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

	if (!password || !confirmPassword) {
		throw new ApiError(400, "Both password fields are required");
	}

	if (password !== confirmPassword) {
		throw new ApiError(400, "Passwords do not match");
	}

	if (password.length < 8) {
		throw new ApiError(400, "Password must be at least 8 characters long");
	}

	// Use AuthService for enhanced password reset
	const result = await AuthService.resetPassword(token, password, req);

	res.status(200).json(new ApiResponse(200, {}, result.message));
});

export { resetPassword };
