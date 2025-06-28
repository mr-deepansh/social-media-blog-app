import { User } from "../../users/models/user.model.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import EmailService from "../../email/services/email.service.js";
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

	const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

	const user = await User.findOne({
		forgotPasswordToken: hashedToken,
		forgotPasswordExpiry: { $gt: Date.now() },
	});

	if (!user) {
		throw new ApiError(400, "Invalid or expired reset token");
	}

	user.password = password;
	user.forgotPasswordToken = undefined;
	user.forgotPasswordExpiry = undefined;
	user.refreshToken = undefined; // Logout user from all devices

	await user.save();

	// Send success notification email
	try {
		const loginUrl = EmailService.generateLoginUrl();

		await EmailService.sendPasswordResetSuccessEmail(
			{
				email: user.email,
				name: user.fullName,
				username: user.username,
			},
			loginUrl,
		);
	} catch (emailError) {
		// Log email error but don't fail the password reset
		console.error("Failed to send success email:", emailError);
	}

	res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});

export { resetPassword };
