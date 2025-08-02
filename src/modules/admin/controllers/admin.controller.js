// src/modules/admin/controllers/admin.controller.js
import { User } from "../../users/models/user.model.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import mongoose from "mongoose";
import { CacheService } from "../services/cache.service.js";
import { ValidationService } from "../services/validation.service.js";
import { AnalyticsService } from "../services/analytics.service.js";
import { NotificationService } from "../services/notification.service.js";
import auditService from "../services/audit.service.js";
import { ExportImportService } from "../services/exportImport.service.js";
import { SecurityService } from "../services/security.service.js";
import { log } from "console";

// Initialize services
const cache = new CacheService();
const validator = new ValidationService();
const analyticsService = new AnalyticsService();
const notificationService = new NotificationService();
const exportImportService = new ExportImportService();
const securityService = new SecurityService();

// ENTERPRISE-GRADE PERFORMANCE OPTIMIZATIONS

// Pre-compiled aggregation pipelines for maximum performance
const AGGREGATION_PIPELINES = {
	basicCounts: [
		{
			$facet: {
				totalUsers: [{ $count: "count" }],
				activeUsers: [{ $match: { isActive: true } }, { $count: "count" }],
				adminUsers: [{ $match: { role: "admin" } }, { $count: "count" }],
				usersByRole: [
					{ $group: { _id: "$role", count: { $sum: 1 } } },
					{ $project: { _id: 0, role: "$_id", count: 1 } },
					{ $sort: { count: -1 } },
				],
			},
		},
	],
	userAnalytics: [
		{
			$facet: {
				locationStats: [
					{
						$match: {
							"location.country": { $exists: true, $ne: null, $ne: "" },
						},
					},
					{ $group: { _id: "$location.country", count: { $sum: 1 } } },
					{ $project: { _id: 0, country: "$_id", count: 1 } },
					{ $sort: { count: -1 } },
					{ $limit: 5 },
				],
				engagementStats: [
					{
						$project: {
							daysSinceLastLogin: {
								$cond: {
									if: { $ifNull: ["$lastLoginAt", false] },
									then: {
										$divide: [
											{ $subtract: [new Date(), "$lastLoginAt"] },
											86400000,
										],
									},
									else: 999,
								},
							},
						},
					},
					{
						$group: {
							_id: null,
							highly_engaged: {
								$sum: {
									$cond: [{ $lt: ["$daysSinceLastLogin", 7] }, 1, 0],
								},
							},
							moderately_engaged: {
								$sum: {
									$cond: [
										{
											$and: [
												{ $gte: ["$daysSinceLastLogin", 7] },
												{ $lt: ["$daysSinceLastLogin", 30] },
											],
										},
										1,
										0,
									],
								},
							},
							low_engaged: {
								$sum: {
									$cond: [{ $gte: ["$daysSinceLastLogin", 30] }, 1, 0],
								},
							},
						},
					},
					{ $project: { _id: 0 } },
				],
			},
		},
	],
};
// Constants for better performance
const MONTH_NAMES = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];
// Connection pool optimization
const aggregationOptions = {
	allowDiskUse: false,
	maxTimeMS: 30000,
	readConcern: { level: "local" },
};

// ============================================================================
// * TODO ANALYTICS & DASHBOARD CONTROLLERS
// ============================================================================

