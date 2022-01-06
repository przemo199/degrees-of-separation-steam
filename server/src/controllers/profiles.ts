import {NextFunction, Request, Response} from "express";
import {ReasonPhrases} from "http-status-codes";
import {fetchProfilesData} from "../services/fetch-profiles.js";
import constants from "../constants/constants.js";

export async function handleFetchingProfiles(req: Request, res: Response, next: NextFunction): Promise<unknown> {
  if (req.method !== "POST") return next(new Error(ReasonPhrases.METHOD_NOT_ALLOWED));

  const body = req.body;
  if (body.apiKey.length !== constants.API_KEY_LENGTH) return next(new Error(ReasonPhrases.BAD_REQUEST));

  const profiles = await fetchProfilesData(body.apiKey, body.steamIds);
  res.status(200).json(profiles);
}
