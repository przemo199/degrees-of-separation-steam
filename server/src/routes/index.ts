import express, {Router} from "express";
import api from "./api/index.js";

const router = Router();

router.use(express.static("../client/public/"));

router.use("/api", api);

export default router;
