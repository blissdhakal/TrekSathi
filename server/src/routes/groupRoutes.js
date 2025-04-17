import express from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  createGroup,
  getAllGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  updateGroup,
  makeAdmin,
  removeMember,
  getUserGroups
} from "../controllers/groupController.js";

const router = express.Router();

router.route("/").post(verifyJwt, createGroup).get(verifyJwt, getAllGroups);
router.route("/my-groups").get(verifyJwt, getUserGroups);
router.route("/:groupId").get(verifyJwt, getGroupById).patch(verifyJwt, updateGroup);
router.route("/:groupId/join").post(verifyJwt, joinGroup);
router.route("/:groupId/leave").post(verifyJwt, leaveGroup);
router.route("/:groupId/make-admin/:userId").post(verifyJwt, makeAdmin);
router.route("/:groupId/members/:userId").delete(verifyJwt, removeMember);

export default router;
