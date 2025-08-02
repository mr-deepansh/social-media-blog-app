// src/modules/admin/services/analytics.service.js
import { User } from "../../users/models/user.model.js";
import { QueryBuilderService } from "./queryBuilder.service.js";

export class AnalyticsService {
	async generateAdminStats(dateRange = null) {
		try {
			// Use a simpler approach first to test
			const totalUsers = await User.countDocuments({});
			const activeUsers = await User.countDocuments({ isActive: true });
			const adminUsers = await User.countDocuments({ role: "admin" });

			// Get role distribution
			const roleDistribution = await User.aggregate([
				{
					$group: {
						_id: "$role",
						count: { $sum: 1 },
					},
				},
			]);

			const stats = {
				overview: {
					totalUsers: totalUsers || 0,
					activeUsers: activeUsers || 0,
					adminUsers: adminUsers || 0,
					suspendedUsers: (totalUsers || 0) - (activeUsers || 0),
					activePercentage:
						totalUsers > 0
							? ((activeUsers / totalUsers) * 100).toFixed(2)
							: "0.00",
				},
				breakdown: {
					usersByRole: roleDistribution.reduce((acc, item) => {
						acc[item._id] = item.count;
						return acc;
					}, {}),
					monthlyGrowth: [],
					dailyGrowth: [],
				},
				metadata: {
					generatedAt: new Date().toISOString(),
					dataRange: dateRange ? "filtered" : "all_time",
					cacheRecommendation: "cache_5_minutes",
				},
			};

			return stats;
		} catch (error) {
			console.error("Analytics generation failed:", error.message);
			// Return a basic stats object instead of throwing
			return {
				overview: {
					totalUsers: 0,
					activeUsers: 0,
					adminUsers: 0,
					suspendedUsers: 0,
					activePercentage: "0.00",
				},
				breakdown: {
					usersByRole: {},
					monthlyGrowth: [],
					dailyGrowth: [],
				},
				metadata: {
					generatedAt: new Date().toISOString(),
					dataRange: "error_fallback",
					cacheRecommendation: "cache_5_minutes",
					error: error.message,
				},
			};
		}
	}

	formatStatsResponse(result) {
		const totalStats = result.totalStats[0] || {};
		const roleDistribution = result.roleDistribution || [];
		const monthlyGrowth = result.monthlyGrowth || [];
		const dailyGrowth = result.dailyGrowth || [];

		return {
			overview: {
				totalUsers: totalStats.totalUsers || 0,
				activeUsers: totalStats.activeUsers || 0,
				adminUsers: totalStats.adminUsers || 0,
				suspendedUsers:
					(totalStats.totalUsers || 0) - (totalStats.activeUsers || 0),

				// Calculated metrics
				activePercentage:
					totalStats.totalUsers > 0
						? ((totalStats.activeUsers / totalStats.totalUsers) * 100).toFixed(
								2,
							)
						: "0.00",
			},
			breakdown: {
				usersByRole: roleDistribution.reduce((acc, item) => {
					acc[item._id] = item.count;
					return acc;
				}, {}),
				monthlyGrowth: monthlyGrowth.map((item) => ({
					month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
					users: item.count,
				})),
				dailyGrowth: dailyGrowth.map((item) => ({
					date: `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(item._id.day).padStart(2, "0")}`,
					users: item.count,
				})),
			},
			metadata: {
				generatedAt: new Date().toISOString(),
				dataRange: dateRange ? "filtered" : "all_time",
				cacheRecommendation: "cache_5_minutes",
			},
		};
	}

	async generateUserActivityReport(userId, dateRange = null) {
		// Mock implementation for user activity analysis
		return {
			userId,
			period: dateRange || "all_time",
			metrics: {
				totalLogins: 45,
				uniqueDevices: 3,
				averageSessionDuration: "24 minutes",
				lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
				ipAddresses: ["192.168.1.100", "10.0.0.1"],
				locations: ["New York, NY", "Jersey City, NJ"],
			},
			riskAssessment: {
				score: 2,
				level: "low",
				factors: ["verified_email", "consistent_location", "regular_activity"],
			},
		};
	}

	async generateTrendAnalysis(dateRange = null) {
		// Mock implementation for trend analysis
		return {
			userGrowth: {
				trend: "increasing",
				growthRate: 12.5,
				projectedGrowth: 15.2,
			},
			activityTrends: {
				dailyActiveUsers: 1250,
				weeklyActiveUsers: 8900,
				monthlyActiveUsers: 32000,
			},
			engagementMetrics: {
				avgSessionDuration: "18 minutes",
				bounceRate: 23.4,
				retentionRate: 67.8,
			},
		};
	}
}
