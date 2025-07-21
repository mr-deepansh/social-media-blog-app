// src/modules/admin/controllers/admin.controller.js
import { User } from "../../users/models/user.model.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import mongoose from "mongoose";

// 📋 GET: Get all users with pagination & filters
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

	// Build filter object
	const filter = {};

	if (search) {
		filter.$or = [
			{ username: { $regex: search, $options: "i" } },
			{ email: { $regex: search, $options: "i" } },
			{ firstName: { $regex: search, $options: "i" } },
			{ lastName: { $regex: search, $options: "i" } },
		];
	}

	if (role) filter.role = role;
	if (isActive !== undefined) filter.isActive = isActive;

	// Build sort object
	const sort = {};
	sort[sortBy] = sortOrder === "desc" ? -1 : 1;

	// Execute query with pagination
	const skip = (page - 1) * limit;

	const [users, totalUsers] = await Promise.all([
		User.find(filter)
			.select("-password -refreshToken")
			.sort(sort)
			.skip(skip)
			.limit(parseInt(limit)),
		User.countDocuments(filter),
	]);

	const totalPages = Math.ceil(totalUsers / limit);

	return res.status(200).json(
		new ApiResponse(
			200,
			{
				users,
				pagination: {
					currentPage: parseInt(page),
					totalPages,
					totalUsers,
					hasNextPage: page < totalPages,
					hasPrevPage: page > 1,
					limit: parseInt(limit),
				},
			},
			"Users fetched successfully",
		),
	);
});

// 👤 GET: Get user by ID (admin only)
const getUserById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid user ID");
	}

	const user = await User.findById(id).select("-password -refreshToken");

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, { user }, "User fetched successfully"));
});

// 🗑️ DELETE: Delete user by ID
const deleteUserById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid user ID");
	}

	// Prevent admin from deleting themselves
	if (req.user._id.toString() === id) {
		throw new ApiError(400, "You cannot delete your own account");
	}

	const user = await User.findByIdAndDelete(id);

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				{ deletedUser: { id: user._id, username: user.username } },
				"User deleted successfully",
			),
		);
});

// ✏️ PUT: Update user by ID
const updateUserById = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const updates = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid user ID");
	}

	// Prevent password updates through this endpoint
	if (updates.password) {
		throw new ApiError(400, "Use dedicated password change endpoint");
	}

	// Remove sensitive fields from updates
	delete updates.refreshToken;
	delete updates._id;

	const user = await User.findByIdAndUpdate(
		id,
		{ ...updates, updatedAt: new Date() },
		{
			new: true,
			runValidators: true,
		},
	).select("-password -refreshToken");

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, { user }, "User updated successfully"));
});

// 🚫 PATCH: Suspend user
const suspendUser = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid user ID");
	}

	// Prevent admin from suspending themselves
	if (req.user._id.toString() === id) {
		throw new ApiError(400, "You cannot suspend your own account");
	}

	const user = await User.findByIdAndUpdate(
		id,
		{ isActive: false, suspendedAt: new Date() },
		{ new: true },
	).select("-password -refreshToken");

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, { user }, "User suspended successfully"));
});

// ✅ PATCH: Activate user
const activateUser = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid user ID");
	}

	const user = await User.findByIdAndUpdate(
		id,
		{ isActive: true, $unset: { suspendedAt: 1 } },
		{ new: true },
	).select("-password -refreshToken");

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, { user }, "User activated successfully"));
});

// 📊 GET: Admin dashboard stats
const getAdminStats = asyncHandler(async (req, res) => {
	const [totalUsers, activeUsers, suspendedUsers, adminUsers, recentUsers] =
		await Promise.all([
			User.countDocuments(),
			User.countDocuments({ isActive: true }),
			User.countDocuments({ isActive: false }),
			User.countDocuments({ role: "admin" }),
			User.countDocuments({
				createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
			}),
		]);

	const stats = {
		totalUsers,
		activeUsers,
		suspendedUsers,
		adminUsers,
		recentUsers, // Users in last 30 days
		userGrowthRate:
			totalUsers > 0 ? ((recentUsers / totalUsers) * 100).toFixed(2) : 0,
	};

	return res
		.status(200)
		.json(new ApiResponse(200, { stats }, "Admin stats fetched successfully"));
});

export {
	getAllUsers,
	getUserById,
	deleteUserById,
	updateUserById,
	suspendUser,
	activateUser,
	getAdminStats,
};
