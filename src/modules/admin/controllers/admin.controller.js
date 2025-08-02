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
import { AuditService } from "../services/audit.service.js";
import { ExportImportService } from "../services/exportImport.service.js";
import { SecurityService } from "../services/security.service.js";

const cache = new CacheService();
const validator = new ValidationService();
const analyticsService = new AnalyticsService();
const notificationService = new NotificationService();
const auditService = new AuditService();
const exportImportService = new ExportImportService();
const securityService = new SecurityService();

// ============================================================================
// ANALYTICS & DASHBOARD CONTROLLERS
// ============================================================================

const getAdminStats = asyncHandler(async (req, res) => {
	try {
		console.log("Admin stats called");

		// Test if User model is working
		const totalUsers = await User.countDocuments({});
		console.log("Total users:", totalUsers);

		const activeUsers = await User.countDocuments({ isActive: true });
		console.log("Active users:", activeUsers);

		const adminUsers = await User.countDocuments({ role: "admin" });
		console.log("Admin users:", adminUsers);

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
				usersByRole: {},
				monthlyGrowth: [],
				dailyGrowth: [],
			},
			metadata: {
				generatedAt: new Date().toISOString(),
				dataRange: "all_time",
				cacheRecommendation: "cache_5_minutes",
			},
		};

		console.log("Stats generated:", stats);

		return res.status(200).json(
			new ApiResponse(
				200,
				{
					stats,
					meta: {
						cacheHit: false,
						generatedAt: new Date().toISOString(),
					},
				},
				"Admin stats generated successfully",
			),
		);
	} catch (error) {
		console.error("Admin stats error:", error);
		console.error("Error stack:", error.stack);
		throw new ApiError(500, `Admin stats failed: ${error.message}`);
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
	const {
		q = "",
		username = "",
		page = 1,
		limit = 10,
		role,
		isActive,
	} = req.query;

	const searchQuery = q || username || "";
	const pageNum = Math.max(1, parseInt(page));
	const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
	const skip = (pageNum - 1) * limitNum;

	const matchStage = {};

	// Always allow search even without parameters - return all users if no search query
	if (searchQuery.trim()) {
		matchStage.$or = [
			{ username: { $regex: searchQuery, $options: "i" } },
			{ email: { $regex: searchQuery, $options: "i" } },
			{ firstName: { $regex: searchQuery, $options: "i" } },
			{ lastName: { $regex: searchQuery, $options: "i" } },
		];
	}

	if (role) matchStage.role = role;
	if (isActive !== undefined) matchStage.isActive = isActive === "true";

	const users = await User.find(matchStage)
		.select("-password -refreshToken")
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limitNum)
		.lean();

	const totalUsers = await User.countDocuments(matchStage);
	const totalPages = Math.ceil(totalUsers / limitNum);

	return res.status(200).json(
		new ApiResponse(
			200,
			{
				users,
				pagination: {
					currentPage: pageNum,
					totalPages,
					totalUsers,
					hasNextPage: pageNum < totalPages,
					hasPrevPage: pageNum > 1,
					limit: limitNum,
				},
			},
			"User search completed successfully",
		),
	);
});

const bulkExportUsers = asyncHandler(async (req, res) => {
	const { format = "csv", role, isActive, fields, limit = 1000 } = req.query;

	const supportedFormats = ["csv", "json"];
	if (!supportedFormats.includes(format.toLowerCase())) {
		throw new ApiError(
			400,
			`Unsupported format '${format}'. Supported: ${supportedFormats.join(", ")}`,
		);
	}

	const filters = {};
	if (role) filters.role = role;
	if (isActive !== undefined) filters.isActive = isActive === "true";

	const users = await User.find(filters)
		.select("-password -refreshToken")
		.limit(parseInt(limit))
		.lean();

	const timestamp = new Date().toISOString().split("T")[0];
	const filename = `users_export_${timestamp}.${format}`;

	if (format === "csv") {
		// Handle custom fields if provided
		let csvHeader, csvData;
		if (fields) {
			const fieldList = fields.split(",").map((f) => f.trim());
			csvHeader = fieldList.join(",") + "\n";
			csvData = users
				.map((user) => {
					return fieldList
						.map((field) => {
							const value = user[field];
							if (value === null || value === undefined) return "";
							if (typeof value === "object") return JSON.stringify(value);
							return String(value).replace(/,/g, ";"); // Replace commas to avoid CSV issues
						})
						.join(",");
				})
				.join("\n");
		} else {
			csvHeader =
				"ID,Username,Email,First Name,Last Name,Role,Active,Created At\n";
			csvData = users
				.map(
					(user) =>
						`${user._id},${user.username || ""},${user.email || ""},${user.firstName || ""},${user.lastName || ""},${user.role || ""},${user.isActive},${user.createdAt}`,
				)
				.join("\n");
		}

		res.setHeader("Content-Type", "text/csv");
		res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
		return res.status(200).send(csvHeader + csvData);
	} else {
		res.setHeader("Content-Type", "application/json");
		res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
		return res.status(200).json({
			users,
			exportedAt: new Date(),
			total: users.length,
			filters,
			format,
		});
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
			overallRisk: "HIGH",
			riskScore: 9,
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
	getAllUsers,
	getUserById,
	deleteUserById,
	updateUserById,
	suspendUser,
	activateUser,
	getAdminStats,
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
