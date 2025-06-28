// Desc: Blogs.controller.js
import { Blog } from "../models/blog.model.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";

// tested

const getAllBlogs = asyncHandler(async (req, res) => {
	const {
		page = 1,
		limit = 10,
		sortBy = "createdAt",
		sortOrder = "desc",
	} = req.query;

	const skip = (page - 1) * limit;
	const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

	const blogs = await Blog.find()
		.populate("author", "fullName username")
		.sort(sort)
		.skip(skip)
		.limit(parseInt(limit));

	const totalBlogs = await Blog.countDocuments();

	return res.status(200).json(
		new ApiResponse(
			200,
			{
				blogs,
				totalBlogs,
				currentPage: parseInt(page),
				totalPages: Math.ceil(totalBlogs / limit),
			},
			"Blogs retrieved successfully",
		),
	);
});

// tested

const getBlogById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const blog = await Blog.findById(id).populate("author", "fullName username");

	if (!blog) {
		throw new ApiError(404, "Blog not found");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, blog, "Blog retrieved successfully"));
});

//  tested

const createBlog = asyncHandler(async (req, res) => {
	const { title, content, tags } = req.body;

	if (!title || !content) {
		throw new ApiError(400, "Title and content are required");
	}

	const blog = await Blog.create({
		title,
		content,
		tags: tags || [],
		author: req.user._id,
	});

	const createdBlog = await Blog.findById(blog._id).populate(
		"author",
		"fullName username",
	);

	return res
		.status(201)
		.json(new ApiResponse(201, createdBlog, "Blog created successfully"));
});

// tested

const updateBlog = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { title, content, tags } = req.body;

	const blog = await Blog.findById(id);

	if (!blog) {
		throw new ApiError(404, "Blog not found");
	}

	if (blog.author.toString() !== req.user._id.toString()) {
		throw new ApiError(403, "You can only update your own blogs");
	}

	const updatedBlog = await Blog.findByIdAndUpdate(
		id,
		{
			$set: {
				title: title || blog.title,
				content: content || blog.content,
				tags: tags || blog.tags,
			},
		},
		{ new: true },
	).populate("author", "fullName username");

	return res
		.status(200)
		.json(new ApiResponse(200, updatedBlog, "Blog updated successfully"));
});

//  tested

const deleteBlog = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const blog = await Blog.findById(id);

	if (!blog) {
		throw new ApiError(404, "Blog not found");
	}

	if (blog.author.toString() !== req.user._id.toString()) {
		throw new ApiError(403, "You can only delete your own blogs");
	}

	await Blog.findByIdAndDelete(id);

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Blog deleted successfully"));
});

export { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog };
