// src/modules/blogs/services/analytics.service.js
import { Post, Comment, View } from "../models/index.js";
import mongoose from "mongoose";

class AnalyticsService {
	// Get post analytics
	async getPostAnalytics(postId, userId) {
		const post = await Post.findById(postId);
		if (!post) {
			throw new Error("Post not found");
		}

		if (post.author.toString() !== userId.toString()) {
			throw new Error("Access denied");
		}

		const viewsByHour = await View.aggregate([
			{ $match: { post: mongoose.Types.ObjectId(postId) } },
			{
				$group: {
					_id: {
						hour: { $hour: "$createdAt" },
						date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					},
					count: { $sum: 1 },
				},
			},
			{ $sort: { "_id.date": 1, "_id.hour": 1 } },
		]);

		return {
			overview: {
				views: post.engagement.viewCount,
				uniqueViews: post.engagement.uniqueViewCount,
				likes: post.engagement.likeCount,
				comments: post.engagement.commentCount,
				shares: post.engagement.shareCount,
				engagementRate: post.engagementRate,
			},
			viewsByHour,
			reach: post.reach,
		};
	}

	// Get user analytics
	async getUserAnalytics(userId, timeframe = "30d") {
		const timeMap = {
			"7d": 7,
			"30d": 30,
			"90d": 90,
		};

		const days = timeMap[timeframe] || 30;
		const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

		const postsAnalytics = await Post.aggregate([
			{
				$match: {
					author: mongoose.Types.ObjectId(userId),
					createdAt: { $gte: since },
				},
			},
			{
				$group: {
					_id: null,
					totalPosts: { $sum: 1 },
					totalViews: { $sum: "$engagement.viewCount" },
					totalLikes: { $sum: "$engagement.likeCount" },
					totalComments: { $sum: "$engagement.commentCount" },
					avgEngagementRate: { $avg: { $toDouble: "$engagementRate" } },
				},
			},
		]);

		const topPosts = await Post.find({
			author: userId,
			createdAt: { $gte: since },
		})
			.sort({ "engagement.viewCount": -1 })
			.limit(5)
			.select("title content engagement createdAt");

		return {
			overview: postsAnalytics[0] || {
				totalPosts: 0,
				totalViews: 0,
				totalLikes: 0,
				totalComments: 0,
				avgEngagementRate: 0,
			},
			topPosts,
			timeframe,
		};
	}

	// Get platform analytics (admin only)
	async getPlatformAnalytics(timeframe = "30d") {
		const timeMap = {
			"7d": 7,
			"30d": 30,
			"90d": 90,
		};

		const days = timeMap[timeframe] || 30;
		const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

		const platformMetrics = await Post.aggregate([
			{ $match: { createdAt: { $gte: since } } },
			{
				$group: {
					_id: null,
					totalPosts: { $sum: 1 },
					totalViews: { $sum: "$engagement.viewCount" },
					totalEngagements: {
						$sum: {
							$add: ["$engagement.likeCount", "$engagement.commentCount", "$engagement.shareCount"],
						},
					},
					avgEngagementRate: { $avg: { $toDouble: "$engagementRate" } },
				},
			},
		]);

		const contentTypes = await Post.aggregate([
			{ $match: { createdAt: { $gte: since } } },
			{
				$group: {
					_id: "$type",
					count: { $sum: 1 },
					avgEngagement: { $avg: { $toDouble: "$engagementRate" } },
				},
			},
			{ $sort: { count: -1 } },
		]);

		return {
			overview: platformMetrics[0] || {
				totalPosts: 0,
				totalViews: 0,
				totalEngagements: 0,
				avgEngagementRate: 0,
			},
			contentTypes,
			timeframe,
		};
	}
}

export default new AnalyticsService();
