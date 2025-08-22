import express from "express";
import {
	createBlog,
	getAllBlogs,
	getBlogById,
	updateBlog,
	deleteBlog,
} from "../controllers/blog.controller.js";
import { verifyJWT } from "../../../shared/middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);

// Protected routes
router.post("/", verifyJWT, createBlog);
router.patch("/:id", verifyJWT, updateBlog);
router.delete("/:id", verifyJWT, deleteBlog);

export default router;
