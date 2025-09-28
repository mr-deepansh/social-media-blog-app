import { User } from "../../users/models/user.model.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import { AuthService } from "../services/auth.service.js";
import crypto from "crypto";

/**
 * Handle password reset with token validation
 * Resets user password and sends confirmation email
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  // Validate and sanitize inputs
  if (!password || !confirmPassword || typeof password !== "string" || typeof confirmPassword !== "string") {
    throw new ApiError(400, "Both password fields are required and must be strings");
  }

  if (!token || typeof token !== "string" || token.length < 10) {
    throw new ApiError(400, "Invalid reset token");
  }

  // Sanitize token to prevent injection
  const sanitizedToken = token.replace(/[^a-zA-Z0-9\-_.:]/g, "");
  if (sanitizedToken !== token) {
    throw new ApiError(400, "Invalid token format");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }

  // Additional password strength validation
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    throw new ApiError(
      400,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    );
  }

  // Use AuthService for enhanced password reset with sanitized token
  const result = await AuthService.resetPassword(sanitizedToken, password, req);

  res.status(200).json(new ApiResponse(200, {}, result.message));
});

export { resetPassword };
