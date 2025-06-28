import { User } from "../../users/models/user.model.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import EmailService from "../../email/services/email.service.js";
// import dotenv from "dotenv";

// dotenv.config();

/**
 * Handle forgot password request
 * Sends a password reset link to user's email
 */
const forgetPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;

	// Validate email input
	if (!email || !email.trim()) {
		throw new ApiError(400, "Email is required");
	}

	// Validate email format
	if (!EmailService.isValidEmail(email)) {
		throw new ApiError(400, "Please provide a valid email address");
	}

	// Sanitize email
	const sanitizedEmail = EmailService.sanitizeEmail(email);

	// Find user by email
	const user = await User.findOne({ email: sanitizedEmail });
	if (!user) {
		// Don't reveal if user exists or not for security
		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					{},
					"If an account with this email exists, a password reset link has been sent",
				),
			);
	}

	// Generate reset token using user model method
	const resetToken = user.generateForgotPasswordToken();
	await user.save({ validateBeforeSave: false });

	// Create reset URL
	const resetUrl = EmailService.generateResetUrl(resetToken);

	try {
		// Send forgot password email
		await EmailService.sendForgotPasswordEmail(
			{ email: user.email, name: user.name },
			resetUrl,
		);

		res
			.status(200)
			.json(new ApiResponse(200, {}, "Password reset link sent to your email"));
	} catch (emailError) {
		// Clear reset token if email fails
		user.forgotPasswordToken = undefined;
		user.forgotPasswordExpiry = undefined;
		await user.save({ validateBeforeSave: false });

		console.error("Email sending failed:", emailError);
		throw new ApiError(500, "Error sending email. Please try again later.");
	}
});

export { forgetPassword };