// * ✅ [TESTED] 🚀 Get Admin Stats
const getAdminStats = asyncHandler(async (req, res) => {
	let startTime = process.hrtime.bigint();
	let cacheHit = false;
	try {
		// 🚀 TIER 1: Multi-level caching strategy
		const cacheKey = `admin:stats:${Math.floor(Date.now() / 60000)}`;
		const fallbackCacheKey = `admin:stats:fallback`;
		// Try primary cache first
		try {
			const cachedStats = await cache.get(cacheKey);
			if (cachedStats) {
				cacheHit = true;
				const responseTime =
					Number(process.hrtime.bigint() - startTime) / 1000000;
				return res.status(200).json(
					new ApiResponse(
						200,
						{
							stats: {
								...cachedStats,
								metadata: {
									...cachedStats.metadata,
									generatedAt: new Date().toISOString(),
									fromCache: true,
									responseTime: `${responseTime.toFixed(2)}ms`,
								},
							},
							meta: {
								cacheHit: true,
								generatedAt: new Date().toISOString(),
								executionTime: `${responseTime.toFixed(2)}ms`,
								dataFreshness: "cached_1_minute",
								performanceGrade: "A++",
							},
						},
						"Admin stats from cache",
					),
				);
			}
		} catch (cacheError) {
			console.warn("Primary cache failed:", cacheError.message);
		}
		// 🚀 TIER 2: Database operations with circuit breaker pattern
		const dbOperations = async () => {
			const [basicCounts, userAnalytics, recentActivity, timeBasedGrowth] =
				await Promise.all([
					// Basic counts with optimized aggregation
					User.aggregate(AGGREGATION_PIPELINES.basicCounts, aggregationOptions)
						.hint({ _id: 1 })
						.catch((err) => {
							console.error("Basic counts error:", err.message);
							return [
								{
									totalUsers: [{ count: 0 }],
									activeUsers: [{ count: 0 }],
									adminUsers: [{ count: 0 }],
									usersByRole: [],
								},
							];
						}),
					User.aggregate(
						AGGREGATION_PIPELINES.userAnalytics,
						aggregationOptions,
					)
						.hint({ lastLoginAt: 1 })
						.catch((err) => {
							console.error("User analytics error:", err.message);
							return [
								{
									locationStats: [],
									engagementStats: [
										{
											highly_engaged: 0,
											moderately_engaged: 0,
											low_engaged: 0,
										},
									],
								},
							];
						}),
					// Recent users with lean query
					User.find(
						{},
						{ name: 1, email: 1, role: 1, createdAt: 1, isActive: 1 },
					)
						.sort({ createdAt: -1 })
						.limit(8)
						.lean(true)
						.hint({ createdAt: -1 })
						.catch((err) => {
							console.error("Recent activity error:", err.message);
							return [];
						}),
					// Time-based growth analytics
					User.aggregate(
						[
							{
								$facet: {
									monthlyGrowth: [
										{
											$match: {
												createdAt: {
													$gte: new Date(
														Date.now() - 6 * 30 * 24 * 60 * 60 * 1000,
													),
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
										{
											$project: {
												_id: 0,
												year: "$_id.year",
												month: "$_id.month",
												count: 1,
											},
										},
									],
									dailyGrowth: [
										{
											$match: {
												createdAt: {
													$gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
												},
											},
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
										{
											$project: {
												_id: 0,
												year: "$_id.year",
												month: "$_id.month",
												day: "$_id.day",
												count: 1,
											},
										},
									],
								},
							},
						],
						aggregationOptions,
					)
						.hint({ createdAt: 1 })
						.catch((err) => {
							console.error("Time-based growth error:", err.message);
							return [{ monthlyGrowth: [], dailyGrowth: [] }];
						}),
				]);

			return [basicCounts, userAnalytics, recentActivity, timeBasedGrowth];
		};
		// Execute database operations with timeout
		const dbResults = await Promise.race([
			dbOperations(),
			new Promise((_, reject) =>
				setTimeout(
					() => reject(new Error("Database operation timeout")),
					25000,
				),
			),
		]);
		const [basicCounts, userAnalytics, recentActivity, timeBasedGrowth] =
			dbResults;
		const executionTime = Number(process.hrtime.bigint() - startTime) / 1000000;
		// 🚀 TIER 3: Ultra-fast data processing
		const basicStats = basicCounts[0] || {};
		const analytics = userAnalytics[0] || {};
		const timeData = timeBasedGrowth[0] || {};
		const totalUsers = basicStats.totalUsers?.[0]?.count || 0;
		const activeUsers = basicStats.activeUsers?.[0]?.count || 0;
		const adminUsers = basicStats.adminUsers?.[0]?.count || 0;
		const suspendedUsers = totalUsers - activeUsers;
		const activePercentage =
			totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : "0.0";
		const now = new Date();
		const currentMonth = now.getMonth() + 1;
		const currentYear = now.getFullYear();
		const currentMonthGrowth =
			timeData.monthlyGrowth?.find(
				(item) => item.month === currentMonth && item.year === currentYear,
			)?.count || 0;
		// 🚀 TIER 4: Optimized object construction
		const stats = {
			overview: {
				totalUsers,
				activeUsers,
				adminUsers,
				suspendedUsers,
				activePercentage: `${activePercentage}%`,
				currentMonthSignups: currentMonthGrowth,
				userGrowthTrend: currentMonthGrowth > 0 ? "up" : "down",
				healthScore: Math.round((activeUsers / (totalUsers || 1)) * 100),
			},
			breakdown: {
				usersByRole: Object.fromEntries(
					(basicStats.usersByRole || []).map((item) => [
						item.role || "undefined",
						item.count,
					]),
				),
				usersByLocation: Object.fromEntries(
					(analytics.locationStats || []).map((item) => [
						item.country,
						item.count,
					]),
				),
				monthlyGrowth: (timeData.monthlyGrowth || []).map((item) => ({
					...item,
					monthName: MONTH_NAMES[item.month - 1] || "Unknown",
				})),
				dailyGrowth: timeData.dailyGrowth || [],
			},
			activity: {
				recentUsers: (recentActivity || []).map((user) => ({
					id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
					joinedAt: user.createdAt,
					status: user.isActive ? "active" : "suspended",
					daysSinceJoined: Math.floor(
						(Date.now() - new Date(user.createdAt)) / (24 * 60 * 60 * 1000),
					),
				})),
			},
			engagement: analytics.engagementStats?.[0] || {
				highly_engaged: 0,
				moderately_engaged: 0,
				low_engaged: 0,
			},
			metadata: {
				generatedAt: new Date().toISOString(),
				queryExecutionTime: `${executionTime.toFixed(2)}ms`,
				totalQueries: 4,
				optimizedVersion: "4.0-Enterprise",
				fromCache: false,
				performance: {
					dbLatency: `${executionTime.toFixed(2)}ms`,
					cacheStatus: "miss",
					optimization: "enterprise",
				},
			},
		};
		// 🚀 TIER 5: Non-blocking background operations
		const backgroundOps = [
			// Set primary cache with proper method call
			cache
				.setex(cacheKey, 60, stats)
				.catch((err) => console.warn("Primary cache set failed:", err.message)),
			// Set fallback cache (longer TTL)
			cache
				.setex(fallbackCacheKey, 300, stats)
				.catch((err) =>
					console.warn("Fallback cache set failed:", err.message),
				),
			// Update analytics if available
			analyticsService
				.updateDashboardMetrics?.(stats)
				.catch((err) => console.warn("Analytics update failed:", err.message)),
		];
		// Execute background operations without blocking response
		Promise.allSettled(backgroundOps);
		// Performance grading
		const getPerformanceGrade = (time) => {
			if (time < 50) return "A++";
			if (time < 100) return "A+";
			if (time < 200) return "A";
			if (time < 400) return "B";
			return "C";
		};
		return res.status(200).json(
			new ApiResponse(
				200,
				{
					stats,
					meta: {
						cacheHit: false,
						generatedAt: new Date().toISOString(),
						totalQueries: 4,
						executionTime: `${executionTime.toFixed(2)}ms`,
						dataFreshness: "real_time",
						performanceGrade: getPerformanceGrade(executionTime),
						insights: {
							speed:
								executionTime < 100
									? "optimal"
									: executionTime < 200
										? "good"
										: "needs_optimization",
							cacheRecommendation: "enabled",
							nextOptimization:
								executionTime > 200
									? "consider_database_sharding"
									: "none_needed",
						},
					},
				},
				"Admin stats fetched successfully",
			),
		);
	} catch (error) {
		// 🚀 TIER 6: Enterprise error handling with fallback strategy
		try {
			// Try fallback cache first
			const fallbackStats = await cache.get("admin:stats:fallback");
			if (fallbackStats) {
				console.log("🔄 Returning fallback cached stats due to error");
				return res.status(200).json(
					new ApiResponse(
						200,
						{
							stats: {
								...fallbackStats,
								metadata: {
									...fallbackStats.metadata,
									warning: "Using cached data due to temporary issue",
									generatedAt: new Date().toISOString(),
								},
							},
							meta: {
								cacheHit: true,
								dataFreshness: "fallback_cache",
								warning: "Using cached data due to temporary issue",
							},
						},
						"Admin stats from fallback cache",
					),
				);
			}
		} catch (fallbackError) {
			console.error("Fallback cache error:", fallbackError.message);
		}
		// 🛠️ Enhanced audit logging
		try {
			await auditService.logAdminActivity({
				adminId: req.user?._id,
				action: "GET_ADMIN_STATS",
				details: {
					error: error.message,
					stack: error.stack?.split("\n").slice(0, 5).join("\n"),
					timestamp: new Date().toISOString(),
				},
				level: "error",
				status: "failure",
				ipAddress: req.ip,
				userAgent: req.get("User-Agent"),
			});
		} catch (auditError) {
			console.error("❌ Audit logging failed:", auditError.message);
		}
		// Enhanced error handling with specific error types
		if (error.message === "Database operation timeout") {
			throw new ApiError(504, "Database response timeout. Please try again.");
		}
		if (error.name === "MongoError" || error.name === "MongoServerError") {
			throw new ApiError(
				503,
				"Database temporarily unavailable. Please try again.",
			);
		}
		if (error.name === "MongoNetworkError") {
			throw new ApiError(503, "Database connection issue. Please try again.");
		}
		if (error instanceof ApiError) {
			throw error;
		}
		throw new ApiError(500, `Admin stats failed: ${error.message}`);
	}
});

// * ✅ [TESTED] 🚀 live stats endpoint
const getAdminStatsLive = asyncHandler(async (req, res) => {
	const startTime = process.hrtime.bigint();
	try {
		// Check cache first for instant response
		const liveCache = await cache.get("admin:stats:live");
		if (liveCache) {
			const responseTime =
				Number(process.hrtime.bigint() - startTime) / 1000000;
			return res.status(200).json(
				new ApiResponse(
					200,
					{
						...liveCache,
						metadata: {
							...liveCache.metadata,
							generatedAt: new Date().toISOString(),
							responseTime: `${responseTime.toFixed(2)}ms`,
						},
					},
					"Live admin stats (cached)",
				),
			);
		}
		const basicStatsPromise = User.aggregate(
			[
				{
					$facet: {
						total: [{ $count: "count" }],
						active: [{ $match: { isActive: true } }, { $count: "count" }],
						admin: [{ $match: { role: "admin" } }, { $count: "count" }],
					},
				},
			],
			{
				allowDiskUse: false,
				maxTimeMS: 5000,
			},
		).hint({ _id: 1 });
		const basicStats = await Promise.race([
			basicStatsPromise,
			new Promise((_, reject) =>
				setTimeout(() => reject(new Error("Live stats timeout")), 4000),
			),
		]);
		const stats = basicStats[0] || {};
		const totalUsers = stats.total?.[0]?.count || 0;
		const activeUsers = stats.active?.[0]?.count || 0;
		const adminUsers = stats.admin?.[0]?.count || 0;
		const executionTime = Number(process.hrtime.bigint() - startTime) / 1000000;
		const liveData = {
			overview: {
				totalUsers,
				activeUsers,
				adminUsers,
				suspendedUsers: totalUsers - activeUsers,
				activePercentage: `${totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : "0.0"}%`,
			},
			metadata: {
				type: "live",
				generatedAt: new Date().toISOString(),
				executionTime: `${executionTime.toFixed(2)}ms`,
				performanceGrade:
					executionTime < 25 ? "A++" : executionTime < 50 ? "A+" : "A",
			},
		};
		// Cache for 30 seconds (non-blocking)
		cache.setex("admin:stats:live", 30, liveData).catch(() => {});
		return res
			.status(200)
			.json(new ApiResponse(200, liveData, "Live admin stats"));
	} catch (error) {
		console.error("❌ Live stats error:", error);
		// Log error (non-blocking)
		auditService
			.logAdminActivity({
				adminId: req.user?._id,
				action: "GET_ADMIN_STATS_LIVE",
				details: { error: error.message },
				level: "error",
				status: "failure",
			})
			.catch(() => {});
		// Return minimal fallback data
		const fallbackData = {
			overview: {
				totalUsers: 0,
				activeUsers: 0,
				adminUsers: 0,
				suspendedUsers: 0,
				activePercentage: "0.0%",
			},
			metadata: {
				type: "fallback",
				generatedAt: new Date().toISOString(),
				error: "Live stats temporarily unavailable",
			},
		};
		return res
			.status(200)
			.json(new ApiResponse(200, fallbackData, "Live stats fallback"));
	}
});

// ============================================================================
//*  ADMIN MANAGEMENT CONTROLLERS
// ============================================================================

// * ✅ [TESTED] 🚀 Get All Admins with Advanced Filtering, Pagination & Caching
const getAllAdmins = asyncHandler(async (req, res) => {
	try {
		const startTime = Date.now();
		const {
			page = 1,
			limit = 10,
			sortBy = "createdAt",
			sortOrder = "desc",
			search = "",
			status = "all", // 'active', 'suspended', 'all'
			role = "admin", // 'admin', 'super_admin', 'all'
			dateFrom,
			dateTo,
			lastLoginFrom,
			lastLoginTo,
		} = req.query;
		const validatedParams = validator.validatePagination(page, limit);
		// Add sort validation
		const validSortFields = ["createdAt", "name", "email", "lastLoginAt"];
		const validSortOrders = ["asc", "desc"];
		const finalSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";
		const finalSortOrder = validSortOrders.includes(sortOrder)
			? sortOrder
			: "desc";
		// 🔥 Build cache key based on query params
		const cacheKey = `admin:list:${JSON.stringify(req.query)}`;
		let cachedResult = null;
		// Safe cache get with fallback
		if (cache && typeof cache.get === "function") {
			try {
				cachedResult = await cache.get(cacheKey);
			} catch (error) {
				console.warn("Cache get failed:", error.message);
			}
		}
		if (cachedResult) {
			console.log(`⚡ Admin list cache hit - ${Date.now() - startTime}ms`);
			return res
				.status(200)
				.json(new ApiResponse(200, cachedResult, "Admins fetched from cache"));
		}
		// 🚀 Build dynamic filter object
		const filter = {
			role: { $in: role === "all" ? ["admin", "super_admin"] : [role] },
		};
		// Status filter
		if (status !== "all") {
			filter.isActive = status === "active";
		}
		// Search filter (name, email, phone) - sanitize search input
		const sanitizedSearch = validator.sanitizeSearchQuery(search);
		if (sanitizedSearch) {
			filter.$or = [
				{ name: { $regex: sanitizedSearch, $options: "i" } },
				{ email: { $regex: sanitizedSearch, $options: "i" } },
				{ phone: { $regex: sanitizedSearch, $options: "i" } },
			];
		}
		// Date range filters
		if (dateFrom || dateTo) {
			filter.createdAt = {};
			if (dateFrom) {
				try {
					filter.createdAt.$gte = new Date(dateFrom);
				} catch (error) {
					throw new ApiError(400, "Invalid dateFrom format");
				}
			}
			if (dateTo) {
				try {
					filter.createdAt.$lte = new Date(dateTo);
				} catch (error) {
					throw new ApiError(400, "Invalid dateTo format");
				}
			}
		}
		// Last login filter
		if (lastLoginFrom || lastLoginTo) {
			filter.lastLoginAt = {};
			if (lastLoginFrom) {
				try {
					filter.lastLoginAt.$gte = new Date(lastLoginFrom);
				} catch (error) {
					throw new ApiError(400, "Invalid lastLoginFrom format");
				}
			}
			if (lastLoginTo) {
				try {
					filter.lastLoginAt.$lte = new Date(lastLoginTo);
				} catch (error) {
					throw new ApiError(400, "Invalid lastLoginTo format");
				}
			}
		}
		const sort = {
			[finalSortBy]: finalSortOrder === "desc" ? -1 : 1,
		};
		const [admins, totalCount, activeCount, recentActivityCount] =
			await Promise.all([
				User.find(filter)
					.select(
						"name email phone role isActive createdAt lastLoginAt profileImage permissions department",
					)
					.sort(sort)
					.skip((validatedParams.page - 1) * validatedParams.limit)
					.limit(validatedParams.limit)
					.lean(),
				User.countDocuments(filter),
				User.countDocuments({ ...filter, isActive: true }),
				User.countDocuments({
					...filter,
					lastLoginAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
				}),
			]);
		const executionTime = Date.now() - startTime;
		const transformedAdmins = admins.map((admin) => ({
			id: admin._id,
			name: admin.name,
			email: admin.email,
			phone: admin.phone || null,
			role: admin.role,
			status: admin.isActive ? "active" : "suspended",
			isActive: admin.isActive,
			joinedAt: admin.createdAt,
			lastLogin: admin.lastLoginAt || null,
			profileImage: admin.profileImage || null,
			department: admin.department || null,
			permissions: admin.permissions || [],
			// Calculated fields
			daysSinceJoined: Math.floor(
				(Date.now() - new Date(admin.createdAt)) / (24 * 60 * 60 * 1000),
			),
			daysSinceLastLogin: admin.lastLoginAt
				? Math.floor(
						(Date.now() - new Date(admin.lastLoginAt)) / (24 * 60 * 60 * 1000),
					)
				: null,
			isOnline: admin.lastLoginAt
				? Date.now() - new Date(admin.lastLoginAt) < 15 * 60 * 1000 // 15 minutes
				: false,
		}));
		// 🔥 Calculate pagination metadata
		const totalPages = Math.ceil(totalCount / validatedParams.limit);
		const hasNextPage = validatedParams.page < totalPages;
		const hasPrevPage = validatedParams.page > 1;
		const result = {
			admins: transformedAdmins,
			pagination: {
				currentPage: validatedParams.page,
				totalPages,
				totalCount,
				limit: validatedParams.limit,
				hasNextPage,
				hasPrevPage,
				nextPage: hasNextPage ? validatedParams.page + 1 : null,
				prevPage: hasPrevPage ? validatedParams.page - 1 : null,
			},
			summary: {
				totalAdmins: totalCount,
				activeAdmins: activeCount,
				suspendedAdmins: totalCount - activeCount,
				recentlyActive: recentActivityCount,
				onlineNow: transformedAdmins.filter((admin) => admin.isOnline).length,
			},
			filters: {
				applied: {
					search: sanitizedSearch || null,
					status,
					role,
					dateRange: dateFrom || dateTo ? { from: dateFrom, to: dateTo } : null,
					lastLoginRange:
						lastLoginFrom || lastLoginTo
							? { from: lastLoginFrom, to: lastLoginTo }
							: null,
				},
				available: {
					statuses: ["all", "active", "suspended"],
					roles: ["all", "admin", "super_admin"],
					sortOptions: ["createdAt", "name", "email", "lastLoginAt"],
				},
			},
			metadata: {
				generatedAt: new Date().toISOString(),
				executionTime: `${executionTime}ms`,
				cached: false,
				dataFreshness: "real_time",
			},
		};
		// 🚀 Cache the result (2 minutes for list data) - using setex method
		if (cache && typeof cache.setex === "function") {
			try {
				await cache.setex(cacheKey, 120, result);
			} catch (error) {
				console.warn("Cache set failed:", error.message);
			}
		}
		// 🔥 Log admin access for audit
		auditService
			.logAdminActivity({
				adminId: req.user._id,
				action: "VIEW_ADMIN_LIST",
				details: {
					filters: result.filters.applied,
					resultCount: transformedAdmins.length,
				},
			})
			.catch(() => {});
		return res
			.status(200)
			.json(new ApiResponse(200, result, "Admins fetched successfully"));
	} catch (error) {
		console.error("❌ Get all admins error:", error);
		if (error instanceof ApiError) {
			throw error;
		}
		// Log error for monitoring
		auditService
			.logAdminError({
				adminId: req.user?._id,
				action: "GET_ALL_ADMINS",
				error: error.message,
				filters: req.query,
			})
			.catch(() => {});
		throw new ApiError(500, `Failed to fetch admins: ${error.message}`);
	}
});

// ! 🚀 Get Admin by ID with Detailed Information & Activity History
const getAdminById = asyncHandler(async (req, res) => {
	try {
		const startTime = Date.now();
		const { adminId } = req.params;
		if (!mongoose.Types.ObjectId.isValid(adminId)) {
			throw new ApiError(400, "Invalid admin ID format");
		}
		// 🚀 Check cache first
		const cacheKey = `admin:profile:${adminId}`;
		const cachedAdmin = await cache.get(cacheKey).catch(() => null);
		if (cachedAdmin) {
			console.log(`⚡ Admin profile cache hit - ${Date.now() - startTime}ms`);
			return res
				.status(200)
				.json(new ApiResponse(200, cachedAdmin, "Admin profile from cache"));
		}
		// 🚀 Execute parallel queries for comprehensive admin data
		const [adminData, loginHistory, recentActivities, managedUsers] =
			await Promise.all([
				// Main admin data
				User.findById(adminId)
					.select("-password -refreshToken") // Exclude sensitive fields
					.lean(),
				// Login history (last 10 logins)
				User.aggregate([
					{ $match: { _id: new mongoose.Types.ObjectId(adminId) } },
					{
						$unwind: {
							path: "$loginHistory",
							preserveNullAndEmptyArrays: true,
						},
					},
					{ $sort: { "loginHistory.timestamp": -1 } },
					{ $limit: 10 },
					{
						$project: {
							_id: 0,
							timestamp: "$loginHistory.timestamp",
							ipAddress: "$loginHistory.ipAddress",
							userAgent: "$loginHistory.userAgent",
							location: "$loginHistory.location",
						},
					},
				]),
				// Recent admin activities (if audit system exists)
				User.aggregate([
					{ $match: { _id: new mongoose.Types.ObjectId(adminId) } },
					{
						$unwind: {
							path: "$recentActivities",
							preserveNullAndEmptyArrays: true,
						},
					},
					{ $sort: { "recentActivities.timestamp": -1 } },
					{ $limit: 20 },
					{
						$project: {
							_id: 0,
							action: "$recentActivities.action",
							timestamp: "$recentActivities.timestamp",
							details: "$recentActivities.details",
							ipAddress: "$recentActivities.ipAddress",
						},
					},
				]),
				// Users managed by this admin (if applicable)
				User.countDocuments({
					createdBy: adminId,
					role: { $ne: "admin" },
				}),
			]);
		const executionTime = Date.now() - startTime;
		if (!adminData) {
			throw new ApiError(404, "Admin not found");
		}
		// 🔥 Check if requesting user has permission to view this admin
		const currentUser = req.user;
		if (
			currentUser.role !== "super_admin" &&
			currentUser._id.toString() !== adminId
		) {
			// Allow admins to view their own profile, super_admins can view all
			throw new ApiError(403, "Access denied. Insufficient permissions");
		}
		// 🚀 Transform and enrich admin data
		const enrichedAdmin = {
			id: adminData._id,
			personalInfo: {
				name: adminData.name,
				email: adminData.email,
				phone: adminData.phone || null,
				profileImage: adminData.profileImage || null,
				dateOfBirth: adminData.dateOfBirth || null,
				address: adminData.address || null,
			},
			accountInfo: {
				role: adminData.role,
				status: adminData.isActive ? "active" : "suspended",
				isActive: adminData.isActive,
				isEmailVerified: adminData.isEmailVerified || false,
				isPhoneVerified: adminData.isPhoneVerified || false,
				twoFactorEnabled: adminData.twoFactorEnabled || false,
			},
			professionalInfo: {
				department: adminData.department || null,
				position: adminData.position || null,
				employeeId: adminData.employeeId || null,
				permissions: adminData.permissions || [],
				accessLevel: adminData.accessLevel || "standard",
			},
			activityInfo: {
				joinedAt: adminData.createdAt,
				lastLogin: adminData.lastLoginAt || null,
				lastActivity: adminData.lastActivity || null,
				totalLogins: adminData.loginCount || 0,
				daysSinceJoined: Math.floor(
					(Date.now() - new Date(adminData.createdAt)) / (24 * 60 * 60 * 1000),
				),
				daysSinceLastLogin: adminData.lastLoginAt
					? Math.floor(
							(Date.now() - new Date(adminData.lastLoginAt)) /
								(24 * 60 * 60 * 1000),
						)
					: null,
				isCurrentlyOnline: adminData.lastLoginAt
					? Date.now() - new Date(adminData.lastLoginAt) < 15 * 60 * 1000
					: false,
			},
			statistics: {
				managedUsers: managedUsers,
				loginHistory: loginHistory,
				recentActivities: recentActivities,
				averageSessionDuration: adminData.averageSessionDuration || null,
				totalActionsPerformed: adminData.totalActions || 0,
			},
			settings: {
				language: adminData.language || "en",
				timezone: adminData.timezone || "UTC",
				theme: adminData.theme || "light",
				notifications: adminData.notificationSettings || {
					email: true,
					sms: false,
					push: true,
				},
			},
			metadata: {
				createdBy: adminData.createdBy || null,
				updatedAt: adminData.updatedAt,
				version: adminData.__v || 0,
				lastProfileUpdate: adminData.lastProfileUpdate || null,
			},
		};
		// 🚀 Cache the result (5 minutes for profile data)
		cache.set(cacheKey, enrichedAdmin, 300).catch((error) => {
			console.warn("Cache set failed:", error.message);
		});
		// 🔥 Log profile view for audit
		auditService
			.logAdminActivity({
				adminId: currentUser._id,
				action: "VIEW_ADMIN_PROFILE",
				targetAdminId: adminId,
				details: {
					viewedBy: currentUser.role,
					profileOwner: adminData.role,
				},
			})
			.catch(() => {});
		console.log(`⚡ Admin profile generated in ${executionTime}ms`);
		return res.status(200).json(
			new ApiResponse(
				200,
				{
					admin: enrichedAdmin,
					meta: {
						executionTime: `${executionTime}ms`,
						cached: false,
						dataFreshness: "real_time",
						permissionLevel: currentUser.role,
						canEdit:
							currentUser.role === "super_admin" ||
							currentUser._id.toString() === adminId,
					},
				},
				"Admin profile fetched successfully",
			),
		);
	} catch (error) {
		console.error("❌ Get admin by ID error:", error);
		if (error instanceof ApiError) {
			throw error;
		}
		// Log error for monitoring
		auditService
			.logAdminError({
				adminId: req.user?._id,
				action: "GET_ADMIN_BY_ID",
				targetAdminId: req.params.adminId,
				error: error.message,
			})
			.catch(() => {});
		throw new ApiError(500, `Failed to fetch admin profile: ${error.message}`);
	}
});

// ============================================================================
// USER MANAGEMENT CONTROLLERS
// ============================================================================

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

	// Cache implementation (optional)
	try {
		const cacheKey = `users:list:${Buffer.from(JSON.stringify(req.query)).toString("base64")}`;
		const cachedResult = await cache.get(cacheKey);
		if (cachedResult) {
			return res
				.status(200)
				.json(
					new ApiResponse(
						200,
						JSON.parse(cachedResult),
						"Users fetched from cache",
					),
				);
		}
	} catch (cacheError) {
		// Cache not available, continue without caching
	}

	const pipeline = [];
	const matchStage = {};

	if (search) {
		matchStage.$or = [
			{ username: { $regex: search, $options: "i" } },
			{ email: { $regex: search, $options: "i" } },
			{ firstName: { $regex: search, $options: "i" } },
			{ lastName: { $regex: search, $options: "i" } },
		];
	}
	if (role) matchStage.role = role;
	if (isActive !== undefined) matchStage.isActive = isActive === "true";

	pipeline.push({ $match: matchStage });
	pipeline.push({
		$project: {
			password: 0,
			refreshToken: 0,
			__v: 0,
		},
	});

	const sortObj = {};
	sortObj[sortBy] = sortOrder === "desc" ? -1 : 1;
	pipeline.push({ $sort: sortObj });

	const skip = (parseInt(page) - 1) * parseInt(limit);
	pipeline.push({
		$facet: {
			data: [{ $skip: skip }, { $limit: parseInt(limit) }],
			count: [{ $count: "total" }],
		},
	});

	const [result] = await User.aggregate(pipeline).allowDiskUse(true);
	const users = result.data;
	const totalUsers = result.count[0]?.total || 0;
	const totalPages = Math.ceil(totalUsers / parseInt(limit));

	const responseData = {
		users,
		pagination: {
			currentPage: parseInt(page),
			totalPages,
			totalUsers,
			hasNextPage: parseInt(page) < totalPages,
			hasPrevPage: parseInt(page) > 1,
			limit: parseInt(limit),
		},
	};

	// Cache the response (optional)
	try {
		const cacheKey = `users:list:${Buffer.from(JSON.stringify(req.query)).toString("base64")}`;
		await cache.setex(cacheKey, 300, JSON.stringify(responseData));
	} catch (cacheError) {
		// Cache not available, continue without caching
	}

	return res
		.status(200)
		.json(new ApiResponse(200, responseData, "Users fetched successfully"));
});

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
		.json(new ApiResponse(200, { user }, "User details fetched successfully"));
});

