// src/modules/blogs/routes/post/post.routes.js
import express from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getMyPosts,
  getUserPosts,
} from "../../controllers/post/post.controller.js";
import { verifyJWT } from "../../../../shared/middleware/auth.middleware.js";
import { optionalAuth } from "../../../../shared/middleware/optionalAuth.middleware.js";
import { uploadMedia } from "../../../../shared/middleware/upload.middleware.js";

const router = express.Router();

// Protected routes (specific routes first)
router.post("/", verifyJWT, uploadMedia.array("files", 5), createPost);
router.get("/my-posts", verifyJWT, getMyPosts);

// Public routes
router.get("/", optionalAuth, getPosts);

// Username-based routes
router.get("/user/:username", optionalAuth, getUserPosts);

// Dynamic routes (must be last)
router.get("/:id", optionalAuth, getPostById);
router.patch("/:id", verifyJWT, updatePost);
router.delete("/:id", verifyJWT, deletePost);

export default router;
