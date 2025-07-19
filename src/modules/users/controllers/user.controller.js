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

const createUser = asyncHandler(async (req, res) => {
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

// Get user feed - personalized content after login
const getUserFeed = asyncHandler(async (req, res) => {
	const {
		page = 1,
		limit = 20,
		sortBy = "createdAt",
		sortOrder = "desc",
	} = req.query;

	const userId = req.user._id;
	const skip = (page - 1) * limit;

	// Get users that current user follows
	const following = await User.findById(userId).select("following");
	const followingIds = following?.following || [];

	// Create aggregation pipeline for feed
	const feedPipeline = [
		{
			$match: {
				$or: [
					{ owner: { $in: followingIds } }, // Posts from followed users
					{ owner: userId }, // User's own posts
				],
			},
		},
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
						},
					},
				],
			},
		},
		{
			$addFields: {
				author: { $first: "$author" },
			},
		},
		{
			$sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
		},
		{
			$skip: skip,
		},
		{
			$limit: parseInt(limit),
		},
	];

	// Note: You'll need to replace 'posts' with your actual post collection name
	// This is just an example assuming you have a posts collection
	const feed = await mongoose.connection.db
		.collection("posts")
		.aggregate(feedPipeline)
		.toArray();

	// Get total count for pagination
	const totalPosts = await mongoose.connection.db
		.collection("posts")
		.countDocuments({
			$or: [{ owner: { $in: followingIds } }, { owner: userId }],
		});

	return res.status(200).json(
		new ApiResponse(
			200,
			{
				feed,
				pagination: {
					currentPage: parseInt(page),
					totalPages: Math.ceil(totalPosts / limit),
					totalPosts,
					hasNextPage: page * limit < totalPosts,
					hasPrevPage: page > 1,
				},
			},
			"Feed fetched successfully",
		),
	);
});

// Get user profile by username with followers/following details
const getUserProfileByUsername = asyncHandler(async (req, res) => {
	const { username } = req.params;
	const currentUserId = req.user._id;

	if (!username?.trim()) {
		throw new ApiError(400, "Username is required");
	}

	const userProfile = await User.aggregate([
		{
			$match: {
				username: username.toLowerCase(),
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
						$project: {
							_id: 1,
							username: 1,
							firstName: 1,
							lastName: 1,
							avatar: 1,
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
						$project: {
							_id: 1,
							username: 1,
							firstName: 1,
							lastName: 1,
							avatar: 1,
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
					$cond: {
						if: { $in: [currentUserId, "$followers"] },
						then: true,
						else: false,
					},
				},
				isOwnProfile: {
					$cond: {
						if: { $eq: ["$_id", currentUserId] },
						then: true,
						else: false,
					},
				},
			},
		},
		{
			$project: {
				_id: 1,
				username: 1,
				email: 1,
				firstName: 1,
				lastName: 1,
				bio: 1,
				avatar: 1,
				coverImage: 1,
				isActive: 1,
				createdAt: 1,
				followersCount: 1,
				followingCount: 1,
				followersDetails: { $slice: ["$followersDetails", 10] }, // Show only first 10
				followingDetails: { $slice: ["$followingDetails", 10] }, // Show only first 10
				isFollowing: 1,
				isOwnProfile: 1,
			},
		},
	]);

	if (!userProfile || userProfile.length === 0) {
		throw new ApiError(404, "User not found");
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, userProfile[0], "User profile fetched successfully"),
		);
});

// Follow a user
const followUser = asyncHandler(async (req, res) => {
	const { userId } = req.params;
	const currentUserId = req.user._id;

	if (userId === currentUserId.toString()) {
		throw new ApiError(400, "You cannot follow yourself");
	}

	const userToFollow = await User.findById(userId);
	if (!userToFollow) {
		throw new ApiError(404, "User not found");
	}

	const currentUser = await User.findById(currentUserId);

	// Check if already following
	if (currentUser.following.includes(userId)) {
		throw new ApiError(400, "You are already following this user");
	}

	// Add to following list of current user
	await User.findByIdAndUpdate(currentUserId, {
		$push: { following: userId },
	});

	// Add to followers list of target user
	await User.findByIdAndUpdate(userId, {
		$push: { followers: currentUserId },
	});

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "User followed successfully"));
});