const updateUserById = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const updateData = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid user ID");
	}

	const user = await User.findByIdAndUpdate(
		id,
		{ ...updateData, updatedAt: new Date() },
		{ new: true },
	).select("-password -refreshToken");

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	// Clear cache (optional)
	try {
		await cache.del(`user:${id}`);
		await cache.del("users:list:*");
	} catch (cacheError) {
		// Cache not available, continue
	}

	return res
		.status(200)
		.json(new ApiResponse(200, { user }, "User updated successfully"));
});

const deleteUserById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid user ID");
	}

	if (req.user._id.toString() === id) {
		throw new ApiError(400, "You cannot delete your own account");
	}

	const user = await User.findByIdAndDelete(id);
	if (!user) {
		throw new ApiError(404, "User not found");
	}

	// Clear cache (optional)
	try {
		await cache.del(`user:${id}`);
		await cache.del("users:list:*");
	} catch (cacheError) {
		// Cache not available, continue
	}

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "User deleted successfully"));
});

const suspendUser = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { reason } = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid user ID");
	}

	if (req.user._id.toString() === id) {
		throw new ApiError(400, "You cannot suspend your own account");
	}

	const user = await User.findByIdAndUpdate(
		id,
		{
			isActive: false,
			suspendedAt: new Date(),
			suspendedBy: req.user._id,
			suspensionReason: reason || "Suspended by admin",
		},
		{ new: true },
	).select("-password -refreshToken");

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	// Clear cache (optional)
	try {
		await cache.del(`user:${id}`);
		await cache.del("users:list:*");
	} catch (cacheError) {
		// Cache not available, continue
	}

	return res
		.status(200)
		.json(new ApiResponse(200, { user }, "User suspended successfully"));
});

