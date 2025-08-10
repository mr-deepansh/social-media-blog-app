// src/modules/admin/controllers/analytics.controller.js
import { User } from "../../users/models/user.model.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { CacheService } from "../services/cache.service.js";
import { AnalyticsService } from "../services/analytics.service.js";

const cache = new CacheService();
const analyticsService = new AnalyticsService();

// 📊 Advanced Analytics Overview
const getAnalyticsOverview = asyncHandler(async (req, res) => {
	try {
		const { timeRange = "30d" } = req.query;
		const cacheKey = `analytics:overview:${timeRange}`;
		
		const cached = await cache.get(cacheKey);
		if (cached) {
			return res.status(200).json(new ApiResponse(200, cached, "Analytics overview (cached)"));
		}

		const dateRange = getDateRange(timeRange);
		const [userGrowth, engagement, demographics] = await Promise.all([
			getUserGrowthAnalytics(dateRange),
			getEngagementMetrics(dateRange),
			getUserDemographics(dateRange),
		]);

		const overview = {
			userGrowth,
			engagement,
			demographics,
			timeRange,
			generatedAt: new Date().toISOString(),
		};

		await cache.setex(cacheKey, 300, overview);
		return res.status(200).json(new ApiResponse(200, overview, "Analytics overview"));
	} catch (error) {
		throw new ApiError(500, `Analytics overview failed: ${error.message}`);
	}
});

