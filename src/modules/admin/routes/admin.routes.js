// src/modules/admin/routes/admin.routes.js
import { Router } from "express";
import { upload } from "../../../shared/middleware/multer.middleware.js";
import { verifyJWT } from "../../../shared/middleware/auth.middleware.js";
import { isAdmin } from "../../../shared/middleware/isAdmin.middleware.js";
import {
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
} from "../controllers/admin.controller.js";

const router = Router();
router.use(verifyJWT);
router.use(isAdmin);

// 📊 Dashboard & Stats
router.route("/stats").get(getAdminStats);

// 🔍 Advanced Search & Export (must come before :id routes)
router.route("/users/search").get(searchUsers);
router.route("/users/export").get(bulkExportUsers);

// 👥 User Management
router.route("/users").get(getAllUsers);

router
	.route("/users/:id")
	.get(getUserById)
	.put(updateUserById)
	.delete(deleteUserById);

// 🔄 User Status Management
router.route("/users/:id/suspend").patch(suspendUser);
router.route("/users/:id/activate").patch(activateUser);

// 📥 Bulk Import (with file upload)
router.route("/users/import").post(
	upload.single("csvFile"), // Multer middleware for file upload
	bulkImportUsers,
);

// ⚡ Bulk Actions
router.route("/users/bulk-actions").post(bulkActions);

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
