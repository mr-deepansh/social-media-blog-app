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
		if (filters.role) {
			query.role = filters.role;
		}
		if (typeof filters.isVerified === "boolean") {
			query.isEmailVerified = filters.isVerified;
		}
		if (typeof filters.isActive === "boolean") {
			query.isActive = filters.isActive;
		}
		// Pagination
		const skip = (page - 1) * limit;
		// Use lean for performance
		const [users, total] = await Promise.all([
			User.find(query)
				.select("username firstName lastName avatar bio followersCount isEmailVerified role createdAt")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			User.countDocuments(query),
		]);

		// Map isEmailVerified to isVerified for frontend compatibility
		const mappedUsers = users.map(user => ({
			...user,
			isVerified: user.isEmailVerified,
			isEmailVerified: undefined, // Remove the original field
		}));

		return {
			users: mappedUsers,
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
			user = await User.findById(userId).select("-password -refreshToken").lean();
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

		const user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true }).select(
			"-password -refreshToken",
		);

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
		try {
			if (currentUserId.toString() === targetUserId.toString()) {
				throw new ApiError(400, "Cannot follow yourself");
			}

			const [currentUser, targetUser] = await Promise.all([
				User.findById(currentUserId).lean(),
				User.findById(targetUserId).lean(),
			]);

			if (!currentUser) {
				throw new ApiError(404, "Current user not found");
			}

			if (!targetUser || !targetUser.isActive) {
				throw new ApiError(404, "User not found or inactive");
			}

			const isAlreadyFollowing = currentUser.following?.some(id => id.toString() === targetUserId.toString()) || false;
			if (isAlreadyFollowing) {
				throw new ApiError(400, "Already following this user");
			}

			const [updatedCurrentUser, updatedTargetUser] = await Promise.all([
				User.findByIdAndUpdate(
					currentUserId,
					{
						$push: { following: targetUserId },
					},
					{ new: true },
				).select("following followers"),
				User.findByIdAndUpdate(
					targetUserId,
					{
						$push: { followers: currentUserId },
					},
					{ new: true },
				).select("following followers"),
			]);

			if (!updatedCurrentUser || !updatedTargetUser) {
				throw new ApiError(500, "Failed to update user relationships");
			}

			// Invalidate caches with error handling
			await Promise.allSettled([
				CacheService.del(`user:${currentUserId}`),
				CacheService.del(`user:${targetUserId}`),
				CacheService.del(`profile:${targetUser.username}:*`),
			]);

			return {
				success: true,
				currentUserFollowingCount: updatedCurrentUser.following?.length || 0,
				targetUserFollowersCount: updatedTargetUser.followers?.length || 0,
			};
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			throw new ApiError(500, "Follow operation failed");
		}
	}

	static async unfollowUser(currentUserId, targetUserId) {
		try {
			if (currentUserId.toString() === targetUserId.toString()) {
				throw new ApiError(400, "Cannot unfollow yourself");
			}

			const [currentUser, targetUser] = await Promise.all([
				User.findById(currentUserId).lean(),
				User.findById(targetUserId).lean(),
			]);

			if (!currentUser) {
				throw new ApiError(404, "Current user not found");
			}

			if (!targetUser) {
				throw new ApiError(404, "User not found");
			}

			const isFollowing = currentUser.following?.some(id => id.toString() === targetUserId.toString()) || false;
			if (!isFollowing) {
				throw new ApiError(400, "Not following this user");
			}

			const [updatedCurrentUser, updatedTargetUser] = await Promise.all([
				User.findByIdAndUpdate(
					currentUserId,
					{
						$pull: { following: targetUserId },
					},
					{ new: true },
				).select("following followers"),
				User.findByIdAndUpdate(
					targetUserId,
					{
						$pull: { followers: currentUserId },
					},
					{ new: true },
				).select("following followers"),
			]);

			if (!updatedCurrentUser || !updatedTargetUser) {
				throw new ApiError(500, "Failed to update user relationships");
			}

			// Invalidate caches with error handling
			await Promise.allSettled([
				CacheService.del(`user:${currentUserId}`),
				CacheService.del(`user:${targetUserId}`),
				CacheService.del(`profile:${targetUser.username}:*`),
			]);

			return {
				success: true,
				currentUserFollowingCount: updatedCurrentUser.following?.length || 0,
				targetUserFollowersCount: updatedTargetUser.followers?.length || 0,
			};
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			throw new ApiError(500, "Unfollow operation failed");
		}
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
