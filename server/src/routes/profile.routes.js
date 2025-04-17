import { Router } from "express";
import {
  completeProfile,
  updateProfile,
  updateProfileImage,
  getProfile,
  updateLiveLocation,
  getUserProfileById,
  getBatchUserProfiles,
  checkProfileCompletion
} from "../controllers/profile.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/complete").post(
  verifyJwt, upload.single("profilePicture"),
  completeProfile
);

router.route("/get").get(verifyJwt, getProfile);

router
  .route("/updateProfile")
  .patch(verifyJwt, updateProfile);

router
  .route("/updateProfileImage")
  .patch(verifyJwt, upload.single("profilePicture"), updateProfileImage);

// New routes for user profile access in group chats
router
  .route("/user/:userId")
  .get(verifyJwt, getUserProfileById);

router
  .route("/batch")
  .post(verifyJwt, getBatchUserProfiles);

router
  .route("/updateLiveLocation")
  .patch(verifyJwt, updateLiveLocation);

router
  .route("/check-completion")
  .get(verifyJwt, checkProfileCompletion);

export default router;