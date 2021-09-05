import * as path from "path";
import {fileURLToPath} from "url";
import express from "express";
import http from "http";
import {SeparationCalculator} from "./separation-calculator.js";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({
  extended: true
}));

app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "public", "build")));
app.use(express.static(path.join(__dirname, "..", "public")));

// app.use((req, res, next) => {
//     res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
// });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.post("/degree", async (req, res) => {
  if (req.method !== "POST") res.status(405).send("Method Not allowed");
  const calculator = new SeparationCalculator(req.body.apiKey);
  const result = await calculator.performSearch(req.body.steamId1, req.body.steamId2);
  res.status(200).send({...req.body, ...result});
});

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
