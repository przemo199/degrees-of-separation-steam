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
  if (req.method !== "POST") res.status(405).send("Method Not allowed");
  const body = req.body;
  if (body.apiKey.length !== 32 && body.steamId1.length !== 17 && body.secondId.length !== 17) {
    res.status(400).send("Bad request");
  }

  const calculator = new SeparationCalculator(body.apiKey);
  const searchResult = await calculator.findDegreeOfSeparation(body.steamId1, body.steamId2);
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

    const profiles = profilesData.map(profile => {
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
