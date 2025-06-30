// user.routes.js
import express from "express";
const router = express.Router();

import { verifyJWT } from "../../../shared/middleware/auth.middleware.js";
import {
	validateRequest,
	validateQuery,
} from "../../../shared/middleware/validate.middleware.js";
import { userValidation } from "../../../shared/validators/user.validator.js";
import * as userController from "../controllers/user.controller.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";

router.get(
	"/",
	verifyJWT,
	validateQuery(userValidation.getUsers),
	asyncHandler(userController.getAllUsers),
);
router.get("/:id", verifyJWT, asyncHandler(userController.getUserById));

router.post(
	"/register",
	validateRequest(userValidation.createUser),
	asyncHandler(userController.registerUser),
);

router.post(
	"/login",
	validateRequest(userValidation.loginUser),
	asyncHandler(userController.loginUser),
);

router.put(
	"/:id",
	verifyJWT,
	validateRequest(userValidation.updateUser),
	asyncHandler(userController.updateUser),
);

router.delete("/:id", verifyJWT, asyncHandler(userController.deleteUser));

router.get(
	"/profile/me",
	verifyJWT,
	asyncHandler(userController.getCurrentUserProfile),
);

router.put(
	"/profile/me",
	verifyJWT,
	validateRequest(userValidation.updateProfile),
	asyncHandler(userController.updateCurrentUserProfile),
);

router.post(
	"/change-password",
	verifyJWT,
	validateRequest(userValidation.changePassword),
	asyncHandler(userController.changePassword),
);

router.post(
	"/upload-avatar",
	verifyJWT,
	asyncHandler(userController.uploadAvatar),
);

export default router;
