// src/modules/admin/routes/admin.routes.js
import { Router } from "express";
import { upload } from "../../../shared/middleware/multer.middleware.js";
import { verifyJWT } from "../../../shared/middleware/auth.middleware.js";
import { isAdmin, isSuperAdmin } from "../../../shared/middleware/isAdmin.middleware.js";
import { trackAdminSession, updateSessionActivity } from "../../../shared/middleware/sessionTracker.middleware.js";
import superAdminRoutes from "./super-admin.routes.js";
import {
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
  bulkActions,
  getUserActivityLog,
  sendNotificationToUser,
  verifyUserAccount,
  forcePasswordReset,
  getUserSecurityAnalysis,
} from "../controllers/admin.controller.js";

// Import super admin controller
import { createSuperAdmin } from "../controllers/super-admin.controller.js";

// Import session controllers
import { getAdminSessionAnalytics, getAdminSessionDetails } from "../controllers/session.controller.js";

// Import dashboard controller
import { getAdminDashboard } from "../controllers/dashboard.controller.js";

// Import analytics controllers
import {
  getAnalyticsOverview,
  getUserGrowthAnalytics,
  getUserRetentionAnalytics,
  getUserDemographics,
  getEngagementMetrics,
} from "../controllers/analytics.controller.js";

// Import security controllers
import {
  getSuspiciousAccounts,
  getLoginAttempts,
  blockIpAddress,
  getBlockedIps,
  getThreatDetection,
  unblockIpAddress,
} from "../controllers/security.controller.js";

// Import advanced controllers
import {
  getAllPosts,
  togglePostVisibility,
  getAppSettings,
  updateAppSettings,
  getNotificationTemplates,
  sendBulkNotification,
  getAutomationRules,
  createAutomationRule,
  getExperiments,
  createExperiment,
  getRevenueAnalytics,
  getUserLifetimeValue,
} from "../controllers/advanced.controller.js";

// Import monitoring controllers
import { getServerHealth, getDatabaseStats } from "../controllers/monitoring.controller.js";

const router = Router();

// ============================================================================
// 🔐 SUPER ADMIN CREATION (PUBLIC - ONE TIME SETUP)
// ============================================================================
router.route("/create-super-admin").post(createSuperAdmin);

router.use(verifyJWT);
router.use(trackAdminSession);
router.use(updateSessionActivity);

// Super Admin routes (must come before isAdmin middleware)
router.use("/super-admin", superAdminRoutes);

// Admin routes (admin and super_admin can access)

router.use(isAdmin);

// ============================================================================
// 📊 DASHBOARD & ANALYTICS ROUTES
// ============================================================================

// Dashboard
router.route("/dashboard").get(getAdminDashboard);

// Basic Stats
router.route("/stats").get(getAdminStats);
router.route("/stats/live").get(getAdminStatsLive);

// Session Analytics
router.route("/sessions/analytics").get(getAdminSessionAnalytics);
router.route("/sessions/:adminId").get(getAdminSessionDetails);

// Advanced Analytics
router.route("/analytics/overview").get(getAnalyticsOverview);
router.route("/analytics/users/growth").get(getUserGrowthAnalytics);
router.route("/analytics/users/retention").get(getUserRetentionAnalytics);
router.route("/analytics/users/demographics").get(getUserDemographics);
router.route("/analytics/engagement/metrics").get(getEngagementMetrics);

// ============================================================================
// 🛡️ SECURITY & MODERATION ROUTES
// ============================================================================

// Security Monitoring
router.route("/security/suspicious-accounts").get(getSuspiciousAccounts);
router.route("/security/login-attempts").get(getLoginAttempts);
router.route("/security/blocked-ips").get(getBlockedIps).post(blockIpAddress);
router.route("/security/blocked-ips/:ipId").delete(unblockIpAddress);
router.route("/security/threat-detection").get(getThreatDetection);

// ============================================================================
// 🚨 CONTENT MANAGEMENT ROUTES
// ============================================================================

