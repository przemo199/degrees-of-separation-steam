import {request} from "undici";
import {SearchResult, User} from '../interfaces';

class SeparationCalculator {
  private apiUrlBlueprint: string;
  private requestsDone: number;
  private privateProfileResponses: number;
  private friendsLevel: number;
  private uniqueProfilesFetched: number;
  private commonFriend: string;
  private tooManyRequests: boolean;
  private path: string[];
  friendLevelsA: User[][];
  friendLevelsB: User[][];

  constructor(steamApiKey: string) {
    this.apiUrlBlueprint =
      `http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${steamApiKey}&steamid={0}&relationship=friend`;
    this.requestsDone = 0;
    this.privateProfileResponses = 0;
    this.friendsLevel = 0;
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
        lowerLevelFriend: id
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

  async fetchNextFriendLevel(users: User[][]) {
    function isUnique(s: string): boolean {
      for (const userLevel of users) {
        if (userLevel.map(user => user.steamId).includes(s)) {
          return false;
        }
      }
      return true;
    }

    const fetchedFriends = (await Promise.all(users[this.friendsLevel - 1]
      .map(user => this.fetchUserFriends(user.steamId)))).flat();
    const uniqueFetchedFriends: User[] = [];
    const tempSet = new Set();
    fetchedFriends.forEach(user => {
      let num = tempSet.size;
      tempSet.add(user.steamId);
      if (num !== tempSet.size) {
        uniqueFetchedFriends.push(user);
      }
    });

    const nextFriendsLevel = uniqueFetchedFriends.filter(user => isUnique(user.steamId));
    this.uniqueProfilesFetched += nextFriendsLevel.length;
    users[this.friendsLevel] = nextFriendsLevel;
  }

  searchCurrentLevel(friendLevelsToSearchBy: User[][], friendLevelsToBeSearched: User[][]) {
    for (const level of friendLevelsToBeSearched) {
      for (const user of friendLevelsToSearchBy[this.friendsLevel]) {
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
        const targetIndex = level.map(user => user.steamId).indexOf(targetId);
        if (targetIndex > -1) {
          path.unshift(level[targetIndex].steamId);
          targetId = level[targetIndex].lowerLevelFriend;
        }
      }
    }

    path.pop(); // removing commonFriend to avoid duplicate values in the array

    targetId = this.commonFriend;
    while (targetId !== "") {
      for (const level of this.friendLevelsB) {
        const targetIndex = level.map(user => user.steamId).indexOf(targetId);
        if (targetIndex > -1) {
          path.push(level[targetIndex].steamId);
          targetId = level[targetIndex].lowerLevelFriend;
        }
      }
    }

    return path;
  }

  async findDegreeOfSeparation(userA: string, userB: string): Promise<SearchResult> {
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
    this.friendLevelsA[this.friendsLevel] = [{steamId: userA, lowerLevelFriend: ""}];
    this.friendLevelsB[this.friendsLevel] = [{steamId: userB, lowerLevelFriend: ""}];
    this.friendsLevel++;

    while (!this.tooManyRequests) {
      await this.fetchNextFriendLevel(this.friendLevelsA);
      if ((this.friendLevelsA)[this.friendsLevel].length === 0) {
        return generateSearchResult();
      }

      let result = this.searchCurrentLevel(this.friendLevelsA, this.friendLevelsB);
      if (result) {
        this.commonFriend = result;
        this.path = this.findPath();
        return generateSearchResult();
      }

      await this.fetchNextFriendLevel(this.friendLevelsB);
      if ((this.friendLevelsB)[this.friendsLevel].length === 0) {
        return generateSearchResult();
      }

      result = this.searchCurrentLevel(this.friendLevelsB, this.friendLevelsA);
      if (result) {
        this.commonFriend = result;
        this.path = this.findPath();
        return generateSearchResult();
      }

      this.friendsLevel++;
    }

    return generateSearchResult();
  }
}

export {SeparationCalculator};
