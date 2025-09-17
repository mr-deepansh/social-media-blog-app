// src/modules/users/controllers/profile.controller.js
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import { ProfileService } from "../services/profile.service.js";

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

export { getUserProfile, getUserPosts };