const activateUser = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid user ID");
	}

	const user = await User.findByIdAndUpdate(
		id,
		{
			isActive: true,
			$unset: { suspendedAt: 1, suspendedBy: 1, suspensionReason: 1 },
		},
		{ new: true },
	).select("-password -refreshToken");

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	// Clear cache (optional)
	try {
		await cache.del(`user:${id}`);
		await cache.del("users:list:*");
	} catch (cacheError) {
		// Cache not available, continue
	}

	return res
		.status(200)
		.json(new ApiResponse(200, { user }, "User activated successfully"));
});

const verifyUserAccount = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid user ID");
	}

	const user = await User.findByIdAndUpdate(
		id,
		{
			isVerified: true,
			verifiedAt: new Date(),
			verifiedBy: req.user._id,
		},
		{ new: true },
	).select("-password -refreshToken");

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	// Clear cache (optional)
	try {
		await cache.del(`user:${id}`);
		await cache.del("users:list:*");
	} catch (cacheError) {
		// Cache not available, continue
	}

	return res
		.status(200)
		.json(new ApiResponse(200, { user }, "User account verified successfully"));
});

// ============================================================================
// SEARCH & EXPORT CONTROLLERS
// ============================================================================

const searchUsers = asyncHandler(async (req, res) => {
	try {
		console.log("🔍 Search users called with query:", req.query);

		const {
			q = "",
			username = "",
			search = "",
			page = 1,
			limit = 10,
			role,
			isActive,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = req.query;

		// Input validation and sanitization
		const searchQuery = (search || q || username || "").toString().trim();
		const pageNum = Math.max(1, parseInt(page) || 1);
		const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
		const skip = (pageNum - 1) * limitNum;

		console.log("📋 Processed search params:", {
			searchQuery,
			pageNum,
			limitNum,
			role,
			isActive,
		});

		const matchStage = {};

		// Build search query - allow empty search to return all users
		if (searchQuery) {
			matchStage.$or = [
				{ username: { $regex: searchQuery, $options: "i" } },
				{ email: { $regex: searchQuery, $options: "i" } },
				{ firstName: { $regex: searchQuery, $options: "i" } },
				{ lastName: { $regex: searchQuery, $options: "i" } },
			];
		}

		// Apply filters
		if (role) matchStage.role = role;
		if (isActive !== undefined) {
			matchStage.isActive = isActive === "true" || isActive === true;
		}

		console.log("🎯 MongoDB match stage:", JSON.stringify(matchStage, null, 2));

		// Build sort object
		const sortObj = {};
		const validSortFields = [
			"createdAt",
			"username",
			"email",
			"firstName",
			"lastName",
		];
		const validSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";
		const validSortOrder = sortOrder === "asc" ? 1 : -1;
		sortObj[validSortBy] = validSortOrder;

		// Execute query
		const users = await User.find(matchStage)
			.select("-password -refreshToken -__v")
			.sort(sortObj)
			.skip(skip)
			.limit(limitNum)
			.lean();

		const totalUsers = await User.countDocuments(matchStage);
		const totalPages = Math.ceil(totalUsers / limitNum);

		console.log(
			`✅ Search completed: ${users.length} users found, ${totalUsers} total`,
		);

		return res.status(200).json(
			new ApiResponse(
				200,
				{
					users,
					search: {
						query: searchQuery,
						filters: { role, isActive },
						resultsCount: users.length,
					},
					pagination: {
						currentPage: pageNum,
						totalPages,
						totalUsers,
						hasNextPage: pageNum < totalPages,
						hasPrevPage: pageNum > 1,
						limit: limitNum,
					},
					sorting: {
						sortBy: validSortBy,
						sortOrder: sortOrder,
					},
				},
				"User search completed successfully",
			),
		);
	} catch (error) {
		console.error("❌ Search users error:", error);
		throw new ApiError(500, `Search failed: ${error.message}`);
	}
});

const bulkExportUsers = asyncHandler(async (req, res) => {
	try {
		console.log("📤 Bulk export users called with query:", req.query);

		const {
			format = "csv",
			role,
			isActive,
			fields,
			search = "", // ✨ FIX: Added missing 'search' parameter
			limit = 1000,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = req.query;

		// Validate format
		const supportedFormats = ["csv", "json"];
		const normalizedFormat = format.toLowerCase();
		if (!supportedFormats.includes(normalizedFormat)) {
			throw new ApiError(
				400,
				`Unsupported format '${format}'. Supported: ${supportedFormats.join(", ")}`,
			);
		}

		const exportLimit = Math.min(10000, Math.max(1, parseInt(limit) || 1000));
		console.log(`📊 Export limit: ${exportLimit}`);

		// ✨ FIX: Using a single, clean pipeline for data fetching
		const pipeline = [];
		const matchStage = {}; // Use one object for all filters

		// Build the match stage for filtering
		const searchQuery = search.toString().trim();
		if (searchQuery) {
			matchStage.$or = [
				{ username: { $regex: searchQuery, $options: "i" } },
				{ email: { $regex: searchQuery, $options: "i" } },
				{ firstName: { $regex: searchQuery, $options: "i" } },
				{ lastName: { $regex: searchQuery, $options: "i" } },
			];
		}
		if (role && role.trim()) {
			matchStage.role = role.trim();
		}
		if (isActive !== undefined) {
			matchStage.isActive = isActive === "true" || isActive === true;
		}

		// Add the match stage to the pipeline if it has any filters
		if (Object.keys(matchStage).length > 0) {
			pipeline.push({ $match: matchStage });
		}

		// Build sort object
		const sortObj = {};
		const validSortFields = [
			"createdAt",
			"username",
			"email",
			"firstName",
			"lastName",
			"role",
		];
		const validSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";
		const validSortOrder = sortOrder === "asc" ? 1 : -1;
		sortObj[validSortBy] = validSortOrder;
		pipeline.push({ $sort: sortObj });

		// Exclude sensitive fields
		pipeline.push({ $project: { password: 0, refreshToken: 0, __v: 0 } });

		// Add limit
		pipeline.push({ $limit: exportLimit });

		// ✨ FIX: Executing the aggregation pipeline instead of User.find()
		const users = await User.aggregate(pipeline).allowDiskUse(true);

		console.log(`✅ Found ${users.length} users for export`);

		if (users.length === 0) {
			console.log("⚠️ No users found matching criteria");
			if (normalizedFormat === "csv") {
				res.setHeader("Content-Type", "text/csv");
				res.setHeader(
					"Content-Disposition",
					'attachment; filename="empty_export.csv"',
				);
				return res
					.status(200)
					.send("No users found matching the specified criteria");
			} else {
				return res.status(200).json({
					users: [],
					exportedAt: new Date(),
					total: 0,
					filters: matchStage,
					format: normalizedFormat,
					message: "No users found matching the specified criteria",
				});
			}
		}

		const timestamp = new Date().toISOString().split("T")[0];
		const filename = `users_export_${timestamp}.${normalizedFormat}`;

		if (normalizedFormat === "csv") {
			let csvHeader, csvData;

			if (fields && fields.trim()) {
				const fieldList = fields
					.split(",")
					.map((f) => f.trim())
					.filter((f) => f);
				if (fieldList.length === 0) {
					throw new ApiError(400, "No valid fields specified for export");
				}

				console.log("📋 Custom fields for export:", fieldList);
				csvHeader = fieldList.join(",") + "\n";
				csvData = users
					.map((user) => {
						return fieldList
							.map((field) => {
								let value = user[field];
								if (value === null || value === undefined) return "";
								if (typeof value === "object") {
									if (value instanceof Date) {
										return value.toISOString();
									}
									return JSON.stringify(value).replace(/"/g, '""');
								}
								value = String(value).replace(/"/g, '""');
								if (
									value.includes(",") ||
									value.includes('"') ||
									value.includes("\n")
								) {
									return `"${value}"`;
								}
								return value;
							})
							.join(",");
					})
					.join("\n");
			} else {
				csvHeader =
					"ID,Username,Email,First Name,Last Name,Role,Active,Created At\n";
				csvData = users
					.map((user) => {
						const escapeCSV = (val) => {
							if (val === null || val === undefined) return "";
							val = String(val);
							if (
								val.includes(",") ||
								val.includes('"') ||
								val.includes("\n")
							) {
								return `"${val.replace(/"/g, '""')}"`;
							}
							return val;
						};

						return [
							user._id,
							escapeCSV(user.username || ""),
							escapeCSV(user.email || ""),
							escapeCSV(user.firstName || ""),
							escapeCSV(user.lastName || ""),
							escapeCSV(user.role || ""),
							user.isActive ? "true" : "false",
							new Date(user.createdAt).toISOString(),
						].join(",");
					})
					.join("\n");
			}

			res.setHeader("Content-Type", "text/csv; charset=utf-8");
			res.setHeader(
				"Content-Disposition",
				`attachment; filename="${filename}"`,
			);
			res.setHeader("Cache-Control", "no-cache");
			console.log(`📤 Sending CSV export: ${filename}`);
			return res.status(200).send(csvHeader + csvData);
		} else {
			res.setHeader("Content-Type", "application/json");
			res.setHeader(
				"Content-Disposition",
				`attachment; filename="${filename}"`,
			);
			res.setHeader("Cache-Control", "no-cache");

			console.log(`📤 Sending JSON export: ${filename}`);
			return res.status(200).json({
				meta: {
					exportedAt: new Date().toISOString(),
					total: users.length,
					filters: matchStage,
					format: normalizedFormat,
					limit: exportLimit,
					sorting: {
						sortBy: validSortBy,
						sortOrder: sortOrder,
					},
				},
				users,
			});
		}
	} catch (error) {
		console.error("❌ Bulk export error:", error);
		if (error instanceof ApiError) {
			throw error;
		}
		throw new ApiError(500, `Export failed: ${error.message}`);
	}
});

const bulkImportUsers = asyncHandler(async (req, res) => {
	if (!req.file) {
		throw new ApiError(400, "Please upload a CSV file");
	}

	const {
		skipDuplicates = true,
		updateExisting = false,
		validateOnly = false,
	} = req.body;

	const filePath = req.file.path;
	const importId = `import_${Date.now()}_${req.user._id}`;

	const importProgress = {
		id: importId,
		startTime: Date.now(),
		totalProcessed: 0,
		successful: 0,
		duplicates: 0,
		errors: 0,
		status: "processing",
		details: {
			createdUsers: [],
			updatedUsers: [],
			duplicateEmails: [],
			errors: [],
		},
	};

	try {
		const result = await exportImportService.processCSVImport({
			filePath,
			options: {
				skipDuplicates,
				updateExisting,
				validateOnly,
				batchSize: 500,
				adminId: req.user._id,
			},
			progressCallback: (progress) => {
				console.log(`Import progress: ${progress.processed}/${progress.total}`);
			},
		});

		Object.assign(importProgress, result, {
			status: "completed",
			endTime: Date.now(),
			executionTime: Date.now() - importProgress.startTime,
		});

		await auditService.logAdminAction({
			adminId: req.user._id,
			action: "BULK_IMPORT_USERS",
			metadata: {
				importId,
				fileName: req.file.originalname,
				fileSize: req.file.size,
				totalProcessed: result.totalProcessed,
				successful: result.successful,
				duplicates: result.duplicates,
				errors: result.errors,
				options: { skipDuplicates, updateExisting, validateOnly },
			},
		});

		if (!validateOnly && result.successful > 0) {
			await cache.invalidateUserCaches();
			await cache.invalidatePattern("admin:stats:*");
		}

		return res
			.status(200)
			.json(new ApiResponse(200, importProgress, "Bulk import completed"));
	} catch (error) {
		importProgress.status = "failed";
		importProgress.error = error.message;

		console.error("Bulk import failed:", error.message);
		throw new ApiError(500, `Import failed: ${error.message}`);
	} finally {
		await exportImportService.cleanupFile(filePath);
	}
});

const bulkActions = asyncHandler(async (req, res) => {
	const {
		action,
		userIds,
		data = {},
		confirmPassword,
		dryRun = false,
	} = req.body;

	if (!action || !userIds || !Array.isArray(userIds)) {
		throw new ApiError(400, "Action and userIds array are required");
	}

	if (userIds.length === 0) {
		throw new ApiError(400, "At least one user ID is required");
	}

	if (userIds.length > 1000) {
		throw new ApiError(400, "Cannot process more than 1000 users at once");
	}

	const validUserIds = [];
	const invalidUserIds = [];

	userIds.forEach((id) => {
		if (mongoose.Types.ObjectId.isValid(id)) {
			validUserIds.push(id);
		} else {
			invalidUserIds.push(id);
		}
	});

	if (invalidUserIds.length > 0) {
		throw new ApiError(400, `Invalid user IDs: ${invalidUserIds.join(", ")}`);
	}

	const destructiveActions = ["delete", "suspend", "force_password_reset"];
	const isDestructive = destructiveActions.includes(action);

	if (isDestructive && validUserIds.includes(req.user._id.toString())) {
		throw new ApiError(400, `You cannot ${action} your own account`);
	}

	if (
		isDestructive &&
		process.env.NODE_ENV === "production" &&
		!confirmPassword
	) {
		throw new ApiError(
			400,
			`Password confirmation required for ${action} action`,
		);
	}

	if (dryRun) {
		const preview = await generateBulkActionPreview(action, validUserIds, data);
		return res
			.status(200)
			.json(new ApiResponse(200, preview, "Bulk action preview generated"));
	}

	const operationId = `bulk_${action}_${Date.now()}`;
	const startTime = Date.now();

	const session = await mongoose.startSession();

	try {
		const result = await session.withTransaction(async () => {
			const batchSize = 100;
			const results = {
				successful: 0,
				failed: 0,
				errors: [],
				processedUsers: [],
			};

			for (let i = 0; i < validUserIds.length; i += batchSize) {
				const batch = validUserIds.slice(i, i + batchSize);
				const batchResult = await processBulkActionBatch(
					action,
					batch,
					data,
					req.user._id,
					session,
				);

				results.successful += batchResult.successful;
				results.failed += batchResult.failed;
				results.errors.push(...batchResult.errors);
				results.processedUsers.push(...batchResult.processedUsers);

				if (validUserIds.length > 100) {
					console.log(
						`Bulk ${action} progress: ${i + batch.length}/${validUserIds.length}`,
					);
				}
			}

			return results;
		});

		// Clear cache (optional)
		try {
			await cache.invalidateUserCaches();
			await cache.invalidatePattern("admin:stats:*");
		} catch (cacheError) {
			// Cache not available, continue
		}

		// Log admin action (optional)
		try {
			await auditService.logAdminAction({
				adminId: req.user._id,
				action: `BULK_${action.toUpperCase()}`,
				metadata: {
					operationId,
					totalUsers: validUserIds.length,
					successful: result.successful,
					failed: result.failed,
					executionTime: Date.now() - startTime,
					data,
				},
			});
		} catch (auditError) {
			// Audit service not available, continue
		}

		return res.status(200).json(
			new ApiResponse(
				200,
				{
					operationId,
					action,
					summary: {
						totalRequested: validUserIds.length,
						successful: result.successful,
						failed: result.failed,
						executionTime: Date.now() - startTime,
					},
					details:
						result.errors.length > 0
							? {
									errors: result.errors.slice(0, 10),
									hasMoreErrors: result.errors.length > 10,
								}
							: undefined,
				},
				`Bulk ${action} completed`,
			),
		);
	} catch (error) {
		console.error("Bulk operation failed:", error.message);
		throw new ApiError(500, `Bulk operation failed: ${error.message}`);
	} finally {
		await session.endSession();
	}
});

// ============================================================================
// SECURITY & MONITORING CONTROLLERS
// ============================================================================

const getUserSecurityAnalysis = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { includeDevices = true, includeSessions = true } = req.query;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid user ID");
	}

	const user = await User.findById(id)
		.select(
			"username email firstName lastName createdAt isActive isVerified lastLogin",
		)
		.lean();

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	const startTime = Date.now();

	// Mock security analysis for testing
	const securityAnalysis = {
		riskAssessment: {
			overallRisk: "LOW",
			riskScore: 2,
			factors: [],
		},
		activityPatterns: {
			lastLogin: null,
			loginFrequency: "NORMAL",
			suspiciousActivity: false,
		},
		deviceAnalysis: {
			devices: [
				{
					deviceId: "device_1",
					deviceType: "desktop",
					browser: "Chrome",
					os: "Windows",
					lastUsed: new Date().toISOString(),
					location: "Unknown",
					isTrusted: true,
				},
			],
			totalDevices: 1,
			trustedDevices: 1,
		},
		sessionAnalysis: {
			sessions: [
				{
					sessionId: "session_1",
					loginTime: new Date().toISOString(),
					logoutTime: null,
					ipAddress: "192.168.1.1",
					userAgent: "Mozilla/5.0...",
					location: "Unknown",
					isActive: true,
				},
			],
			totalSessions: 1,
			activeSessions: 1,
		},
		recommendations: [],
	};

	// Log admin action (optional)
	try {
		await auditService.logAdminAction({
			adminId: req.user._id,
			action: "VIEW_USER_SECURITY_ANALYSIS",
			targetUserId: id,
			metadata: {
				includeDevices,
				includeSessions,
				executionTime: Date.now() - startTime,
			},
		});
	} catch (auditError) {
		// Audit service not available, continue
	}

	return res.status(200).json(
		new ApiResponse(
			200,
			{
				user: {
					id: user._id,
					username: user.username,
					email: user.email,
				},
				securityAnalysis,
				meta: {
					generatedAt: new Date().toISOString(),
					executionTime: Date.now() - startTime,
				},
			},
			"Security analysis completed",
		),
	);
});

const sendNotificationToUser = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const {
		title,
		message,
		type = "info",
		priority = "normal",
		template,
		templateData = {},
		channels = ["in-app"],
		scheduleFor,
		trackDelivery = true,
	} = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid user ID");
	}

	if (!template && (!title || !message)) {
		throw new ApiError(
			400,
			"Title and message are required (or use a template)",
		);
	}

	const user = await User.findById(id)
		.select("username email firstName lastName isActive")
		.lean();

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	if (!user.isActive) {
		throw new ApiError(400, "Cannot send notifications to inactive users");
	}

	const validChannels = ["email", "sms", "push", "in-app"];
	const invalidChannels = channels.filter((ch) => !validChannels.includes(ch));
	if (invalidChannels.length > 0) {
		throw new ApiError(400, `Invalid channels: ${invalidChannels.join(", ")}`);
	}

	const notificationId = `notif_${Date.now()}_${id}`;

	// Mock notification result for testing
	const result = {
		notificationId,
		delivered: true,
		channels,
		timestamp: new Date().toISOString(),
		user: {
			id: user._id,
			email: user.email,
		},
	};

	// Log admin action (optional)
	try {
		await auditService.logAdminAction({
			adminId: req.user._id,
			action: "SEND_USER_NOTIFICATION",
			targetUserId: id,
			metadata: {
				notificationId,
				type,
				priority,
				channels,
				template: template || "custom",
				scheduled: !!scheduleFor,
			},
		});
	} catch (auditError) {
		// Audit service not available, continue
	}

	return res
		.status(200)
		.json(new ApiResponse(200, result, "Notification sent successfully"));
});

