import {request} from "undici";
import constants from "../constants/constants.js";

function isNumber(string: string): boolean {
  const numOnlyRegex = /^\d+$/;
  return numOnlyRegex.test(string);
}

function isVanityUrl(steamId: string): boolean {
  return !(steamId.length === constants.STEAM_ID_LENGTH && isNumber(steamId));
}

async function isValidSteamId(steamId: string, apiKey: string): Promise<boolean> {
  const resolveVanityUrlSteamApiEndpoint = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/";
  const url = new URL(resolveVanityUrlSteamApiEndpoint);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("steamids", steamId);

  const {statusCode, body} = await request(url);

  if (statusCode === 200) {
    const {response} = await body.json();
    if (response.hasOwnProperty("players")) {
      return response.players.length !== 0;
    }
  }
  return false;
}

async function resolveVanityUrl(vanityUrl: string, apiKey: string): Promise<string | false> {
  const resolveVanityUrlSteamApiEndpoint = "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/";
  const url = new URL(resolveVanityUrlSteamApiEndpoint);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("vanityurl", vanityUrl);

  const {statusCode, body} = await request(url);

  if (statusCode === 200) {
    const {response} = await body.json();
    if (response.hasOwnProperty("steamid")) {
      return response.steamid;
    }
  }
  return false;
}

export default async function validateSteamid(steamId: string, apiKey: string): Promise<string | false> {
  if (isVanityUrl(steamId)) {
    const resolvedUrl = await resolveVanityUrl(apiKey, steamId);
    if (resolvedUrl) {
      return resolvedUrl;
    } else {
      return false;
    }
  } else {
    if (await isValidSteamId(steamId, apiKey)) {
      return steamId;
    } else {
      return false;
    }
  }
}
