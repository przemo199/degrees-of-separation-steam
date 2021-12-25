import express from "express";
import http from "http";
import {request} from "undici";
import {SeparationCalculator} from "./separation-calculator.js";
import {ProfileData, RawProfileData} from "../interfaces";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({
  extended: true
}));

app.use(express.json());

app.use(express.static("./public/build"));
app.use(express.static("./public/"));

app.post("/api/find-degree", async (req, res) => {
  function isNumber(string: string): boolean {
    const numOnlyRegex = /^\d+$/;
    return numOnlyRegex.test(string)
  }

  async function resolveId(steamId: string): Promise<string> {
    if (steamId.length !== steamIdLength || !isNumber(steamId)) {
      const resolvedUrl = await resolveVanityUrl(body.apiKey, steamId);
      if (resolvedUrl) {
        return resolvedUrl;
      } else {
        res.status(400).send("Bad request");
      }
    }

    return steamId;
  }

  if (req.method !== "POST") res.status(405).send("Method Not allowed");

  const apiKeyLength = 32;
  const steamIdLength = 17;
  const body = req.body;
  if (!body.hasOwnProperty("apiKey") ||
    !body.hasOwnProperty("steamId1") ||
    !body.hasOwnProperty("steamId2") ||
    body.apiKey.length !== apiKeyLength) {
    res.status(400).send("Bad request");
  }

  const steamId1 = resolveId(body.steamId1);
  const steamId2 = resolveId(body.steamId2);

  const calculator = new SeparationCalculator(body.apiKey);
  const searchResult = await calculator.findDegreeOfSeparation(await steamId1, await steamId2);
  res.status(200).json(searchResult);
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

async function resolveVanityUrl(steamApiKey: string, vanityUrl: string): Promise<string | false> {
  const resolveVanityUrlSteamApiEndpoint = "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/";
  const url = new URL(resolveVanityUrlSteamApiEndpoint);
  url.searchParams.set("key", steamApiKey);
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