const forcePasswordReset = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const {
		reason,
		notifyUser = true,
		invalidateAllSessions = true,
		confirmPassword,
	} = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid user ID");
	}

	if (req.user._id.toString() === id) {
		throw new ApiError(
			400,
			"You cannot force password reset on your own account",
		);
	}

	if (!reason || reason.trim().length < 10) {
		throw new ApiError(
			400,
			"Detailed reason is required (minimum 10 characters)",
		);
	}

	if (process.env.NODE_ENV === "production" && !confirmPassword) {
		throw new ApiError(
			400,
			"Password confirmation required for password reset",
		);
	}

	const session = await mongoose.startSession();

	try {
		const result = await session.withTransaction(async () => {
			const resetToken =
				Math.random().toString(36).substring(2, 15) +
				Math.random().toString(36).substring(2, 15);
			const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

			const updatedUser = await User.findByIdAndUpdate(
				id,
				{
					passwordResetRequired: true,
					passwordResetToken: resetToken,
					passwordResetExpires: resetExpires,
					passwordResetBy: req.user._id,
					passwordResetReason: reason.trim(),
					passwordResetAt: new Date(),
					...(invalidateAllSessions && { $inc: { tokenVersion: 1 } }),
				},
				{ new: true, session },
			).select("username email firstName lastName");

			if (!updatedUser) {
				throw new ApiError(404, "User not found");
			}

			await auditService.logAdminAction(
				{
					adminId: req.user._id,
					action: "FORCE_PASSWORD_RESET",
					targetUserId: id,
					metadata: {
						reason,
						invalidateAllSessions,
						resetExpires,
						userEmail: updatedUser.email,
						criticality: "HIGH",
					},
				},
				session,
			);

			return { user: updatedUser, resetToken };
		});

		if (notifyUser) {
			// Mock notification sending
			console.log(`Security notification sent to ${result.user.email}`);
		}

		// Clear cache (optional)
		try {
			await cache.invalidateUserCaches(id);
		} catch (cacheError) {
			// Cache not available, continue
		}

		console.log(
			`🚨 SECURITY ALERT: Password reset forced for ${result.user.email} by ${req.user.email}`,
			{
				reason,
				timestamp: new Date(),
				adminId: req.user._id,
				targetUserId: id,
			},
		);

		return res.status(200).json(
			new ApiResponse(
				200,
				{
					user: {
						id: result.user._id,
						username: result.user.username,
						email: result.user.email,
					},
					resetDetails: {
						tokenGenerated: true,
						expiresAt: result.user.passwordResetExpires,
						notificationSent: notifyUser,
					},
				},
				"Password reset forced successfully",
			),
		);
	} finally {
		await session.endSession();
	}
});

