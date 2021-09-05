import {request} from "undici";

interface User {
  steamId: string;
  lowerDegreeFriend: string;
}

class SeparationCalculator {
  private apiUrlBlueprint: string;
  private requestsDone: number;
  private privateProfileResponses: number;
  private friendLevel: number;
  private usersFetched: number;
  private commonFriend: string;
  private tooManyRequests: boolean;
  friendLevelsA: User[][];
  friendLevelsB: User[][];

  constructor(key: string) {
    this.apiUrlBlueprint =
      `http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${key}&steamid={0}&relationship=friend`;
    this.requestsDone = 0;
    this.privateProfileResponses = 0;
    this.friendLevel = 0;
    this.usersFetched = 0;
    this.commonFriend = "";
    this.tooManyRequests = false;
    this.friendLevelsA = [];
    this.friendLevelsB = [];
  }

  async fetchUserFriends(id: string): Promise<User[]> {
    if (this.requestsDone >= 100000) {
      return [];
    }

    const {statusCode, body} = await request(this.apiUrlBlueprint.replace("{0}", id));

    this.requestsDone++;
    if (statusCode === 200) {
      return (await body.json()).friendslist.friends.map((friend: { steamid: string; }) => ({
        steamId: friend.steamid,
        lowerDegreeFriend: id
      }));
    } else if (statusCode === 401) {
      this.privateProfileResponses++;
    } else if (statusCode === 429) {
      this.tooManyRequests = true;
      console.log("Too many requests");
    } else {
      console.log("Response has invalid status code: " + statusCode);
    }
    return [];
  }

  async fetchNextFriendLevel(arr: User[][]) {
    function isDuplicate(s: string) {
      for (const ar of arr) {
        if (ar.map(user => user.steamId).includes(s)) {
          return true;
        }
      }
      return false;
    }

    const fetched = (await Promise.all(arr[this.friendLevel - 1].map(user => this.fetchUserFriends(user.steamId)))).flat();
    const uniqueFetched: User[] = [];
    const tempSet = new Set();
    fetched.forEach(user => {
      let num = tempSet.size;
      tempSet.add(user.steamId);
      if (num !== tempSet.size) {
        uniqueFetched.push(user);
      }
    });

    const nextDegree = uniqueFetched.filter(user => isDuplicate(user.steamId) ? null : user);
    this.usersFetched += nextDegree.length;
    arr[this.friendLevel] = nextDegree;
  }

  searchCurrentDegree(friendLevelsToSearchBy: User[][], friendLevelsToBeSearched: User[][]) {
    for (const level of friendLevelsToBeSearched) {
      for (const user of friendLevelsToSearchBy[this.friendLevel]) {
        if (level.map(usr => usr.steamId).includes(user.steamId)) {
          return user.steamId;
        }
      }
    }

    return false;
  }

  findDegreeById(id: string): number {
    let result = 0;
    for (let i = 0; i < this.friendLevelsA.length; i++) {
      if ((this.friendLevelsA)[i].map(user => user.steamId).includes(id)) {
        result += i;
        break;
      }
    }
    for (let i = 0; i < this.friendLevelsA.length; i++) {
      if ((this.friendLevelsB)[i].map(user => user.steamId).includes(id)) {
        result += i;
        break;
      }
    }

    return result;
  }

  async findDegreeOfSeparation(userA: string, userB: string) {
    (this.friendLevelsA)[this.friendLevel] = [{steamId: userA, lowerDegreeFriend: ""}];
    this.friendLevelsB[this.friendLevel] = [{steamId: userB, lowerDegreeFriend: ""}];
    this.friendLevel++;

    while (!this.tooManyRequests) {
      await this.fetchNextFriendLevel(this.friendLevelsA);
      if ((this.friendLevelsA)[this.friendLevel].length === 0) {
        return false;
      }
      let result = this.searchCurrentDegree(this.friendLevelsA, this.friendLevelsB);
      if (result) {
        this.commonFriend = result;
        return this.findDegreeById(result);
      }
      await this.fetchNextFriendLevel(this.friendLevelsB);
      if ((this.friendLevelsB)[this.friendLevel].length === 0) {
        return false;
      }
      result = this.searchCurrentDegree(this.friendLevelsB, this.friendLevelsA);
      if (result) {
        this.commonFriend = result;
        return this.findDegreeById(result);
      }
      this.friendLevel++;
    }

    return false;
  }

  findPath(): string[] {
    let targetId = this.commonFriend;
    const path: string[] = [];

    while (targetId !== "") {
      for (const level of this.friendLevelsA) {
        let targetIndex = level.map(user => user.steamId).indexOf(targetId);
        if (targetIndex > -1) {
          path.unshift(level[targetIndex].steamId);
          targetId = level[targetIndex].lowerDegreeFriend;
        }
      }
    }

    path.pop(); // removing commonFriend to avoid duplicate values in the array

    targetId = this.commonFriend;
    while (targetId !== "") {
      for (const level of this.friendLevelsB) {
        let targetIndex = level.map(user => user.steamId).indexOf(targetId);
        if (targetIndex > -1) {
          path.push(level[targetIndex].steamId);
          targetId = level[targetIndex].lowerDegreeFriend;
        }
      }
    }

    return path;
  }
}

export {SeparationCalculator};
