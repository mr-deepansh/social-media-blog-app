// user.controller.js
import { User } from "../models/user.model.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import Jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
	try {
		const user = await User.findById(userId);
		const accessToken = user.generateAccessToken();
		const refreshToken = user.generateRefreshToken();

		user.refreshToken = refreshToken;
		await user.save({ validateBeforeSave: false });
		return { accessToken, refreshToken };
	} catch (error) {
		throw new ApiError(
			500,
			"Something went wrong while generating refresh and access token",
		);
	}
};

// Get all users with pagination and filtering
const getAllUsers = asyncHandler(async (req, res) => {
	const {
		page = 1,
		limit = 10,
		search,
		role,
		isActive,
		sortBy = "createdAt",
		sortOrder = "desc",
	} = req.query;

	const query = {};

	// Add search filter
	if (search) {
		query.$or = [
			{ username: { $regex: search, $options: "i" } },
			{ email: { $regex: search, $options: "i" } },
			{ firstName: { $regex: search, $options: "i" } },
			{ lastName: { $regex: search, $options: "i" } },
		];
	}

	// Add role filter
	if (role) {
		query.role = role;
	}

	// Add active status filter
	if (isActive !== undefined) {
		query.isActive = isActive === "true";
	}

	const sortOptions = {};
	sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

	const skip = (page - 1) * limit;

	const users = await User.find(query)
		.select("-password -refreshToken")
		.sort(sortOptions)
		.skip(skip)
		.limit(parseInt(limit));

	const totalUsers = await User.countDocuments(query);

	return res.status(200).json(
		new ApiResponse(
			200,
			{
				users,
				pagination: {
					currentPage: parseInt(page),
					totalPages: Math.ceil(totalUsers / limit),
					totalUsers,
					hasNextPage: page * limit < totalUsers,
					hasPrevPage: page > 1,
				},
			},
			"Users fetched successfully",
		),
	);
});

// Get user by ID
const getUserById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	// Check if user is trying to access their own profile or is admin
	if (req.user.role !== "admin" && req.user._id.toString() !== id) {
		throw new ApiError(403, "You can only access your own profile");
	}

	const user = await User.findById(id).select("-password -refreshToken");

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, user, "User fetched successfully"));
});

// Create new user
import bcrypt from "bcryptjs";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createUser = asyncHandler(async (req, res) => {
	const { username, email, password, firstName, lastName, bio, avatar } =
		req.body;

	const existingUser = await User.findOne({
		$or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
	});
	if (existingUser) {
		throw new ApiError(409, "Username or email already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const user = await User.create({
		username: username.toLowerCase(),
		email: email.toLowerCase(),
		password: hashedPassword,
		firstName,
		lastName,
		bio,
		avatar,
		role: "user",
		isActive: true,
	});

	const createdUser = await User.findById(user._id).select(
		"-password -refreshToken",
	);

	return res
		.status(201)
		.json(new ApiResponse(201, createdUser, "User created successfully"));
});

// Update user profile
const updateUser = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const updateData = req.body;

	// Check if user is trying to update their own profile or is admin
	if (req.user.role !== "admin" && req.user._id.toString() !== id) {
		throw new ApiError(403, "You can only update your own profile");
	}

	// Remove sensitive fields that shouldn't be updated directly
	delete updateData.password;
	delete updateData.refreshToken;
	delete updateData.role; // Only admins should be able to change roles

	const user = await User.findByIdAndUpdate(
		id,
		{ $set: updateData },
		{ new: true, runValidators: true },
	).select("-password -refreshToken");

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, user, "User updated successfully"));
});

// Delete user account
const deleteUser = asyncHandler(async (req, res) => {
	const { id } = req.params;

	// Check if user is trying to delete their own account or is admin
	if (req.user.role !== "admin" && req.user._id.toString() !== id) {
		throw new ApiError(403, "You can only delete your own account");
	}

	const user = await User.findByIdAndDelete(id);

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "User deleted successfully"));
});

