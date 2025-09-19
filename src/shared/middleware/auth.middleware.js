// src/shared/middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import { User } from "../../modules/users/models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { CacheService } from "../../shared/utils/Cache.js";

// Enterprise fallback constants
const FALLBACK_CACHE_TTL = 300; // 5 minutes
const MAX_RETRY_ATTEMPTS = 3;

// Optimized cache operations for millions of users
const isTokenBlacklisted = async token => await CacheService.isTokenBlacklisted(token);

const getCachedUser = async userId => await CacheService.getCachedUser(userId);

const setCachedUser = async (userId, userData, ttl = 300) => await CacheService.cacheUser(userId, userData, ttl);

// 🔥 OPTIMIZED AUTH MIDDLEWARE WITH ENTERPRISE FALLBACK
export const verifyJWT = asyncHandler(async (req, res, next) => {
	try {
		// Extract token from multiple sources with better parsing
		let token = req.cookies?.accessToken || req.body?.accessToken;

		// Handle Authorization header properly
		const authHeader = req.header("Authorization");
		if (!token && authHeader) {
			if (authHeader.startsWith("Bearer ")) {
				token = authHeader.substring(7);
			} else {
				token = authHeader;
			}
		}

		if (!token) {
			throw new ApiError(401, "Unauthorized request");
		}

		// Check token blacklist with fallback
		try {
			if (await isTokenBlacklisted(token)) {
				throw new ApiError(401, "Token has been invalidated");
			}
		} catch (cacheError) {
			console.warn("Cache check failed, proceeding:", cacheError.message);
		}

		// Verify JWT with proper secret
		const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

		// Try cache first with fallback to database
		let user;
		try {
			user = await getCachedUser(decodedToken._id);
		} catch (cacheError) {
			console.warn("Cache retrieval failed:", cacheError.message);
		}

		if (!user) {
			user = await User.findById(decodedToken._id).select("-password -refreshToken -security.passwordHistory").lean();

			if (!user) {
				throw new ApiError(401, "Invalid Access Token");
			}

			// Cache user data with error handling
			try {
				await setCachedUser(decodedToken._id, user);
			} catch (cacheError) {
				console.warn("Cache storage failed:", cacheError.message);
			}
		}

		// Security checks
		if (!user.isActive) {
			throw new ApiError(401, "Account is deactivated");
		}

		req.user = user;
		req.token = token;
		next();
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			throw new ApiError(401, "Invalid Access Token");
		}
		if (error instanceof jwt.TokenExpiredError) {
			throw new ApiError(401, "Access Token Expired");
		}
		throw error;
	}
});

// Optional auth middleware with enterprise fallback
export const optionalAuth = asyncHandler(async (req, res, next) => {
	try {
		let token = req.cookies?.accessToken;

		const authHeader = req.header("Authorization");
		if (!token && authHeader) {
			token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
		}

		if (!token) {
			req.user = null;
			return next();
		}

		const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		let user;

		try {
			user = await getCachedUser(decodedToken._id);
		} catch (cacheError) {
			console.warn("Optional auth cache failed:", cacheError.message);
		}

		if (!user) {
			user = await User.findById(decodedToken._id).select("-password -refreshToken").lean();

			if (user) {
				try {
					await setCachedUser(decodedToken._id, user);
				} catch (cacheError) {
					console.warn("Optional auth cache storage failed:", cacheError.message);
				}
			}
		}

		req.user = user && user.isActive ? user : null;
		next();
	} catch (error) {
		req.user = null;
		next();
	}
});

// Enterprise refresh token middleware (no auth required)
export const refreshTokenMiddleware = asyncHandler(async (req, res, next) => {
	// Skip auth for refresh token endpoint
	next();
});
