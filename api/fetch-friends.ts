import type {VercelRequest, VercelResponse} from "@vercel/node";
import {request} from "undici";

const apiUrl =
  `https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key={1}&steamid={0}&relationship=friend`;

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "POST") {
    let apiUrlFilled = apiUrl.replace("{0}", req.body.steamId);
    apiUrlFilled = apiUrlFilled.replace("{1}", req.body.apiKey);
    console.log(apiUrl);
    console.log(apiUrlFilled);
    const {body} = await request(apiUrlFilled, {
      method: "GET",
      headers: {
        "content-type": "application/json"
      }
    });
    res.status(200).send(await body.json());
  } else {
    res.status(405).send("Method Not Allowed");
  }
};