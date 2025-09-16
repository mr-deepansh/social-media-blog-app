// src/modules/users/controllers/user.controller.js
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import { Logger } from "../../../shared/utils/Logger.js";
import { UserService } from "../services/user.service.js";
import { Validator } from "../../../shared/utils/Validator.js";
import { safeAsyncOperation } from "../../../shared/utils/ErrorHandler.js";
import { calculateApiHealth } from "../../../shared/utils/ApiHealth.js";
import { AuthService } from "../../auth/services/auth.service.js";
import Jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { uploadToCloudinary, deleteFromCloudinary } from "../../../shared/services/cloudinary.service.js";
import fs from "fs/promises";
import { User } from "../models/user.model.js";
import { Post } from "../../blogs/models/post/post.model.js";

const logger = new Logger("UserController");

const generateAccessAndRefreshTokens = async userId => {
  return await AuthService.generateTokens(userId);
};

// Error handler for controller functions
const handleControllerError = (error, req, res, startTime, logger) => {
  const executionTime = Date.now() - startTime;
  logger.error("Controller error:", {
    error: error.message,
    stack: error.stack,
    executionTime: `${executionTime}ms`,
    path: req.path,
    method: req.method,
  });

  if (error instanceof ApiError) {
    throw error;
  }

  throw new ApiError(500, "Internal server error occurred");
};
// Get all users with pagination + filtering
const getAllUsers = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const filters = req.query;
  const { page = 1, limit = 10 } = req.query;

  const result = await UserService.getAllUsers(filters, parseInt(page), parseInt(limit));
  const executionTime = Date.now() - startTime;

  res.status(200).json(
    new ApiResponse(200, result, "Users fetched successfully", true, {
      executionTime: `${executionTime}ms`,
    }),
  );
});
// Get user by ID
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user._id;

  const user = await UserService.getUserById(id, currentUserId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});
// ================================================
// 📌 Create user (Register)
// ================================================
const createUser = asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName, bio, avatar } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "Username, email, and password are required");
  }
  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }
  const existingUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });
  if (existingUser) {
    throw new ApiError(409, "Username or email already exists");
  }
  // Let the User model handle password hashing via pre-save middleware
  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password, // Will be hashed by pre-save middleware
    firstName,
    lastName,
    bio,
    avatar,
    role: "user",
    isActive: true,
  });
  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  return res
    .status(201)
    .set("Location", `${req.protocol}://${req.get("host")}/users/${user._id}`)
    .json(new ApiResponse(201, { success: true, data: createdUser }, "User created successfully"));
});

// Update user profile
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user._id;

  const user = await UserService.updateUser(id, req.body, currentUserId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
});

// Delete user account
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if user is trying to delete their own account or is admin
  if (req.user.role !== "admin" && req.user._id.toString() !== id) {
    throw new ApiError(403, "You can only delete your own account");
  }
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});

// Get current user profile
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select("-password -refreshToken -security -activityLog").lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Ensure avatar URL is properly formatted
  const formattedUser = {
    ...user,
    avatar: user.avatar?.url || null,
    coverImage: user.coverImage?.url || null,
    fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username,
  };

  res.status(200).json(new ApiResponse(200, formattedUser, "Current user profile fetched successfully"));
});

// Update current user profile
const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findByIdAndUpdate(userId, { $set: req.body }, { new: true, runValidators: true }).select(
    "-password -refreshToken",
  );

  res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
});

// Change user password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }
  if (newPassword.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }

  await UserService.changePassword(userId, currentPassword, newPassword);

  res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Upload user avatar
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Avatar file is required");
  }

  try {
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, "avatars");

    // Get current user to delete old avatar
    const currentUser = await User.findById(req.user._id);
    if (currentUser.avatar?.publicId) {
      await deleteFromCloudinary(currentUser.avatar.publicId);
    }

    // Update user with new avatar directly
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: result }, { new: true }).select(
      "-password -refreshToken",
    );

    // Delete temp file
    await fs.unlink(req.file.path).catch(() => {});

    res.status(200).json(new ApiResponse(200, user, "Avatar uploaded successfully"));
  } catch (error) {
    // Delete temp file on error
    await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
});

// Upload cover image
const uploadCoverImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Cover image file is required");
  }

  try {
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, "covers");

    // Get current user to delete old cover
    const currentUser = await User.findById(req.user._id);
    if (currentUser.coverImage?.publicId) {
      await deleteFromCloudinary(currentUser.coverImage.publicId);
    }

    // Update user with new cover image directly
    const user = await User.findByIdAndUpdate(req.user._id, { coverImage: result }, { new: true }).select(
      "-password -refreshToken",
    );

    // Delete temp file
    await fs.unlink(req.file.path).catch(() => {});

    res.status(200).json(new ApiResponse(200, user, "Cover image uploaded successfully"));
  } catch (error) {
    // Delete temp file on error
    await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
});

