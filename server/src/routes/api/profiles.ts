import {Router} from "express";
import {handleFetchingProfiles} from "../../controllers/profiles.js";

const router = Router();

router.route("/").all(handleFetchingProfiles);

export default router;