// Content Management
router.route("/content/posts").get(getAllPosts);
router.route("/content/posts/:postId/toggle-visibility").patch(togglePostVisibility);

// ============================================================================
// 🎛️ SYSTEM CONFIGURATION ROUTES
// ============================================================================

// App Settings
router.route("/config/app-settings").get(getAppSettings).put(updateAppSettings);

// ============================================================================
// 📢 COMMUNICATION & NOTIFICATIONS ROUTES
// ============================================================================

// Notification Management
router.route("/notifications/templates").get(getNotificationTemplates);
router.route("/notifications/send-bulk").post(sendBulkNotification);

// ============================================================================
// 📈 PERFORMANCE MONITORING ROUTES
// ============================================================================

// System Health
router.route("/monitoring/server-health").get(getServerHealth);
router.route("/monitoring/database-stats").get(getDatabaseStats);

// ============================================================================
// 🔄 AUTOMATION & WORKFLOWS ROUTES
// ============================================================================

// Automation Rules
router.route("/automation/rules").get(getAutomationRules).post(createAutomationRule);

// ============================================================================
// 🎯 A/B TESTING & EXPERIMENTS ROUTES
// ============================================================================

// Experiments
router.route("/experiments").get(getExperiments).post(createExperiment);

// ============================================================================
// 🌟 ENTERPRISE FEATURES ROUTES
// ============================================================================

// Business Intelligence
router.route("/bi/revenue-analytics").get(getRevenueAnalytics);
router.route("/bi/user-lifetime-value").get(getUserLifetimeValue);

// ============================================================================
// 👤 ADMIN MANAGEMENT ROUTES
// ============================================================================

// Admin Management
router.route("/admins").get(getAllAdmins);
router.route("/admins/:adminId").get(getAdminById);

// ============================================================================
// 👥 USER MANAGEMENT ROUTES
// ============================================================================

// Advanced Search & Export (must come before :id routes)
router.route("/users/search").get(searchUsers);
router.route("/users/export").get(bulkExportUsers);
// router.route("/users/import").post(upload.single("csvFile"), bulkImportUsers); // TODO: Implement
router.route("/users/bulk-actions").post(bulkActions);

// Basic User Management
router.route("/users").get(getAllUsers);
router.route("/users/:id").get(getUserById).put(updateUserById).delete(deleteUserById);

// User Status Management
router.route("/users/:id/suspend").patch(suspendUser);
router.route("/users/:id/activate").patch(activateUser);
router.route("/users/:id/verify").patch(verifyUserAccount);

// User Analytics & Monitoring
router.route("/users/:id/activity-log").get(getUserActivityLog);
// router.route("/users/:id/login-history").get(getUserLoginHistory); // TODO: Implement
// router.route("/users/:id/devices").get(getUserDeviceInfo); // TODO: Implement
router.route("/users/:id/security-analysis").get(getUserSecurityAnalysis);

// Communication & Security
router.route("/users/:id/notify").post(sendNotificationToUser);
router.route("/users/:id/force-password-reset").post(forcePasswordReset);

// ============================================================================
// 🔄 SOCIAL FEATURES ROUTES (Future Implementation)
// ============================================================================

// Posts Management (when Blog model is available)
// router.route("/posts").get(getAllPosts);
// router.route("/posts/:postId").get(getPostById).put(updatePost).delete(deletePost);
// router.route("/posts/:postId/hide").patch(hidePost);
// router.route("/posts/:postId/feature").patch(featurePost);

// Comments Management
// router.route("/comments").get(getAllComments);
// router.route("/comments/:commentId/moderate").patch(moderateComment);

// Trending & Discovery
// router.route("/trending/posts").get(getTrendingPosts);
// router.route("/trending/hashtags").get(getTrendingHashtags);

// ============================================================================
// 📊 REPORTS & EXPORTS (Future Implementation)
// ============================================================================

// Scheduled Reports
// router.route("/reports/scheduled").get(getScheduledReports).post(createScheduledReport);
// router.route("/reports/generate").post(generateReport);
// router.route("/reports/export").get(exportReport);

export default router;