// Unfollow a user
const unfollowUser = asyncHandler(async (req, res) => {
	const { userId } = req.params;
	const currentUserId = req.user._id;

	if (userId === currentUserId.toString()) {
		throw new ApiError(400, "You cannot unfollow yourself");
	}

	const userToUnfollow = await User.findById(userId);
	if (!userToUnfollow) {
		throw new ApiError(404, "User not found");
	}

	const currentUser = await User.findById(currentUserId);

	// Check if not following
	if (!currentUser.following.includes(userId)) {
		throw new ApiError(400, "You are not following this user");
	}

	// Remove from following list of current user
	await User.findByIdAndUpdate(currentUserId, {
		$pull: { following: userId },
	});

	// Remove from followers list of target user
	await User.findByIdAndUpdate(userId, {
		$pull: { followers: currentUserId },
	});

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "User unfollowed successfully"));
});

// Get user's followers
const getUserFollowers = asyncHandler(async (req, res) => {
	const { userId } = req.params;
	const { page = 1, limit = 20, search } = req.query;
	const skip = (page - 1) * limit;

	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError(404, "User not found");
	}

	const matchStage = {
		_id: { $in: user.followers },
	};

	// Add search filter if provided
	if (search) {
		matchStage.$or = [
			{ username: { $regex: search, $options: "i" } },
			{ firstName: { $regex: search, $options: "i" } },
			{ lastName: { $regex: search, $options: "i" } },
		];
	}

	const followers = await User.find(matchStage)
		.select("_id username firstName lastName avatar bio")
		.skip(skip)
		.limit(parseInt(limit))
		.sort({ createdAt: -1 });

	const totalFollowers = await User.countDocuments(matchStage);

	return res.status(200).json(
		new ApiResponse(
			200,
			{
				followers,
				pagination: {
					currentPage: parseInt(page),
					totalPages: Math.ceil(totalFollowers / limit),
					totalFollowers,
					hasNextPage: page * limit < totalFollowers,
					hasPrevPage: page > 1,
				},
			},
			"Followers fetched successfully",
		),
	);
});

// Get user's following list
const getUserFollowing = asyncHandler(async (req, res) => {
	const { userId } = req.params;
	const { page = 1, limit = 20, search } = req.query;
	const skip = (page - 1) * limit;

	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError(404, "User not found");
	}

	const matchStage = {
		_id: { $in: user.following },
	};

	// Add search filter if provided
	if (search) {
		matchStage.$or = [
			{ username: { $regex: search, $options: "i" } },
			{ firstName: { $regex: search, $options: "i" } },
			{ lastName: { $regex: search, $options: "i" } },
		];
	}

	const following = await User.find(matchStage)
		.select("_id username firstName lastName avatar bio")
		.skip(skip)
		.limit(parseInt(limit))
		.sort({ createdAt: -1 });

	const totalFollowing = await User.countDocuments(matchStage);

	return res.status(200).json(
		new ApiResponse(
			200,
			{
				following,
				pagination: {
					currentPage: parseInt(page),
					totalPages: Math.ceil(totalFollowing / limit),
					totalFollowing,
					hasNextPage: page * limit < totalFollowing,
					hasPrevPage: page > 1,
				},
			},
			"Following list fetched successfully",
		),
	);
});

