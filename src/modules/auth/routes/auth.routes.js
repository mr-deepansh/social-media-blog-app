// src/modules/auth/routes/auth.routes.js
import { Router } from "express";
import {
	verifyEmail,
	resendEmailVerification,
	getSecurityOverview,
} from "../controllers/auth.controller.js";
import {
	getUserActivity,
	getActivityStats,
	getLoginLocations,
} from "../controllers/activity.controller.js";
import { verifyJWT } from "../../../shared/middleware/auth.middleware.js";

const router = Router();

// Public routes
router.route("/verify-email/:token").post(verifyEmail);

// Protected routes
router.use(verifyJWT); // Apply JWT verification to all routes below

router.route("/resend-verification").post(resendEmailVerification);
router.route("/activity").get(getUserActivity);
router.route("/activity/stats").get(getActivityStats);
router.route("/activity/locations").get(getLoginLocations);
router.route("/security-overview").get(getSecurityOverview);

export default router;
