// src/modules/blogs/routes/post/post.routes.js
import express from "express";
import {
	createPost,
	getPosts,
	getPostById,
	updatePost,
	deletePost,
} from "../../controllers/post/post.controller.js";
import { verifyJWT } from "../../../../shared/middleware/auth.middleware.js";
import { optionalAuth } from "../../../../shared/middleware/optionalAuth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", optionalAuth, getPosts);
router.get("/:id", optionalAuth, getPostById);

// Protected routes
router.post("/", verifyJWT, createPost);
router.patch("/:id", verifyJWT, updatePost);
router.delete("/:id", verifyJWT, deletePost);

export default router;
