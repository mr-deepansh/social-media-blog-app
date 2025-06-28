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

router.use(verifyJWT);

router.route("/").post(createBlog).get(getAllBlogs);

router.route("/:id").get(getBlogById).patch(updateBlog).delete(deleteBlog);

export default router;
