import {request} from "undici";
import {SearchResult} from "../interfaces";

class SeparationCalculator {
  private readonly apiKey: string;
  private requestsDone: number;
  private privateProfileResponses: number;
  private uniqueProfilesFetched: number;
  private tooManyRequests: boolean;
  private path: string[];
  friendConnectionsA: Map<string, string>;
  friendConnectionsB: Map<string, string>;

  constructor(steamApiKey: string) {
    this.apiKey = steamApiKey;
    this.requestsDone = 0;
    this.privateProfileResponses = 0;
    this.uniqueProfilesFetched = 0;
    this.tooManyRequests = false;
    this.path = [];
    this.friendConnectionsA = new Map<string, string>();
    this.friendConnectionsB = new Map<string, string>();
  }

  async fetchUserFriends(id: string): Promise<string[]> {
    if (this.tooManyRequests) {
      return [];
    }

    const friendsListSteamApiEndpoint = "https://api.steampowered.com/ISteamUser/GetFriendList/v0001/";
    const url = new URL(friendsListSteamApiEndpoint);
    url.searchParams.set("key", this.apiKey);
    url.searchParams.set("steamid", id);
    url.searchParams.set("relationship", "friend");

    const {statusCode, body} = await request(url);
    this.requestsDone++;

    switch (statusCode) {
      case 200:
        return (await body.json()).friendslist.friends.map((friend: any) => friend.steamid);
      case 401:
        this.privateProfileResponses++;
        break;
      case 429:
        this.tooManyRequests = true;
        console.log("Too many requests");
        break;
      default:
        console.log("Invalid status code: " + statusCode);
    }

    return [];
  }

  async fetchNextFriendLevel(users: string[], userMap: Map<string, string>): Promise<string[]> {
    const promises = users.map(async user => {
      const friends = await this.fetchUserFriends(user);
      const result: string[] = [];
      friends.forEach(friend => {
        if (!userMap.has(friend)) {
          userMap.set(friend, user);
          result.push(friend);
          this.uniqueProfilesFetched++;
        }
      });
      return result;
    });

    return (await Promise.all(promises)).flat();
  }

  searchCurrentLevel(currentLevel: string[], mapToSearch: Map<string, string>): string | false {
    for (const friend of currentLevel) {
      if (mapToSearch.has(friend)) {
        return friend
      }
    }
    return false;
  }

  findConnectionPath(commonFriend: string): string[] {
    const connectionPath: string[] = [];
    let targetId = commonFriend;

    while (targetId !== "") {
      connectionPath.unshift(targetId);
      targetId = this.friendConnectionsA.get(targetId)!;
    }

    targetId = commonFriend;
    while (targetId !== "") {
      targetId = this.friendConnectionsB.get(targetId)!;
      if (targetId !== "") {
        connectionPath.push(targetId);
      }
    }

    return connectionPath;
  }

  async findDegreeOfSeparation(userA: string, userB: string): Promise<SearchResult> {
    const generateSearchResult = () => {
      return {
        searchDuration: new Date().getTime() - startTime,
        degreeOfSeparation: this.path.length > 0 ? this.path.length - 1 : null,
        path: this.path.length > 0 ? this.path : null,
        requestsDone: this.requestsDone,
        uniqueProfilesFetched: this.uniqueProfilesFetched,
        tooManyRequests: this.tooManyRequests
      };
    };

    const startTime = new Date().getTime();
    let currentFriendsLevelA = [userA];
    let currentFriendsLevelB = [userB];
    this.friendConnectionsA.set(userA, "");
    this.friendConnectionsB.set(userB, "");

    while (!this.tooManyRequests && (currentFriendsLevelA.length > 0 || currentFriendsLevelB.length > 0)) {
      if (currentFriendsLevelA.length > 0) {
        currentFriendsLevelA = await this.fetchNextFriendLevel(currentFriendsLevelA, this.friendConnectionsA);
        const commonFriend = this.searchCurrentLevel(currentFriendsLevelA, this.friendConnectionsB);
        if (commonFriend) {
          this.path = this.findConnectionPath(commonFriend);
          return generateSearchResult();
        }
      }

      if (currentFriendsLevelB.length > 0) {
        currentFriendsLevelB = await this.fetchNextFriendLevel(currentFriendsLevelB, this.friendConnectionsB);
        const commonFriend = this.searchCurrentLevel(currentFriendsLevelB, this.friendConnectionsA);
        if (commonFriend) {
          this.path = this.findConnectionPath(commonFriend);
          return generateSearchResult();
        }
      }
    }

    return generateSearchResult();
  }
}

export {SeparationCalculator};
