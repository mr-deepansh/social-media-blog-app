import { User } from "../../users/models/user.model.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import mongoose from "mongoose";

// GET: Get all users
const getAllUsers = asyncHandler(async (req, res) => {
	const users = await User.find().select("-password -refreshToken");
	return res
		.status(200)
		.json(new ApiResponse(200, { users }, "Users fetched successfully"));
});

// DELETE: Delete user by ID
const deleteUserById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid user ID");
	}

	const user = await User.findByIdAndDelete(id);

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "User deleted successfully"));
});

// PUT: Update user by ID
const updateUserById = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const updates = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid user ID");
	}

	const user = await User.findByIdAndUpdate(id, updates, {
		new: true,
		runValidators: true,
	});

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, user, "User updated successfully"));
});

export { getAllUsers, deleteUserById, updateUserById };
