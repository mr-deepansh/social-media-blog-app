// src/modules/users/services/profile.service.js
import { User } from "../models/user.model.js";
import { Post } from "../../blogs/models/index.js";
import { CacheService } from "../../../shared/utils/Cache.js";
import mongoose from "mongoose";

export class ProfileService {
  static async getUserProfile(username, currentUserId) {
    const cacheKey = `profile:${username}:${currentUserId || "guest"}`;

    // Try cache first
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const [userProfile, userStats] = await Promise.all([
      this.getUserBasicProfile(username, currentUserId),
      this.getUserStats(username),
    ]);

    if (!userProfile) {
      return null;
    }

    const profile = {
      ...userProfile,
      stats: userStats,
      posts: await this.getUserRecentPosts(userProfile._id, 9),
      // Add additional metadata for frontend
      canEdit: userProfile.isOwnProfile,
      canFollow: !userProfile.isOwnProfile && !userProfile.isFollowing,
      relationshipStatus: userProfile.isOwnProfile
				? "self"
				: userProfile.isFollowing && userProfile.followsYou
					? "mutual"
					: userProfile.isFollowing
						? "following"
						: userProfile.followsYou
							? "follower"
							: "none",
    };

    // Cache for 5 minutes
    await CacheService.set(cacheKey, profile, 300);
    return profile;
  }

  static async getUserBasicProfile(username, currentUserId) {
    console.log("🔍 ProfileService Debug:", {
      username: username.toLowerCase(),
      currentUserId: currentUserId?.toString(),
      hasCurrentUser: !!currentUserId,
    });

    const pipeline = [
      { $match: { username: username.toLowerCase(), isActive: true } },
      {
        $lookup: {
          from: "users",
          localField: "followers",
          foreignField: "_id",
          as: "followersData",
          pipeline: [{ $project: { username: 1, firstName: 1, lastName: 1, avatar: 1 } }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "following",
          foreignField: "_id",
          as: "followingData",
          pipeline: [{ $project: { username: 1, firstName: 1, lastName: 1, avatar: 1 } }],
        },
      },
      {
        $addFields: {
          followersCount: { $size: "$followers" },
          followingCount: { $size: "$following" },
          isOwnProfile: currentUserId ? { $eq: ["$_id", new mongoose.Types.ObjectId(currentUserId)] } : false,
          isFollowing: currentUserId
						? {
						  $in: [new mongoose.Types.ObjectId(currentUserId), "$followers"],
						}
						: false,
          followsYou: currentUserId
						? {
						  $in: [new mongoose.Types.ObjectId(currentUserId), "$following"],
						}
						: false,
          fullName: {
            $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }],
          },
        },
      },
      {
        $project: {
          password: 0,
          refreshToken: 0,
          "security.passwordHistory": 0,
          activityLog: 0,
          // Explicitly include important fields
          _id: 1,
          username: 1,
          firstName: 1,
          lastName: 1,
          fullName: 1,
          bio: 1,
          avatar: 1,
          coverImage: 1,
          followersCount: 1,
          followingCount: 1,
          isOwnProfile: 1,
          isFollowing: 1,
          followsYou: 1,
          isActive: 1,
          isEmailVerified: 1,
          createdAt: 1,
          // Only show email for own profile
          email: {
            $cond: {
              if: "$isOwnProfile",
              then: "$email",
              else: "$$REMOVE",
            },
          },
        },
      },
    ];

    const result = await User.aggregate(pipeline);
    return result[0] || null;
  }

  static async getUserStats(username) {
    const user = await User.findOne({
      username: username.toLowerCase(),
    }).select("_id");
    if (!user) {
      return null;
    }

    const stats = await Post.aggregate([
      {
        $match: {
          author: user._id,
          status: "published",
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalLikes: { $sum: "$engagement.likeCount" },
          totalComments: { $sum: "$engagement.commentCount" },
          totalShares: { $sum: "$engagement.shareCount" },
          totalViews: { $sum: "$engagement.viewCount" },
          avgEngagement: {
            $avg: {
              $add: ["$engagement.likeCount", "$engagement.commentCount", "$engagement.shareCount"],
            },
          },
        },
      },
    ]);

    const result = stats[0] || {};
    return {
      posts: result.totalPosts || 0,
      likes: result.totalLikes || 0,
      comments: result.totalComments || 0,
      shares: result.totalShares || 0,
      views: result.totalViews || 0,
      engagementRate:
				result.totalViews > 0
					? (((result.totalLikes + result.totalComments + result.totalShares) / result.totalViews) * 100).toFixed(2)
					: "0.00",
    };
  }

  static async getUserRecentPosts(userId, limit = 9) {
    return await Post.find({
      author: userId,
      status: "published",
      isDeleted: { $ne: true },
    })
      .select("title content type createdAt engagement media")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  static async getUserPosts(username, page = 1, limit = 12, type = "all") {
    const user = await User.findOne({
      username: username.toLowerCase(),
    }).select("_id");
    if (!user) {
      return null;
    }

    const query = {
      author: user._id,
      status: "published",
      isDeleted: { $ne: true },
    };

    if (type !== "all") {
      query.type = type;
    }

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

  static async getFollowStatus(currentUserId, targetUserId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(currentUserId) || !mongoose.Types.ObjectId.isValid(targetUserId)) {
        return { isFollowing: false, followsYou: false, error: "Invalid user ID" };
      }

      const [currentUser, targetUser] = await Promise.all([
        User.findById(currentUserId).select("following").lean(),
        User.findById(targetUserId).select("followers").lean(),
      ]);

      if (!currentUser || !targetUser) {
        return { isFollowing: false, followsYou: false, error: "User not found" };
      }

      const isFollowing = currentUser.following?.some(id => id.toString() === targetUserId.toString()) || false;
      const followsYou = targetUser.followers?.some(id => id.toString() === currentUserId.toString()) || false;

      return { isFollowing, followsYou };
    } catch (error) {
      console.error("Error checking follow status:", error);
      return { isFollowing: false, followsYou: false, error: "Failed to check status" };
    }
  }

  static async invalidateUserCache(username) {
    // Invalidate all cache variations for this user
    const patterns = [`profile:${username}:*`, `user:${username}:*`];

    for (const pattern of patterns) {
      await CacheService.del(pattern);
    }
  }
}
