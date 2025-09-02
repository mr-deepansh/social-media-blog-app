// src/modules/admin/services/analytics.service.js
import { User } from "../../users/models/user.model.js";
import mongoose from "mongoose";

export class AnalyticsService {
  /**
	 * Get comprehensive analytics overview
	 * @param {string} timeRange - Time range for analytics (7d, 30d, 90d)
	 */
  async getOverview(timeRange = "30d") {
    const days = this.parseTimeRange(timeRange);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const pipeline = [
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activeUsers: { $sum: { $cond: ["$isActive", 1, 0] } },
                adminUsers: {
                  $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] },
                },
                superAdminUsers: {
                  $sum: { $cond: [{ $eq: ["$role", "super_admin"] }, 1, 0] },
                },
              },
            },
          ],
          recentStats: [
            {
              $match: { createdAt: { $gte: startDate } },
            },
            {
              $group: {
                _id: null,
                newUsers: { $sum: 1 },
                newActiveUsers: { $sum: { $cond: ["$isActive", 1, 0] } },
              },
            },
          ],
          roleDistribution: [
            {
              $group: {
                _id: "$role",
                count: { $sum: 1 },
              },
            },
          ],
          dailyGrowth: [
            {
              $match: { createdAt: { $gte: startDate } },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                  day: { $dayOfMonth: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
          ],
        },
      },
    ];

    const [result] = await User.aggregate(pipeline);

    const totalStats = result.totalStats[0] || {};
    const recentStats = result.recentStats[0] || {};

    return {
      overview: {
        totalUsers: totalStats.totalUsers || 0,
        activeUsers: totalStats.activeUsers || 0,
        adminUsers: totalStats.adminUsers || 0,
        superAdminUsers: totalStats.superAdminUsers || 0,
        newUsers: recentStats.newUsers || 0,
        growthRate: this.calculateGrowthRate(
          totalStats.totalUsers,
          recentStats.newUsers,
          days,
        ),
      },
      roleDistribution: result.roleDistribution,
      dailyGrowth: result.dailyGrowth,
      timeRange,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
	 * Get user growth analytics
	 * @param {string} period - Period type (daily, weekly, monthly)
	 * @param {number} days - Number of days to analyze
	 */
  async getUserGrowth(period = "daily", days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    let groupBy;
    switch (period) {
      case "weekly":
        groupBy = {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        };
        break;
      case "monthly":
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
        break;
      default: // daily
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
    }

    const pipeline = [
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: groupBy,
          newUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ["$isActive", 1, 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ];

    const growth = await User.aggregate(pipeline);

    return {
      period,
      days,
      growth: growth.map((item) => ({
        ...item._id,
        newUsers: item.newUsers,
        activeUsers: item.activeUsers,
        date: this.formatDate(item._id, period),
      })),
      summary: {
        totalNewUsers: growth.reduce((sum, item) => sum + item.newUsers, 0),
        averageDaily:
					growth.length > 0
					  ? Math.round(
					    growth.reduce((sum, item) => sum + item.newUsers, 0) /
									growth.length,
					  )
					  : 0,
      },
    };
  }

  /**
	 * Get user retention analytics
	 * @param {string} cohortPeriod - Cohort period (weekly, monthly)
	 */
  async getRetentionAnalytics(cohortPeriod = "monthly") {
    // Mock retention data for now - implement based on user activity tracking
    const cohorts = [];
    const currentDate = new Date();

    for (let i = 0; i < 6; i++) {
      const cohortDate = new Date(currentDate);
      cohortDate.setMonth(cohortDate.getMonth() - i);

      cohorts.push({
        cohort: cohortDate.toISOString().slice(0, 7), // YYYY-MM format
        users: Math.floor(Math.random() * 1000) + 100,
        retention: {
          week1: Math.floor(Math.random() * 30) + 70,
          week2: Math.floor(Math.random() * 20) + 50,
          week4: Math.floor(Math.random() * 15) + 35,
          week8: Math.floor(Math.random() * 10) + 25,
        },
      });
    }

    return {
      cohortPeriod,
      cohorts: cohorts.reverse(),
      averageRetention: {
        week1: Math.round(
          cohorts.reduce((sum, c) => sum + c.retention.week1, 0) /
						cohorts.length,
        ),
        week2: Math.round(
          cohorts.reduce((sum, c) => sum + c.retention.week2, 0) /
						cohorts.length,
        ),
        week4: Math.round(
          cohorts.reduce((sum, c) => sum + c.retention.week4, 0) /
						cohorts.length,
        ),
        week8: Math.round(
          cohorts.reduce((sum, c) => sum + c.retention.week8, 0) /
						cohorts.length,
        ),
      },
    };
  }

  /**
	 * Get user demographics
	 */
  async getDemographics() {
    const pipeline = [
      {
        $facet: {
          roleDistribution: [
            {
              $group: {
                _id: "$role",
                count: { $sum: 1 },
                percentage: { $sum: 1 },
              },
            },
          ],
          statusDistribution: [
            {
              $group: {
                _id: "$isActive",
                count: { $sum: 1 },
              },
            },
          ],
          registrationTrends: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                },
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ],
        },
      },
    ];

    const [result] = await User.aggregate(pipeline);

    // Calculate percentages for role distribution
    const totalUsers = result.roleDistribution.reduce(
      (sum, item) => sum + item.count,
      0,
    );
    const roleDistribution = result.roleDistribution.map((item) => ({
      role: item._id,
      count: item.count,
      percentage:
				totalUsers > 0 ? Math.round((item.count / totalUsers) * 100) : 0,
    }));

    return {
      roleDistribution,
      statusDistribution: result.statusDistribution.map((item) => ({
        status: item._id ? "active" : "inactive",
        count: item.count,
      })),
      registrationTrends: result.registrationTrends,
      totalUsers,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
	 * Get engagement metrics
	 * @param {string} timeRange - Time range for metrics
	 */
  async getEngagementMetrics(timeRange = "7d") {
    const days = this.parseTimeRange(timeRange);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Mock engagement data - implement based on actual user activity tracking
    return {
      timeRange,
      metrics: {
        dailyActiveUsers: Math.floor(Math.random() * 1000) + 500,
        weeklyActiveUsers: Math.floor(Math.random() * 2000) + 1000,
        monthlyActiveUsers: Math.floor(Math.random() * 5000) + 2000,
        averageSessionDuration: Math.floor(Math.random() * 30) + 15, // minutes
        bounceRate: Math.floor(Math.random() * 20) + 10, // percentage
        pageViewsPerSession: Math.floor(Math.random() * 5) + 3,
      },
      trends: {
        dailyActive: "increasing",
        engagement: "stable",
        retention: "improving",
      },
      generatedAt: new Date().toISOString(),
    };
  }

  // Helper methods
  parseTimeRange(timeRange) {
    const match = timeRange.match(/(\d+)([dwmy])/);
    if (!match) {
      return 30;
    } // default

    const [, num, unit] = match;
    const multipliers = { d: 1, w: 7, m: 30, y: 365 };
    return parseInt(num) * (multipliers[unit] || 1);
  }

  calculateGrowthRate(total, recent, days) {
    if (!total || !recent) {
      return 0;
    }
    const dailyRate = recent / days;
    const previousTotal = total - recent;
    return previousTotal > 0
      ? Math.round(((dailyRate * days) / previousTotal) * 100)
      : 0;
  }

  formatDate(dateObj, period) {
    const { year, month, day } = dateObj;
    switch (period) {
      case "weekly":
        return `${year}-W${dateObj.week}`;
      case "monthly":
        return `${year}-${month.toString().padStart(2, "0")}`;
      default:
        return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    }
  }
}