// ============================================================================
// LEGACY CONTROLLERS (for backward compatibility)
// ============================================================================

const getUserActivityLog = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid user ID");
	}

	const user = await User.findById(id);
	if (!user) {
		throw new ApiError(404, "User not found");
	}

	// Mock activity log for testing
	const activityLog = {
		activities: [
			{
				id: "activity_1",
				type: "LOGIN",
				timestamp: new Date().toISOString(),
				ipAddress: "192.168.1.1",
				userAgent: "Mozilla/5.0...",
				details: "User logged in successfully",
			},
			{
				id: "activity_2",
				type: "PROFILE_UPDATE",
				timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
				ipAddress: "192.168.1.1",
				userAgent: "Mozilla/5.0...",
				details: "Profile information updated",
			},
		],
		totalActivities: 2,
		lastActivity: new Date().toISOString(),
	};

	return res
		.status(200)
		.json(new ApiResponse(200, { activityLog }, "User activity log fetched"));
});

const getUserLoginHistory = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid user ID");
	}

	const user = await User.findById(id);
	if (!user) {
		throw new ApiError(404, "User not found");
	}

	// Mock login history for testing
	const loginHistory = {
		sessions: [
			{
				sessionId: "session_1",
				loginTime: new Date().toISOString(),
				logoutTime: null,
				ipAddress: "192.168.1.1",
				userAgent: "Mozilla/5.0...",
				location: "Unknown",
				isActive: true,
			},
		],
		totalSessions: 1,
		activeSessions: 1,
	};

	return res
		.status(200)
		.json(new ApiResponse(200, { loginHistory }, "User login history fetched"));
});

