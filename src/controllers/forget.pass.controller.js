import { User } from "../models/user.model.js";
import { asyncHandler } from "../utility/AsyncHandler.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/ApiResponse.js";
import crypto from "crypto";
import { sendEmail } from "../utility/sendEmail.js";
import dotenv from "dotenv";

dotenv.config();

const forgetPassword = asyncHandler(async (req, res) => {
	console.log("Forget password route hit!");
	const { email } = req.body;
	if (!email) {
		throw new ApiError(400, "Email is required");
	}
	console.log("Email received:", email);
	const user = await User.findOne({ email });
	if (!user) {
		throw new ApiError(404, "User with this email does not exist");
	}
	const resetToken = crypto.randomBytes(32).toString("hex");
	user.forgotPasswordToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");
	user.forgotPasswordExpiry = Date.now() + 10 * 60 * 1000;
	await user.save({ validateBeforeSave: false });
	const frontendUrl = process.env.FRONTEND_URL;
	console.log("Loaded FRONTEND_URL:", process.env.FRONTEND_URL);
	const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
	const subject = "Password Reset Request";
	const message = `
		You requested a password reset for your account.
		Click the link below to reset your password:
		${resetUrl}

		This link expires in 10 minutes.

		If you did not request this, please ignore this email.
	`;

	try {
		await sendEmail({
			email: user.email,
			subject,
			message,
		});
		res
			.status(200)
			.json(new ApiResponse(200, {}, "Password reset link sent to your email"));
	} catch (emailError) {
		user.forgotPasswordToken = undefined;
		await user.save({ validateBeforeSave: false });
		throw new ApiError(500, "Error sending email, please try again");
	}
});

export { forgetPassword };
