// src/modules/auth/controllers/activity.controller.js
import { UserActivity } from "../models/userActivity.model.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import { Validator } from "../../../shared/utils/Validator.js";

/**
 * Get user activity logs with pagination
 */
const getUserActivity = asyncHandler(async (req, res) => {
	const { page, limit } = Validator.validatePagination(req.query);
	const { action, startDate, endDate } = req.query;
	const userId = req.user._id;

	// Build query
	const query = { userId };

	if (action) {
		query.action = action;
	}

	if (startDate || endDate) {
		query.createdAt = {};
		if (startDate) query.createdAt.$gte = new Date(startDate);
		if (endDate) query.createdAt.$lte = new Date(endDate);
	}

	const skip = (page - 1) * limit;

	const [activities, total] = await Promise.all([
		UserActivity.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		UserActivity.countDocuments(query),
	]);

	const totalPages = Math.ceil(total / limit);

	res.status(200).json(
		new ApiResponse(
			200,
			{
				activities,
				pagination: {
					currentPage: page,
					totalPages,
					totalItems: total,
					hasNextPage: page < totalPages,
					hasPrevPage: page > 1,
					limit,
				},
			},
			"Activity logs retrieved successfully",
		),
	);
});

/**
 * Get activity statistics
 */
const getActivityStats = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	const { days = 30 } = req.query;

	const startDate = new Date();
	startDate.setDate(startDate.getDate() - parseInt(days));

	const stats = await UserActivity.aggregate([
		{
			$match: {
				userId,
				createdAt: { $gte: startDate },
			},
		},
		{
			$group: {
				_id: "$action",
				count: { $sum: 1 },
				lastActivity: { $max: "$createdAt" },
			},
		},
		{
			$sort: { count: -1 },
		},
	]);

	const totalActivities = await UserActivity.countDocuments({
		userId,
		createdAt: { $gte: startDate },
	});

	res.status(200).json(
		new ApiResponse(
			200,
			{
				stats,
				totalActivities,
				period: `${days} days`,
			},
			"Activity statistics retrieved successfully",
		),
	);
});

/**
 * Get recent login locations
 */
const getLoginLocations = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	const { limit = 10 } = req.query;

	const locations = await UserActivity.aggregate([
		{
			$match: {
				userId,
				action: "login",
				success: true,
			},
		},
		{
			$group: {
				_id: {
					country: "$location.country",
					region: "$location.region",
					city: "$location.city",
				},
				count: { $sum: 1 },
				lastLogin: { $max: "$createdAt" },
				ips: { $addToSet: "$ip" },
			},
		},
		{
			$sort: { lastLogin: -1 },
		},
		{
			$limit: parseInt(limit),
		},
	]);

	res
		.status(200)
		.json(
			new ApiResponse(200, locations, "Login locations retrieved successfully"),
		);
});

export { getUserActivity, getActivityStats, getLoginLocations };
