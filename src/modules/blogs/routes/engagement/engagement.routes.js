// src/modules/blogs/routes/engagement/engagement.routes.js
import express from "express";
import {
  toggleLike,
  trackView,
} from "../../controllers/engagement/engagement.controller.js";
import { verifyJWT } from "../../../../shared/middleware/auth.middleware.js";
import { optionalAuth } from "../../../../shared/middleware/optionalAuth.middleware.js";

const router = express.Router();

// Engagement routes
router.post("/:postId/like", verifyJWT, toggleLike);
router.post("/:postId/view", optionalAuth, trackView);

export default router;
