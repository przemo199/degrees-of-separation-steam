import express from "express";
import http from "http";
import {request} from "undici";
import {SeparationCalculator} from "./separation-calculator.js";
import {ProfileData, RawProfileData} from "../interfaces";

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY_LENGTH = 32;
const STEAM_ID_LENGTH = 17;

app.use(express.urlencoded({
  extended: true
}));

app.use(express.json());

app.use(express.static("./public/build"));
app.use(express.static("./public/"));

app.post("/api/find-degree", async (req, res) => {
  if (req.method !== "POST") res.status(405).send("Method Not allowed");

  const body = req.body;
  if (!body.hasOwnProperty("apiKey") ||
    !body.hasOwnProperty("steamId1") ||
    !body.hasOwnProperty("steamId2") ||
    body.apiKey.length !== API_KEY_LENGTH) {
    res.status(400).send("Bad request");
  }

  const id1Promise = validateId(body.steamId1, body.apiKey);
  const id2Promise = validateId(body.steamId2, body.apiKey);
  const steamId1 = await id1Promise;
  const steamId2 = await id2Promise;

  if (steamId1 === steamId2) {
    res.status(400).send("Bad request");
  }

  if (steamId1 && steamId2) {
    const calculator = new SeparationCalculator(body.apiKey);
    const searchResult = await calculator.findDegreeOfSeparation(steamId1, steamId2);
    res.status(200).json(searchResult);
  } else {
    res.status(400).send("Bad request");
  }
});

app.post("/api/profiles", async (req, res) => {
  if (req.method !== "POST") res.status(405).send("Method Not allowed");
  const body = req.body;
  if (body.apiKey.length !== 32) res.status(400).send("Bad request");

  const profiles = await fetchProfilesData(body.apiKey, body.steamIds);
  res.status(200).json(profiles);
});

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

async function fetchProfilesData(steamApiKey: string, steamIds: string[]): Promise<ProfileData[]> {
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
      }
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

function isNumber(string: string): boolean {
  const numOnlyRegex = /^\d+$/;
  return numOnlyRegex.test(string)
}

function isVanityUrl(steamId: string): boolean {
  return !(steamId.length === STEAM_ID_LENGTH && isNumber(steamId));
}

async function isValidId(steamId: string, apiKey: string): Promise<boolean> {
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

async function validateId(steamId: string, apiKey: string): Promise<string | false> {
  if (isVanityUrl(steamId)) {
    const resolvedUrl = await resolveVanityUrl(apiKey, steamId);
    if (resolvedUrl) {
      return resolvedUrl;
    } else {
      return false;
    }
  } else {
    if (await isValidId(steamId, apiKey)) {
      return steamId;
    } else {
      return false;
    }
  }
}
