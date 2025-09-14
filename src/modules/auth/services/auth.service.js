import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../../users/models/user.model.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { redisClient, RedisUtils } from "../../../config/redis/redis.config.js";

// Cache user data in Redis to reduce DB queries
const setCachedUser = async (userId, userData, ttl = 300) => {
	try {
		await redisClient.setex(`user:${userId}`, ttl, JSON.stringify(userData));
	} catch (error) {
		console.error("Redis user cache set failed:", error);
	}
};

class AuthService {
	// 🚀 HIGH-PERFORMANCE REGISTRATION
	static async registerUser(userData, req) {
		const { username, email, password, firstName, lastName, bio, avatar } = userData;

		// Batch existence check with single query
		const existingUsers = await User.find({
			$or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
		})
			.select("email username")
			.lean();

		// Check conflicts
		const emailExists = existingUsers.find(u => u.email === email.toLowerCase());
		const usernameExists = existingUsers.find(u => u.username === username.toLowerCase());

		if (emailExists || usernameExists) {
			const conflicts = [];
			if (emailExists) {
				conflicts.push("email");
			}
			if (usernameExists) {
				conflicts.push("username");
			}

			throw new ApiError(409, "Registration failed", {
				conflicts,
				message: `${conflicts.join(" and ")} already in use`,
			});
		}

		// Create user with optimized data structure
		// Password will be hashed by the User model's pre-save middleware
		const user = await User.create({
			username: username.toLowerCase(),
			email: email.toLowerCase(),
			password, // Let the model handle hashing
			firstName,
			lastName,
			bio: bio?.substring(0, 500) || "", // Limit bio length
			avatar,
			isActive: true,
			role: "user", // Always default to user
			// Initialize arrays to prevent null issues
			followers: [],
			following: [],
			watchHistory: [],
		});

		// Log activity asynchronously
		this.logActivity(user, "register", req).catch(console.error);

		return user;
	}

	// 🔥 OPTIMIZED LOGIN WITH SECURITY
	static async loginUser({ identifier, password }, req) {
		const startTime = Date.now();

		// Find user with single query
		const user = await User.findOne({
			$or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
			isActive: true,
		}).select("+password +security.failedLoginAttempts +security.lockUntil");

		if (!user) {
			// Consistent timing to prevent user enumeration
			await bcrypt.hash("dummy", 10);
			throw new ApiError(401, "Invalid credentials");
		}

		// Check account lockout
		if (user.isAccountLocked()) {
			throw new ApiError(423, "Account temporarily locked due to failed attempts");
		}

		// Verify password
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			// Increment failed attempts
			await user.incrementFailedLoginAttempts();
			throw new ApiError(401, "Invalid credentials");
		}

		// Reset failed attempts on successful login
		if (user.security.failedLoginAttempts > 0) {
			await user.resetFailedLoginAttempts();
		}

		// Generate tokens
		const { accessToken, refreshToken } = this.generateTokens(user._id);

		// Update user data
		await User.findByIdAndUpdate(user._id, {
			refreshToken,
			lastActive: new Date(),
			"security.lastLoginIP": req.ip,
			"security.lastLoginLocation": req.get("CF-IPCountry") || "Unknown",
		});

		// Cache user data
		const userForCache = await User.findById(user._id).select("-password -refreshToken").lean();

		await setCachedUser(user._id, userForCache);

		// Log activity asynchronously
		this.logActivity(user, "login", req).catch(console.error);

		const executionTime = Date.now() - startTime;
		console.log(`✅ Login completed in ${executionTime}ms`);

		return {
			user: userForCache,
			accessToken,
			refreshToken,
		};
	}

	// 🔥 OPTIMIZED LOGOUT WITH TOKEN BLACKLISTING
	static async logoutUser(user, token, req) {
		const startTime = Date.now();

		try {
			// Parallel operations for better performance
			await Promise.all([
				// Clear refresh token in DB
				User.findByIdAndUpdate(user._id, {
					$unset: { refreshToken: 1 },
					lastActive: new Date(),
				}),

				// Add token to blacklist (expires with token)
				this.blacklistToken(token),

				// Clear user cache
				redisClient.del(`user:${user._id}`).catch(console.error),
			]);

			// Log activity asynchronously
			this.logActivity(user, "logout", req).catch(console.error);

			const executionTime = Date.now() - startTime;
			console.log(`✅ Logout completed in ${executionTime}ms`);

			return true;
		} catch (error) {
			console.error("Logout error:", error);
			throw new ApiError(500, "Logout failed");
		}
	}

	// Token blacklisting for security
	static async blacklistToken(token) {
		try {
			const decoded = jwt.decode(token);
			const expiryTime = decoded.exp * 1000; // Convert to milliseconds
			const currentTime = Date.now();
			const ttl = Math.max(0, Math.floor((expiryTime - currentTime) / 1000));

			if (ttl > 0) {
				await redisClient.setex(`blacklist:${token}`, ttl, "1");
			}
		} catch (error) {
			console.error("Token blacklist failed:", error);
		}
	}

	// 🚀 OPTIMIZED TOKEN GENERATION
	static generateTokens(userId) {
		const accessToken = jwt.sign({ _id: userId }, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
			algorithm: "HS256",
		});

		const refreshToken = jwt.sign({ _id: userId, type: "refresh" }, process.env.REFRESH_TOKEN_SECRET, {
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
			algorithm: "HS256",
		});

		return { accessToken, refreshToken };
	}

	// 🚀 OPTIMIZED TOKEN REFRESH
	static async refreshTokens(oldRefreshToken) {
		try {
			const decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);

			// Validate refresh token type
			if (decoded.type !== "refresh") {
				throw new ApiError(401, "Invalid token type");
			}

			const user = await User.findById(decoded._id).select("refreshToken isActive");

			if (!user || !user.isActive) {
				throw new ApiError(401, "User not found or inactive");
			}

			if (user.refreshToken !== oldRefreshToken) {
				// Possible token reuse - security issue
				await User.findByIdAndUpdate(user._id, { $unset: { refreshToken: 1 } });
				throw new ApiError(401, "Invalid refresh token - please login again");
			}

			// Generate new tokens
			const { accessToken, refreshToken } = this.generateTokens(user._id);

			// Update user with new refresh token
			await User.findByIdAndUpdate(user._id, {
				refreshToken,
				lastActive: new Date(),
			});

			// Blacklist old refresh token
			await this.blacklistToken(oldRefreshToken);

			return { accessToken, refreshToken };
		} catch (error) {
			if (error instanceof jwt.JsonWebTokenError) {
				throw new ApiError(401, "Invalid refresh token");
			}
			throw error;
		}
	}

	// 🔥 ASYNC ACTIVITY LOGGING (Non-blocking)
	static async logActivity(user, action, req, success = true, errorMessage = null) {
		try {
			// Use worker queue for heavy operations in production
			const activityData = {
				userId: user._id,
				email: user.email,
				action,
				ip: req.ip || req.connection?.remoteAddress || "127.0.0.1",
				userAgent: req.get("User-Agent") || "Unknown",
				timestamp: new Date(),
				success,
				errorMessage,
			};

			// Store in Redis queue for processing
			await redisClient.lpush("activity_log", JSON.stringify(activityData));

			// Keep queue size manageable
			await redisClient.ltrim("activity_log", 0, 9999);
		} catch (error) {
			console.error("Activity logging failed:", error.message);
			// Never throw - logging should not affect user experience
		}
	}
}

export { AuthService };
