import {Router} from "express";
import {handleFindingDegree} from "../../controllers/find-degree.js";

const router = Router();

router.route("/").all(handleFindingDegree);

export default router;
