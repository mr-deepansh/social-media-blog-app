import express from "express";
const router = express.Router();

import { verifyJWT } from "../../../shared/middleware/auth.middleware.js";
import {
	validateRequest,
	validateQuery,
} from "../../../shared/middleware/validate.middleware.js";
import { zodValidation } from "../../../shared/validators/zod.validator.js";
import * as userController from "../controllers/user.controller.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";

// ✅ Highest priority: Auth
router.post(
	"/register",
	validateRequest(zodValidation.createUser),
	asyncHandler(userController.registerUser),
);

router.post(
	"/login",
	validateRequest(zodValidation.loginUser),
	asyncHandler(userController.loginUser),
);

router.post("/logout", verifyJWT, asyncHandler(userController.logoutUser));
router.post("/refresh-token", asyncHandler(userController.refreshAccessToken));

// ✅ Current user profile routes
router.get(
	"/profile/me",
	verifyJWT,
	asyncHandler(userController.getCurrentUserProfile),
);
router.put(
	"/profile/me",
	verifyJWT,
	validateRequest(zodValidation.updateProfile),
	asyncHandler(userController.updateCurrentUserProfile),
);

// ✅ Feed (most visited after login)
router.get(
	"/feed",
	verifyJWT,
	validateQuery(zodValidation.getFeed),
	asyncHandler(userController.getUserFeed),
);

// ✅ User Search
router.get(
	"/search",
	verifyJWT,
	validateQuery(zodValidation.searchUser),
	asyncHandler(userController.searchUsers),
);

// ✅ Follow / Unfollow
router.post(
	"/follow/:userId",
	verifyJWT,
	asyncHandler(userController.followUser),
);
router.post(
	"/unfollow/:userId",
	verifyJWT,
	asyncHandler(userController.unfollowUser),
);

// ✅ Followers & Following
router.get(
	"/followers/:userId",
	verifyJWT,
	validateQuery(zodValidation.getFollowers),
	asyncHandler(userController.getUserFollowers),
);
router.get(
	"/following/:userId",
	verifyJWT,
	validateQuery(zodValidation.getFollowing),
	asyncHandler(userController.getUserFollowing),
);

// ✅ Change password & avatar
router.post(
	"/change-password",
	verifyJWT,
	validateRequest(zodValidation.changePassword),
	asyncHandler(userController.changePassword),
);
router.post(
	"/upload-avatar",
	verifyJWT,
	asyncHandler(userController.uploadAvatar),
);

// ✅ Public profile (static route with :username — not ID)
router.get(
	"/profile/:username",
	verifyJWT,
	asyncHandler(userController.getUserProfileByUsername),
);

// ✅ Admin / Verified route: get all users
router.get(
	"/",
	verifyJWT,
	validateQuery(zodValidation.getUsers),
	asyncHandler(userController.getAllUsers),
);

// ⚠️ Dynamic ID routes - keep these last
router.get("/:id", verifyJWT, asyncHandler(userController.getUserById));
router.put(
	"/:id",
	verifyJWT,
	validateRequest(zodValidation.updateUser),
	asyncHandler(userController.updateUser),
);
router.delete("/:id", verifyJWT, asyncHandler(userController.deleteUser));

export default router;
