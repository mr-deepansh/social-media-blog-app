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
  getAuditLogs,
  getSystemHealth,
} from "../controllers/super-admin.controller.js";

// Import monitoring controllers for super admin
import { getSystemConfig, updateSystemConfig, emergencyLockdown } from "../controllers/monitoring.controller.js";

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
router.route("/system-config").get(getSystemConfig).put(updateSystemConfig);

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
router.route("/emergency-lockdown").post(emergencyLockdown);

export default router;
