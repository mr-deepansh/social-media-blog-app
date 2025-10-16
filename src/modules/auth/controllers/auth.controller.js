// src/modules/auth/controllers/auth.controller.js
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import { AuthService } from "../services/auth.service.js";
import { User } from "../../users/models/user.model.js";
import { logger } from "../../../shared/services/logger.service.js";
import { MESSAGES, HTTP_STATUS } from "../../../shared/constants/index.js";

/*
 * Verify email address
 * @route POST /auth/verify-email/:token
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const clientIP = req.ip || req.connection.remoteAddress;

  // Input validation
  if (!token?.trim()) {
    logger.warn("Email verification attempted without token", { ip: clientIP });
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, MESSAGES.AUTH.TOKEN_REQUIRED);
  }
  // Verify email with enhanced logging
  logger.info("Email verification attempt", { token: `${token.substring(0, 10)}...`, ip: clientIP });
  const result = await AuthService.verifyEmail(token);
  logger.info("Email verification successful", { userId: result.userId, ip: clientIP });
  return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { verified: true }, result.message));
});

/*
 * Resend email verification
 * @route POST /auth/resend-verification
 * @access Private
 */
const resendEmailVerification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const clientIP = req.ip || req.connection.remoteAddress;

  logger.info("Resend verification attempt", { userId, ip: clientIP });
  // Fetch user with optimized query
  const user = await User.findById(userId).select(
    "email isEmailVerified emailVerificationToken emailVerificationExpires avatar coverImage",
  );
  if (!user) {
    logger.error("User not found for verification resend", { userId, ip: clientIP });
    throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.USER.NOT_FOUND);
  }
  // Check if already verified
  if (user.isEmailVerified) {
    logger.warn("Verification resend for already verified email", { userId, email: user.email });
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, MESSAGES.AUTH.EMAIL_ALREADY_VERIFIED);
  }
  // Rate limiting check (prevent spam)
  const lastTokenGenerated = user.emailVerificationExpires;
  if (lastTokenGenerated && Date.now() - lastTokenGenerated < 60000) {
    // 1 minute cooldown
    throw new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, MESSAGES.AUTH.VERIFICATION_COOLDOWN);
  }

  try {
    // Generate and send verification email
    const result = await AuthService.resendVerificationEmail(user, req);
    logger.info("Verification email resent successfully", { userId, email: user.email });
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { emailSent: true }, result.message));
  } catch (error) {
    logger.error("Failed to resend verification email", { userId, error: error.message });
    throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.AUTH.VERIFICATION_SEND_FAILED);
  }
});

// Removed - moved to activity.controller.js

/*
 * Get security overview
 * @route GET /auth/security-overview
 * @access Private
 */
const getSecurityOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const clientIP = req.ip || req.connection.remoteAddress;

  logger.info("Security overview requested", { userId, ip: clientIP });
  // Optimized query with specific field selection
  const user = await User.findById(userId).select("isEmailVerified security lastActive activityLog").lean();
  if (!user) {
    logger.error("User not found for security overview", { userId, ip: clientIP });
    throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.USER.NOT_FOUND);
  }
  // Build security overview with null safety
  const securityOverview = await AuthService.buildSecurityOverview(user);
  logger.info("Security overview generated successfully", { userId });
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, securityOverview, MESSAGES.AUTH.SECURITY_OVERVIEW_SUCCESS));
});
export { verifyEmail, resendEmailVerification, getSecurityOverview };