// Enterprise-grade user registration with optimized performance
const registerUser = asyncHandler(async (req, res) => {
  const startTime = Date.now();

  try {
    // Input validation and sanitization
    const validatedData = Validator.validateRegistration(req.body);
    const sanitizedBio = Validator.sanitizeString(req.body.bio || "");
    const sanitizedAvatar = Validator.sanitizeString(req.body.avatar || "");
    // Enhanced registration via AuthService
    const user = await AuthService.registerUser({ ...validatedData, bio: sanitizedBio, avatar: sanitizedAvatar }, req);
    // Generate tokens for immediate login after registration
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Fetch clean user data
    const createdUser = await User.findById(user._id).select("-password -refreshToken -security -activityLog").lean();

    // Set cookie options for tokens
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400000, // 24 hours
    };

    // Performance tracking
    const executionTime = Date.now() - startTime;
    logger.success("User registration completed", {
      userId: user._id,
      username: user.username,
      executionTime: `${executionTime}ms`,
    });

    return res
      .status(201)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          201,
          {
            user: createdUser,
            accessToken,
            refreshToken,
            message: "Registration successful! You are now logged in.",
            meta: {
              executionTime: `${executionTime}ms`,
              apiHealth: calculateApiHealth(executionTime),
              registrationTime: new Date().toISOString(),
            },
          },
          "User registered and logged in successfully",
        ),
      );
  } catch (error) {
    handleControllerError(error, req, res, startTime, logger);
  }
});

// **login for production scalability
const loginUser = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const clientIP = req.ip || req.connection.remoteAddress;
  try {
    const { identifier, username, email, password, rememberMe = false } = req.body;

    // Validate and sanitize input
    const validatedData = Validator.validateLogin({
      identifier: identifier || username || email,
      password,
    });
    // Use AuthService for enhanced login
    const loginResult = await AuthService.loginUser(validatedData, req);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: rememberMe ? 2592000000 : 86400000, // 30d : 1d
    };
    const executionTime = Date.now() - startTime;
    logger.info("User login successful", {
      userId: loginResult.user._id,
      username: loginResult.user.username,
      executionTime,
    });
    return res
      .status(200)
      .cookie("accessToken", loginResult.accessToken, cookieOptions)
      .cookie("refreshToken", loginResult.refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {
            user: loginResult.user,
            accessToken: loginResult.accessToken,
            refreshToken: loginResult.refreshToken,
            meta: {
              executionTime: `${executionTime}ms`,
              apiHealth: calculateApiHealth(executionTime),
              loginTime: new Date().toISOString(),
              rememberMe,
            },
          },
          "Login successful",
        ),
      );
  } catch (error) {
    // Enhanced fallback strategy for login failures
    const fallbackResponse = await safeAsyncOperation(
      () => ({
        message: "Login temporarily unavailable",
        status: "retry_later",
        suggestions: [
          "Check your credentials",
          "Verify account is active",
          "Try again in a few moments",
          "Contact support if issue persists",
        ],
      }),
      null,
      false,
    );
    if (error.message?.includes("Invalid credentials") && fallbackResponse) {
      logger.warn("Login attempt failed", {
        clientIP,
        error: error.message,
        executionTime: Date.now() - startTime,
      });
      return res.status(401).json(
        new ApiResponse(
          401,
          {
            ...fallbackResponse,
            meta: {
              executionTime: `${Date.now() - startTime}ms`,
              apiHealth: calculateApiHealth(Date.now() - startTime),
              dataFreshness: "error_fallback",
              warning: "Invalid login credentials provided",
            },
          },
          "Login failed - invalid credentials",
          false,
        ),
      );
    }
    handleControllerError(error, req, res, startTime, logger);
  }
});

//------------------------------------
// Secure logout
//-------------------------------------
const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;
  const token = req.token;

  if (!user || !token) {
    throw new ApiError(401, "Not authenticated");
  }

  // Use enterprise logout
  const result = await AuthService.logoutUser(user, token, req);

  res.status(200).json(new ApiResponse(200, {}, result.message));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    const decodedToken = Jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };
    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -refreshToken -security -activityLog").lean();

  const formattedUser = {
    ...user,
    avatar: user.avatar?.url || null,
    coverImage: user.coverImage?.url || null,
    fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username,
  };

  return res.status(200).json(new ApiResponse(200, formattedUser, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true },
  ).select("-password");
  return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: { $ifNull: ["$subscribers", []] } },
        channelsSubscribedToCount: {
          $size: { $ifNull: ["$subscribedTo", []] },
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }
  return res.status(200).json(new ApiResponse(200, channel[0], "User channel fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res.status(200).json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"));
});

