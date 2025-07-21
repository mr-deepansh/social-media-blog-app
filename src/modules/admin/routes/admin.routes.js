// src/modules/admin/routes/admin.routes.js
import express from "express";
import { verifyJWT } from "../../../shared/middleware/auth.middleware.js";
import { isAdmin } from "../../../shared/middleware/isAdmin.middleware.js";
import {
	validateQuery,
	validateRequest,
} from "../../../shared/middleware/validate.middleware.js";
import { zodValidation } from "../../../shared/validators/zod.validator.js";
import {
	getAllUsers,
	getUserById,
	deleteUserById,
	updateUserById,
	suspendUser,
	activateUser,
	getAdminStats,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Add debug middleware to check if routes are being hit
/* router.use((req, res, next) => {
	console.log(`🔍 Admin Route Hit: ${req.method} ${req.originalUrl}`);
	console.log(`🔍 Headers:`, req.headers);
	next();
}); */

// Test route without any auth middleware
router.get("/test-no-auth", (req, res) => {
	// console.log("🧪 Test route hit (no auth)");
	res.json({
		success: true,
		message: "Admin routes are working! (No auth required)",
		path: req.originalUrl,
		method: req.method,
		timestamp: new Date().toISOString(),
	});
});

// Test route with auth but no admin check
router.get("/test-auth-only", verifyJWT, (req, res) => {
	// console.log("🧪 Test route hit (auth only)");
	res.json({
		success: true,
		message: "Auth working! User authenticated",
		user: {
			id: req.user._id,
			email: req.user.email,
			role: req.user.role,
		},
		path: req.originalUrl,
		method: req.method,
		timestamp: new Date().toISOString(),
	});
});

// Apply auth middleware to all OTHER routes (not test route)
router.use((req, res, next) => {
	// Skip auth for test route
	if (req.path === "/test") {
		return next();
	}
	// Apply auth middleware for other routes
	verifyJWT(req, res, (err) => {
		if (err) {
			console.log("❌ JWT verification failed:", err.message);
			return next(err);
		}
		// console.log("✅ JWT verified successfully");

		isAdmin(req, res, (err) => {
			if (err) {
				// console.log("❌ Admin check failed:", err.message);
				return next(err);
			}
			// console.log("✅ Admin check passed");
			next();
		});
	});
});

// Dashboard stats
router.get("/stats", (req, res) => {
	// console.log("📊 Stats route hit");
	getAdminStats(req, res);
});

// User management
router.get("/users", validateQuery(zodValidation.getUsers), getAllUsers);
router.get("/users/:id", getUserById);
router.put(
	"/users/:id",
	validateRequest(zodValidation.updateUser),
	updateUserById,
);
router.delete("/users/:id", deleteUserById);

// User status management
router.patch("/users/:id/suspend", suspendUser);
router.patch("/users/:id/activate", activateUser);

export default router;
