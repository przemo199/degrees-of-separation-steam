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
