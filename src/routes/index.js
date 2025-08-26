// src/routes/index.js
import express from "express";

// Import route modules
import adminRoutes from "../modules/admin/routes/admin.routes.js";
import authRoutes from "../modules/auth/routes/auth.routes.js";
import forgotPasswordRoutes from "../modules/auth/routes/forgotPassword.routes.js";
import resetPasswordRoutes from "../modules/auth/routes/resetPassword.routes.js";
import userRoutes from "../modules/users/routes/user.routes.js";
import blogRoutes from "../modules/blogs/routes/blog.routes.js";

const router = express.Router();

/**
 * API Routes Configuration
 * All routes are prefixed with /api/{version}
 */

// Authentication routes
router.use("/auth", authRoutes);
router.use("/auth", forgotPasswordRoutes);
router.use("/auth", resetPasswordRoutes);

// User management routes
router.use("/users", userRoutes);

// Admin routes
router.use("/admin", adminRoutes);

// Blog routes
router.use("/blogs", blogRoutes);

export default router;
