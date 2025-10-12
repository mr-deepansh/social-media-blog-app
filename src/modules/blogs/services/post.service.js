// src/modules/blogs/services/post.service.js
import mongoose from "mongoose";
import { Post } from "../models/index.js";
import { CacheService } from "../../../shared/utils/Cache.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { User } from "../../users/models/user.model.js";
import { Logger } from "../../../shared/utils/Logger.js";
import { POST_STATUS, POST_VISIBILITY, CACHE_TTL, CACHE_PREFIXES } from "../../../shared/constants/post.constants.js";

const logger = new Logger("PostService");

export class PostService {
  // Creates a new post.
  static async createPost(postData, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const post = new Post({
        ...postData,
        author: userId,
        metadata: {
          ...postData.metadata,
          device: postData.metadata?.device?.substring(0, 200) || "unknown",
          language: postData.metadata?.language?.substring(0, 50) || "en",
        },
      });
      await post.save({ session });
      // Invalidate caches
      await Promise.all([
        CacheService.del(`${CACHE_PREFIXES.USER}:${userId}`),
        CacheService.del(`${CACHE_PREFIXES.POSTS_BY_USER}:${userId}:*`),
      ]);
      await session.commitTransaction();
      logger.info("Post created successfully", { postId: post._id, userId });
      return post;
    } catch (error) {
      await session.abortTransaction();
      logger.error("Error creating post", { error, userId });
      throw new ApiError(500, "Failed to create post");
    } finally {
      session.endSession();
    }
  }
  // Retrieves posts created by the authenticated user.
  static async getMyPosts(userId, page = 1, limit = 20, status = null) {
    const cacheKey = `${CACHE_PREFIXES.POSTS_BY_USER}:${userId}:${page}:${limit}:${status || "all"}`;
    const cachedPosts = await CacheService.get(cacheKey);
    if (cachedPosts) {
      return cachedPosts;
    }
    const query = {
      author: userId,
      isDeleted: { $ne: true },
    };
    if (status && Object.values(POST_STATUS).includes(status)) {
      query.status = status;
    }
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "username firstName lastName avatar")
        .populate("media")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);
    const result = {
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
    await CacheService.set(cacheKey, result, CACHE_TTL.MEDIUM);
    return result;
  }
  // Retrieves a post by its ID.
  static async getPostById(postId) {
    const cacheKey = `${CACHE_PREFIXES.POST}:${postId}`;
    let post = await CacheService.get(cacheKey);
    if (!post) {
      post = await Post.findById(postId)
        .populate("author", "username firstName lastName avatar")
        .populate("media")
        .lean();
      if (post) {
        await CacheService.set(cacheKey, post, CACHE_TTL.MEDIUM);
      }
    }
    if (!post) {
      throw new ApiError(404, "Post not found");
    }
    return post;
  }
  // Retrieves a post by the author's username and the post ID.
  static async getPostByUsernameAndId(username, postId) {
    const cacheKey = `${CACHE_PREFIXES.POST_BY_USERNAME_AND_ID}:${username}:${postId}`;
    let post = await CacheService.get(cacheKey);
    if (!post) {
      const user = await User.findOne({ username: username.toLowerCase() }).select("_id").lean();
      if (!user) {
        throw new ApiError(404, "User not found");
      }
      post = await Post.findOne({ _id: postId, author: user._id })
        .populate("author", "username firstName lastName avatar")
        .populate("media")
        .lean();
      if (post) {
        await CacheService.set(cacheKey, post, CACHE_TTL.MEDIUM);
      }
    }
    if (!post) {
      throw new ApiError(404, "Post not found");
    }
    return post;
  }
  // Updates a post.
  static async updatePost(postId, updateData, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const post = await Post.findById(postId).session(session);
      if (!post) {
        throw new ApiError(404, "Post not found");
      }
      if (post.author.toString() !== userId.toString()) {
        throw new ApiError(403, "Access denied");
      }
      // Whitelist fields that can be updated
      const allowedUpdates = ["title", "content", "tags", "status", "visibility", "scheduledAt", "metadata"];
      const filteredUpdateData = Object.keys(updateData)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {});
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $set: filteredUpdateData },
        { new: true, runValidators: true, session },
      ).populate("author", "username firstName lastName avatar");
      // Invalidate caches
      await Promise.all([
        CacheService.del(`${CACHE_PREFIXES.POST}:${postId}`),
        CacheService.del(`${CACHE_PREFIXES.POSTS_BY_USER}:${userId}:*`),
        CacheService.del(`${CACHE_PREFIXES.POST_BY_USERNAME_AND_ID}:${updatedPost.author.username}:${postId}`),
      ]);
      await session.commitTransaction();
      logger.info("Post updated successfully", { postId, userId });
      return updatedPost;
    } catch (error) {
      await session.abortTransaction();
      logger.error("Error updating post", { error, postId, userId });
      throw new ApiError(500, "Failed to update post");
    } finally {
      session.endSession();
    }
  }
  // Deletes a post.
  static async deletePost(postId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const post = await Post.findById(postId).session(session);
      if (!post) {
        throw new ApiError(404, "Post not found");
      }
      if (post.author.toString() !== userId.toString()) {
        throw new ApiError(403, "Access denied");
      }
      await Post.findByIdAndDelete(postId, { session });
      // Invalidate caches
      await Promise.all([
        CacheService.del(`${CACHE_PREFIXES.POST}:${postId}`),
        CacheService.del(`${CACHE_PREFIXES.POSTS_BY_USER}:${userId}:*`),
        CacheService.del(`${CACHE_PREFIXES.POST_BY_USERNAME_AND_ID}:${post.author.username}:${postId}`),
      ]);
      await session.commitTransaction();
      logger.info("Post deleted successfully", { postId, userId });
      return true;
    } catch (error) {
      await session.abortTransaction();
      logger.error("Error deleting post", { error, postId, userId });
      throw new ApiError(500, "Failed to delete post");
    } finally {
      session.endSession();
    }
  }
  // Retrieves posts with optional filters and pagination.
  static async getPosts(filters = {}, page = 1, limit = 20) {
    const query = {
      status: POST_STATUS.PUBLISHED,
      visibility: POST_VISIBILITY.PUBLIC,
      isDeleted: { $ne: true },
    };
    // Whitelist and apply filters to prevent NoSQL injection
    const allowedFilters = ["tags", "author", "type"];
    Object.keys(filters).forEach(key => {
      if (allowedFilters.includes(key) && filters[key]) {
        if (key === "tags") {
          query.tags = { $in: filters[key].split(",").map(tag => tag.trim()) };
        } else {
          query[key] = filters[key];
        }
      }
    });
    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "username firstName lastName avatar")
        .populate("media")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);
    return {
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }
  // Retrieves posts by a user's username.
  static async getUserPostsByUsername(username, page = 1, limit = 12) {
    const user = await User.findOne({
      username: username.toLowerCase(),
    })
      .select("_id username firstName lastName avatar")
      .lean();
    if (!user) {
      return null;
    }
    const query = {
      author: user._id,
      status: POST_STATUS.PUBLISHED,
      visibility: POST_VISIBILITY.PUBLIC,
      isDeleted: { $ne: true },
    };
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      Post.find(query)
        .select("title content type createdAt engagement slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);
    return {
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar || "/assets/default-avatar.png",
      },
      posts: posts.map(post => ({
        id: post._id,
        title: post.title,
        content:
          post.content && post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content || "",
        type: post.type,
        createdAt: post.createdAt,
        engagement: {
          likes: post.engagement?.likeCount || 0,
          comments: post.engagement?.commentCount || 0,
          shares: post.engagement?.shareCount || 0,
          views: post.engagement?.viewCount || 0,
        },
        slug: post.slug,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }
}
