import { User } from "../models/user.model.js";
import { asyncHandler } from "../utility/AsyncHandler.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/ApiResponse.js";
import crypto from "crypto";

const resetPassword = asyncHandler(async (req, res) => {
	try {
		console.log("Reset password route hit!"); // TODO - Remove this line
		const { token } = req.params;
		const { newPassword, confirmPassword } = req.body;
		if (!newPassword || !confirmPassword) {
			throw new ApiError(400, "Both password fields are required");
		}
		if (newPassword !== confirmPassword) {
			throw new ApiError(400, "Passwords do not match");
		}
		if (newPassword !== confirmPassword) {
			throw new ApiError(400, "Passwords do not match");
		}
		if (newPassword.length < 6) {
			throw new ApiError(400, "Password must be at least 6 characters long");
		}
		console.log("Token received:", token); // TODO - Remove this line
		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
		console.log("Hashed token:", hashedToken); // TODO - Remove this line
		const user = await User.findOne({
			forgotPasswordToken: hashedToken,
			forgotPasswordExpiry: { $gt: Date.now() },
		});

		if (!user) {
			console.log("User not found or token expired."); // TODO - Remove this line
			throw new ApiError(400, "Invalid or expired token");
		}
		console.log("User found:", user.email); // TODO - Remove this line
		user.password = newPassword;
		user.forgotPasswordToken = undefined;
		user.forgotPasswordExpiry = undefined;
		user.refreshToken = undefined; // Logout user from all devices
		await user.save();
		console.log("Password reset successfully!"); // TODO - Remove this line
		res.status(200).json(new ApiResponse(200, {}, "Password reset successful"));
	} catch (error) {
		console.log("Error resetting password:", error.message); // TODO - Remove this line
		res
			.status(error instanceof ApiError ? error.statusCode : 500)
			.json(
				new ApiResponse(
					error instanceof ApiError ? error.statusCode : 500,
					null,
					error.message || "Internal Server Error",
					false,
				),
			);
	}
});

export { resetPassword };
