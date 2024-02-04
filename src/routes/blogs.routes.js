import { Router } from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../controllers/blogs.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/blogs").get(getAllBlogs);
router.route("/blogs/:id").get(getBlogById);
router.route("/blogs").post(verifyJWT, createBlog);
router.route("/blogs/:id").put(verifyJWT, updateBlog);
router.route("/blogs/:id").delete(verifyJWT, deleteBlog);

export default router;
