// src/modules/blogs/routes/analytics.routes.js
import express from "express";
import {
  getPostAnalytics,
  getUserAnalytics,
  getPlatformAnalytics,
  getRealtimeEngagement,
  getScheduledPosts,
  cancelScheduledPost,
  reschedulePost,
  getSchedulingAnalytics,
} from "../controllers/analytics.controller.js";
import { verifyJWT } from "../../../shared/middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// Analytics routes
router.get("/user", getUserAnalytics);
router.get("/platform", getPlatformAnalytics);
router.get("/post/:id", getPostAnalytics);
router.get("/post/:id/realtime", getRealtimeEngagement);

// Scheduling routes
router.get("/scheduled", getScheduledPosts);
router.get("/scheduling", getSchedulingAnalytics);
router.delete("/scheduled/:id", cancelScheduledPost);
router.patch("/scheduled/:id", reschedulePost);

export default router;