// 📈 User Growth Analytics
const getUserGrowthAnalytics = asyncHandler(async (req, res) => {
	try {
		const { period = "daily", days = 30 } = req.query;
		const cacheKey = `analytics:growth:${period}:${days}`;
		
		const cached = await cache.get(cacheKey);
		if (cached) {
			return res.status(200).json(new ApiResponse(200, cached, "Growth analytics (cached)"));
		}

		const startDate = new Date();
		startDate.setDate(startDate.getDate() - parseInt(days));

		const pipeline = [
			{ $match: { createdAt: { $gte: startDate } } },
			{
				$group: {
					_id: period === "daily" 
						? { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
						: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
					newUsers: { $sum: 1 },
					activeUsers: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
				}
			},
			{ $sort: { _id: 1 } }
		];

		const growthData = await User.aggregate(pipeline);
		const totalGrowth = growthData.reduce((sum, day) => sum + day.newUsers, 0);
		const avgDailyGrowth = totalGrowth / parseInt(days);

		const result = {
			period,
			days: parseInt(days),
			totalNewUsers: totalGrowth,
			avgDailyGrowth: Math.round(avgDailyGrowth * 100) / 100,
			growthData,
			trend: calculateGrowthTrend(growthData),
		};

		await cache.setex(cacheKey, 600, result);
		return res.status(200).json(new ApiResponse(200, result, "User growth analytics"));
	} catch (error) {
		throw new ApiError(500, `Growth analytics failed: ${error.message}`);
	}
});

// 🎯 User Retention Analytics
const getUserRetentionAnalytics = asyncHandler(async (req, res) => {
	try {
		const { cohortPeriod = "monthly" } = req.query;
		const cacheKey = `analytics:retention:${cohortPeriod}`;
		
		const cached = await cache.get(cacheKey);
		if (cached) {
			return res.status(200).json(new ApiResponse(200, cached, "Retention analytics (cached)"));
		}

		// Mock retention data - replace with actual calculation
		const retentionData = {
			cohortPeriod,
			cohorts: [
				{ period: "2024-01", users: 1000, retention: [100, 85, 72, 65, 58, 52] },
				{ period: "2024-02", users: 1200, retention: [100, 88, 75, 68, 61] },
				{ period: "2024-03", users: 1500, retention: [100, 90, 78, 71] },
			],
			averageRetention: {
				day1: 87.7,
				day7: 75.0,
				day30: 68.0,
				day90: 58.7,
			},
		};

		await cache.setex(cacheKey, 1800, retentionData);
		return res.status(200).json(new ApiResponse(200, retentionData, "Retention analytics"));
	} catch (error) {
		throw new ApiError(500, `Retention analytics failed: ${error.message}`);
	}
});

// 🌍 User Demographics
const getUserDemographics = asyncHandler(async (req, res) => {
	try {
		const cacheKey = "analytics:demographics";
		const cached = await cache.get(cacheKey);
		if (cached) {
			return res.status(200).json(new ApiResponse(200, cached, "Demographics (cached)"));
		}

		const [locationStats, ageStats, deviceStats] = await Promise.all([
			User.aggregate([
				{ $match: { "location.country": { $exists: true, $ne: null } } },
				{ $group: { _id: "$location.country", count: { $sum: 1 } } },
				{ $sort: { count: -1 } },
				{ $limit: 10 }
			]),
			User.aggregate([
				{ $match: { dateOfBirth: { $exists: true, $ne: null } } },
				{
					$addFields: {
						age: {
							$floor: {
								$divide: [
									{ $subtract: [new Date(), "$dateOfBirth"] },
									365.25 * 24 * 60 * 60 * 1000
								]
							}
						}
					}
				},
				{
					$group: {
						_id: {
							$switch: {
								branches: [
									{ case: { $lt: ["$age", 18] }, then: "Under 18" },
									{ case: { $lt: ["$age", 25] }, then: "18-24" },
									{ case: { $lt: ["$age", 35] }, then: "25-34" },
									{ case: { $lt: ["$age", 45] }, then: "35-44" },
									{ case: { $lt: ["$age", 55] }, then: "45-54" },
								],
								default: "55+"
							}
						},
						count: { $sum: 1 }
					}
				},
				{ $sort: { count: -1 } }
			]),
			// Mock device stats
			Promise.resolve([
				{ _id: "Desktop", count: 4500 },
				{ _id: "Mobile", count: 6800 },
				{ _id: "Tablet", count: 1200 },
			])
		]);

		const demographics = {
			location: locationStats,
			ageGroups: ageStats,
			devices: deviceStats,
			generatedAt: new Date().toISOString(),
		};

		await cache.setex(cacheKey, 3600, demographics);
		return res.status(200).json(new ApiResponse(200, demographics, "User demographics"));
	} catch (error) {
		throw new ApiError(500, `Demographics failed: ${error.message}`);
	}
});

// 📊 Engagement Metrics
const getEngagementMetrics = asyncHandler(async (req, res) => {
	try {
		const { timeRange = "7d" } = req.query;
		const cacheKey = `analytics:engagement:${timeRange}`;
		
		const cached = await cache.get(cacheKey);
		if (cached) {
			return res.status(200).json(new ApiResponse(200, cached, "Engagement metrics (cached)"));
		}

		const dateRange = getDateRange(timeRange);
		const [dailyActive, weeklyActive, monthlyActive] = await Promise.all([
			User.countDocuments({
				lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
			}),
			User.countDocuments({
				lastLoginAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
			}),
			User.countDocuments({
				lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
			}),
		]);

		const engagement = {
			dailyActiveUsers: dailyActive,
			weeklyActiveUsers: weeklyActive,
			monthlyActiveUsers: monthlyActive,
			dau_wau_ratio: weeklyActive > 0 ? (dailyActive / weeklyActive * 100).toFixed(2) : 0,
			wau_mau_ratio: monthlyActive > 0 ? (weeklyActive / monthlyActive * 100).toFixed(2) : 0,
			timeRange,
		};

		await cache.setex(cacheKey, 300, engagement);
		return res.status(200).json(new ApiResponse(200, engagement, "Engagement metrics"));
	} catch (error) {
		throw new ApiError(500, `Engagement metrics failed: ${error.message}`);
	}
});

// Helper functions
const getDateRange = (timeRange) => {
	const end = new Date();
	const start = new Date();
	
	switch (timeRange) {
		case "1d": start.setDate(start.getDate() - 1); break;
		case "7d": start.setDate(start.getDate() - 7); break;
		case "30d": start.setDate(start.getDate() - 30); break;
		case "90d": start.setDate(start.getDate() - 90); break;
		default: start.setDate(start.getDate() - 30);
	}
	
	return { start, end };
};

const calculateGrowthTrend = (data) => {
	if (data.length < 2) return "stable";
	const recent = data.slice(-7).reduce((sum, d) => sum + d.newUsers, 0);
	const previous = data.slice(-14, -7).reduce((sum, d) => sum + d.newUsers, 0);
	const change = ((recent - previous) / previous) * 100;
	
	if (change > 10) return "increasing";
	if (change < -10) return "decreasing";
	return "stable";
};

export {
	getAnalyticsOverview,
	getUserGrowthAnalytics,
	getUserRetentionAnalytics,
	getUserDemographics,
	getEngagementMetrics,
};