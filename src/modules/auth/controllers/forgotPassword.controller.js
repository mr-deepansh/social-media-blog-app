import { User } from "../../users/models/user.model.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import { AuthService } from "../services/auth.service.js";
import { calculateApiHealth } from "../../../shared/utils/ApiHealth.js";
import { safeAsyncOperation, handleControllerError } from "../../../shared/utils/ErrorHandler.js";
import { Logger } from "../../../shared/utils/Logger.js";

const logger = new Logger("ForgotPasswordController");
// import dotenv from "dotenv";

// dotenv.config();

/**
 * Handle forgot password request
 * Sends a password reset link to user's email
 */
const forgetPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;

	if (!email) {
		throw new ApiError(400, "Email is required");
	}

	// Use AuthService for enhanced forgot password
	const result = await AuthService.processForgotPassword(email, req);

	return res.status(200).json(new ApiResponse(200, {}, result.message));
});

export { forgetPassword };
