import {NextFunction, Request, Response, Router} from "express";
import {request} from "undici";
import {ReasonPhrases} from "http-status-codes";
import {SeparationCalculator} from "../../separation-calculator.js";

const router = Router();

const API_KEY_LENGTH = 32;
const STEAM_ID_LENGTH = 17;

router.route("/")
  .get((req: Request, res: Response, next: NextFunction) => {
    next(new Error(ReasonPhrases.METHOD_NOT_ALLOWED));
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    if (!body.hasOwnProperty("apiKey") ||
      !body.hasOwnProperty("steamId1") ||
      !body.hasOwnProperty("steamId2") ||
      body.apiKey.length !== API_KEY_LENGTH) {
      return next(new Error(ReasonPhrases.BAD_REQUEST));
    }

    const id1Promise = validateId(body.steamId1, body.apiKey);
    const id2Promise = validateId(body.steamId2, body.apiKey);
    const steamId1 = await id1Promise;
    const steamId2 = await id2Promise;

    if (steamId1 === steamId2) return next(new Error(ReasonPhrases.BAD_REQUEST));

    if (steamId1 && steamId2) {
      const calculator = new SeparationCalculator(body.apiKey);
      const searchResult = await calculator.findDegreeOfSeparation(steamId1, steamId2);
      return res.status(200).json(searchResult);
    } else {
      return next(new Error(ReasonPhrases.BAD_REQUEST));
    }
  });

function isNumber(string: string): boolean {
  const numOnlyRegex = /^\d+$/;
  return numOnlyRegex.test(string);
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

export default router;
