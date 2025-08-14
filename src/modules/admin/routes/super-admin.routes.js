// src/modules/admin/routes/super-admin.routes.js
import { Router } from "express";
import { isSuperAdmin } from "../../../shared/middleware/superAdmin.middleware.js";
import {
	createSuperAdmin,
	createAdmin,
	deleteAdmin,
	getAllAdmins,
	updateAdmin,
	changeUserRole,
	getSystemConfig,
	getAuditLogs,
	getSystemHealth,
	emergencyLockdown,
} from "../controllers/super-admin.controller.js";

const router = Router();

// ============================================================================
// 👑 SUPER ADMIN CREATION (One-time setup)
// ============================================================================

// Create super admin (public route for initial setup)
router.post("/create", createSuperAdmin);

// Apply super admin middleware to protected routes
router.use(isSuperAdmin);

// ============================================================================
// 👤 ADMIN MANAGEMENT (Super Admin Only)
// ============================================================================

// Create admin user
router.post("/create-admin", createAdmin);

// Get all admins
router.get("/admins", getAllAdmins);

// Update admin
router.put("/update-admin/:adminId", updateAdmin);

// Change user role (user <-> admin)
router.put("/change-role/:userId", changeUserRole);

// Get system configuration
router.get("/system-config", getSystemConfig);

// Delete admin user
router.delete("/delete-admin/:adminId", deleteAdmin);

// ============================================================================
// 📋 AUDIT & COMPLIANCE ROUTES (Super Admin Only)
// ============================================================================

// Get audit logs
router.get("/audit-logs", getAuditLogs);

// ============================================================================
// 🔧 SYSTEM MONITORING ROUTES (Super Admin Only)
// ============================================================================

// Get detailed system health
router.get("/system-health", getSystemHealth);

// ============================================================================
// 🚨 EMERGENCY OPERATIONS ROUTES (Super Admin Only)
// ============================================================================

// Emergency system lockdown
router.post("/emergency-lockdown", emergencyLockdown);

export default router;
