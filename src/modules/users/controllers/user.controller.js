// src/modules/users/controllers/user.controller.js
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

// Create a new user
const createUser = asyncHandler(async (req, res) => {
	const { username, email, password, firstName, lastName, bio, avatar } =
		req.body;

	if (!username || !email || !password) {
		throw new ApiError(400, "Username, email, and password are required");
	}

	if (password.length < 8) {
		throw new ApiError(400, "Password must be at least 8 characters long");
	}

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
	if (!currentPassword || !newPassword) {
		throw new ApiError(400, "Current password and new password are required");
	}

	if (newPassword.length < 8) {
		throw new ApiError(400, "Password must be at least 8 characters long");
	}

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

	if (!username || !email || !password || !firstName || !lastName) {
		throw new ApiError(400, "All required fields must be provided");
	}
	if (password !== confirmPassword) {
		throw new ApiError(400, "Passwords do not match");
	}
	if (password.length < 8) {
		throw new ApiError(400, "Password must be at least 8 characters long");
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
	// TODO login by username or email
	if (!email || !password) {
		throw new ApiError(400, "Email and password are required");
	}
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
	await User.findByIdAndUpdate(
		userId,
		{ $unset: { refreshToken: 1 } },
		{ new: true },
	);
	const cookieOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "Strict",
	};
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
	if (!currentPassword || !newPassword) {
		throw new ApiError(400, "Current password and new password are required");
	}
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
				subscribersCount: { $size: { $ifNull: ["$subscribers", []] } },
				channelsSubscribedToCount: {
					$size: { $ifNull: ["$subscribedTo", []] },
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

// Get user's followers with proper error handling and validation
const getUserFollowers = asyncHandler(async (req, res) => {
	const { userId } = req.params;
	const { page = 1, limit = 20, search } = req.query;

	if (!mongoose.Types.ObjectId.isValid(userId)) {
		throw new ApiError(400, "Invalid user ID format");
	}

	const pageNum = Math.max(1, parseInt(page, 10) || 1);
	const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
	const skip = (pageNum - 1) * limitNum;
	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError(404, "User not found");
	}
	const pipeline = [
		{
			$match: {
				_id: { $in: user.followers },
			},
		},
	];
	// Add search filter if provided
	if (search && search.trim()) {
		const searchRegex = new RegExp(
			search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
			"i",
		);
		pipeline.push({
			$match: {
				$or: [
					{ username: { $regex: searchRegex } },
					{ firstName: { $regex: searchRegex } },
					{ lastName: { $regex: searchRegex } },
					{
						$expr: {
							$regexMatch: {
								input: {
									$concat: [
										{ $ifNull: ["$firstName", ""] },
										" ",
										{ $ifNull: ["$lastName", ""] },
									],
								},
								regex: search.trim(),
								options: "i",
							},
						},
					},
				],
			},
		});
	}
	// Add projection and sorting
	pipeline.push(
		{
			$addFields: {
				fullName: {
					$trim: {
						input: {
							$concat: [
								{ $ifNull: ["$firstName", ""] },
								" ",
								{ $ifNull: ["$lastName", ""] },
							],
						},
					},
				},
				followersCount: { $size: { $ifNull: ["$followers", []] } },
				followingCount: { $size: { $ifNull: ["$following", []] } },
			},
		},
		{
			$sort: { createdAt: -1 },
		},
		{
			$skip: skip,
		},
		{
			$limit: limitNum,
		},
		{
			$project: {
				_id: 1,
				username: 1,
				firstName: 1,
				lastName: 1,
				fullName: 1,
				avatar: 1,
				bio: { $substr: [{ $ifNull: ["$bio", ""] }, 0, 150] },
				followersCount: 1,
				followingCount: 1,
				isActive: 1,
				createdAt: 1,
			},
		},
	);
	// Execute aggregation and get total count
	const [followers, totalCountResult] = await Promise.all([
		User.aggregate(pipeline),
		User.aggregate([
			{ $match: { _id: { $in: user.followers } } },
			...(search && search.trim()
				? [
						{
							$match: {
								$or: [
									{
										username: {
											$regex: new RegExp(
												search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
												"i",
											),
										},
									},
									{
										firstName: {
											$regex: new RegExp(
												search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
												"i",
											),
										},
									},
									{
										lastName: {
											$regex: new RegExp(
												search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
												"i",
											),
										},
									},
								],
							},
						},
					]
				: []),
			{ $count: "total" },
		]),
	]);

	const totalFollowers =
		totalCountResult.length > 0 ? totalCountResult[0].total : 0;
	const totalPages = Math.ceil(totalFollowers / limitNum);

	return res.status(200).json(
		new ApiResponse(
			200,
			{
				followers: followers.map((follower) => ({
					...follower,
					avatar: follower.avatar || "/assets/default-avatar.png",
					bio: follower.bio || "",
				})),
				pagination: {
					currentPage: pageNum,
					totalPages,
					totalFollowers,
					hasNextPage: pageNum < totalPages,
					hasPrevPage: pageNum > 1,
					limit: limitNum,
				},
				meta: {
					searchTerm: search?.trim() || null,
					userId,
				},
			},
			"Followers fetched successfully",
		),
	);
});

// Get user's following list with proper error handling
const getUserFollowing = asyncHandler(async (req, res) => {
	const { userId } = req.params;
	const { page = 1, limit = 20, search } = req.query;

	if (!mongoose.Types.ObjectId.isValid(userId)) {
		throw new ApiError(400, "Invalid user ID format");
	}
	const pageNum = Math.max(1, parseInt(page, 10) || 1);
	const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
	const skip = (pageNum - 1) * limitNum;

	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError(404, "User not found");
	}

	const pipeline = [
		{
			$match: {
				_id: { $in: user.following },
			},
		},
	];
	// Add search filter if provided
	if (search && search.trim()) {
		const searchRegex = new RegExp(
			search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
			"i",
		);
		pipeline.push({
			$match: {
				$or: [
					{ username: { $regex: searchRegex } },
					{ firstName: { $regex: searchRegex } },
					{ lastName: { $regex: searchRegex } },
					{
						$expr: {
							$regexMatch: {
								input: {
									$concat: [
										{ $ifNull: ["$firstName", ""] },
										" ",
										{ $ifNull: ["$lastName", ""] },
									],
								},
								regex: search.trim(),
								options: "i",
							},
						},
					},
				],
			},
		});
	}
	// Add projection and sorting
	pipeline.push(
		{
			$addFields: {
				fullName: {
					$trim: {
						input: {
							$concat: [
								{ $ifNull: ["$firstName", ""] },
								" ",
								{ $ifNull: ["$lastName", ""] },
							],
						},
					},
				},
				followersCount: { $size: { $ifNull: ["$followers", []] } },
				followingCount: { $size: { $ifNull: ["$following", []] } },
			},
		},
		{
			$sort: { createdAt: -1 },
		},
		{
			$skip: skip,
		},
		{
			$limit: limitNum,
		},
		{
			$project: {
				_id: 1,
				username: 1,
				firstName: 1,
				lastName: 1,
				fullName: 1,
				avatar: 1,
				bio: { $substr: [{ $ifNull: ["$bio", ""] }, 0, 150] },
				followersCount: 1,
				followingCount: 1,
				isActive: 1,
				createdAt: 1,
			},
		},
	);
	// Execute aggregation and get total count
	const [following, totalCountResult] = await Promise.all([
		User.aggregate(pipeline),
		User.aggregate([
			{ $match: { _id: { $in: user.following } } },
			...(search && search.trim()
				? [
						{
							$match: {
								$or: [
									{
										username: {
											$regex: new RegExp(
												search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
												"i",
											),
										},
									},
									{
										firstName: {
											$regex: new RegExp(
												search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
												"i",
											),
										},
									},
									{
										lastName: {
											$regex: new RegExp(
												search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
												"i",
											),
										},
									},
								],
							},
						},
					]
				: []),
			{ $count: "total" },
		]),
	]);
	const totalFollowing =
		totalCountResult.length > 0 ? totalCountResult[0].total : 0;
	const totalPages = Math.ceil(totalFollowing / limitNum);
	return res.status(200).json(
		new ApiResponse(
			200,
			{
				following: following.map((user) => ({
					...user,
					avatar: user.avatar || "/assets/default-avatar.png",
					bio: user.bio || "",
				})),
				pagination: {
					currentPage: pageNum,
					totalPages,
					totalFollowing,
					hasNextPage: pageNum < totalPages,
					hasPrevPage: pageNum > 1,
					limit: limitNum,
				},
				meta: {
					searchTerm: search?.trim() || null,
					userId,
				},
			},
			"Following list fetched successfully",
		),
	);
});

// searchUsers function
const searchUsers = asyncHandler(async (req, res) => {
	const {
		search,
		username,
		firstName,
		lastName,
		page = 1,
		limit = 10,
		sortBy = "relevance",
		includePrivate = false,
	} = req.query;

	// Validate search parameters
	if (!search && !username && !firstName && !lastName) {
		throw new ApiError(
			400,
			"At least one search parameter is required (search, username, firstName, or lastName)",
		);
	}
	// Validate search length if provided
	if (search && search.trim().length < 2) {
		throw new ApiError(400, "Search query must be at least 2 characters long");
	}
	const pageNum = Math.max(1, parseInt(page, 10) || 1);
	const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
	const currentUserId = req.user?._id;
	const skip = (pageNum - 1) * limitNum;
	const startTime = Date.now();
	try {
		// Helper function to sanitize search terms
		const sanitizeSearchTerm = (term) => {
			if (!term) return null;
			return term.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		};
		// Sanitize search terms
		const sanitizedSearch = sanitizeSearchTerm(search);
		const sanitizedUsername = sanitizeSearchTerm(username);
		const sanitizedFirstName = sanitizeSearchTerm(firstName);
		const sanitizedLastName = sanitizeSearchTerm(lastName);
		// Build search conditions
		const searchConditions = [];
		// General search across multiple fields
		if (sanitizedSearch) {
			const searchRegex = new RegExp(sanitizedSearch, "i");
			searchConditions.push({
				$or: [
					{ username: { $regex: searchRegex } },
					{ firstName: { $regex: searchRegex } },
					{ lastName: { $regex: searchRegex } },
					{
						$expr: {
							$regexMatch: {
								input: {
									$concat: [
										{ $ifNull: ["$firstName", ""] },
										" ",
										{ $ifNull: ["$lastName", ""] },
									],
								},
								regex: sanitizedSearch,
								options: "i",
							},
						},
					},
				],
			});
		}
		// Specific username search
		if (sanitizedUsername) {
			const usernameRegex = new RegExp(sanitizedUsername, "i");
			searchConditions.push({
				username: { $regex: usernameRegex },
			});
		}
		// Specific first name search
		if (sanitizedFirstName) {
			const firstNameRegex = new RegExp(sanitizedFirstName, "i");
			searchConditions.push({
				firstName: { $regex: firstNameRegex },
			});
		}
		// Specific last name search
		if (sanitizedLastName) {
			const lastNameRegex = new RegExp(sanitizedLastName, "i");
			searchConditions.push({
				lastName: { $regex: lastNameRegex },
			});
		}
		// Build match conditions
		const matchConditions = {
			$and: [
				// Combine all search conditions with AND logic
				...(searchConditions.length > 0 ? [{ $and: searchConditions }] : []),
				{ isActive: { $eq: true } },
				{ $expr: { $ne: [{ $ifNull: ["$isDeleted", false] }, true] } },
			],
		};
		// Add private profile filter if not admin
		if (!includePrivate && req.user?.role !== "admin") {
			matchConditions.$and.push({
				$expr: { $ne: [{ $ifNull: ["$isPrivate", false] }, true] },
			});
		}
		// Define sorting options
		let sortStage = {};
		switch (sortBy) {
			case "followers":
				sortStage = { followersCount: -1, username: 1 };
				break;
			case "newest":
				sortStage = { createdAt: -1, username: 1 };
				break;
			case "username":
				sortStage = { username: 1 };
				break;
			default: // relevance
				sortStage = { relevanceScore: -1, followersCount: -1, username: 1 };
		}
		// Enhanced relevance scoring
		const calculateRelevanceScore = () => {
			const conditions = [];
			// If general search is provided
			if (sanitizedSearch) {
				const searchRegex = new RegExp(sanitizedSearch, "i");
				conditions.push(
					// Exact username match gets highest score
					{
						$cond: [
							{
								$eq: [{ $toLower: "$username" }, sanitizedSearch.toLowerCase()],
							},
							100,
							0,
						],
					},
					// Username starts with search term
					{
						$cond: [
							{
								$eq: [
									{
										$indexOfCP: [
											{ $toLower: "$username" },
											sanitizedSearch.toLowerCase(),
										],
									},
									0,
								],
							},
							75,
							0,
						],
					},
					// Username contains search term
					{
						$cond: [
							{ $regexMatch: { input: "$username", regex: searchRegex } },
							50,
							0,
						],
					},
					// First name match
					{
						$cond: [
							{
								$regexMatch: {
									input: { $ifNull: ["$firstName", ""] },
									regex: searchRegex,
								},
							},
							30,
							0,
						],
					},
					// Last name match
					{
						$cond: [
							{
								$regexMatch: {
									input: { $ifNull: ["$lastName", ""] },
									regex: searchRegex,
								},
							},
							30,
							0,
						],
					},
				);
			}
			// Specific field matches get higher scores
			if (sanitizedUsername) {
				const usernameRegex = new RegExp(sanitizedUsername, "i");
				conditions.push({
					$cond: [
						{ $regexMatch: { input: "$username", regex: usernameRegex } },
						80,
						0,
					],
				});
			}
			if (sanitizedFirstName) {
				const firstNameRegex = new RegExp(sanitizedFirstName, "i");
				conditions.push({
					$cond: [
						{
							$regexMatch: {
								input: { $ifNull: ["$firstName", ""] },
								regex: firstNameRegex,
							},
						},
						60,
						0,
					],
				});
			}
			if (sanitizedLastName) {
				const lastNameRegex = new RegExp(sanitizedLastName, "i");
				conditions.push({
					$cond: [
						{
							$regexMatch: {
								input: { $ifNull: ["$lastName", ""] },
								regex: lastNameRegex,
							},
						},
						60,
						0,
					],
				});
			}
			return conditions.length > 0 ? { $sum: conditions } : { $literal: 0 };
		};
		// Aggregation pipeline for search
		const pipeline = [
			{ $match: matchConditions },
			{
				$addFields: {
					// Calculate relevance score
					relevanceScore: calculateRelevanceScore(),
					// Check if current user follows this user
					isFollowing: currentUserId
						? {
								$in: [currentUserId, { $ifNull: ["$followers", []] }],
							}
						: false,
					// Full name for display
					fullName: {
						$trim: {
							input: {
								$concat: [
									{ $ifNull: ["$firstName", ""] },
									" ",
									{ $ifNull: ["$lastName", ""] },
								],
							},
						},
					},
					// Calculate followers count
					followersCount: { $size: { $ifNull: ["$followers", []] } },
					followingCount: { $size: { $ifNull: ["$following", []] } },
				},
			},
			{ $sort: sortStage },
			{ $skip: skip },
			{ $limit: limitNum },
			{
				$project: {
					_id: 1,
					username: 1,
					firstName: 1,
					lastName: 1,
					fullName: 1,
					avatar: 1,
					bio: { $substr: [{ $ifNull: ["$bio", ""] }, 0, 150] },
					followersCount: 1,
					followingCount: 1,
					isVerified: { $ifNull: ["$isVerified", false] },
					isPrivate: { $ifNull: ["$isPrivate", false] },
					isFollowing: 1,
					relevanceScore: 1,
					createdAt: 1,
				},
			},
		];
		// Execute search with timeout and get total count
		const [users, totalCount] = await Promise.all([
			User.aggregate(pipeline).maxTimeMS(10000).exec(),
			User.aggregate([{ $match: matchConditions }, { $count: "total" }])
				.maxTimeMS(5000)
				.exec(),
		]);
		const total = totalCount.length > 0 ? totalCount[0].total : 0;
		// Format response
		const formattedUsers = users.map((user) => ({
			...user,
			avatar: user.avatar || "/assets/default-avatar.png",
			fullName: user.fullName || user.username,
			bio: user.bio || "",
		}));
		const totalPages = Math.ceil(total / limitNum);
		const hasMore = pageNum < totalPages;
		// Build search summary for response
		const searchSummary = [];
		if (search) searchSummary.push(`general: "${search.trim()}"`);
		if (username) searchSummary.push(`username: "${username.trim()}"`);
		if (firstName) searchSummary.push(`firstName: "${firstName.trim()}"`);
		if (lastName) searchSummary.push(`lastName: "${lastName.trim()}"`);
		return res.status(200).json(
			new ApiResponse(
				200,
				{
					users: formattedUsers,
					pagination: {
						currentPage: pageNum,
						totalPages,
						totalResults: total,
						hasMore,
						limit: limitNum,
						hasNext: hasMore,
						hasPrevious: pageNum > 1,
					},
					meta: {
						searchCriteria: {
							search: search?.trim() || null,
							username: username?.trim() || null,
							firstName: firstName?.trim() || null,
							lastName: lastName?.trim() || null,
						},
						searchSummary: searchSummary.join(", "),
						resultsCount: formattedUsers.length,
						searchTime: Date.now() - startTime,
						sortBy,
						filters: {
							includePrivate: Boolean(includePrivate),
						},
					},
				},
				formattedUsers.length === 0
					? "No users found matching your search criteria"
					: `Found ${formattedUsers.length} of ${total} users`,
			),
		);
	} catch (error) {
		console.error("User search error:", error);
		// Handle specific errors
		if (error.message && error.message.includes("maxTimeMS")) {
			throw new ApiError(
				408,
				"Search timeout - please try a more specific search query",
			);
		}
		if (error.name === "MongoError" && error.code === 2) {
			throw new ApiError(400, "Invalid search query format");
		}
		if (error.name === "CastError") {
			throw new ApiError(400, "Invalid user ID format");
		}
		// Don't expose internal errors
		if (error instanceof ApiError) {
			throw error;
		}
		throw new ApiError(500, "Search operation failed. Please try again.");
	}
});

// Fixed getUserSuggestions function
const getUserSuggestions = asyncHandler(async (req, res) => {
	const { limit = 10, type = "all" } = req.query;
	const currentUserId = req.user._id;
	const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

	try {
		// Get current user's data with better error handling
		const currentUser = await User.findById(currentUserId).select(
			"following followers",
		);
		if (!currentUser) {
			throw new ApiError(404, "Current user not found");
		}

		const followingIds = currentUser.following || [];
		const followerIds = currentUser.followers || [];

		// Fixed: Removed duplicate $expr in baseMatch
		const baseMatch = {
			_id: { $nin: [currentUserId, ...followingIds] },
			isActive: true,
			$and: [
				{ $expr: { $ne: [{ $ifNull: ["$isDeleted", false] }, true] } },
				{ $expr: { $ne: [{ $ifNull: ["$isPrivate", false] }, true] } },
			],
		};

		let pipeline = [];

		// Different suggestion types with improved logic
		switch (type) {
			case "followers":
				// People who follow you but you don't follow back
				pipeline = [
					{
						$match: {
							...baseMatch,
							_id: { $in: followerIds, $nin: [...followingIds, currentUserId] },
						},
					},
				];
				break;
			case "mutual":
				// People with mutual connections
				pipeline = [
					{ $match: baseMatch },
					{
						$addFields: {
							mutualFollowers: {
								$size: {
									$setIntersection: [
										{ $ifNull: ["$followers", []] },
										followingIds,
									],
								},
							},
						},
					},
					{ $match: { mutualFollowers: { $gt: 0 } } },
				];
				break;
			case "popular":
				// Users sorted primarily by popularity
				pipeline = [
					{ $match: baseMatch },
					{
						$addFields: {
							followersCount: { $size: { $ifNull: ["$followers", []] } },
						},
					},
					{ $match: { followersCount: { $gte: 10 } } }, // Only suggest users with decent following
				];
				break;
			default:
				// General suggestions with balanced algorithm
				pipeline = [{ $match: baseMatch }];
		}

		// Add common aggregation stages with improved scoring
		pipeline.push(
			{
				$addFields: {
					suggestionScore: {
						$sum: [
							// High boost for users who follow you back
							{
								$cond: [
									{ $in: [currentUserId, { $ifNull: ["$following", []] }] },
									100,
									0,
								],
							},
							// Boost for mutual followers (scaled)
							{
								$multiply: [
									{
										$size: {
											$setIntersection: [
												{ $ifNull: ["$followers", []] },
												followingIds,
											],
										},
									},
									10,
								],
							},
							// Moderate boost for popularity (logarithmic to prevent overshadowing)
							{
								$multiply: [
									{
										$log10: {
											$add: [{ $size: { $ifNull: ["$followers", []] } }, 1],
										},
									},
									5,
								],
							},
							// Small boost for recent activity
							{
								$cond: [
									{
										$gte: [
											"$lastActive",
											{ $subtract: [new Date(), 7 * 24 * 60 * 60 * 1000] }, // 7 days
										],
									},
									20,
									0,
								],
							},
						],
					},
					mutualFollowersCount: {
						$size: {
							$setIntersection: [{ $ifNull: ["$followers", []] }, followingIds],
						},
					},
					followsYou: { $in: [currentUserId, { $ifNull: ["$following", []] }] },
					followersCount: { $size: { $ifNull: ["$followers", []] } },
					followingCount: { $size: { $ifNull: ["$following", []] } },
					fullName: {
						$trim: {
							input: {
								$concat: [
									{ $ifNull: ["$firstName", ""] },
									" ",
									{ $ifNull: ["$lastName", ""] },
								],
							},
						},
					},
				},
			},
			{
				$sort: {
					suggestionScore: -1,
					followersCount: -1,
					createdAt: -1,
				},
			},
			{ $limit: limitNum },
			{
				$project: {
					_id: 1,
					username: 1,
					firstName: 1,
					lastName: 1,
					fullName: 1,
					avatar: 1,
					bio: { $substr: [{ $ifNull: ["$bio", ""] }, 0, 100] },
					followersCount: 1,
					followingCount: 1,
					mutualFollowersCount: 1,
					followsYou: 1,
					isVerified: { $ifNull: ["$isVerified", false] },
					suggestionScore: 1,
					createdAt: 1,
					lastActive: 1,
				},
			},
		);

		// Execute aggregation with timeout
		const suggestions = await User.aggregate(pipeline).maxTimeMS(10000);

		// Enhanced formatting with better suggestion reasons
		const formattedSuggestions = suggestions.map((user) => {
			let suggestionReason = "Suggested for you";

			if (user.followsYou) {
				suggestionReason = "Follows you";
			} else if (user.mutualFollowersCount > 0) {
				suggestionReason =
					user.mutualFollowersCount === 1
						? "1 mutual follower"
						: `${user.mutualFollowersCount} mutual followers`;
			} else if (user.followersCount > 1000) {
				suggestionReason = "Popular user";
			} else if (user.followersCount > 100) {
				suggestionReason = "Active user";
			}

			return {
				...user,
				avatar: user.avatar || "/assets/default-avatar.png",
				fullName: user.fullName || user.username || "Unknown User",
				bio: user.bio || "",
				suggestionReason,
			};
		});

		return res.status(200).json(
			new ApiResponse(
				200,
				{
					suggestions: formattedSuggestions,
					meta: {
						type,
						count: formattedSuggestions.length,
						limit: limitNum,
						hasMore: formattedSuggestions.length === limitNum,
					},
				},
				formattedSuggestions.length > 0
					? "User suggestions fetched successfully"
					: "No suggestions available at this time",
			),
		);
	} catch (error) {
		console.error("Get user suggestions error:", error);

		if (error instanceof ApiError) {
			throw error;
		}

		throw new ApiError(
			500,
			"Failed to fetch user suggestions. Please try again later.",
		);
	}
});

// Enhanced getUserFeed function with better performance and error handling
const getUserFeed = asyncHandler(async (req, res) => {
	const {
		page = 1,
		limit = 20,
		sortBy = "createdAt",
		sortOrder = "desc",
		type = "all",
	} = req.query;

	const pageNum = Math.max(1, parseInt(page, 10) || 1);
	const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
	const userId = req.user._id;
	const skip = (pageNum - 1) * limitNum;

	try {
		const currentUser = await User.findById(userId).select("following").lean(); // Use lean for better performance
		if (!currentUser) {
			throw new ApiError(404, "User not found");
		}
		const followingIds = currentUser.following || [];
		let matchConditions = {};
		switch (type) {
			case "following":
				if (followingIds.length === 0) {
					return res.status(200).json(
						new ApiResponse(
							200,
							{
								feed: [],
								pagination: {
									currentPage: pageNum,
									totalPages: 0,
									totalPosts: 0,
									hasNextPage: false,
									hasPrevPage: false,
									limit: limitNum,
								},
								meta: {
									feedType: type,
									sortBy,
									sortOrder,
									followingCount: 0,
								},
							},
							"No posts available - you're not following anyone yet",
						),
					);
				}
				matchConditions = {
					owner: { $in: followingIds },
				};
				break;
			case "own":
				matchConditions = {
					owner: userId,
				};
				break;
			case "trending":
				// Trending posts from last 7 days with high engagement
				const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
				matchConditions = {
					createdAt: { $gte: weekAgo },
					$or: [
						{ owner: { $in: [...followingIds, userId] } },
						{
							isPublic: true,
							$expr: {
								$gte: [{ $add: ["$likesCount", "$commentsCount"] }, 10],
							},
						},
					],
				};
				break;
			default: // "all"
				matchConditions = {
					$or: [
						{ owner: { $in: [...followingIds, userId] } },
						{
							isPublic: { $ne: false },
							owner: { $ne: userId }, // Avoid duplicating own posts
						},
					],
				};
		}
		// Add common filters with better handling
		matchConditions = {
			...matchConditions,
			$and: [{ isActive: { $ne: false } }, { isDeleted: { $ne: true } }],
		};
		// Enhanced sorting with validation
		const validSortFields = [
			"createdAt",
			"updatedAt",
			"likesCount",
			"commentsCount",
			"engagementScore",
		];
		const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
		const validSortOrders = ["asc", "desc"];
		const validSortOrder = validSortOrders.includes(sortOrder)
			? sortOrder
			: "desc";
		let sortStage = {};
		sortStage[sortField] = validSortOrder === "desc" ? -1 : 1;
		// Enhanced pipeline with better performance
		const pipeline = [
			{ $match: matchConditions },
			{
				$lookup: {
					from: "users",
					localField: "owner",
					foreignField: "_id",
					as: "author",
					pipeline: [
						{
							$project: {
								_id: 1,
								username: 1,
								firstName: 1,
								lastName: 1,
								avatar: 1,
								isVerified: { $ifNull: ["$isVerified", false] },
							},
						},
					],
				},
			},
			{
				$addFields: {
					author: { $first: "$author" },
					engagementScore: {
						$add: [
							{ $multiply: [{ $ifNull: ["$likesCount", 0] }, 1] },
							{ $multiply: [{ $ifNull: ["$commentsCount", 0] }, 2] },
							{ $multiply: [{ $ifNull: ["$sharesCount", 0] }, 3] },
						],
					},
					// Check if current user liked this post
					isLikedByCurrentUser: {
						$in: [userId, { $ifNull: ["$likes", []] }],
					},
				},
			},
		];
		// Add sorting based on type
		if (type === "trending") {
			pipeline.push({
				$sort: {
					engagementScore: -1,
					createdAt: -1,
				},
			});
		} else {
			pipeline.push({ $sort: sortStage });
		}
		// Add pagination and projection
		pipeline.push(
			{ $skip: skip },
			{ $limit: limitNum },
			{
				$project: {
					_id: 1,
					content: 1,
					media: 1,
					author: 1,
					likesCount: { $ifNull: ["$likesCount", 0] },
					commentsCount: { $ifNull: ["$commentsCount", 0] },
					sharesCount: { $ifNull: ["$sharesCount", 0] },
					isLiked: "$isLikedByCurrentUser",
					createdAt: 1,
					updatedAt: 1,
					engagementScore: 1,
					isPublic: 1,
				},
			},
		);
		// Execute queries with proper error handling
		let feed = [];
		let totalPosts = 0;
		try {
			const db = mongoose.connection.db;
			// Check if posts collection exists
			const collections = await db.listCollections({ name: "posts" }).toArray();
			if (collections.length === 0) {
				console.warn("Posts collection does not exist");
				return res.status(200).json(
					new ApiResponse(
						200,
						{
							feed: [],
							pagination: {
								currentPage: pageNum,
								totalPages: 0,
								totalPosts: 0,
								hasNextPage: false,
								hasPrevPage: false,
								limit: limitNum,
							},
							meta: {
								feedType: type,
								sortBy: sortField,
								sortOrder: validSortOrder,
								followingCount: followingIds.length,
							},
						},
						"Feed is currently empty",
					),
				);
			}
			const postsCollection = db.collection("posts");
			// Execute both queries in parallel for better performance
			const [feedResult, totalCountResult] = await Promise.all([
				postsCollection.aggregate(pipeline).maxTimeMS(15000).toArray(),
				postsCollection
					.aggregate([{ $match: matchConditions }, { $count: "total" }])
					.maxTimeMS(10000)
					.toArray(),
			]);
			feed = feedResult;
			totalPosts = totalCountResult.length > 0 ? totalCountResult[0].total : 0;
		} catch (dbError) {
			console.error("Database error in getUserFeed:", dbError);
			if (dbError.code === 50) {
				// maxTimeMS exceeded
				throw new ApiError(408, "Feed request timed out. Please try again.");
			}
			throw new ApiError(500, "Database error occurred while fetching feed");
		}
		const totalPages = Math.ceil(totalPosts / limitNum);
		// Enhanced response formatting
		const formattedFeed = feed.map((post) => ({
			...post,
			author: {
				...post.author,
				avatar: post.author?.avatar || "/assets/default-avatar.png",
				displayName: post.author
					? `${post.author.firstName || ""} ${post.author.lastName || ""}`.trim() ||
						post.author.username
					: "Unknown User",
			},
			// Add relative timestamps if needed
			timeAgo: getTimeAgo(post.createdAt),
		}));

		return res.status(200).json(
			new ApiResponse(
				200,
				{
					feed: formattedFeed,
					pagination: {
						currentPage: pageNum,
						totalPages,
						totalPosts,
						hasNextPage: pageNum < totalPages,
						hasPrevPage: pageNum > 1,
						limit: limitNum,
					},
					meta: {
						feedType: type,
						sortBy: sortField,
						sortOrder: validSortOrder,
						followingCount: followingIds.length,
					},
				},
				totalPosts === 0
					? `No posts found in your ${type} feed`
					: `Feed fetched successfully - ${totalPosts} posts available`,
			),
		);
	} catch (error) {
		console.error("Get user feed error:", error);

		if (error instanceof ApiError) {
			throw error;
		}

		throw new ApiError(
			500,
			"Failed to fetch user feed. Please try again later.",
		);
	}
});

// Enhanced getUserProfileByUsername with privacy controls and better data handling
const getUserProfileByUsername = asyncHandler(async (req, res) => {
	const { username } = req.params;
	const currentUserId = req.user._id;
	// Enhanced input validation
	if (!username?.trim()) {
		throw new ApiError(400, "Username is required");
	}
	const sanitizedUsername = username.toLowerCase().trim();
	// Validate username format (basic validation)
	if (!/^[a-zA-Z0-9._-]+$/.test(sanitizedUsername)) {
		throw new ApiError(400, "Invalid username format");
	}
	try {
		const currentUser = await User.findById(currentUserId)
			.select("following")
			.lean();

		if (!currentUser) {
			throw new ApiError(401, "Current user not found");
		}

		const currentUserFollowing = currentUser.following || [];

		const userProfile = await User.aggregate([
			{
				$match: {
					username: sanitizedUsername,
					isActive: { $ne: false },
					isDeleted: { $ne: true },
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "followers",
					foreignField: "_id",
					as: "followersDetails",
					pipeline: [
						{
							$match: {
								isActive: { $ne: false },
								isDeleted: { $ne: true },
							},
						},
						{
							$project: {
								_id: 1,
								username: 1,
								firstName: 1,
								lastName: 1,
								avatar: 1,
								isVerified: { $ifNull: ["$isVerified", false] },
							},
						},
					],
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "following",
					foreignField: "_id",
					as: "followingDetails",
					pipeline: [
						{
							$match: {
								isActive: { $ne: false },
								isDeleted: { $ne: true },
							},
						},
						{
							$project: {
								_id: 1,
								username: 1,
								firstName: 1,
								lastName: 1,
								avatar: 1,
								isVerified: { $ifNull: ["$isVerified", false] },
							},
						},
					],
				},
			},
			{
				$addFields: {
					followersCount: { $size: { $ifNull: ["$followers", []] } },
					followingCount: { $size: { $ifNull: ["$following", []] } },
					isFollowing: {
						$in: [currentUserId, { $ifNull: ["$followers", []] }],
					},
					followsYou: {
						$in: [currentUserId, { $ifNull: ["$following", []] }],
					},
					isOwnProfile: {
						$eq: ["$_id", currentUserId],
					},
					// Calculate mutual followers using the current user's following list
					mutualFollowersCount: {
						$size: {
							$setIntersection: [
								{ $ifNull: ["$followers", []] },
								currentUserFollowing,
							],
						},
					},
					// Get sample mutual followers for display
					mutualFollowersSample: {
						$slice: [
							{
								$filter: {
									input: "$followersDetails",
									cond: { $in: ["$this._id", currentUserFollowing] },
								},
							},
							3,
						],
					},
				},
			},
			{
				$project: {
					_id: 1,
					username: 1,
					email: {
						$cond: {
							if: { $eq: ["$_id", currentUserId] },
							then: "$email",
							else: "$REMOVE",
						},
					},
					firstName: 1,
					lastName: 1,
					bio: 1,
					avatar: 1,
					coverImage: 1,
					location: 1,
					website: 1,
					isActive: 1,
					isVerified: { $ifNull: ["$isVerified", false] },
					isPrivate: { $ifNull: ["$isPrivate", false] },
					createdAt: 1,
					lastActive: 1,
					followersCount: 1,
					followingCount: 1,
					// Show detailed lists only if it's own profile or public profile
					followersDetails: {
						$cond: {
							if: {
								$or: [
									{ $eq: ["$_id", currentUserId] },
									{ $ne: [{ $ifNull: ["$isPrivate", false] }, true] },
								],
							},
							then: { $slice: ["$followersDetails", 20] },
							else: [],
						},
					},
					followingDetails: {
						$cond: {
							if: {
								$or: [
									{ $eq: ["$_id", currentUserId] },
									{ $ne: [{ $ifNull: ["$isPrivate", false] }, true] },
								],
							},
							then: { $slice: ["$followingDetails", 20] },
							else: [],
						},
					},
					isFollowing: 1,
					followsYou: 1,
					isOwnProfile: 1,
					mutualFollowersCount: {
						$cond: {
							if: { $eq: ["$_id", currentUserId] },
							then: 0,
							else: "$mutualFollowersCount",
						},
					},
					mutualFollowersSample: {
						$cond: {
							if: { $eq: ["$_id", currentUserId] },
							then: [],
							else: "$mutualFollowersSample",
						},
					},
				},
			},
		]).maxTimeMS(10000);

		if (!userProfile || userProfile.length === 0) {
			throw new ApiError(404, "User not found or account may be deactivated");
		}

		const profile = userProfile[0];

		// Enhanced computed fields
		const enhancedProfile = {
			...profile,
			avatar: profile.avatar || "/assets/default-avatar.png",
			coverImage: profile.coverImage || "/assets/default-cover.png",
			fullName:
				`${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
				profile.username,
			joinDate: profile.createdAt,
			relationshipStatus: profile.isOwnProfile
				? "self"
				: profile.isFollowing && profile.followsYou
					? "mutual"
					: profile.isFollowing
						? "following"
						: profile.followsYou
							? "follower"
							: "none",
			// Add formatted mutual followers info
			mutualInfo:
				profile.mutualFollowersCount > 0
					? {
							count: profile.mutualFollowersCount,
							sample:
								profile.mutualFollowersSample?.map((user) => ({
									...user,
									avatar: user.avatar || "/assets/default-avatar.png",
									displayName:
										`${user.firstName || ""} ${user.lastName || ""}`.trim() ||
										user.username,
								})) || [],
							message:
								profile.mutualFollowersCount === 1
									? "1 mutual follower"
									: `${profile.mutualFollowersCount} mutual followers`,
						}
					: null,
			// Profile stats for display
			stats: {
				posts: 0, // This would need to be calculated from posts collection
				followers: profile.followersCount,
				following: profile.followingCount,
				joinedDate: new Date(profile.createdAt).toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
				}),
			},
			// Privacy and interaction flags
			canViewFollowers: profile.isOwnProfile || !profile.isPrivate,
			canViewFollowing: profile.isOwnProfile || !profile.isPrivate,
			canSendMessage: !profile.isOwnProfile,
			canFollow: !profile.isOwnProfile && !profile.isFollowing,
		};

		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					enhancedProfile,
					"User profile fetched successfully",
				),
			);
	} catch (error) {
		console.error("Get user profile error:", error);

		if (error instanceof ApiError) {
			throw error;
		}
		if (error.name === "CastError") {
			throw new ApiError(400, "Invalid user identifier");
		}
		if (error.code === 50) {
			throw new ApiError(408, "Profile request timed out. Please try again.");
		}
		throw new ApiError(500, "Failed to fetch user profile");
	}
});

// Enhanced follow/unfollow functions with better validation and notifications
const followUser = asyncHandler(async (req, res) => {
	const { userId } = req.params;
	const currentUserId = req.user._id;
	// Enhanced validation
	if (!mongoose.Types.ObjectId.isValid(userId)) {
		throw new ApiError(400, "Invalid user ID");
	}
	if (userId === currentUserId.toString()) {
		throw new ApiError(400, "You cannot follow yourself");
	}
	try {
		// Use transaction for data consistency
		const session = await mongoose.startSession();

		await session.withTransaction(async () => {
			const [userToFollow, currentUser] = await Promise.all([
				User.findById(userId).session(session),
				User.findById(currentUserId).session(session),
			]);

			if (!userToFollow) {
				throw new ApiError(404, "User not found");
			}
			if (!userToFollow.isActive || userToFollow.isDeleted) {
				throw new ApiError(404, "User account is not available");
			}
			// Check if already following
			if (currentUser.following.includes(userId)) {
				throw new ApiError(400, "You are already following this user");
			}
			// Update both users atomically
			await Promise.all([
				User.findByIdAndUpdate(
					currentUserId,
					{ $push: { following: userId } },
					{ session },
				),
				User.findByIdAndUpdate(
					userId,
					{ $push: { followers: currentUserId } },
					{ session },
				),
			]);
		});

		session.endSession();

		// TODO: Add notification creation here
		// await createNotification({
		//   type: 'follow',
		//   fromUser: currentUserId,
		//   toUser: userId
		// });

		return res
			.status(200)
			.json(
				new ApiResponse(200, { followed: true }, "User followed successfully"),
			);
	} catch (error) {
		console.error("Follow user error:", error);

		if (error instanceof ApiError) {
			throw error;
		}

		throw new ApiError(500, "Failed to follow user");
	}
});

const unfollowUser = asyncHandler(async (req, res) => {
	const { userId } = req.params;
	const currentUserId = req.user._id;

	// Enhanced validation
	if (!mongoose.Types.ObjectId.isValid(userId)) {
		throw new ApiError(400, "Invalid user ID");
	}
	if (userId === currentUserId.toString()) {
		throw new ApiError(400, "You cannot unfollow yourself");
	}

	try {
		// Use transaction for data consistency
		const session = await mongoose.startSession();

		await session.withTransaction(async () => {
			const [userToUnfollow, currentUser] = await Promise.all([
				User.findById(userId).session(session),
				User.findById(currentUserId).session(session),
			]);

			if (!userToUnfollow) {
				throw new ApiError(404, "User not found");
			}

			// Check if not following
			if (!currentUser.following.includes(userId)) {
				throw new ApiError(400, "You are not following this user");
			}

			// Update both users atomically
			await Promise.all([
				User.findByIdAndUpdate(
					currentUserId,
					{ $pull: { following: userId } },
					{ session },
				),
				User.findByIdAndUpdate(
					userId,
					{ $pull: { followers: currentUserId } },
					{ session },
				),
			]);
		});

		session.endSession();

		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					{ followed: false },
					"User unfollowed successfully",
				),
			);
	} catch (error) {
		console.error("Unfollow user error:", error);

		if (error instanceof ApiError) {
			throw error;
		}

		throw new ApiError(500, "Failed to unfollow user");
	}
});

// Utility function for time ago calculation
const getTimeAgo = (date) => {
	const now = new Date();
	const postDate = new Date(date);
	const diffInSeconds = Math.floor((now - postDate) / 1000);

	if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
	if (diffInSeconds < 2592000)
		return `${Math.floor(diffInSeconds / 86400)}d ago`;

	return postDate.toLocaleDateString();
};
export {
	registerUser, // ✅
	loginUser, // ✅
	logoutUser, // ✅
	refreshAccessToken, // ✅
	changeCurrentPassword, // ✅
	getCurrentUser, // ✅
	updateAccountDetails, // ✅
	getUserChannelProfile, // ✅
	getWatchHistory, // ✅
	getAllUsers,
	getUserById,
	createUser, // ✅
	updateUser, // ✅
	deleteUser, // ✅
	getCurrentUserProfile,
	updateCurrentUserProfile,
	changePassword, // ✅
	uploadAvatar,
	getUserFeed,
	getUserProfileByUsername,
	followUser, // ✅
	unfollowUser, // ✅
	getUserFollowers,
	getUserFollowing,
	searchUsers,
	getUserSuggestions,
};