// Search users by username or name
const searchUsers = asyncHandler(async (req, res) => {
	console.log("searchUsers");

	const {
		search,
		page = 1,
		limit = 10,
		sortBy = "relevance",
		includePrivate = false,
	} = req.query;
	console.log(req.query);

	// Validate inputs
	if (!search || search.trim().length === 0) {
		throw new ApiError(400, "Search query is required");
	}

	if (search.trim().length < 2) {
		throw new ApiError(400, "Search query must be at least 2 characters long");
	}

	const pageNum = Math.max(1, parseInt(page, 10) || 1);
	const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
	const currentUserId = req.user?._id;
	const skip = (pageNum - 1) * limitNum;
	const startTime = Date.now();

	try {
		// Sanitize and create search regex
		const sanitizedSearch = search
			.trim()
			.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const searchRegex = new RegExp(sanitizedSearch, "i");

		// Build match conditions
		const matchConditions = {
			$and: [
				{
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
				},
				{ isActive: { $eq: true } },
				{ isDeleted: { $ne: true } },
			],
		};

		// Add private profile filter if not admin
		if (!includePrivate && req.user?.role !== "admin") {
			matchConditions.$and.push({
				$or: [{ isPrivate: { $ne: true } }, { isPrivate: { $exists: false } }],
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

		// Aggregation pipeline for search
		const pipeline = [
			{ $match: matchConditions },
			{
				$addFields: {
					// Calculate relevance score
					relevanceScore: {
						$sum: [
							// Exact username match gets highest score
							{
								$cond: [
									{
										$eq: [
											{ $toLower: "$username" },
											sanitizedSearch.toLowerCase(),
										],
									},
									100,
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
							// Full name match
							{
								$cond: [
									{
										$regexMatch: {
											input: {
												$concat: [
													{ $ifNull: ["$firstName", ""] },
													" ",
													{ $ifNull: ["$lastName", ""] },
												],
											},
											regex: searchRegex,
										},
									},
									25,
									0,
								],
							},
						],
					},
					// Check if current user follows this user
					isFollowing: currentUserId
						? {
								$in: [
									{ $toObjectId: currentUserId },
									{ $ifNull: ["$followers", []] },
								],
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
			User.aggregate(pipeline).maxTimeMS(5000).exec(),
			User.aggregate([{ $match: matchConditions }, { $count: "total" }])
				.maxTimeMS(2000)
				.exec(),
		]);

		const total = totalCount.length > 0 ? totalCount[0].total : 0;

		// Format response
		const formattedUsers = users.map((user) => ({
			...user,
			avatar: user.avatar || "/assets/default-avatar.png",
			fullName:
				user.fullName ||
				`${user.firstName || ""} ${user.lastName || ""}`.trim() ||
				user.username,
			bio: user.bio || "",
		}));

		const totalPages = Math.ceil(total / limitNum);
		const hasMore = pageNum < totalPages;

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
						searchTerm: search.trim(),
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
		if (error.message.includes("maxTimeMS")) {
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

// Get user suggestions (people you might know)
const getUserSuggestions = asyncHandler(async (req, res) => {
	const { limit = 10 } = req.query;
	const currentUserId = req.user._id;

	const currentUser = await User.findById(currentUserId).select(
		"following followers",
	);
	const followingIds = currentUser.following || [];
	const followerIds = currentUser.followers || [];

	// Get users followed by people you follow (friends of friends)
	const suggestions = await User.aggregate([
		{
			$match: {
				_id: { $nin: [currentUserId, ...followingIds] },
				isActive: true,
				isDeleted: { $ne: true },
				isPrivate: { $ne: true },
			},
		},
		{
			$addFields: {
				// Calculate suggestion score
				suggestionScore: {
					$sum: [
						// Boost users who follow you back
						{ $cond: [{ $in: [currentUserId, "$following"] }, 50, 0] },
						// Boost users with mutual followers
						{ $size: { $setIntersection: ["$followers", followingIds] } },
						// Boost users with similar interests (if you have tags/interests)
						// { $size: { $setIntersection: ['$interests', currentUser.interests] } }
					],
				},
				mutualFollowers: {
					$size: { $setIntersection: ["$followers", followingIds] },
				},
				followsYou: { $in: [currentUserId, "$following"] },
			},
		},
		{
			$sort: {
				suggestionScore: -1,
				followersCount: -1,
				createdAt: -1,
			},
		},
		{ $limit: parseInt(limit) },
		{
			$project: {
				_id: 1,
				username: 1,
				firstName: 1,
				lastName: 1,
				avatar: 1,
				bio: { $substr: ["$bio", 0, 100] },
				followersCount: { $size: { $ifNull: ["$followers", []] } },
				mutualFollowers: {
					$size: {
						$setIntersection: [{ $ifNull: ["$followers", []] }, followingIds],
					},
				},
				followsYou: 1,
				isVerified: 1,
			},
		},
	]);

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				suggestions,
				"User suggestions fetched successfully",
			),
		);
});

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
