// src/modules/users/controllers/profile.controller.js
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import { ProfileService } from "../services/profile.service.js";
import { Logger } from "../../../shared/utils/Logger.js";
import { safeAsyncOperation } from "../../../shared/utils/ErrorHandler.js";
import mongoose from "mongoose";

const logger = new Logger("ProfileController");

// Error handler for controller functions
const handleControllerError = (error, req, res, startTime, logger) => {
	const executionTime = Date.now() - startTime;
	logger.error("Controller error:", {
		error: error.message,
		stack: error.stack,
		executionTime: `${executionTime}ms`,
		path: req.path,
		method: req.method,
	});

	if (error instanceof ApiError) {
		throw error;
	}

	throw new ApiError(500, "Internal server error occurred");
};

// Instagram/X/LinkedIn-like user profile
const getUserProfile = asyncHandler(async (req, res) => {
	const { username } = req.params;
	const currentUserId = req.user?._id;
	const startTime = Date.now();

	const profile = await ProfileService.getUserProfile(username, currentUserId);
	if (!profile) {
		throw new ApiError(404, "User not found");
	}

	const executionTime = Date.now() - startTime;
	res.status(200).json(
		new ApiResponse(200, profile, "Profile retrieved successfully", true, {
			executionTime: `${executionTime}ms`,
		}),
	);
});

// Get user's posts with pagination
const getUserPosts = asyncHandler(async (req, res) => {
	const { username } = req.params;
	const { page = 1, limit = 12, type = "all" } = req.query;

	const result = await ProfileService.getUserPosts(username, parseInt(page), parseInt(limit), type);
	if (!result) {
		throw new ApiError(404, "User not found");
	}

	res.status(200).json(new ApiResponse(200, result, "User posts retrieved successfully"));
});

// Check follow status with optimized error handling
const getFollowStatus = asyncHandler(async (req, res) => {
	const startTime = Date.now();
	const { userId } = req.params;
	const currentUserId = req.user._id;

	try {
		if (!mongoose.Types.ObjectId.isValid(userId)) {
			throw new ApiError(400, "Invalid user ID format");
		}

		const status = await safeAsyncOperation(
			() => ProfileService.getFollowStatus(currentUserId, userId),
			{ isFollowing: false, followsYou: false },
			false,
		);

		const executionTime = Date.now() - startTime;

		if (status.error) {
			logger.warn("Follow status check warning", {
				currentUserId: currentUserId.toString(),
				targetUserId: userId,
				error: status.error,
				executionTime: `${executionTime}ms`,
			});
		}

		res.status(200).json(
			new ApiResponse(
				200,
				{
					isFollowing: status.isFollowing,
					followsYou: status.followsYou,
				},
				"Follow status retrieved successfully",
			),
		);
	} catch (error) {
		handleControllerError(error, req, res, startTime, logger);
	}
});

export { getUserProfile, getUserPosts, getFollowStatus };
