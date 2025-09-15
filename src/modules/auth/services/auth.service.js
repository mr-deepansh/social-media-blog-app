import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../../users/models/user.model.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { redisClient, RedisUtils } from "../../../config/redis/redis.config.js";
import { emailService } from "../../email/services/email.service.js";
import { Logger } from "../../../shared/utils/Logger.js";

const logger = new Logger("AuthService");

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

  // 🔥 ENTERPRISE FORGOT PASSWORD (Millions of Users)
  static async processForgotPassword(email, req) {
    const startTime = Date.now();

    // Optimized user lookup with minimal fields
    const user = await User.findOne(
      { email: email.toLowerCase(), isActive: true },
      { _id: 1, email: 1, firstName: 1, username: 1, forgotPasswordExpiry: 1 },
    ).lean();

    if (!user) {
      // Consistent timing to prevent user enumeration
      await new Promise(resolve => setTimeout(resolve, 100));
      return { message: "If the email exists, a password reset link has been sent" };
    }

    // Rate limiting: Check if recent reset request exists
    if (user.forgotPasswordExpiry && user.forgotPasswordExpiry > new Date()) {
      return { message: "Password reset link already sent. Please check your email or wait before requesting again." };
    }

    // Generate enterprise-grade secure token with multiple layers
    const payload = {
      userId: user._id,
      email: user.email,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString("hex"),
      ip: req.ip || "127.0.0.1",
    };

    // Create JWT token with encryption
    const resetToken = jwt.sign(payload, process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET, {
      expiresIn: "10m",
      algorithm: "HS256",
      issuer: "endlessChatt-security",
      audience: "password-reset",
    });

    // Additional encryption layer with IV
    const algorithm = "aes-256-cbc";
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || process.env.JWT_SECRET, "salt", 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encryptedToken = cipher.update(resetToken, "utf8", "hex");
    encryptedToken += cipher.final("hex");
    // Prepend IV to encrypted token
    encryptedToken = `${iv.toString("hex")  }:${  encryptedToken}`;

    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Atomic update with optimistic concurrency
    const updateResult = await User.findByIdAndUpdate(
      user._id,
      {
        forgotPasswordToken: encryptedToken,
        forgotPasswordExpiry: resetTokenExpiry,
        lastActive: new Date(),
      },
      { new: true, select: "_id" },
    );

    if (!updateResult) {
      throw new ApiError(500, "Failed to process password reset request");
    }

    // Async email sending (non-blocking)
    setImmediate(async () => {
      try {
        const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:8080"}/reset-password?token=${encodeURIComponent(encryptedToken)}`;

        await emailService.sendEmail({
          to: user.email,
          subject: "🔒 Password Reset - endlessChatt",
          html: `
						<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
							<h2 style="color: #333; text-align: center;">🔒 Password Reset Request</h2>
							<p>Hi <strong>${user.firstName || user.username}</strong>,</p>
							<p>You requested a password reset for your endlessChatt account.</p>
							<div style="text-align: center; margin: 30px 0;">
								<a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
							</div>
							<p><strong>This link expires in 10 minutes</strong> for security.</p>
							<p>If you didn't request this, please ignore this email.</p>
							<hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
							<p style="font-size: 12px; color: #666; text-align: center;">endlessChatt Security Team</p>
						</div>
					`,
        });
      } catch (emailError) {
        logger.error("Email send failed", { error: emailError.message, email: user.email });
        // Log to monitoring system in production
      }
    });

    // Async activity logging
    this.logActivity({ _id: user._id, email: user.email }, "forgot_password", req).catch(console.error);

    const executionTime = Date.now() - startTime;
    logger.info("Forgot password processed", { executionTime: `${executionTime}ms`, email: user.email });

    return { message: "If the email exists, a password reset link has been sent" };
  }

  // 🔥 ENTERPRISE PASSWORD RESET (High Performance)
  static async resetPassword(token, newPassword, req) {
    const startTime = Date.now();

    // Input validation
    if (!token || token.length < 32) {
      throw new ApiError(400, "Invalid reset token format");
    }

    // Decode URL-encoded token
    const decodedToken = decodeURIComponent(token);

    // Check if token is blacklisted (already used)
    const isBlacklisted = await redisClient.get(`blacklist_reset:${decodedToken}`);
    if (isBlacklisted) {
      await bcrypt.hash("dummy", 10); // Consistent timing
      throw new ApiError(400, "Reset link has already been used. Please request a new password reset.");
    }

    let user;
    try {
      // Extract IV and encrypted data
      const [ivHex, encryptedData] = decodedToken.split(":");
      if (!ivHex || !encryptedData) {
        throw new Error("Invalid token format");
      }

      // Decrypt the token
      const algorithm = "aes-256-cbc";
      const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || process.env.JWT_SECRET, "salt", 32);
      const iv = Buffer.from(ivHex, "hex");
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decryptedToken = decipher.update(encryptedData, "hex", "utf8");
      decryptedToken += decipher.final("utf8");

      // Verify JWT token
      const payload = jwt.verify(decryptedToken, process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET, {
        algorithm: "HS256",
        issuer: "endlessChatt-security",
        audience: "password-reset",
      });

      // Additional security checks
      if (payload.ip !== (req.ip || "127.0.0.1")) {
        logger.warn("IP mismatch in reset token", {
          originalIP: payload.ip,
          currentIP: req.ip,
          userId: payload.userId,
        });
        // Allow but log for monitoring
      }

      // Find user with decrypted payload
      user = await User.findOne(
        {
          _id: payload.userId,
          email: payload.email,
          forgotPasswordToken: decodedToken,
          forgotPasswordExpiry: { $gt: new Date() },
          isActive: true,
        },
        { _id: 1, email: 1, firstName: 1, username: 1, password: 1 },
      );
    } catch (decryptError) {
      await bcrypt.hash("dummy", 10); // Consistent timing
      logger.error("Token decryption failed", { error: decryptError.message });
      throw new ApiError(400, "Invalid or corrupted reset token");
    }

    if (!user) {
      // Consistent timing for security
      await bcrypt.hash("dummy", 10);
      throw new ApiError(400, "Invalid or expired reset token");
    }

    // Password strength validation
    if (newPassword.length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters long");
    }

    // Check if new password is same as current (optional security)
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new ApiError(400, "New password must be different from current password");
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Blacklist the reset token immediately to prevent reuse
    await redisClient.setex(`blacklist_reset:${decodedToken}`, 3600, "1"); // 1 hour blacklist

    // Atomic update with security fields
    const updateResult = await User.findByIdAndUpdate(
      user._id,
      {
        password: hashedPassword,
        "security.lastPasswordChange": new Date(),
        lastActive: new Date(),
        $unset: {
          forgotPasswordToken: 1,
          forgotPasswordExpiry: 1,
          // Clear any existing sessions for security
          refreshToken: 1,
        },
        $inc: { "security.passwordResetCount": 1 },
      },
      { new: true, select: "_id" },
    );

    if (!updateResult) {
      throw new ApiError(500, "Failed to reset password");
    }

    // Invalidate ALL user sessions and tokens for complete security
    try {
      await Promise.all([
        // Clear user cache
        redisClient.del(`user:${user._id}`),
        // Clear all session patterns
        redisClient.del(`sessions:${user._id}:*`),
        // Clear any cached tokens
        redisClient.del(`tokens:${user._id}:*`),
        // Force logout by clearing refresh token patterns
        redisClient.del(`refresh:${user._id}:*`),
      ]);
      logger.info("All user sessions invalidated", { userId: user._id });
    } catch (cacheError) {
      logger.warn("Cache cleanup failed", { error: cacheError.message, userId: user._id });
    }

    // Async success email notification
    setImmediate(async () => {
      try {
        await emailService.sendEmail({
          to: user.email,
          subject: "✅ Password Reset Successful - endlessChatt",
          html: `
						<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
							<h2 style="color: #28a745; text-align: center;">✅ Password Reset Successful</h2>
							<p>Hi <strong>${user.firstName || user.username}</strong>,</p>
							<p>Your password has been successfully reset.</p>
							<p><strong>Security Notice:</strong> All existing sessions have been logged out for security.</p>
							<p>If you didn't make this change, please contact support immediately.</p>
							<hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
							<p style="font-size: 12px; color: #666; text-align: center;">endlessChatt Security Team</p>
						</div>
					`,
        });
      } catch (emailError) {
        logger.error("Success email failed", { error: emailError.message, email: user.email });
      }
    });

    // Async activity logging
    this.logActivity(user, "password_reset", req).catch(console.error);

    const executionTime = Date.now() - startTime;
    logger.info("Password reset completed", { executionTime: `${executionTime}ms`, userId: user._id });

    return {
      message: "Password reset successfully. Please login with your new password.",
      redirectTo: "/login",
    };
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
      logger.error("Activity logging failed", { error: error.message, userId: user._id });
      // Never throw - logging should not affect user experience
    }
  }
}

export { AuthService };
