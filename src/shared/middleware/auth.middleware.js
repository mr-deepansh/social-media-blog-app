// src/shared/middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import { User } from "../../modules/users/models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { CacheService } from "../../shared/utils/Cache.js";

// Optimized cache operations for millions of users
const isTokenBlacklisted = async token =>
  await CacheService.isTokenBlacklisted(token);

const getCachedUser = async userId => await CacheService.getCachedUser(userId);

const setCachedUser = async (userId, userData, ttl = 300) =>
  await CacheService.cacheUser(userId, userData, ttl);

// 🔥 OPTIMIZED AUTH MIDDLEWARE
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Extract token from multiple sources
    const token =
			req.cookies?.accessToken ||
			req.header("Authorization")?.replace("Bearer ", "") ||
			req.body?.accessToken;

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Check token blacklist (for logout/security)
    if (await isTokenBlacklisted(token)) {
      throw new ApiError(401, "Token has been invalidated");
    }

    // Verify JWT
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Try cache first, then database
    let user = await getCachedUser(decodedToken._id);

    if (!user) {
      user = await User.findById(decodedToken._id)
        .select("-password -refreshToken -security.passwordHistory")
        .lean(); // Use lean() for better performance

      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      }

      // Cache user data
      await setCachedUser(decodedToken._id, user);
    }

    // Security checks
    if (!user.isActive) {
      throw new ApiError(401, "Account is deactivated");
    }

    req.user = user;
    req.token = token; // Store token for logout
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

// Optional auth middleware (doesn't throw error if no token)
export const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const token =
			req.cookies?.accessToken ||
			req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      req.user = null;
      return next();
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    let user = await getCachedUser(decodedToken._id);

    if (!user) {
      user = await User.findById(decodedToken._id)
        .select("-password -refreshToken")
        .lean();

      if (user) {
        await setCachedUser(decodedToken._id, user);
      }
    }

    req.user = user && user.isActive ? user : null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
});
