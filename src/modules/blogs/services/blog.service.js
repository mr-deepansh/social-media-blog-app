// src/modules/blogs/services/blog.service.js
import {
	Post,
	Comment,
	Like,
	Share,
	Bookmark,
	View,
	Repost,
} from "../models/index.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import mongoose from "mongoose";

class BlogService {
	// Create post
	async createPost(data, userId) {
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			const postData = {
				...data,
				author: userId,
				metadata: {
					device: data.device,
					browser: data.browser,
					ip: data.ip,
					language: data.language,
					timezone: data.timezone,
				},
			};

			if (data.scheduledAt) {
				postData.status = "scheduled";
				postData.scheduledAt = new Date(data.scheduledAt);
			}

			const post = await Post.create([postData], { session });
			await session.commitTransaction();

			return await Post.findById(post[0]._id)
				.populate("author", "fullName username avatar")
				.populate("media");
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			session.endSession();
		}
	}

	// Get posts with filtering
	async getPosts(filters = {}) {
		const {
			page = 1,
			limit = 20,
			sortBy = "createdAt",
			sortOrder = "desc",
			type,
			author,
			tags,
			status = "published",
		} = filters;

		const skip = (page - 1) * limit;
		const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

		const query = { status };
		if (type) query.type = type;
		if (author) query.author = author;
		if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };

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

		return {
			posts,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(total / limit),
				totalPosts: total,
				hasNext: page * limit < total,
				hasPrev: page > 1,
			},
		};
	}

	// Toggle like
	async toggleLike(postId, userId) {
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			const existingLike = await Like.findOne({
				user: userId,
				target: postId,
				targetType: "post",
			});

			if (existingLike) {
				await Like.findByIdAndDelete(existingLike._id, { session });
				await Post.findByIdAndUpdate(
					postId,
					{ $inc: { "engagement.likeCount": -1 } },
					{ session },
				);
			} else {
				await Like.create(
					[
						{
							user: userId,
							target: postId,
							targetType: "post",
						},
					],
					{ session },
				);
				await Post.findByIdAndUpdate(
					postId,
					{ $inc: { "engagement.likeCount": 1 } },
					{ session },
				);
			}

			await session.commitTransaction();
			return { liked: !existingLike };
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			session.endSession();
		}
	}

	// Add comment
	async addComment(postId, userId, content, parentCommentId = null) {
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			const commentData = {
				content,
				author: userId,
				post: postId,
				parentComment: parentCommentId,
			};

			const comment = await Comment.create([commentData], { session });

			await Post.findByIdAndUpdate(
				postId,
				{ $inc: { "engagement.commentCount": 1 } },
				{ session },
			);

			await session.commitTransaction();

			return await Comment.findById(comment[0]._id).populate(
				"author",
				"fullName username avatar",
			);
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			session.endSession();
		}
	}

	// Track view
	async trackView(postId, userId, ip, userAgent) {
		try {
			const viewData = {
				user: userId,
				post: postId,
				ip,
				userAgent,
			};

			await View.create(viewData);

			const isUniqueView = userId
				? !(await View.findOne({ user: userId, post: postId }))
				: !(await View.findOne({ ip, post: postId }));

			await Post.findByIdAndUpdate(postId, {
				$inc: {
					"engagement.viewCount": 1,
					...(isUniqueView && { "engagement.uniqueViewCount": 1 }),
				},
			});
		} catch (error) {
			// Don't throw error for view tracking failures
			console.error("View tracking failed:", error);
		}
	}

	// Get trending posts
	async getTrendingPosts(timeframe = "24h", limit = 20) {
		const timeMap = {
			"1h": 1,
			"24h": 24,
			"7d": 24 * 7,
			"30d": 24 * 30,
		};

		const hours = timeMap[timeframe] || 24;
		const since = new Date(Date.now() - hours * 60 * 60 * 1000);

		return await Post.find({
			status: "published",
			createdAt: { $gte: since },
		})
			.populate("author", "fullName username avatar verified")
			.sort({ trendingScore: -1, "engagement.viewCount": -1 })
			.limit(limit)
			.lean();
	}
}

export default new BlogService();