// Get user's followers with proper error handling and validation
const getUserFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20, search } = req.query;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const pipeline = [
    {
      $match: {
        _id: { $in: user.followers },
      },
    },
  ];
  // Add search filter if provided
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    pipeline.push({
      $match: {
        $or: [
          { username: { $regex: searchRegex } },
          { firstName: { $regex: searchRegex } },
          { lastName: { $regex: searchRegex } },
          {
            $expr: {
              $regexMatch: {
                input: {
                  $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }],
                },
                regex: search.trim(),
                options: "i",
              },
            },
          },
        ],
      },
    });
  }
  // Add projection and sorting
  pipeline.push(
    {
      $addFields: {
        fullName: {
          $trim: {
            input: {
              $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }],
            },
          },
        },
        followersCount: { $size: { $ifNull: ["$followers", []] } },
        followingCount: { $size: { $ifNull: ["$following", []] } },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: skip,
    },
    {
      $limit: limitNum,
    },
    {
      $project: {
        _id: 1,
        username: 1,
        firstName: 1,
        lastName: 1,
        fullName: 1,
        avatar: 1,
        bio: { $substr: [{ $ifNull: ["$bio", ""] }, 0, 150] },
        followersCount: 1,
        followingCount: 1,
        isActive: 1,
        createdAt: 1,
      },
    },
  );
  // Execute aggregation and get total count
  const [followers, totalCountResult] = await Promise.all([
    User.aggregate(pipeline),
    User.aggregate([
      { $match: { _id: { $in: user.followers } } },
      ...(search && search.trim()
				? [
				  {
				    $match: {
				      $or: [
				        {
				          username: {
				            $regex: new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
				          },
				        },
				        {
				          firstName: {
				            $regex: new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
				          },
				        },
				        {
				          lastName: {
				            $regex: new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
				          },
				        },
				      ],
				    },
				  },
				]
				: []),
      { $count: "total" },
    ]),
  ]);

  const totalFollowers = totalCountResult.length > 0 ? totalCountResult[0].total : 0;
  const totalPages = Math.ceil(totalFollowers / limitNum);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        followers: followers.map(follower => ({
          ...follower,
          avatar: follower.avatar || "/assets/default-avatar.png",
          bio: follower.bio || "",
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalFollowers,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum,
        },
        meta: {
          searchTerm: search?.trim() || null,
          userId,
        },
      },
      "Followers fetched successfully",
    ),
  );
});

// Get user's following list with proper error handling
const getUserFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20, search } = req.query;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID format");
  }
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const pipeline = [
    {
      $match: {
        _id: { $in: user.following },
      },
    },
  ];
  // Add search filter if provided
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    pipeline.push({
      $match: {
        $or: [
          { username: { $regex: searchRegex } },
          { firstName: { $regex: searchRegex } },
          { lastName: { $regex: searchRegex } },
          {
            $expr: {
              $regexMatch: {
                input: {
                  $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }],
                },
                regex: search.trim(),
                options: "i",
              },
            },
          },
        ],
      },
    });
  }
  // Add projection and sorting
  pipeline.push(
    {
      $addFields: {
        fullName: {
          $trim: {
            input: {
              $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }],
            },
          },
        },
        followersCount: { $size: { $ifNull: ["$followers", []] } },
        followingCount: { $size: { $ifNull: ["$following", []] } },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: skip,
    },
    {
      $limit: limitNum,
    },
    {
      $project: {
        _id: 1,
        username: 1,
        firstName: 1,
        lastName: 1,
        fullName: 1,
        avatar: 1,
        bio: { $substr: [{ $ifNull: ["$bio", ""] }, 0, 150] },
        followersCount: 1,
        followingCount: 1,
        isActive: 1,
        createdAt: 1,
      },
    },
  );
  // Execute aggregation and get total count
  const [following, totalCountResult] = await Promise.all([
    User.aggregate(pipeline),
    User.aggregate([
      { $match: { _id: { $in: user.following } } },
      ...(search && search.trim()
				? [
				  {
				    $match: {
				      $or: [
				        {
				          username: {
				            $regex: new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
				          },
				        },
				        {
				          firstName: {
				            $regex: new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
				          },
				        },
				        {
				          lastName: {
				            $regex: new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
				          },
				        },
				      ],
				    },
				  },
				]
				: []),
      { $count: "total" },
    ]),
  ]);
  const totalFollowing = totalCountResult.length > 0 ? totalCountResult[0].total : 0;
  const totalPages = Math.ceil(totalFollowing / limitNum);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        following: following.map(user => ({
          ...user,
          avatar: user.avatar || "/assets/default-avatar.png",
          bio: user.bio || "",
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalFollowing,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum,
        },
        meta: {
          searchTerm: search?.trim() || null,
          userId,
        },
      },
      "Following list fetched successfully",
    ),
  );
});

// Search users
const searchUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  if (!search || search.trim().length < 2) {
    throw new ApiError(400, "Search query must be at least 2 characters long");
  }

  const result = await UserService.searchUsers(search.trim(), parseInt(page), parseInt(limit));

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
				result.users.length === 0
					? "No users found matching your search criteria"
					: `Found ${result.users.length} users`,
      ),
    );
});

