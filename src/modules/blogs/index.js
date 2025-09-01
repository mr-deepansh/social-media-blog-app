// src/modules/blogs/index.js
import express from "express";
import postRoutes from "./routes/post/post.routes.js";
import commentRoutes from "./routes/comment/comment.routes.js";
import engagementRoutes from "./routes/engagement/engagement.routes.js";
import mediaRoutes from "./routes/media/media.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import path from "path";

const router = express.Router();

// Microservice routes
router.use("/posts", postRoutes);
router.use("/comments", commentRoutes);
router.use("/engagement", engagementRoutes);
router.use("/media", mediaRoutes);
router.use("/analytics", analyticsRoutes);

// Serve uploaded media files
router.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

export default router;
