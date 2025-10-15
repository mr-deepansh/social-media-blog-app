// src/modules/auth/routes/auth.routes.js
import { Router } from "express";
import { verifyEmail, resendEmailVerification, getSecurityOverview } from "../controllers/auth.controller.js";
import {
  getUserActivity,
  getActivityStats,
  getLoginLocations,
  getLocationAnalytics,
} from "../controllers/activity.controller.js";
import { verifyJWT } from "../../../shared/middleware/auth.middleware.js";
import { authRateLimit, securityAudit, sanitizeInput } from "../../../shared/middleware/security.middleware.js";
import { performanceMonitor } from "../../../shared/middleware/performance.middleware.js";
import { verifyEmailSchema, validateParams } from "../validators/auth.validator.js";
import securityRoutes from "./security.routes.js";

const router = Router();

// Apply global middleware
router.use(performanceMonitor);
router.use(sanitizeInput);
router.use(securityAudit);

// Public routes with rate limiting
router.route("/verify-email/:token").post(authRateLimit, validateParams(verifyEmailSchema), verifyEmail);

// Protected routes
router.use(verifyJWT); // Apply JWT verification to all routes below

// User verification and activity routes
router.route("/resend-verification").post(authRateLimit, resendEmailVerification);

router.route("/activity").get(getUserActivity);

router.route("/activity/stats").get(getActivityStats);

router.route("/activity/locations").get(getLoginLocations);

router.route("/activity/location-analytics").get(getLocationAnalytics);

router.route("/security-overview").get(getSecurityOverview);

// Enterprise security routes
router.use("/security", securityRoutes);

export default router;
