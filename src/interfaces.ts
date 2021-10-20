export interface SearchResult {
  degreeOfSeparation: number | null;
  path: string[] | null;
  requestsDone: number;
  uniqueProfilesFetched: number;
  searchDuration: number;
  tooManyRequests: boolean;
}

export interface User {
  steamId: string;
  lowerLevelFriend: string;
}

export interface RawProfileData {
  personaname: string;
  realname?: string;
  profileurl: string;
  avatarfull: string;
  steamid: string;
  lastlogoff: number;
  personastate: number;
}

export interface ProfileData {
  profileName: string;
  realName?: string;
  profileUrl: string;
  avatarSrc: string;
  steamId: string;
  lastLogOff: number;
  userState: number;
}
