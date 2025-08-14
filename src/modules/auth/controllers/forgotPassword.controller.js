import { User } from "../../users/models/user.model.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import EmailService from "../../email/services/email.service.js";
import { calculateApiHealth } from "../../../shared/utils/ApiHealth.js";
import {
	safeAsyncOperation,
	handleControllerError,
} from "../../../shared/utils/ErrorHandler.js";
import { Logger } from "../../../shared/utils/Logger.js";

const logger = new Logger("ForgotPasswordController");
// import dotenv from "dotenv";

// dotenv.config();

/**
 * Handle forgot password request
 * Sends a password reset link to user's email
 */
const forgetPassword = asyncHandler(async (req, res) => {
	const startTime = Date.now();
	const clientIP = req.ip || req.connection.remoteAddress;
	try {
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
		const executionTime = Date.now() - startTime;

		if (!user) {
			// Don't reveal if user exists or not for security
			logger.info("Password reset requested for non-existent email", {
				email: sanitizedEmail,
				clientIP,
				executionTime,
			});
			return res.status(200).json(
				new ApiResponse(
					200,
					{
						meta: {
							executionTime: `${executionTime}ms`,
							apiHealth: calculateApiHealth(executionTime),
							securityNote: "Response time normalized for security",
						},
					},
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

			const finalExecutionTime = Date.now() - startTime;
			logger.info("Password reset email sent successfully", {
				userId: user._id,
				email: sanitizedEmail,
				clientIP,
				executionTime: finalExecutionTime,
			});

			res.status(200).json(
				new ApiResponse(
					200,
					{
						meta: {
							executionTime: `${finalExecutionTime}ms`,
							apiHealth: calculateApiHealth(finalExecutionTime),
							sentAt: new Date().toISOString(),
							nextSteps: [
								"Check your email inbox",
								"Look in spam/junk folder",
								"Link expires in 10 minutes",
							],
						},
					},
					"Password reset link sent to your email",
				),
			);
		} catch (emailError) {
			// Clear reset token if email fails
			user.forgotPasswordToken = undefined;
			user.forgotPasswordExpiry = undefined;
			await user.save({ validateBeforeSave: false });

			logger.error("Email sending failed", {
				userId: user._id,
				error: emailError.message,
				clientIP,
			});
			throw new ApiError(500, "Error sending email. Please try again later.");
		}
	} catch (error) {
		// Enhanced fallback strategy
		const fallbackResponse = await safeAsyncOperation(
			() => ({
				message: "Password reset service temporarily unavailable",
				status: "retry_later",
				suggestions: [
					"Verify your email address is correct",
					"Check your internet connection",
					"Try again in a few minutes",
					"Contact support if issue persists",
				],
			}),
			null,
			false,
		);

		if (error.message?.includes("Email") && fallbackResponse) {
			return res.status(503).json(
				new ApiResponse(
					503,
					{
						...fallbackResponse,
						meta: {
							executionTime: `${Date.now() - startTime}ms`,
							apiHealth: calculateApiHealth(Date.now() - startTime),
							dataFreshness: "error_fallback",
							warning: "Email service temporarily unavailable",
						},
					},
					"Password reset temporarily unavailable",
				),
			);
		}

		handleControllerError(error, req, res, startTime, logger);
	}
});

export { forgetPassword };
