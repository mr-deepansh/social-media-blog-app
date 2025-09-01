// src/modules/blogs/routes/blog.routes.js
import express from "express";

// Import sub-routes
import postRoutes from "./post/post.routes.js";
import commentRoutes from "./comment/comment.routes.js";
import engagementRoutes from "./engagement/engagement.routes.js";
import mediaRoutes from "./media/media.routes.js";
import analyticsRoutes from "./analytics.routes.js";

const router = express.Router();

// Mount sub-routes
router.use("/posts", postRoutes);
router.use("/comments", commentRoutes);
router.use("/engagement", engagementRoutes);
router.use("/media", mediaRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