// Fixed getUserSuggestions function
const getUserSuggestions = asyncHandler(async (req, res) => {
  console.log("🔍 getUserSuggestions called with query:", req.query);
  console.log("👤 Current user ID:", req.user._id);
  const { limit = 10, type = "all" } = req.query;
  const currentUserId = req.user._id;
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  console.log("📊 Parameters:", { limit: limitNum, type });
  try {
    // Get current user's data with better error handling
    const currentUser = await User.findById(currentUserId).select("following followers");
    if (!currentUser) {
      console.log("❌ Current user not found:", currentUserId);
      throw new ApiError(404, "Current user not found");
    }
    const followingIds = currentUser.following || [];
    const followerIds = currentUser.followers || [];
    console.log("📈 User stats:", {
      followingCount: followingIds.length,
      followersCount: followerIds.length,
    });
    // Fixed: Removed duplicate $expr in baseMatch
    const baseMatch = {
      _id: { $nin: [currentUserId, ...followingIds] },
      isActive: true,
      $and: [
        { $expr: { $ne: [{ $ifNull: ["$isDeleted", false] }, true] } },
        { $expr: { $ne: [{ $ifNull: ["$isPrivate", false] }, true] } },
      ],
    };
    let pipeline = [];
    // Different suggestion types with improved logic
    switch (type) {
      case "followers":
        // People who follow you but you don't follow back
        pipeline = [
          {
            $match: {
              ...baseMatch,
              _id: { $in: followerIds, $nin: [...followingIds, currentUserId] },
            },
          },
        ];
        console.log("🔄 Using 'followers' type pipeline");
        break;
      case "mutual":
        // People with mutual connections
        pipeline = [
          { $match: baseMatch },
          {
            $addFields: {
              mutualFollowers: {
                $size: {
                  $setIntersection: [{ $ifNull: ["$followers", []] }, followingIds],
                },
              },
            },
          },
          { $match: { mutualFollowers: { $gt: 0 } } },
        ];
        console.log("🤝 Using 'mutual' type pipeline");
        break;
      case "popular":
        // Users sorted primarily by popularity
        pipeline = [
          { $match: baseMatch },
          {
            $addFields: {
              followersCount: { $size: { $ifNull: ["$followers", []] } },
            },
          },
          { $match: { followersCount: { $gte: 10 } } }, // Only suggest users with decent following
        ];
        console.log("⭐ Using 'popular' type pipeline");
        break;
      default:
        // General suggestions with balanced algorithm
        pipeline = [{ $match: baseMatch }];
        console.log("🎯 Using 'all' type pipeline");
    }
    // Add common aggregation stages with improved scoring
    pipeline.push(
      {
        $addFields: {
          suggestionScore: {
            $sum: [
              // High boost for users who follow you back
              {
                $cond: [{ $in: [currentUserId, { $ifNull: ["$following", []] }] }, 100, 0],
              },
              // Boost for mutual followers (scaled)
              {
                $multiply: [
                  {
                    $size: {
                      $setIntersection: [{ $ifNull: ["$followers", []] }, followingIds],
                    },
                  },
                  10,
                ],
              },
              // Moderate boost for popularity (logarithmic to prevent overshadowing)
              {
                $multiply: [
                  {
                    $log10: {
                      $add: [{ $size: { $ifNull: ["$followers", []] } }, 1],
                    },
                  },
                  5,
                ],
              },
              // Small boost for recent activity
              {
                $cond: [
                  {
                    $gte: [
                      "$lastActive",
                      { $subtract: [new Date(), 7 * 24 * 60 * 60 * 1000] }, // 7 days
                    ],
                  },
                  20,
                  0,
                ],
              },
            ],
          },
          mutualFollowersCount: {
            $size: {
              $setIntersection: [{ $ifNull: ["$followers", []] }, followingIds],
            },
          },
          followsYou: { $in: [currentUserId, { $ifNull: ["$following", []] }] },
          followersCount: { $size: { $ifNull: ["$followers", []] } },
          followingCount: { $size: { $ifNull: ["$following", []] } },
          fullName: {
            $trim: {
              input: {
                $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }],
              },
            },
          },
        },
      },
      {
        $sort: {
          suggestionScore: -1,
          followersCount: -1,
          createdAt: -1,
        },
      },
      { $limit: limitNum },
      {
        $project: {
          _id: 1,
          username: 1,
          firstName: 1,
          lastName: 1,
          fullName: 1,
          avatar: 1,
          bio: { $substr: [{ $ifNull: ["$bio", ""] }, 0, 100] },
          followersCount: 1,
          followingCount: 1,
          mutualFollowersCount: 1,
          followsYou: 1,
          isVerified: { $ifNull: ["$isVerified", false] },
          suggestionScore: 1,
          createdAt: 1,
          lastActive: 1,
        },
      },
    );
    console.log("⏳ Executing aggregation pipeline...");
    // Execute aggregation with timeout
    const suggestions = await User.aggregate(pipeline);
    console.log("✅ Suggestions found:", suggestions.length);
    // Enhanced formatting with better suggestion reasons
    const formattedSuggestions = suggestions.map(user => {
      let suggestionReason = "Suggested for you";
      if (user.followsYou) {
        suggestionReason = "Follows you";
      } else if (user.mutualFollowersCount > 0) {
        suggestionReason =
					user.mutualFollowersCount === 1 ? "1 mutual follower" : `${user.mutualFollowersCount} mutual followers`;
      } else if (user.followersCount > 1000) {
        suggestionReason = "Popular user";
      } else if (user.followersCount > 100) {
        suggestionReason = "Active user";
      }
      return {
        ...user,
        avatar: user.avatar || "/assets/default-avatar.png",
        fullName: user.fullName || user.username || "Unknown User",
        bio: user.bio || "",
        suggestionReason,
      };
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          suggestions: formattedSuggestions,
          meta: {
            type,
            count: formattedSuggestions.length,
            limit: limitNum,
            hasMore: formattedSuggestions.length === limitNum,
          },
        },
				formattedSuggestions.length > 0
					? "User suggestions fetched successfully"
					: "No suggestions available at this time",
      ),
    );
  } catch (error) {
    console.error("❌ Get user suggestions error:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to fetch user suggestions. Please try again later.");
  }
});

