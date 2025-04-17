import express from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {sendMessage,editMessage , deleteMessage , getGroupMessages} from "../controllers/messageController.js";
const router = express.Router();

// Get all messages for a specific group
router.get("/groups/:groupId/messages", verifyJwt, getGroupMessages);

// Send a message to a group
router.post("/messages", verifyJwt, sendMessage);

// Edit a specific message
router.patch("/messages/:messageId", verifyJwt, editMessage);

// Delete a specific message
router.delete("/messages/:messageId", verifyJwt, deleteMessage);

export default router;