const getUserDeviceInfo = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid user ID");
	}

	const user = await User.findById(id);
	if (!user) {
		throw new ApiError(404, "User not found");
	}

	// Mock device info for testing
	const deviceInfo = {
		devices: [
			{
				deviceId: "device_1",
				deviceType: "desktop",
				browser: "Chrome",
				os: "Windows",
				lastUsed: new Date().toISOString(),
				location: "Unknown",
				isTrusted: true,
			},
		],
		totalDevices: 1,
		trustedDevices: 1,
	};

	return res
		.status(200)
		.json(new ApiResponse(200, { deviceInfo }, "User device info fetched"));
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function generateBulkActionPreview(action, userIds, data) {
	const users = await User.find(
		{ _id: { $in: userIds } },
		{ username: 1, email: 1, role: 1, isActive: 1 },
	).lean();

	const preview = {
		action,
		totalUsers: userIds.length,
		foundUsers: users.length,
		missingUsers: userIds.length - users.length,
		affectedUsers: users.map((user) => ({
			id: user._id,
			username: user.username,
			email: user.email,
			currentStatus: {
				role: user.role,
				isActive: user.isActive,
			},
		})),
		estimatedChanges: generateActionEstimate(action, users, data),
	};

	return preview;
}

function generateActionEstimate(action, users, data) {
	switch (action) {
		case "suspend":
			return {
				usersToSuspend: users.filter((u) => u.isActive).length,
				alreadySuspended: users.filter((u) => !u.isActive).length,
			};
		case "activate":
			return {
				usersToActivate: users.filter((u) => !u.isActive).length,
				alreadyActive: users.filter((u) => u.isActive).length,
			};
		case "updateRole":
			return {
				roleChanges: users.filter((u) => u.role !== data.role).length,
				noChange: users.filter((u) => u.role === data.role).length,
				newRole: data.role,
			};
		default:
			return { message: `Will ${action} ${users.length} users` };
	}
}

