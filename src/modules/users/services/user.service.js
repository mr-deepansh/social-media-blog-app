// src/modules/users/services/user.service.js
import { User } from "../models/user.model.js";
import { CacheService } from "../../../shared/utils/Cache.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import bcrypt from "bcrypt";

export class UserService {
  // Optimized getAllUsers for production scale
  static async getAllUsers(filters = {}, page = 1, limit = 10) {
    // Build query from filters (add more filter logic as needed)
    const query = { isActive: true };
    if (filters.search) {
      query.$or = [
        { username: { $regex: filters.search, $options: "i" } },
        { firstName: { $regex: filters.search, $options: "i" } },
        { lastName: { $regex: filters.search, $options: "i" } },
      ];
    }
    // Pagination
    const skip = (page - 1) * limit;
    // Use lean for performance
    const [users, total] = await Promise.all([
      User.find(query)
        .select("username firstName lastName avatar bio followersCount")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);
    return {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }
  static async getUserById(userId, currentUserId) {
    // Check permissions
    if (currentUserId !== userId && !(await this.isAdmin(currentUserId))) {
      throw new ApiError(403, "Access denied");
    }

    const cacheKey = `user:${userId}`;
    let user = await CacheService.get(cacheKey);

    if (!user) {
      user = await User.findById(userId)
        .select("-password -refreshToken")
        .lean();
      if (user) {
        await CacheService.set(cacheKey, user, 600);
      }
    }

    return user;
  }

  static async updateUser(userId, updateData, currentUserId) {
    // Check permissions
    if (currentUserId !== userId && !(await this.isAdmin(currentUserId))) {
      throw new ApiError(403, "Access denied");
    }

    // Remove sensitive fields
    delete updateData.password;
    delete updateData.refreshToken;
    delete updateData.role;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password -refreshToken");

    if (user) {
      // Invalidate cache
      await CacheService.del(`user:${userId}`);
    }

    return user;
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordValid) {
      throw new ApiError(400, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    // Invalidate user cache
    await CacheService.del(`user:${userId}`);

    return true;
  }

  static async followUser(currentUserId, targetUserId) {
    if (currentUserId === targetUserId) {
      throw new ApiError(400, "Cannot follow yourself");
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId),
    ]);

    if (!targetUser || !targetUser.isActive) {
      throw new ApiError(404, "User not found");
    }

    if (currentUser.following.includes(targetUserId)) {
      throw new ApiError(400, "Already following this user");
    }

    await Promise.all([
      User.findByIdAndUpdate(currentUserId, {
        $push: { following: targetUserId },
      }),
      User.findByIdAndUpdate(targetUserId, {
        $push: { followers: currentUserId },
      }),
    ]);

    // Invalidate caches
    await Promise.all([
      CacheService.del(`user:${currentUserId}`),
      CacheService.del(`user:${targetUserId}`),
      CacheService.del(`profile:${targetUser.username}:*`),
    ]);

    return true;
  }

  static async unfollowUser(currentUserId, targetUserId) {
    if (currentUserId === targetUserId) {
      throw new ApiError(400, "Cannot unfollow yourself");
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId),
    ]);

    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    if (!currentUser.following.includes(targetUserId)) {
      throw new ApiError(400, "Not following this user");
    }

    await Promise.all([
      User.findByIdAndUpdate(currentUserId, {
        $pull: { following: targetUserId },
      }),
      User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentUserId },
      }),
    ]);

    // Invalidate caches
    await Promise.all([
      CacheService.del(`user:${currentUserId}`),
      CacheService.del(`user:${targetUserId}`),
      CacheService.del(`profile:${targetUser.username}:*`),
    ]);

    return true;
  }

  static async searchUsers(query, page = 1, limit = 20) {
    const searchQuery = {
      $or: [
        { username: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
      ],
      isActive: true,
    };

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(searchQuery)
        .select("username firstName lastName avatar bio followersCount")
        .sort({ followersCount: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(searchQuery),
    ]);

    return {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  static async isAdmin(userId) {
    const user = await User.findById(userId).select("role").lean();
    return user?.role === "admin" || user?.role === "super_admin";
  }
}
