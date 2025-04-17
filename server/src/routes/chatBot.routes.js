import { createNewChat , updateChat} from "../controllers/chatBotController.js";
import { Router } from "express";   
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/createChat").post(verifyJwt, createNewChat);
router.route("/updateChat/:id").patch(verifyJwt, updateChat);

export default router;
