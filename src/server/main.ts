import * as path from "path";
import {fileURLToPath} from "url";
import express from "express";
import http from "http";
import {SeparationCalculator} from "./separation-calculator.js";

const app = express();
const PORT = process.env.PORT || 3000;
const dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({
  extended: true
}));

app.use(express.json());

app.use(express.static("./public/build"));
app.use(express.static("./public/"));

app.get("/", (req, res) => {
  res.sendFile(path.join(dirname, "..", "public", "index.html"));
});

app.post("/api/degree", async (req, res) => {
  if (req.method !== "POST") res.status(405).send("Method Not allowed");
  const body = req.body;
  if (body.apiKey.length !== 32 && body.steamId1.length !== 17 && body.secondId.length !== 17)
    res.status(400).send("Bad request");

  const calculator = new SeparationCalculator(body.apiKey);
  const result = await calculator.findDegreeOfSeparation(body.steamId1, body.steamId2);
  res.status(200).send({...result});
});

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
