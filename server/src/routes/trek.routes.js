import { Router } from "express";
import { getAllTreks, getTrekBySlug } from "../controllers/trek.Controller.js";

const router = Router();

router.route("/").get(getAllTreks);
router.route("/:slug").get(getTrekBySlug);

export default router;