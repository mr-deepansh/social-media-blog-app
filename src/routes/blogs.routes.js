import { Router } from 'express';
import {
	createBlog,
	getAllBlogs,
	getBlogById,
	updateBlog,
	deleteBlog,
} from '../controllers/blogs.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.route('/all-blogs').get(getAllBlogs);
router.route('/blogs/:id').get(getBlogById);
router.route('/add-blogs').post(verifyJWT, createBlog);
router.route('/update-blogs/:id').put(verifyJWT, updateBlog);
router.route('/del-blogs/:id').delete(verifyJWT, deleteBlog);

export default router;
