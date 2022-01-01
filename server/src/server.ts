import express, {Request, Response, NextFunction} from "express";
import http from "http";
import {request} from "undici";
import {SeparationCalculator} from "./separation-calculator.js";
import {ProfileData, RawProfileData} from "shared";

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY_LENGTH = 32;
const STEAM_ID_LENGTH = 17;

const BAD_REQUEST = {message: "Bad request", code: 400};
const METHOD_NOT_ALLOWED = {message: "Method not allowed", code: 405};
const INTERNAL_SERVER_ERROR = {message: "Internal server error", code: 500};

app.use(express.urlencoded({
  extended: true
}));

app.use(express.json());

app.use(express.static("../client/public/build"));
app.use(express.static("../client/public/"));

app.post("/api/find-degree", async (req, res, next) => {
  const body = req.body;
  if (!body.hasOwnProperty("apiKey") ||
    !body.hasOwnProperty("steamId1") ||
    !body.hasOwnProperty("steamId2") ||
    body.apiKey.length !== API_KEY_LENGTH) {
    return next(new Error(BAD_REQUEST.message));
  }

  const id1Promise = validateId(body.steamId1, body.apiKey);
  const id2Promise = validateId(body.steamId2, body.apiKey);
  const steamId1 = await id1Promise;
  const steamId2 = await id2Promise;

  if (steamId1 === steamId2) return next(new Error(BAD_REQUEST.message));

  if (steamId1 && steamId2) {
    const calculator = new SeparationCalculator(body.apiKey);
    const searchResult = await calculator.findDegreeOfSeparation(steamId1, steamId2);
    return res.status(200).json(searchResult);
  } else {
    return next(new Error(BAD_REQUEST.message));
  }
});

app.get("/api/find-degree", (req, res, next) => {
  return next(new Error(METHOD_NOT_ALLOWED.message));
});

app.post("/api/profiles", async (req, res, next) => {
  if (req.method !== "POST") return next(new Error(METHOD_NOT_ALLOWED.message));
  const body = req.body;
  if (body.apiKey.length !== 32) return next(new Error(BAD_REQUEST.message));

  const profiles = await fetchProfilesData(body.apiKey, body.steamIds);
  return res.status(200).json(profiles);
});

app.get("/api/profiles", (req, res, next) => {
  return next(new Error(METHOD_NOT_ALLOWED.message));
});

app.use(errorHandler);

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof Error) {
    switch (err.message) {
      case BAD_REQUEST.message:
        res.status(BAD_REQUEST.code).send(BAD_REQUEST.message);
        break;
      case METHOD_NOT_ALLOWED.message:
        res.status(METHOD_NOT_ALLOWED.code).send(METHOD_NOT_ALLOWED.message);
        break;
    }
  } else {
    res.status(INTERNAL_SERVER_ERROR.code).send(INTERNAL_SERVER_ERROR.message);
  }
}

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
