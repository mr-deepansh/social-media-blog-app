// src/modules/blogs/services/post.service.js
import { Post } from "../models/index.js";
import { CacheService } from "../../../shared/utils/Cache.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { User } from "../../users/models/user.model.js";

export class PostService {
	static async createPost(postData, userId) {
		const post = await Post.create({
			...postData,
			author: userId,
			metadata: {
				...postData.metadata,
				device: postData.metadata?.device?.substring(0, 200) || "unknown",
				language: postData.metadata?.language?.substring(0, 50) || "en",
			},
		});

		// Invalidate user cache
		await CacheService.del(`user:${userId}`);

		return post;
	}

	static async getMyPosts(userId, page = 1, limit = 20, status = null) {
		const query = {
			author: userId,
			isDeleted: { $ne: true },
		};

		if (status && ["draft", "published", "scheduled", "archived"].includes(status)) {
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

	static async getPostById(postId) {
		const cacheKey = `post:${postId}`;
		let post = await CacheService.get(cacheKey);

		if (!post) {
			post = await Post.findById(postId)
				.populate("author", "username firstName lastName avatar")
				.populate("media")
				.lean();

			if (post) {
				await CacheService.set(cacheKey, post, 600);
			}
		}

		return post;
	}

	static async updatePost(postId, updateData, userId) {
		const post = await Post.findById(postId);
		if (!post) {
			throw new ApiError(404, "Post not found");
		}

		if (post.author.toString() !== userId.toString()) {
			throw new ApiError(403, "Access denied");
		}

		const updatedPost = await Post.findByIdAndUpdate(
			postId,
			{ $set: updateData },
			{ new: true, runValidators: true },
		).populate("author", "username firstName lastName avatar");

		// Invalidate cache
		await CacheService.del(`post:${postId}`);

		return updatedPost;
	}

	static async deletePost(postId, userId) {
		const post = await Post.findById(postId);
		if (!post) {
			throw new ApiError(404, "Post not found");
		}

		if (post.author.toString() !== userId.toString()) {
			throw new ApiError(403, "Access denied");
		}

		await Post.findByIdAndDelete(postId);

		// Invalidate cache
		await CacheService.del(`post:${postId}`);

		return true;
	}

	static async getPosts(filters = {}, page = 1, limit = 20) {
		const query = {
			status: "published",
			visibility: "public",
			isDeleted: { $ne: true },
		};

		// Apply filters
		Object.keys(filters).forEach(key => {
			if (filters[key] && key !== "page" && key !== "limit" && key !== "sortBy" && key !== "sortOrder") {
				if (key === "tags") {
					query.tags = { $in: filters[key].split(",") };
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

	static async getUserPostsByUsername(username, page = 1, limit = 12, currentUserId) {
		const user = await User.findOne({
			username: username.toLowerCase(),
		}).select("_id username firstName lastName avatar");
		if (!user) {
			return null;
		}

		const query = {
			author: user._id,
			status: "published",
			visibility: "public",
			isDeleted: { $ne: true },
		};

		const skip = (page - 1) * limit;
		const [posts, total] = await Promise.all([
			Post.find(query)
				.populate("author", "username firstName lastName avatar")
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
