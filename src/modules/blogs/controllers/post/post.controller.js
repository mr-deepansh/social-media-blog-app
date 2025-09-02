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
import { NotificationHelper } from "../../../notifications/services/notification.helper.js";
import { User } from "../../../users/models/user.model.js";

const logger = new Logger("PostController");

// Create post
const createPost = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const userId = req.user._id;

  try {
    // Validate required fields
    if (!req.body.content) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Content is required"));
    }

    // Basic post data with minimal required fields
    const postData = {
      title: req.body.title || "",
      content: req.body.content,
      type: req.body.type || "post",
      category: req.body.category || "general",
      tags: req.body.tags || [],
      hashtags: req.body.hashtags || [],
      status: req.body.status || "draft",
      visibility: req.body.visibility || "public",
      isPublic: req.body.isPublic !== false,
      scheduledAt: req.body.scheduledAt || null,
      author: userId,
      metadata: {
        device: req.headers["user-agent"] || "unknown",
        ip: req.ip || "unknown",
        language: req.headers["accept-language"] || "en",
      },
    };

    // Create post
    const post = await Post.create(postData);

    const executionTime = Date.now() - startTime;
    logger.info("Post created", { postId: post._id, userId, executionTime });

    res.status(201).json(
      new ApiResponse(201, post, "Post created successfully", true, {
        executionTime: `${executionTime}ms`,
        apiHealth: calculateApiHealth(executionTime),
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (error) {
    const executionTime = Date.now() - startTime;
    logger.error("Post creation failed", {
      error: error.message,
      userId,
      executionTime,
    });

    res.status(500).json(
      new ApiResponse(
        500,
        null,
        error.message || "Internal server error",
        false,
        {
          path: req.originalUrl,
          method: req.method,
          executionTime: `${executionTime}ms`,
          timestamp: new Date().toISOString(),
        },
      ),
    );
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
      status,
      visibility,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};
    // Only add filters if they are explicitly provided
    if (status) {
      query.status = status;
    }
    if (visibility) {
      query.visibility = visibility;
    }
    if (type) {
      query.type = type;
    }
    if (category) {
      query.category = category;
    }
    if (tags) {
      query.tags = { $in: tags.split(",") };
    }
    if (author) {
      query.author = author;
    }

    // If no status is provided, default to published for public API
    if (!status) {
      query.status = "published";
      query.visibility = "public";
    }

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
      if (!post.editHistory) {
        post.editHistory = [];
      }
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

// Get current user's posts with enterprise error handling
const getMyPosts = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const userId = req.user?._id;

  try {
    // Validate user authentication
    if (!userId) {
      throw new ApiError(401, "Authentication required");
    }

    const {
      page = 1,
      limit = 20,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Validate pagination parameters
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));

    const query = { author: userId, isDeleted: { $ne: true } };
    if (
      status &&
			["draft", "published", "scheduled", "archived"].includes(status)
    ) {
      query.status = status;
    }

    const skip = (validatedPage - 1) * validatedLimit;
    const validSortFields = ["createdAt", "updatedAt", "publishedAt", "title"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sort = { [sortField]: sortOrder === "desc" ? -1 : 1 };

    // Execute queries with fallback handling
    const [posts, total] = await safeAsyncOperation(
      () =>
        Promise.all([
          Post.find(query)
            .populate("author", "fullName username avatar verified")
            .populate({
              path: "media",
              select: "url thumbnail type",
              options: { strictPopulate: false },
            })
            .sort(sort)
            .skip(skip)
            .limit(validatedLimit)
            .lean()
            .exec(),
          Post.countDocuments(query).exec(),
        ]),
      [[], 0], // Fallback values
      true,
    );

    const executionTime = Date.now() - startTime;
    logger.info("My posts retrieved", {
      userId,
      postCount: posts.length,
      total,
      executionTime,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          posts: posts || [],
          pagination: {
            currentPage: validatedPage,
            totalPages: Math.ceil((total || 0) / validatedLimit),
            totalPosts: total || 0,
            hasNext: validatedPage * validatedLimit < (total || 0),
            hasPrev: validatedPage > 1,
            limit: validatedLimit,
          },
          meta: {
            executionTime: `${executionTime}ms`,
            apiHealth: calculateApiHealth(executionTime),
            dataFreshness: "live",
            cacheStatus: "miss",
          },
          filters: {
            status: status || "all",
            sortBy: sortField,
            sortOrder,
          },
        },
        "My posts retrieved successfully",
      ),
    );
  } catch (error) {
    // Enhanced fallback strategy for my posts
    const fallbackResponse = await safeAsyncOperation(
      () => ({
        posts: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalPosts: 0,
          hasNext: false,
          hasPrev: false,
          limit: 20,
        },
        message: "Posts temporarily unavailable",
        status: "fallback_mode",
        suggestions: [
          "Try refreshing the page",
          "Check your internet connection",
          "Contact support if issue persists",
        ],
      }),
      null,
      false,
    );

    if (error.statusCode === 401 || error.message?.includes("Authentication")) {
      return res
        .status(401)
        .json(
          new ApiResponse(
            401,
            fallbackResponse,
            "Authentication required to view posts",
          ),
        );
    }

    if (fallbackResponse) {
      logger.warn("My posts fallback activated", {
        userId,
        error: error.message,
        executionTime: Date.now() - startTime,
      });
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            ...fallbackResponse,
            meta: {
              executionTime: `${Date.now() - startTime}ms`,
              apiHealth: calculateApiHealth(Date.now() - startTime),
              dataFreshness: "fallback",
              warning: "Using fallback data due to temporary issues",
            },
          },
          "Posts retrieved with fallback data",
        ),
      );
    }

    handleControllerError(error, req, res, startTime, logger);
  }
});

export {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getMyPosts,
};
