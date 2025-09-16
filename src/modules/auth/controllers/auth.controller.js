// src/modules/auth/controllers/auth.controller.js
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import { AuthService } from "../services/auth.service.js";
import { User } from "../../users/models/user.model.js";

/**
 * Verify email address
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    throw new ApiError(400, "Verification token is required");
  }
  const result = await AuthService.verifyEmail(token);
  res.status(200).json(new ApiResponse(200, {}, result.message));
});

/**
 * Resend email verification
 */
const resendEmailVerification = asyncHandler(async (req, res) => {
  // First fix the schema issue by updating the document directly
  await User.updateOne(
    { _id: req.user._id, coverImage: { $type: "string" } },
    { $set: { coverImage: { url: "", publicId: "" } } },
  );
  await User.updateOne(
    { _id: req.user._id, avatar: { $type: "string" } },
    { $set: { avatar: { url: "", publicId: "" } } },
  );

  // Now fetch the user document
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }
  // Generate new verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  // Send verification email
  await AuthService.sendWelcomeEmail(user, verificationToken, req);
  res.status(200).json(new ApiResponse(200, {}, "Verification email sent successfully"));
});

// Removed - moved to activity.controller.js

/**
 * Get security overview
 */
const getSecurityOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Fetch user with Mongoose methods (not lean)
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const securityOverview = {
    accountSecurity: {
      isEmailVerified: user.isEmailVerified,
      twoFactorEnabled: user.security?.twoFactorEnabled || false,
      lastPasswordChange: user.security?.lastPasswordChange,
      failedLoginAttempts: user.security?.failedLoginAttempts || 0,
      isAccountLocked: user.isAccountLocked(),
    },
    recentActivity: {
      lastLogin: user.activityLog
        .filter(log => log.action === "login" && log.success)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0],
      lastActive: user.lastActive,
      recentLogins: user.activityLog
        .filter(log => log.action === "login")
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5),
    },
    deviceInfo: {
      lastLoginIP: user.security?.lastLoginIP,
      lastLoginLocation: user.security?.lastLoginLocation,
    },
  };
  res.status(200).json(new ApiResponse(200, securityOverview, "Security overview fetched successfully"));
});

export { verifyEmail, resendEmailVerification, getSecurityOverview };