// Get current user profile
const getCurrentUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id).select(
		"-password -refreshToken",
	);

	return res
		.status(200)
		.json(
			new ApiResponse(200, user, "Current user profile fetched successfully"),
		);
});

// Update current user profile
const updateCurrentUserProfile = asyncHandler(async (req, res) => {
	const updateData = req.body;

	// Remove sensitive fields
	delete updateData.password;
	delete updateData.refreshToken;
	delete updateData.role;
	delete updateData.isActive;

	const user = await User.findByIdAndUpdate(
		req.user._id,
		{ $set: updateData },
		{ new: true, runValidators: true },
	).select("-password -refreshToken");

	return res
		.status(200)
		.json(new ApiResponse(200, user, "Profile updated successfully"));
});

// Change user password
const changePassword = asyncHandler(async (req, res) => {
	const { currentPassword, newPassword } = req.body;

	const user = await User.findById(req.user._id);

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	// Verify current password
	const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

	if (!isPasswordCorrect) {
		throw new ApiError(400, "Current password is incorrect");
	}

	// Update password
	user.password = newPassword;
	await user.save({ validateBeforeSave: false });

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Upload user avatar
const uploadAvatar = asyncHandler(async (req, res) => {
	// This would typically handle file upload logic
	// For now, we'll just return a success message
	// In a real implementation, you'd use multer or similar for file handling

	const { avatarUrl } = req.body;

	if (!avatarUrl) {
		throw new ApiError(400, "Avatar URL is required");
	}

	const user = await User.findByIdAndUpdate(
		req.user._id,
		{ $set: { avatar: avatarUrl } },
		{ new: true },
	).select("-password -refreshToken");

	return res
		.status(200)
		.json(new ApiResponse(200, user, "Avatar uploaded successfully"));
});

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
	const {
		username,
		email,
		password,
		confirmPassword,
		firstName,
		lastName,
		bio = "",
		avatar = "",
	} = req.body;

	if (password !== confirmPassword) {
		throw new ApiError(400, "Passwords do not match");
	}

	const existingUser = await User.findOne({
		$or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
	});

	if (existingUser) {
		throw new ApiError(409, "User with this username or email already exists");
	}

	const user = await User.create({
		username: username.toLowerCase(),
		email: email.toLowerCase(),
		password,
		firstName,
		lastName,
		bio,
		avatar,
		role: "user",
		isActive: true,
	});

	const createdUser = await User.findById(user._id).select(
		"-password -refreshToken",
	);

	return res
		.status(201)
		.json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// Login a user
const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email: email.toLowerCase() });

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	const isPasswordValid = await user.isPasswordCorrect(password);

	if (!isPasswordValid) {
		throw new ApiError(401, "Invalid credentials");
	}

	const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
		user._id,
	);

	const loggedInUser = await User.findById(user._id).select(
		"-password -refreshToken",
	);

	const options = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
	};

	return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(
			new ApiResponse(
				200,
				{
					user: loggedInUser,
					accessToken,
					refreshToken,
				},
				"User logged in successfully",
			),
		);
});