// Enhanced getUserFeed function with better performance and error handling
const getUserFeed = asyncHandler(async (req, res) => {
  console.log("📰 getUserFeed called with query:", req.query);
  console.log("👤 Current user ID:", req.user._id);

  const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc", type = "all" } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const userId = req.user._id;
  const skip = (pageNum - 1) * limitNum;

  console.log("📊 Feed parameters:", {
    pageNum,
    limitNum,
    sortBy,
    sortOrder,
    type,
  });

  try {
    const currentUser = await User.findById(userId).select("following").lean();
    if (!currentUser) {
      console.log("❌ Current user not found:", userId);
      throw new ApiError(404, "User not found");
    }

    const followingIds = currentUser.following || [];
    console.log("👥 Following count:", followingIds.length);

    let matchConditions = {};
    switch (type) {
      case "following":
        if (followingIds.length === 0) {
          console.log("📭 No following users, returning empty feed");
          return res.status(200).json(
            new ApiResponse(
              200,
              {
                feed: [],
                pagination: {
                  currentPage: pageNum,
                  totalPages: 0,
                  totalPosts: 0,
                  hasNextPage: false,
                  hasPrevPage: false,
                  limit: limitNum,
                },
                meta: {
                  feedType: type,
                  sortBy,
                  sortOrder,
                  followingCount: 0,
                },
              },
              "No posts available - you're not following anyone yet",
            ),
          );
        }
        matchConditions = {
          owner: { $in: followingIds },
        };
        console.log("👥 Using 'following' feed type");
        break;
      case "own":
        matchConditions = {
          owner: userId,
        };
        console.log("👤 Using 'own' feed type");
        break;
      case "trending": {
        // Trending posts from last 7 days with high engagement
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        matchConditions = {
          createdAt: { $gte: weekAgo },
          $or: [
            { owner: { $in: [...followingIds, userId] } },
            {
              isPublic: true,
              $expr: {
                $gte: [{ $add: ["$likesCount", "$commentsCount"] }, 10],
              },
            },
          ],
        };
        console.log("🔥 Using 'trending' feed type");
        break;
      }
      default: // "all"
        matchConditions = {
          $or: [
            { owner: { $in: [...followingIds, userId] } },
            {
              isPublic: { $ne: false },
              owner: { $ne: userId }, // Avoid duplicating own posts
            },
          ],
        };
        console.log("🌐 Using 'all' feed type");
    }

    // Add common filters with better handling
    matchConditions = {
      ...matchConditions,
      $and: [{ isActive: { $ne: false } }, { isDeleted: { $ne: true } }],
    };

    console.log("🔍 Final match conditions:", JSON.stringify(matchConditions, null, 2));

    // Enhanced sorting with validation
    const validSortFields = ["createdAt", "updatedAt", "likesCount", "commentsCount", "engagementScore"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const validSortOrders = ["asc", "desc"];
    const validSortOrder = validSortOrders.includes(sortOrder) ? sortOrder : "desc";

    const sortStage = {};
    sortStage[sortField] = validSortOrder === "desc" ? -1 : 1;

    console.log("📋 Sort stage:", sortStage);

    // Enhanced pipeline with better performance
    const pipeline = [
      { $match: matchConditions },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "author",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                firstName: 1,
                lastName: 1,
                avatar: 1,
                isVerified: { $ifNull: ["$isVerified", false] },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          author: { $first: "$author" },
          engagementScore: {
            $add: [
              { $multiply: [{ $ifNull: ["$likesCount", 0] }, 1] },
              { $multiply: [{ $ifNull: ["$commentsCount", 0] }, 2] },
              { $multiply: [{ $ifNull: ["$sharesCount", 0] }, 3] },
            ],
          },
          // Check if current user liked this post
          isLikedByCurrentUser: {
            $in: [userId, { $ifNull: ["$likes", []] }],
          },
        },
      },
    ];

    // Add sorting based on type
    if (type === "trending") {
      pipeline.push({
        $sort: {
          engagementScore: -1,
          createdAt: -1,
        },
      });
    } else {
      pipeline.push({ $sort: sortStage });
    }

    // Add pagination and projection
    pipeline.push(
      { $skip: skip },
      { $limit: limitNum },
      {
        $project: {
          _id: 1,
          content: 1,
          media: 1,
          author: 1,
          likesCount: { $ifNull: ["$likesCount", 0] },
          commentsCount: { $ifNull: ["$commentsCount", 0] },
          sharesCount: { $ifNull: ["$sharesCount", 0] },
          isLiked: "$isLikedByCurrentUser",
          createdAt: 1,
          updatedAt: 1,
          engagementScore: 1,
          isPublic: 1,
        },
      },
    );

    console.log("⏳ Executing feed pipeline...");

    // Execute queries with proper error handling
    let feed = [];
    let totalPosts = 0;

    try {
      // Try using Post model first, fallback to collection if needed
      try {
        console.log("📝 Attempting to use Post model");
        const [feedResult, totalCountResult] = await Promise.all([
          Post.aggregate(pipeline),
          Post.aggregate([{ $match: matchConditions }, { $count: "total" }]),
        ]);
        feed = feedResult;
        totalPosts = totalCountResult.length > 0 ? totalCountResult[0].total : 0;
        console.log("✅ Successfully used Post model");
      } catch (modelError) {
        console.log("📄 Post model failed, using collection directly:", modelError.message);

        const db = mongoose.connection.db;
        if (!db) {
          throw new ApiError(500, "Database connection not available");
        }

        // Check if posts collection exists
        const collections = await db.listCollections({ name: "posts" }).toArray();

        if (collections.length === 0) {
          console.warn("⚠️ Posts collection does not exist, returning empty feed");
          return res.status(200).json(
            new ApiResponse(
              200,
              {
                feed: [],
                pagination: {
                  currentPage: pageNum,
                  totalPages: 0,
                  totalPosts: 0,
                  hasNextPage: false,
                  hasPrevPage: false,
                  limit: limitNum,
                },
                meta: {
                  feedType: type,
                  sortBy: sortField,
                  sortOrder: validSortOrder,
                  followingCount: followingIds.length,
                  message: "No posts available yet - start following users or create posts",
                },
              },
              "Feed is currently empty - no posts found",
            ),
          );
        }

        console.log("📊 Using posts collection directly");
        const postsCollection = db.collection("posts");

        // Execute both queries in parallel for better performance
        const [feedResult, totalCountResult] = await Promise.all([
          postsCollection.aggregate(pipeline).toArray(),
          postsCollection.aggregate([{ $match: matchConditions }, { $count: "total" }]).toArray(),
        ]);

        feed = feedResult;
        totalPosts = totalCountResult.length > 0 ? totalCountResult[0].total : 0;
        console.log("✅ Successfully used posts collection");
      }
    } catch (dbError) {
      console.error("❌ Database error in getUserFeed:", dbError);
      if (dbError.code === 50) {
        // maxTimeMS exceeded
        throw new ApiError(408, "Feed request timed out. Please try again.");
      }
      throw new ApiError(500, "Database error occurred while fetching feed");
    }

    console.log("✅ Feed results:", { postsFound: feed.length, totalPosts });

    const totalPages = Math.ceil(totalPosts / limitNum);

    // Enhanced response formatting
    const formattedFeed = feed.map(post => ({
      ...post,
      author: {
        ...post.author,
        avatar: post.author?.avatar || "/assets/default-avatar.png",
        displayName: post.author
					? `${post.author.firstName || ""} ${post.author.lastName || ""}`.trim() || post.author.username
					: "Unknown User",
      },
      // Add relative timestamps if needed
      timeAgo: getTimeAgo(post.createdAt),
    }));

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          feed: formattedFeed,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalPosts,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
            limit: limitNum,
          },
          meta: {
            feedType: type,
            sortBy: sortField,
            sortOrder: validSortOrder,
            followingCount: followingIds.length,
          },
        },
				totalPosts === 0
					? `No posts found in your ${type} feed`
					: `Feed fetched successfully - ${totalPosts} posts available`,
      ),
    );
  } catch (error) {
    console.error("❌ Get user feed error:", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to fetch user feed. Please try again later.");
  }
});

