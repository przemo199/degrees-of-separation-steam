import {request} from "undici";
import {ProfileData, RawProfileData} from "shared";

export async function fetchProfilesData(steamApiKey: string, steamIds: string[]): Promise<ProfileData[]> {
  const profileSummarySteamApiEndpoint = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/";
  const url = new URL(profileSummarySteamApiEndpoint);
  url.searchParams.set("key", steamApiKey);
  url.searchParams.set("steamids", steamIds.join(","));

  const {statusCode, body} = await request(url);

  if (statusCode === 200) {
    const profilesData: RawProfileData[] = (await body.json()).response.players;

    const profiles: ProfileData[] = profilesData.map(profile => {
      return {
        profileName: profile.personaname,
        realName: profile.realname,
        profileUrl: profile.profileurl,
        avatarSrc: profile.avatarfull,
        steamId: profile.steamid,
        lastLogOff: profile.lastlogoff,
        userState: profile.personastate
      };
    });

    const map = new Map<string, ProfileData>();
    profiles.forEach(profile => map.set(profile.steamId, profile));

    const orderedProfiles: ProfileData[] = [];
    steamIds.forEach(steamId => {
      const profile = map.get(steamId);
      if (profile) {
        orderedProfiles.push(profile);
      }
    });

    return orderedProfiles;
  } else {
    return [];
  }
}
