import express from "express";
import http from "http";
import routes from "./routes/index.js";
import {errorHandler} from "./error-controller.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({
  extended: true
}));

app.use(express.json());

app.use(routes);

app.use(errorHandler);

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

