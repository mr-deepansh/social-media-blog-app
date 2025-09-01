// src/modules/blogs/controllers/analytics.controller.js
import AnalyticsService from "../services/analytics.service.js";
import SchedulerService from "../services/scheduler.service.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import {
	safeAsyncOperation,
	handleControllerError,
} from "../../../shared/utils/ErrorHandler.js";
import { calculateApiHealth } from "../../../shared/utils/ApiHealth.js";
import { Logger } from "../../../shared/utils/Logger.js";

const logger = new Logger("AnalyticsController");

// Get post analytics
const getPostAnalytics = asyncHandler(async (req, res) => {
	const startTime = Date.now();
	const { id } = req.params;
	const userId = req.user._id;

	try {
		const analytics = await safeAsyncOperation(
			() => AnalyticsService.getPostAnalytics(id, userId),
			null,
			true,
		);

		const executionTime = Date.now() - startTime;

		res.status(200).json(
			new ApiResponse(
				200,
				{
					...analytics,
					meta: {
						executionTime: `${executionTime}ms`,
						apiHealth: calculateApiHealth(executionTime),
					},
				},
				"Post analytics retrieved successfully",
			),
		);
	} catch (error) {
		handleControllerError(error, req, res, startTime, logger);
	}
});

// Get user analytics dashboard
const getUserAnalytics = asyncHandler(async (req, res) => {
	const startTime = Date.now();
	const userId = req.user._id;
	const { timeframe = "30d" } = req.query;

	try {
		const analytics = await safeAsyncOperation(
			() => AnalyticsService.getUserAnalytics(userId, timeframe),
			{ overview: {}, topPosts: [], timeframe },
			false,
		);

		const executionTime = Date.now() - startTime;

		res.status(200).json(
			new ApiResponse(
				200,
				{
					...analytics,
					meta: {
						executionTime: `${executionTime}ms`,
						apiHealth: calculateApiHealth(executionTime),
					},
				},
				"User analytics retrieved successfully",
			),
		);
	} catch (error) {
		handleControllerError(error, req, res, startTime, logger);
	}
});

// Get platform analytics (admin only)
const getPlatformAnalytics = asyncHandler(async (req, res) => {
	const startTime = Date.now();

	try {
		// Check if user is admin
		if (!req.user.role || !["admin", "superAdmin"].includes(req.user.role)) {
			throw new ApiError(403, "Access denied. Admin privileges required.");
		}

		const { timeframe = "30d" } = req.query;
		const analytics = await safeAsyncOperation(
			() => AnalyticsService.getPlatformAnalytics(timeframe),
			{ overview: {}, contentTypes: [], timeframe },
			false,
		);

		const executionTime = Date.now() - startTime;

		res.status(200).json(
			new ApiResponse(
				200,
				{
					...analytics,
					meta: {
						executionTime: `${executionTime}ms`,
						apiHealth: calculateApiHealth(executionTime),
					},
				},
				"Platform analytics retrieved successfully",
			),
		);
	} catch (error) {
		handleControllerError(error, req, res, startTime, logger);
	}
});

// Get real-time engagement
const getRealtimeEngagement = asyncHandler(async (req, res) => {
	const startTime = Date.now();
	const { id } = req.params;
	const { minutes = 60 } = req.query;

	try {
		// Simplified real-time data
		const engagement = {
			postId: id,
			timeframe: `${minutes} minutes`,
			data: [],
		};

		const executionTime = Date.now() - startTime;

		res.status(200).json(
			new ApiResponse(
				200,
				{
					engagement,
					meta: {
						executionTime: `${executionTime}ms`,
						apiHealth: calculateApiHealth(executionTime),
					},
				},
				"Real-time engagement retrieved successfully",
			),
		);
	} catch (error) {
		handleControllerError(error, req, res, startTime, logger);
	}
});

// Get scheduled posts
const getScheduledPosts = asyncHandler(async (req, res) => {
	const startTime = Date.now();
	const userId = req.user._id;
	const { page = 1, limit = 20 } = req.query;

	try {
		const result = await safeAsyncOperation(
			() => SchedulerService.getScheduledPosts(userId, page, limit),
			{ posts: [], pagination: {} },
			false,
		);

		const executionTime = Date.now() - startTime;

		res.status(200).json(
			new ApiResponse(
				200,
				{
					...result,
					meta: {
						executionTime: `${executionTime}ms`,
						apiHealth: calculateApiHealth(executionTime),
					},
				},
				"Scheduled posts retrieved successfully",
			),
		);
	} catch (error) {
		handleControllerError(error, req, res, startTime, logger);
	}
});

// Cancel scheduled post
const cancelScheduledPost = asyncHandler(async (req, res) => {
	const startTime = Date.now();
	const { id } = req.params;
	const userId = req.user._id;

	try {
		const result = await safeAsyncOperation(
			() => SchedulerService.cancelScheduledPost(id, userId),
			null,
			true,
		);

		const executionTime = Date.now() - startTime;
		logger.info("Scheduled post cancelled", {
			postId: id,
			userId,
			executionTime,
		});

		res.status(200).json(
			new ApiResponse(
				200,
				{
					...result,
					meta: {
						executionTime: `${executionTime}ms`,
						apiHealth: calculateApiHealth(executionTime),
					},
				},
				"Scheduled post cancelled successfully",
			),
		);
	} catch (error) {
		handleControllerError(error, req, res, startTime, logger);
	}
});

// Reschedule post
const reschedulePost = asyncHandler(async (req, res) => {
	const startTime = Date.now();
	const { id } = req.params;
	const { scheduledAt } = req.body;
	const userId = req.user._id;

	try {
		if (!scheduledAt) {
			throw new ApiError(400, "New scheduled time is required");
		}

		const result = await safeAsyncOperation(
			() => SchedulerService.reschedulePost(id, userId, scheduledAt),
			null,
			true,
		);

		const executionTime = Date.now() - startTime;
		logger.info("Post rescheduled", {
			postId: id,
			userId,
			scheduledAt,
			executionTime,
		});

		res.status(200).json(
			new ApiResponse(
				200,
				{
					...result,
					meta: {
						executionTime: `${executionTime}ms`,
						apiHealth: calculateApiHealth(executionTime),
					},
				},
				"Post rescheduled successfully",
			),
		);
	} catch (error) {
		handleControllerError(error, req, res, startTime, logger);
	}
});

// Get scheduling analytics
const getSchedulingAnalytics = asyncHandler(async (req, res) => {
	const startTime = Date.now();
	const userId = req.user._id;

	try {
		const analytics = await safeAsyncOperation(
			() => SchedulerService.getSchedulingAnalytics(userId),
			{ overview: {}, bestTimes: [] },
			false,
		);

		const executionTime = Date.now() - startTime;

		res.status(200).json(
			new ApiResponse(
				200,
				{
					...analytics,
					meta: {
						executionTime: `${executionTime}ms`,
						apiHealth: calculateApiHealth(executionTime),
					},
				},
				"Scheduling analytics retrieved successfully",
			),
		);
	} catch (error) {
		handleControllerError(error, req, res, startTime, logger);
	}
});

export {
	getPostAnalytics,
	getUserAnalytics,
	getPlatformAnalytics,
	getRealtimeEngagement,
	getScheduledPosts,
	cancelScheduledPost,
	reschedulePost,
	getSchedulingAnalytics,
};
