// src/modules/admin/routes/admin.routes.js
import { Router } from "express";
import { upload } from "../../../shared/middleware/multer.middleware.js";
import { verifyJWT } from "../../../shared/middleware/auth.middleware.js";
import { isAdmin } from "../../../shared/middleware/isAdmin.middleware.js";
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
	bulkImportUsers,
	bulkActions,
	getUserActivityLog,
	getUserLoginHistory,
	getUserDeviceInfo,
	sendNotificationToUser,
	verifyUserAccount,
	forcePasswordReset,
	getUserSecurityAnalysis,
} from "../controllers/admin.controller.js";

const router = Router();
router.use(verifyJWT);
router.use(isAdmin);

// 📊 Dashboard & Stats
router.route("/stats").get(getAdminStats); //* ✅ [TESTED] ⚠️ Needs Optimization (~1078ms)
router.route("/stats/live").get(getAdminStatsLive); // * ✅ [TESTED]

// 👤 Admin Management
router.route("/admins").get(getAllAdmins); // * ✅ [TESTED]
router.route("/admins/:id").get(getAdminById); // !TODO: Not tested

// 🔍 Advanced Search & Export (must come before :id routes)
router.route("/users/search").get(searchUsers); //* ✅ [TESTED]
router.route("/users/export").get(bulkExportUsers); // * ✅ [TESTED]

// 👥 User Management
router.route("/users").get(getAllUsers); // * ✅ [TESTED]
router
	.route("/users/:id")
	.get(getUserById) // * ✅ [TESTED]
	.put(updateUserById) // * ✅ [TESTED]
	.delete(deleteUserById);

// 🔄 User Status Management
router.route("/users/:id/suspend").patch(suspendUser); // * ✅ [TESTED]
router.route("/users/:id/activate").patch(activateUser); // * ✅ [TESTED]

// 📥 Bulk Import (with file upload)
router.route("/users/import").post(upload.single("csvFile"), bulkImportUsers); // * ✅ [TESTED]

// ⚡ Bulk Actions
router.route("/users/bulk-actions").post(bulkActions); // * ✅ [TESTED]

// 📊 User Analytics & Monitoring
router.route("/users/:id/activity-log").get(getUserActivityLog);
router.route("/users/:id/login-history").get(getUserLoginHistory);
router.route("/users/:id/devices").get(getUserDeviceInfo);

// 📧 Communication & Notifications
router.route("/users/:id/notify").post(sendNotificationToUser);

// 🔒 Security & Verification
router.route("/users/:id/verify").patch(verifyUserAccount);
router.route("/users/:id/force-password-reset").post(forcePasswordReset);

// 🔍 Security Analysis
router.route("/users/:id/security-analysis").get(getUserSecurityAnalysis);

export default router;
