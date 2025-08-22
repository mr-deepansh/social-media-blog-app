// src/modules/auth/controllers/activity.controller.js
import { UserActivity } from "../models/userActivity.model.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import { Validator } from "../../../shared/utils/Validator.js";
import { LocationService } from "../services/location.service.js";

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
 * Get recent login locations with enterprise-grade security analytics
 */
const getLoginLocations = asyncHandler(async (req, res) => {
	const { limit = 10, days = 90 } = req.query;
	const userId = req.user._id;
	const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

	// Enterprise-grade aggregation pipeline for location analytics
	const locations = await UserActivity.aggregate([
		{
			$match: {
				userId,
				action: "login",
				success: true,
				createdAt: { $gte: dateThreshold },
			},
		},
		{
			$group: {
				_id: {
					city: "$location.city",
					country: "$location.country",
					region: "$location.region",
				},
				location: { $first: "$location" },
				loginCount: { $sum: 1 },
				lastLogin: { $max: "$createdAt" },
				uniqueIPs: { $addToSet: "$ip" },
				devices: { $addToSet: "$device" },
				failedAttempts: {
					$sum: {
						$cond: [{ $eq: ["$success", false] }, 1, 0],
					},
				},
			},
		},
		{
			$project: {
				_id: 0,
				location: {
					city: "$location.city",
					region: "$location.region",
					country: "$location.country",
					timezone: "$location.timezone",
				},
				loginCount: 1,
				lastLogin: 1,
				ipCount: { $size: "$uniqueIPs" },
				deviceCount: { $size: "$devices" },
				riskScore: {
					$switch: {
						branches: [
							{ case: { $gt: ["$failedAttempts", 5] }, then: "high" },
							{ case: { $gt: [{ $size: "$uniqueIPs" }, 5] }, then: "medium" },
							{ case: { $gt: ["$loginCount", 50] }, then: "medium" },
						],
						default: "low",
					},
				},
				uniqueIPs: { $slice: ["$uniqueIPs", 5] },
				devices: { $slice: ["$devices", 3] },
			},
		},
		{ $sort: { lastLogin: -1 } },
		{ $limit: parseInt(limit) },
	]);

	res
		.status(200)
		.json(
			new ApiResponse(200, locations, "Login locations retrieved successfully"),
		);
});

/**
 * Get comprehensive location analytics for enterprise security monitoring
 */
const getLocationAnalytics = asyncHandler(async (req, res) => {
	const { days = 30 } = req.query;
	const userId = req.user._id;
	const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

	// Simplified analytics for production stability
	const [locationStats, suspiciousActivity] = await Promise.all([
		UserActivity.aggregate([
			{
				$match: {
					userId,
					action: "login",
					success: true,
					createdAt: { $gte: dateThreshold },
				},
			},
			{
				$group: {
					_id: "$location.country",
					loginCount: { $sum: 1 },
					uniqueIPs: { $addToSet: "$ip" },
				},
			},
			{
				$project: {
					country: "$_id",
					loginCount: 1,
					uniqueIPCount: { $size: "$uniqueIPs" },
					_id: 0,
				},
			},
			{ $sort: { loginCount: -1 } },
		]),
		UserActivity.aggregate([
			{
				$match: { userId, action: "login", createdAt: { $gte: dateThreshold } },
			},
			{
				$group: {
					_id: {
						date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
						ip: "$ip",
					},
					count: { $sum: 1 },
					failed: { $sum: { $cond: [{ $eq: ["$success", false] }, 1, 0] } },
				},
			},
			{ $match: { $or: [{ count: { $gt: 10 } }, { failed: { $gt: 3 } }] } },
			{
				$project: {
					date: "$_id.date",
					ip: "$_id.ip",
					attempts: "$count",
					failed: 1,
					riskLevel: { $cond: [{ $gt: ["$failed", 5] }, "high", "medium"] },
					_id: 0,
				},
			},
			{ $limit: 10 },
		]),
	]);

	const analytics = {
		locationDistribution: locationStats,
		suspiciousActivity,
		summary: {
			totalCountries: locationStats.length,
			totalLogins: locationStats.reduce((sum, loc) => sum + loc.loginCount, 0),
			suspiciousEvents: suspiciousActivity.length,
			period: `${days} days`,
			riskLevel: "low",
		},
	};

	res
		.status(200)
		.json(
			new ApiResponse(
				200,
				analytics,
				"Location analytics retrieved successfully",
			),
		);
});

export {
	getUserActivity,
	getActivityStats,
	getLoginLocations,
	getLocationAnalytics,
};
