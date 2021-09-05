import {request} from "undici";

interface User {
  steamId: string;
  lowerDegreeFriend: string;
}

interface SearchResult {
  degreeOfSeparation: number | null;
  path: string[] | null;
  requestsDone: number;
  uniqueProfilesFetched: number;
  searchDuration: number;
  tooManyRequests: boolean;
}

class SeparationCalculator {
  private apiUrlBlueprint: string;
  private requestsDone: number;
  private privateProfileResponses: number;
  private friendLevel: number;
  private uniqueProfilesFetched: number;
  private commonFriend: string;
  private tooManyRequests: boolean;
  private path: string[];
  friendLevelsA: User[][];
  friendLevelsB: User[][];

  constructor(key: string) {
    this.apiUrlBlueprint =
      `http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${key}&steamid={0}&relationship=friend`;
    this.requestsDone = 0;
    this.privateProfileResponses = 0;
    this.friendLevel = 0;
    this.uniqueProfilesFetched = 0;
    this.commonFriend = "";
    this.tooManyRequests = false;
    this.path = [];
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
    this.uniqueProfilesFetched += nextDegree.length;
    arr[this.friendLevel] = nextDegree;
  }

  searchCurrentLevel(friendLevelsToSearchBy: User[][], friendLevelsToBeSearched: User[][]) {
    for (const level of friendLevelsToBeSearched) {
      for (const user of friendLevelsToSearchBy[this.friendLevel]) {
        if (level.map(usr => usr.steamId).includes(user.steamId)) {
          return user.steamId;
        }
      }
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

  async performSearch(userA: string, userB: string): Promise<SearchResult> {
    const generateSearchResult = () => {
      return {
        degreeOfSeparation: this.path.length > 0 ? this.path.length - 1 : null,
        path: this.path.length > 0 ? this.path : null,
        requestsDone: this.requestsDone,
        uniqueProfilesFetched: this.uniqueProfilesFetched,
        searchDuration: new Date().getTime() - startTime,
        tooManyRequests: this.tooManyRequests
      };
    }
    const startTime = new Date().getTime();
    this.friendLevelsA[this.friendLevel] = [{steamId: userA, lowerDegreeFriend: ""}];
    this.friendLevelsB[this.friendLevel] = [{steamId: userB, lowerDegreeFriend: ""}];
    this.friendLevel++;

    while (!this.tooManyRequests) {
      await this.fetchNextFriendLevel(this.friendLevelsA);
      if ((this.friendLevelsA)[this.friendLevel].length === 0) {
        return generateSearchResult();
      }
      let result = this.searchCurrentLevel(this.friendLevelsA, this.friendLevelsB);
      if (result) {
        this.commonFriend = result;
        this.path = this.findPath();
        return generateSearchResult();
      }
      await this.fetchNextFriendLevel(this.friendLevelsB);
      if ((this.friendLevelsB)[this.friendLevel].length === 0) {
        return generateSearchResult();
      }
      result = this.searchCurrentLevel(this.friendLevelsB, this.friendLevelsA);
      if (result) {
        this.commonFriend = result;
        this.path = this.findPath();
        return generateSearchResult();
      }
      this.friendLevel++;
    }

    return generateSearchResult();
  }
}

export {SeparationCalculator};
