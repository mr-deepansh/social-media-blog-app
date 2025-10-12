// src/modules/blogs/routes/engagement/engagement.routes.js
import express from "express";
import {
  toggleLike,
  trackView,
  repost,
  toggleBookmark,
  trackShare,
} from "../../controllers/engagement/engagement.controller.js";
import { verifyJWT } from "../../../../shared/middleware/auth.middleware.js";
import { optionalAuth } from "../../../../shared/middleware/optionalAuth.middleware.js";

const router = express.Router();

// Engagement routes
router.post("/:postId/like", verifyJWT, toggleLike);
router.post("/:postId/view", optionalAuth, trackView);
router.post("/:postId/repost", verifyJWT, repost);
router.post("/:postId/bookmark", verifyJWT, toggleBookmark);
router.post("/:postId/share", verifyJWT, trackShare);

export default router;