// Enhanced getUserProfileByUsername with privacy controls and better data handling
const getUserProfileByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const currentUserId = req.user._id;
  // Enhanced input validation
  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }
  const sanitizedUsername = username.toLowerCase().trim();
  // Validate username format (basic validation)
  if (!/^[a-zA-Z0-9._-]+$/.test(sanitizedUsername)) {
    throw new ApiError(400, "Invalid username format");
  }
  try {
    const currentUser = await User.findById(currentUserId).select("following").lean();

    if (!currentUser) {
      throw new ApiError(401, "Current user not found");
    }

    const currentUserFollowing = currentUser.following || [];

    const userProfile = await User.aggregate([
      {
        $match: {
          username: sanitizedUsername,
          isActive: { $ne: false },
          isDeleted: { $ne: true },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "followers",
          foreignField: "_id",
          as: "followersDetails",
          pipeline: [
            {
              $match: {
                isActive: { $ne: false },
                isDeleted: { $ne: true },
              },
            },
            {
              $project: {
                _id: 1,
                username: 1,
                firstName: 1,
                lastName: 1,
                avatar: 1,
                isVerified: { $ifNull: ["$isVerified", false] },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "following",
          foreignField: "_id",
          as: "followingDetails",
          pipeline: [
            {
              $match: {
                isActive: { $ne: false },
                isDeleted: { $ne: true },
              },
            },
            {
              $project: {
                _id: 1,
                username: 1,
                firstName: 1,
                lastName: 1,
                avatar: 1,
                isVerified: { $ifNull: ["$isVerified", false] },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          followersCount: { $size: { $ifNull: ["$followers", []] } },
          followingCount: { $size: { $ifNull: ["$following", []] } },
          isFollowing: {
            $in: [currentUserId, { $ifNull: ["$followers", []] }],
          },
          followsYou: {
            $in: [currentUserId, { $ifNull: ["$following", []] }],
          },
          isOwnProfile: {
            $eq: ["$_id", currentUserId],
          },
          // Calculate mutual followers using the current user's following list
          mutualFollowersCount: {
            $size: {
              $setIntersection: [{ $ifNull: ["$followers", []] }, currentUserFollowing],
            },
          },
          // Get sample mutual followers for display
          mutualFollowersSample: {
            $slice: [
              {
                $filter: {
                  input: "$followersDetails",
                  cond: { $in: ["$this._id", currentUserFollowing] },
                },
              },
              3,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          email: {
            $cond: {
              if: { $eq: ["$_id", currentUserId] },
              then: "$email",
              else: "$REMOVE",
            },
          },
          firstName: 1,
          lastName: 1,
          bio: 1,
          avatar: 1,
          coverImage: 1,
          location: 1,
          website: 1,
          isActive: 1,
          isVerified: { $ifNull: ["$isVerified", false] },
          isPrivate: { $ifNull: ["$isPrivate", false] },
          createdAt: 1,
          lastActive: 1,
          followersCount: 1,
          followingCount: 1,
          // Show detailed lists only if it's own profile or public profile
          followersDetails: {
            $cond: {
              if: {
                $or: [{ $eq: ["$_id", currentUserId] }, { $ne: [{ $ifNull: ["$isPrivate", false] }, true] }],
              },
              then: { $slice: ["$followersDetails", 20] },
              else: [],
            },
          },
          followingDetails: {
            $cond: {
              if: {
                $or: [{ $eq: ["$_id", currentUserId] }, { $ne: [{ $ifNull: ["$isPrivate", false] }, true] }],
              },
              then: { $slice: ["$followingDetails", 20] },
              else: [],
            },
          },
          isFollowing: 1,
          followsYou: 1,
          isOwnProfile: 1,
          mutualFollowersCount: {
            $cond: {
              if: { $eq: ["$_id", currentUserId] },
              then: 0,
              else: "$mutualFollowersCount",
            },
          },
          mutualFollowersSample: {
            $cond: {
              if: { $eq: ["$_id", currentUserId] },
              then: [],
              else: "$mutualFollowersSample",
            },
          },
        },
      },
    ]);

    if (!userProfile || userProfile.length === 0) {
      throw new ApiError(404, "User not found or account may be deactivated");
    }

    const profile = userProfile[0];

    // Enhanced computed fields
    const enhancedProfile = {
      ...profile,
      avatar: profile.avatar || "/assets/default-avatar.png",
      coverImage: profile.coverImage || "/assets/default-cover.png",
      fullName: `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || profile.username,
      joinDate: profile.createdAt,
      relationshipStatus: profile.isOwnProfile
				? "self"
				: profile.isFollowing && profile.followsYou
					? "mutual"
					: profile.isFollowing
						? "following"
						: profile.followsYou
							? "follower"
							: "none",
      // Add formatted mutual followers info
      mutualInfo:
				profile.mutualFollowersCount > 0
					? {
					  count: profile.mutualFollowersCount,
					  sample:
								profile.mutualFollowersSample?.map(user => ({
								  ...user,
								  avatar: user.avatar || "/assets/default-avatar.png",
								  displayName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username,
								})) || [],
					  message:
								profile.mutualFollowersCount === 1
									? "1 mutual follower"
									: `${profile.mutualFollowersCount} mutual followers`,
					}
					: null,
      // Profile stats for display
      stats: {
        posts: 0, // This would need to be calculated from posts collection
        followers: profile.followersCount,
        following: profile.followingCount,
        joinedDate: new Date(profile.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        }),
      },
      // Privacy and interaction flags
      canViewFollowers: profile.isOwnProfile || !profile.isPrivate,
      canViewFollowing: profile.isOwnProfile || !profile.isPrivate,
      canSendMessage: !profile.isOwnProfile,
      canFollow: !profile.isOwnProfile && !profile.isFollowing,
    };

    return res.status(200).json(new ApiResponse(200, enhancedProfile, "User profile fetched successfully"));
  } catch (error) {
    console.error("Get user profile error:", error);

    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === "CastError") {
      throw new ApiError(400, "Invalid user identifier");
    }
    if (error.code === 50) {
      throw new ApiError(408, "Profile request timed out. Please try again.");
    }
    throw new ApiError(500, "Failed to fetch user profile");
  }
});

// Follow user
const followUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  await UserService.followUser(currentUserId, userId);

  res.status(200).json(new ApiResponse(200, { followed: true }, "User followed successfully"));
});

// Unfollow user
const unfollowUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  await UserService.unfollowUser(currentUserId, userId);

  res.status(200).json(new ApiResponse(200, { followed: false }, "User unfollowed successfully"));
});

// Utility function for time ago calculation
const getTimeAgo = date => {
  const now = new Date();
  const postDate = new Date(date);
  const diffInSeconds = Math.floor((now - postDate) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }
  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  }
  if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  }
  if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }

  return postDate.toLocaleDateString();
};
// Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.processForgotPassword(email, req);
  res.status(200).json(new ApiResponse(200, {}, result.message));
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  if (!password || !confirmPassword) {
    throw new ApiError(400, "Both password fields are required");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const result = await AuthService.resetPassword(token, password, req);
  res.status(200).json(new ApiResponse(200, {}, result.message));
});

// Email Verification (public route)
const verifyEmail = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { token } = req.params;
  const clientIP = req.ip || req.connection.remoteAddress;

  try {
    // Input validation with sanitization
    if (!token?.trim() || token.length < 10) {
      logger.warn("Invalid verification token attempt", { clientIP, tokenLength: token?.length || 0 });
      throw new ApiError(400, "Valid verification token is required");
    }

    const sanitizedToken = token.trim();

    // Rate limiting check (basic)
    const cacheKey = `verify_attempt_${clientIP}`;
    const attempts = await safeAsyncOperation(() => UserService.getCacheValue(cacheKey), 0, false);

    if (attempts >= 10) {
      logger.warn("Email verification rate limit exceeded", { clientIP, attempts });
      throw new ApiError(429, "Too many verification attempts. Please try again later.");
    }

    // Increment attempt counter
    await safeAsyncOperation(
      () => UserService.setCacheValue(cacheKey, attempts + 1, 300), // 5 min expiry
      null,
      false,
    );

    // Verify email with fallback
    const result = await safeAsyncOperation(() => AuthService.verifyEmail(sanitizedToken, req), null, true);

    if (!result) {
      logger.error("Email verification service failed", { token: `${sanitizedToken.substring(0, 10)  }...` });
      throw new ApiError(500, "Verification service temporarily unavailable. Please try again.");
    }

    const executionTime = Date.now() - startTime;
    logger.success("Email verification successful", {
      executionTime: `${executionTime}ms`,
      clientIP,
      apiHealth: calculateApiHealth(executionTime),
    });

    // Clear rate limit on success
    await safeAsyncOperation(() => UserService.deleteCacheValue(cacheKey), null, false);

    res.status(200).json(new ApiResponse(200, { verified: true }, result.message));
  } catch (error) {
    const executionTime = Date.now() - startTime;

    if (error instanceof ApiError) {
      logger.warn("Email verification failed", {
        error: error.message,
        statusCode: error.statusCode,
        executionTime: `${executionTime}ms`,
        clientIP,
      });
      throw error;
    }

    logger.error("Unexpected email verification error", {
      error: error.message,
      stack: error.stack,
      executionTime: `${executionTime}ms`,
      clientIP,
    });

    throw new ApiError(500, "Email verification failed. Please try again or contact support.");
  }
});

// Resend Email Verification (protected route)
const resendEmailVerification = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const user = req.user;
  const clientIP = req.ip || req.connection.remoteAddress;

  try {
    // Pre-validation checks
    if (!user?._id) {
      throw new ApiError(401, "Authentication required");
    }

    if (user.isEmailVerified) {
      logger.info("Resend verification attempted for verified email", {
        userId: user._id,
        email: `${user.email?.substring(0, 3)  }***`,
      });
      throw new ApiError(400, "Email is already verified");
    }

    // Rate limiting for resend attempts
    const rateLimitKey = `resend_verify_${user._id}`;
    const recentAttempts = await safeAsyncOperation(() => UserService.getCacheValue(rateLimitKey), 0, false);

    if (recentAttempts >= 3) {
      logger.warn("Resend verification rate limit exceeded", {
        userId: user._id,
        attempts: recentAttempts,
        clientIP,
      });
      throw new ApiError(429, "Too many resend attempts. Please wait 15 minutes before trying again.");
    }

    // Generate verification token with error handling
    let verificationToken;
    try {
      verificationToken = user.generateEmailVerificationToken();
      if (!verificationToken) {
        throw new Error("Token generation failed");
      }
    } catch (tokenError) {
      logger.error("Verification token generation failed", {
        userId: user._id,
        error: tokenError.message,
      });
      throw new ApiError(500, "Unable to generate verification token. Please try again.");
    }

    // Save user with retry mechanism
    const saveResult = await safeAsyncOperation(
      async () => {
        await user.save({ validateBeforeSave: false });
        return true;
      },
      null,
      true,
    );

    if (!saveResult) {
      logger.error("Failed to save verification token", { userId: user._id });
      throw new ApiError(500, "Unable to process verification request. Please try again.");
    }

    // Send email with fallback
    const emailResult = await safeAsyncOperation(
      () => AuthService.sendWelcomeEmail(user, verificationToken, req),
      null,
      true,
    );

    if (!emailResult) {
      logger.error("Email sending failed", {
        userId: user._id,
        email: `${user.email?.substring(0, 3)  }***`,
      });

      // Fallback: Still return success but log the issue
      logger.warn("Email service degraded, verification email may be delayed", {
        userId: user._id,
      });
    }

    // Update rate limit counter
    await safeAsyncOperation(
      () => UserService.setCacheValue(rateLimitKey, recentAttempts + 1, 900), // 15 min expiry
      null,
      false,
    );

    const executionTime = Date.now() - startTime;
    logger.success("Verification email resent", {
      userId: user._id,
      executionTime: `${executionTime}ms`,
      apiHealth: calculateApiHealth(executionTime),
      emailSent: !!emailResult,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          sent: true,
          email: user.email?.replace(/(.{2}).*(@.*)/, "$1***$2"),
          nextResendAvailable: new Date(Date.now() + 300000).toISOString(), // 5 min
        },
				emailResult ? "Verification email sent successfully" : "Verification email queued for delivery",
      ),
    );
  } catch (error) {
    const executionTime = Date.now() - startTime;

    if (error instanceof ApiError) {
      logger.warn("Resend verification failed", {
        error: error.message,
        statusCode: error.statusCode,
        userId: user?._id,
        executionTime: `${executionTime}ms`,
        clientIP,
      });
      throw error;
    }

    logger.error("Unexpected resend verification error", {
      error: error.message,
      stack: error.stack,
      userId: user?._id,
      executionTime: `${executionTime}ms`,
      clientIP,
    });

    throw new ApiError(500, "Unable to resend verification email. Please try again later.");
  }
});

export {
  // Auth functions
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  getUserChannelProfile,
  getWatchHistory,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendEmailVerification,

  // User management
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  changePassword,
  uploadAvatar,
  uploadCoverImage,

  // Social features
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  searchUsers,
  getUserSuggestions,
  getUserFeed,
  getUserProfileByUsername,
};
