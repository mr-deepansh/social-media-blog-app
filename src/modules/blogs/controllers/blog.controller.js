// Desc: Blogs.controller.js
import { Blog } from "../models/blog.model.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import { calculateApiHealth } from "../../../shared/utils/ApiHealth.js";
import {
	safeAsyncOperation,
	handleControllerError,
} from "../../../shared/utils/ErrorHandler.js";
import { Logger } from "../../../shared/utils/Logger.js";

const logger = new Logger("BlogController");

// tested

const getAllBlogs = asyncHandler(async (req, res) => {
	const startTime = Date.now();
	try {
		const {
			page = 1,
			limit = 10,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = req.query;

		const skip = (page - 1) * limit;
		const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

		const [blogs, totalBlogs] = await Promise.all([
			Blog.find()
				.populate("author", "fullName username")
				.sort(sort)
				.skip(skip)
				.limit(parseInt(limit)),
			Blog.countDocuments(),
		]);

		const executionTime = Date.now() - startTime;
		return res.status(200).json(
			new ApiResponse(
				200,
				{
					blogs,
					totalBlogs,
					currentPage: parseInt(page),
					totalPages: Math.ceil(totalBlogs / limit),
					meta: {
						executionTime: `${executionTime}ms`,
						apiHealth: calculateApiHealth(executionTime),
						filters: { sortBy, sortOrder },
					},
				},
				"Blogs retrieved successfully",
			),
		);
	} catch (error) {
		// Enhanced fallback strategy
		const fallbackData = await safeAsyncOperation(
			() => ({
				blogs: [],
				totalBlogs: 0,
				currentPage: 1,
				totalPages: 0,
				suggestions: [
					"Check database connectivity",
					"Verify blog collection exists",
					"Try refreshing the page",
				],
			}),
			null,
			false,
		);

		if (error.message?.includes("timeout") && fallbackData) {
			return res
				.status(200)
				.json(
					new ApiResponse(
						200,
						fallbackData,
						"Blogs list temporarily unavailable - using fallback",
					),
				);
		}

		handleControllerError(error, req, res, startTime, logger);
	}
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
	const startTime = Date.now();
	const clientIP = req.ip || req.connection.remoteAddress;
	try {
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

		const executionTime = Date.now() - startTime;
		logger.info("Blog created successfully", {
			blogId: blog._id,
			author: req.user._id,
			clientIP,
			executionTime,
		});

		return res.status(201).json(
			new ApiResponse(
				201,
				{
					...createdBlog.toObject(),
					meta: {
						executionTime: `${executionTime}ms`,
						apiHealth: calculateApiHealth(executionTime),
						createdAt: new Date().toISOString(),
						nextSteps: [
							"Blog is now live",
							"Share with your audience",
							"Monitor engagement",
						],
					},
				},
				"Blog created successfully",
			),
		);
	} catch (error) {
		// Enhanced fallback strategy
		const fallbackResponse = await safeAsyncOperation(
			() => ({
				message: "Blog creation temporarily unavailable",
				status: "retry_later",
				suggestions: [
					"Check your content for invalid characters",
					"Verify database connectivity",
					"Try again in a few moments",
				],
			}),
			null,
			false,
		);

		if (error.code === 11000 && fallbackResponse) {
			return res.status(409).json(
				new ApiResponse(
					409,
					{
						...fallbackResponse,
						meta: {
							executionTime: `${Date.now() - startTime}ms`,
							apiHealth: calculateApiHealth(Date.now() - startTime),
							dataFreshness: "error_fallback",
							warning: "Blog with similar content may already exist",
						},
					},
					"Blog creation failed - duplicate detected",
				),
			);
		}

		handleControllerError(error, req, res, startTime, logger);
	}
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
