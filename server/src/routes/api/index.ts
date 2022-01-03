import {Router} from "express";
import profiles from "./profiles.js";
import findDegree from "./find-degree.js";

const router = Router();

router.use("/profiles", profiles);

router.use("/find-degree", findDegree);

export default router;
