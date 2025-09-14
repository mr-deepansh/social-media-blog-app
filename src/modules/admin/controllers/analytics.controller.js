// src/modules/admin/controllers/analytics.controller.js
import { User } from "../../users/models/user.model.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { AnalyticsService } from "../services/analytics.service.js";
import { CacheService } from "../../../shared/services/cache.service.js";

const analyticsService = new AnalyticsService();
const cache = new CacheService();

/**
 * Get comprehensive analytics overview
 * @route GET /admin/analytics/overview
 * @access Admin, Super Admin
 */
export const getAnalyticsOverview = asyncHandler(async (req, res) => {
	const { timeRange = "30d" } = req.query;
	const cacheKey = `analytics:overview:${timeRange}`;

	// Try cache first
	const cached = await cache.get(cacheKey);
	if (cached) {
		return res.status(200).json(new ApiResponse(200, cached, "Analytics overview from cache"));
	}

	const overview = await analyticsService.getOverview(timeRange);

	// Cache for 5 minutes
	await cache.set(cacheKey, overview, 300);

	return res.status(200).json(new ApiResponse(200, overview, "Analytics overview generated"));
});

/**
 * Get user growth analytics
 * @route GET /admin/analytics/users/growth
 * @access Admin, Super Admin
 */
export const getUserGrowthAnalytics = asyncHandler(async (req, res) => {
	const { period = "daily", days = 30 } = req.query;
	const cacheKey = `analytics:growth:${period}:${days}`;

	const cached = await cache.get(cacheKey);
	if (cached) {
		return res.status(200).json(new ApiResponse(200, cached, "Growth analytics from cache"));
	}

	const growth = await analyticsService.getUserGrowth(period, parseInt(days));

	await cache.set(cacheKey, growth, 600); // 10 minutes

	return res.status(200).json(new ApiResponse(200, growth, "User growth analytics generated"));
});

/**
 * Get user retention analytics
 * @route GET /admin/analytics/users/retention
 * @access Admin, Super Admin
 */
export const getUserRetentionAnalytics = asyncHandler(async (req, res) => {
	const { cohortPeriod = "monthly" } = req.query;
	const cacheKey = `analytics:retention:${cohortPeriod}`;

	const cached = await cache.get(cacheKey);
	if (cached) {
		return res.status(200).json(new ApiResponse(200, cached, "Retention analytics from cache"));
	}

	const retention = await analyticsService.getRetentionAnalytics(cohortPeriod);

	await cache.set(cacheKey, retention, 1800); // 30 minutes

	return res.status(200).json(new ApiResponse(200, retention, "Retention analytics generated"));
});

/**
 * Get user demographics
 * @route GET /admin/analytics/users/demographics
 * @access Admin, Super Admin
 */
export const getUserDemographics = asyncHandler(async (req, res) => {
	const cacheKey = "analytics:demographics";

	const cached = await cache.get(cacheKey);
	if (cached) {
		return res.status(200).json(new ApiResponse(200, cached, "Demographics from cache"));
	}

	const demographics = await analyticsService.getDemographics();

	await cache.set(cacheKey, demographics, 3600); // 1 hour

	return res.status(200).json(new ApiResponse(200, demographics, "Demographics generated"));
});

/**
 * Get engagement metrics
 * @route GET /admin/analytics/engagement/metrics
 * @access Admin, Super Admin
 */
export const getEngagementMetrics = asyncHandler(async (req, res) => {
	const { timeRange = "7d" } = req.query;
	const cacheKey = `analytics:engagement:${timeRange}`;

	const cached = await cache.get(cacheKey);
	if (cached) {
		return res.status(200).json(new ApiResponse(200, cached, "Engagement metrics from cache"));
	}

	const engagement = await analyticsService.getEngagementMetrics(timeRange);

	await cache.set(cacheKey, engagement, 900); // 15 minutes

	return res.status(200).json(new ApiResponse(200, engagement, "Engagement metrics generated"));
});