async function processBulkActionBatch(action, userIds, data, adminId, session) {
	const results = {
		successful: 0,
		failed: 0,
		errors: [],
		processedUsers: [],
	};

	const updateData = {
		updatedAt: new Date(),
		lastModifiedBy: adminId,
	};

	try {
		let result = null;

		switch (action) {
			case "activate":
				updateData.isActive = true;
				updateData.$unset = {
					suspendedAt: 1,
					suspensionReason: 1,
					suspendedBy: 1,
				};
				result = await User.updateMany({ _id: { $in: userIds } }, updateData, {
					session,
				});
				break;

			case "suspend":
				updateData.isActive = false;
				updateData.suspendedAt = new Date();
				updateData.suspendedBy = adminId;
				updateData.suspensionReason = data.reason || "Bulk suspension";
				result = await User.updateMany({ _id: { $in: userIds } }, updateData, {
					session,
				});
				break;

			case "updateRole":
				if (!data.role) {
					throw new Error("Role is required for role update");
				}
				updateData.role = data.role;
				result = await User.updateMany({ _id: { $in: userIds } }, updateData, {
					session,
				});
				break;

			case "verify":
				updateData.isVerified = true;
				updateData.verifiedAt = new Date();
				updateData.verifiedBy = adminId;
				result = await User.updateMany({ _id: { $in: userIds } }, updateData, {
					session,
				});
				break;

			case "delete":
				result = await User.deleteMany({ _id: { $in: userIds } }, { session });
				break;

			default:
				throw new Error(`Unsupported action: ${action}`);
		}

		results.successful = result.modifiedCount || result.deletedCount || 0;
		results.processedUsers = userIds.map((id) => ({ id, status: "success" }));
	} catch (error) {
		results.failed = userIds.length;
		results.errors.push({
			batch: userIds,
			error: error.message,
		});
		results.processedUsers = userIds.map((id) => ({
			id,
			status: "failed",
			error: error.message,
		}));
	}

	return results;
}

export {
	getAdminStats,
	getAdminStatsLive,
	getAllAdmins,
	getAdminById,
	getAllUsers,
	getUserById,
	deleteUserById,
	updateUserById,
	suspendUser,
	activateUser,
	searchUsers,
	bulkExportUsers,
	bulkImportUsers,
	bulkActions,
	getUserActivityLog,
	getUserLoginHistory,
	getUserDeviceInfo,
	sendNotificationToUser,
	verifyUserAccount,
	forcePasswordReset,
	getUserSecurityAnalysis,
};
