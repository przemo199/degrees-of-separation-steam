import {writable} from "svelte/store";

interface User {
  steamId: string;
  lowerDegreeFriend: string;
}

let apiKey;
let requestsDone = 0;
let privateProfileResponses = 0;
let friendLevel = 0;
let usersFetched = 0;
let commonFriend = '';
let tooManyRequests = false;
const friendLevelsA: User[][] = [];
const friendLevelsB: User[][] = [];

async function fetchUserFriends(id: string): Promise<User[]> {
  if (requestsDone >= 100000) {
    return [];
  }

  const response = await fetch("/api/fetch-friends", {
    method: "POST",
    body: JSON.stringify({apiKey: apiKey, steamId: id})
  });
  requestsDone++;
  if (response.status === 200) {
    return (await response.json()).friendslist.friends.map((friend: { steamid: string; }) => ({steamId: friend.steamid, lowerDegreeFriend: id}));
  } else if (response.status === 401) {
    privateProfileResponses++;
  } else if (response.status === 429){
    tooManyRequests = true;
  } else {
    console.error('Response has invalid status code: ' + response.status);
  }
  return [];
}

async function fetchNextFriendLevel(arr: User[][]) {
  function isDuplicate(s: string) {
    for (const ar of arr) {
      if (ar.map(user => user.steamId).includes(s)) {
        return true;
      }
    }
    return false;
  }

  const fetched = (await Promise.all(arr[friendLevel - 1].map(user => fetchUserFriends(user.steamId)))).flat();
  const uniqueFetched: User[] = [];
  const tempSet = new Set();
  fetched.forEach(user => {
    let num = tempSet.size;
    tempSet.add(user.steamId);
    if (num != tempSet.size) {
      uniqueFetched.push(user);
    }
  });

  const nextDegree = uniqueFetched.filter(user => isDuplicate(user.steamId) ? null : user);
  usersFetched += nextDegree.length;
  arr[friendLevel] = nextDegree;
}

function searchCurrentDegree(friendLevelsToSearchBy: User[][], friendLevelsToBeSearched: User[][]) {
  for (const level of friendLevelsToBeSearched) {
    for (const user of friendLevelsToSearchBy[friendLevel]) {
      if (level.map(usr => usr.steamId).includes(user.steamId)) {
        return user.steamId;
      }
    }
  }

  return false;
}

function findDegreeById(id: string): number {
  let result = 0;
  for (let i = 0; i < friendLevelsA.length; i++) {
    if (friendLevelsA[i].map(user => user.steamId).includes(id)) {
      result += i;
      break;
    }
  }
  for (let i = 0; i < friendLevelsA.length; i++) {
    if (friendLevelsB[i].map(user => user.steamId).includes(id)) {
      result += i;
      break;
    }
  }

  return result;
}

async function findDegreeOfSeparation(userA: string, userB: string) {
  friendLevelsA[friendLevel] = [{steamId: userA, lowerDegreeFriend: ''}];
  friendLevelsB[friendLevel] = [{steamId: userB, lowerDegreeFriend: ''}];
  friendLevel++;

  while(!tooManyRequests) {
    await fetchNextFriendLevel(friendLevelsA);
    if (friendLevelsA[friendLevel].length === 0) {
      return false;
    }
    let result = searchCurrentDegree(friendLevelsA, friendLevelsB);
    if (result) {
      commonFriend = result;
      return findDegreeById(result);
    }
    await fetchNextFriendLevel(friendLevelsB);
    if (friendLevelsB[friendLevel].length === 0) {
      return false;
    }
    result = searchCurrentDegree(friendLevelsB, friendLevelsA);
    if (result) {
      commonFriend = result;
      return findDegreeById(result);
    }
    friendLevel++;
  }

  return false;
}

function findPath(): string[] {
  let targetId = commonFriend;
  const path: string[] = [];

  while (targetId !== '') {
    for (const level of friendLevelsA) {
      let targetIndex = level.map(user => user.steamId).indexOf(targetId);
      if (targetIndex > -1) {
        path.unshift(level[targetIndex].steamId);
        targetId = level[targetIndex].lowerDegreeFriend;
      }
    }
  }

  path.pop(); // removing commonFriend to avoid duplicate values in the array

  targetId = commonFriend;
  while (targetId !== '') {
    for (const level of friendLevelsB) {
      let targetIndex = level.map(user => user.steamId).indexOf(targetId);
      if (targetIndex > -1) {
        path.push(level[targetIndex].steamId);
        targetId = level[targetIndex].lowerDegreeFriend;
      }
    }
  }

  return path;
}

async function startSearch(steamApiKey: string, steamId1: string, steamId2: string): Promise<number | false> {
  apiKey = steamApiKey;
  return findDegreeOfSeparation(steamId1, steamId2);
}

export {startSearch, findPath};