const logoutUser = asyncHandler(async (req, res) => {
	const userId = req.user?._id;

	// Step 1: Clear refreshToken in DB
	await User.findByIdAndUpdate(
		userId,
		{ $unset: { refreshToken: 1 } },
		{ new: true },
	);

	// Step 2: Clear cookies
	const cookieOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production", // true in production only
		sameSite: "Strict",
	};

	// Step 3: Send response
	return res
		.status(200)
		.clearCookie("accessToken", cookieOptions)
		.clearCookie("refreshToken", cookieOptions)
		.json(new ApiResponse(200, null, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
	const incomingRefreshToken =
		req.cookies.refreshToken || req.body.refreshToken;

	if (!incomingRefreshToken) {
		throw new ApiError(401, "unauthorized request");
	}

	try {
		const decodedToken = Jwt.verify(
			incomingRefreshToken,
			process.env.REFRESH_TOKEN_SECRET,
		);

		const user = await User.findById(decodedToken?._id);

		if (!user) {
			throw new ApiError(401, "Invalid refresh token");
		}

		if (incomingRefreshToken !== user?.refreshToken) {
			throw new ApiError(401, "Refresh token is expired or used");
		}

		const options = {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
		};

		const { accessToken, newRefreshToken } =
			await generateAccessAndRefreshTokens(user._id);

		return res
			.status(200)
			.cookie("accessToken", accessToken, options)
			.cookie("refreshToken", newRefreshToken, options)
			.json(
				new ApiResponse(
					200,
					{ accessToken, refreshToken: newRefreshToken },
					"Access token refreshed",
				),
			);
	} catch (error) {
		throw new ApiError(401, error?.message || "Invalid refresh token");
	}
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
	const { currentPassword, newPassword } = req.body;

	const user = await User.findById(req.user?._id);
	const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

	if (!isPasswordCorrect) {
		throw new ApiError(400, "Invalid old password");
	}

	user.password = newPassword;
	await user.save({ validateBeforeSave: false });

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
	return res
		.status(200)
		.json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
	const { fullName, email } = req.body;

	if (!fullName || !email) {
		throw new ApiError(400, "All fields are required");
	}

	const user = await User.findByIdAndUpdate(
		req.user?._id,
		{
			$set: {
				fullName,
				email: email,
			},
		},
		{ new: true },
	).select("-password");

	return res
		.status(200)
		.json(new ApiResponse(200, user, "Account details updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
	const { username } = req.params;

	if (!username?.trim()) {
		throw new ApiError(400, "username is missing");
	}

	const channel = await User.aggregate([
		{
			$match: {
				username: username?.toLowerCase(),
			},
		},
		{
			$lookup: {
				from: "subscriptions",
				localField: "_id",
				foreignField: "channel",
				as: "subscribers",
			},
		},
		{
			$lookup: {
				from: "subscriptions",
				localField: "_id",
				foreignField: "subscriber",
				as: "subscribedTo",
			},
		},
		{
			$addFields: {
				subscribersCount: {
					$size: "$subscribers",
				},
				channelsSubscribedToCount: {
					$size: "$subscribedTo",
				},
				isSubscribed: {
					$cond: {
						if: { $in: [req.user?._id, "$subscribers.subscriber"] },
						then: true,
						else: false,
					},
				},
			},
		},
		{
			$project: {
				fullName: 1,
				username: 1,
				subscribersCount: 1,
				channelsSubscribedToCount: 1,
				isSubscribed: 1,
				avatar: 1,
				coverImage: 1,
				email: 1,
			},
		},
	]);

	if (!channel?.length) {
		throw new ApiError(404, "channel does not exists");
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, channel[0], "User channel fetched successfully"),
		);
});

const getWatchHistory = asyncHandler(async (req, res) => {
	const user = await User.aggregate([
		{
			$match: {
				_id: new mongoose.Types.ObjectId(req.user._id),
			},
		},
		{
			$lookup: {
				from: "videos",
				localField: "watchHistory",
				foreignField: "_id",
				as: "watchHistory",
				pipeline: [
					{
						$lookup: {
							from: "users",
							localField: "owner",
							foreignField: "_id",
							as: "owner",
							pipeline: [
								{
									$project: {
										fullName: 1,
										username: 1,
										avatar: 1,
									},
								},
							],
						},
					},
					{
						$addFields: {
							owner: {
								$first: "$owner",
							},
						},
					},
				],
			},
		},
	]);

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				user[0].watchHistory,
				"Watch history fetched successfully",
			),
		);
});

export {
	registerUser,
	loginUser,
	logoutUser,
	refreshAccessToken,
	changeCurrentPassword,
	getCurrentUser,
	updateAccountDetails,
	getUserChannelProfile,
	getWatchHistory,
	// New methods for the routes
	getAllUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
	getCurrentUserProfile,
	updateCurrentUserProfile,
	changePassword,
	uploadAvatar,
};
