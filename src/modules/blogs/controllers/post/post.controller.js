// src/modules/blogs/controllers/post/post.controller.js
import { Post } from "../../models/index.js";
import { asyncHandler } from "../../../../shared/utils/AsyncHandler.js";
import { ApiError } from "../../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../../shared/utils/ApiResponse.js";
import {
	safeAsyncOperation,
	handleControllerError,
} from "../../../../shared/utils/ErrorHandler.js";
import { calculateApiHealth } from "../../../../shared/utils/ApiHealth.js";
import { Logger } from "../../../../shared/utils/Logger.js";

const logger = new Logger("PostController");

// Create post
const createPost = asyncHandler(async (req, res) => {
	const startTime = Date.now();
	const userId = req.user._id;

	try {
		const postData = {
			...req.body,
			author: userId,
			metadata: {
				device: req.headers["user-agent"],
				ip: req.ip,
				language: req.headers["accept-language"],
			},
		};

		const post = await safeAsyncOperation(
			() => Post.create(postData),
			null,
			true,
		);

		const populatedPost = await Post.findById(post._id)
			.populate("author", "fullName username avatar")
			.populate("media");

		const executionTime = Date.now() - startTime;
		logger.info("Post created", { postId: post._id, userId, executionTime });

		res.status(201).json(
			new ApiResponse(
				201,
				{
					...populatedPost.toObject(),
					meta: {
						executionTime: `${executionTime}ms`,
						apiHealth: calculateApiHealth(executionTime),
					},
				},
				"Post created successfully",
			),
		);
	} catch (error) {
		handleControllerError(error, req, res, startTime, logger);
	}
});

// Get posts with advanced filtering
const getPosts = asyncHandler(async (req, res) => {
	const startTime = Date.now();

	try {
		const {
			page = 1,
			limit = 20,
			type,
			category,
			tags,
			author,
			status = "published",
			visibility = "public",
			sortBy = "createdAt",
			sortOrder = "desc",
		} = req.query;

		const query = { status, visibility };
		if (type) query.type = type;
		if (category) query.category = category;
		if (tags) query.tags = { $in: tags.split(",") };
		if (author) query.author = author;

		const skip = (page - 1) * limit;
		const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

		const [posts, total] = await Promise.all([
			Post.find(query)
				.populate("author", "fullName username avatar verified")
				.populate("media", "url thumbnail type")
				.sort(sort)
				.skip(skip)
				.limit(parseInt(limit))
				.lean(),
			Post.countDocuments(query),
		]);

		const executionTime = Date.now() - startTime;

		res.status(200).json(
			new ApiResponse(
				200,
				{
					posts,
					pagination: {
						currentPage: parseInt(page),
						totalPages: Math.ceil(total / limit),
						totalPosts: total,
						hasNext: page * limit < total,
						hasPrev: page > 1,
					},
					meta: {
						executionTime: `${executionTime}ms`,
						apiHealth: calculateApiHealth(executionTime),
					},
				},
				"Posts retrieved successfully",
			),
		);
	} catch (error) {
		handleControllerError(error, req, res, startTime, logger);
	}
});

// Get single post by ID
const getPostById = asyncHandler(async (req, res) => {
	const startTime = Date.now();
	const { id } = req.params;

	try {
		const post = await Post.findById(id)
			.populate("author", "fullName username avatar verified")
			.populate("media", "url thumbnail type")
			.lean();

		if (!post) {
			throw new ApiError(404, "Post not found");
		}

		const executionTime = Date.now() - startTime;

		res.status(200).json(
			new ApiResponse(
				200,
				{
					...post,
					meta: {
						executionTime: `${executionTime}ms`,
						apiHealth: calculateApiHealth(executionTime),
					},
				},
				"Post retrieved successfully",
			),
		);
	} catch (error) {
		handleControllerError(error, req, res, startTime, logger);
	}
});

// Update post
const updatePost = asyncHandler(async (req, res) => {
	const startTime = Date.now();
	const { id } = req.params;
	const userId = req.user._id;

	try {
		const post = await Post.findById(id);
		if (!post) {
			throw new ApiError(404, "Post not found");
		}

		// Check if user owns the post
		if (post.author.toString() !== userId.toString()) {
			throw new ApiError(403, "You can only update your own posts");
		}

		const updateData = {
			...req.body,
			updatedAt: new Date(),
		};

		// Add edit history if content changed
		if (req.body.content && req.body.content !== post.content) {
			if (!post.editHistory) post.editHistory = [];
			post.editHistory.push({
				previousContent: post.content,
				editedAt: new Date(),
				reason: req.body.editReason || "Content updated",
			});
			updateData.editHistory = post.editHistory;
		}

		const updatedPost = await Post.findByIdAndUpdate(id, updateData, {
			new: true,
			runValidators: true,
		})
			.populate("author", "fullName username avatar")
			.populate("media");

		const executionTime = Date.now() - startTime;
		logger.info("Post updated", { postId: id, userId, executionTime });

		res.status(200).json(
			new ApiResponse(
				200,
				{
					...updatedPost.toObject(),
					meta: {
						executionTime: `${executionTime}ms`,
						apiHealth: calculateApiHealth(executionTime),
					},
				},
				"Post updated successfully",
			),
		);
	} catch (error) {
		handleControllerError(error, req, res, startTime, logger);
	}
});

// Delete post
const deletePost = asyncHandler(async (req, res) => {
	const startTime = Date.now();
	const { id } = req.params;
	const userId = req.user._id;

	try {
		const post = await Post.findById(id);
		if (!post) {
			throw new ApiError(404, "Post not found");
		}

		// Check if user owns the post
		if (post.author.toString() !== userId.toString()) {
			throw new ApiError(403, "You can only delete your own posts");
		}

		await Post.findByIdAndDelete(id);

		const executionTime = Date.now() - startTime;
		logger.info("Post deleted", { postId: id, userId, executionTime });

		res.status(200).json(
			new ApiResponse(
				200,
				{
					meta: {
						executionTime: `${executionTime}ms`,
						apiHealth: calculateApiHealth(executionTime),
					},
				},
				"Post deleted successfully",
			),
		);
	} catch (error) {
		handleControllerError(error, req, res, startTime, logger);
	}
});

export { createPost, getPosts, getPostById, updatePost, deletePost };
