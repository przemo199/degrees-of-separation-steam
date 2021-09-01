import type {VercelRequest, VercelResponse} from "@vercel/node";
import {request} from "undici";

let apiUrl =
  `https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key={1}&steamid={0}&relationship=friend`;

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "POST") {
    apiUrl = apiUrl.replace("{0}", req.body.steamId);
    apiUrl = apiUrl.replace("{1}", req.body.apiKey);
    const {body} = await request(apiUrl, {
      method: "GET",
      headers: {
        "content-type": "application/json"}
    });
    res.status(200).send(await body.json());
  } else {
    res.status(405).send("Method Not Allowed");
  }
};