import {NextFunction, Request, Response} from "express";
import {ReasonPhrases} from "http-status-codes";
import SeparationCalculator from "../services/separation-calculator.js";
import validateSteamid from "../services/validate-steamid.js";
import constants from "../constants/constants.js";

export async function handleFindingDegree(req: Request, res: Response, next: NextFunction): Promise<unknown> {
  if (req.method !== "POST") next(new Error(ReasonPhrases.METHOD_NOT_ALLOWED));

  const body = req.body;
  if (!body.hasOwnProperty("apiKey") ||
    !body.hasOwnProperty("steamId1") ||
    !body.hasOwnProperty("steamId2") ||
    body.apiKey.length !== constants.API_KEY_LENGTH) {
    return next(new Error(ReasonPhrases.BAD_REQUEST));
  }

  const [steamId1, steamId2] = await Promise.all([
    validateSteamid(body.steamId1, body.apiKey),
    validateSteamid(body.steamId2, body.apiKey)
  ]);

  if (steamId1 === steamId2) return next(new Error(ReasonPhrases.BAD_REQUEST));

  if (steamId1 && steamId2) {
    const calculator = new SeparationCalculator(body.apiKey);
    const searchResult = await calculator.findDegreeOfSeparation(steamId1, steamId2);
    res.status(200).json(searchResult);
  } else {
    return next(new Error(ReasonPhrases.BAD_REQUEST));
  }
}

