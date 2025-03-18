import { User } from "../models/user.model.js";
import { asyncHandler } from "../utility/AsyncHandler.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/ApiResponse.js";
import crypto from "crypto";

const resetPassword = asyncHandler(async (req, res) => {
	try {
		const { token } = req.params;
		const { newPassword } = req.body;
		if (newPassword.length < 6) {
			throw new ApiError(400, "Password must be at least 6 characters long");
		}
		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
		const user = await User.findOne({
			forgotPasswordToken: hashedToken,
			forgotPasswordExpiry: { $gt: Date.now() },
		});
		if (!user) {
			throw new ApiError(400, "Invalid or expired token");
		}
		await user.resetPassword(newPassword);
		user.refreshToken = undefined; // Logout user from all devices
		await user.save();
		res.status(200).json(new ApiResponse(200, "Password reset successful"));
	} catch (error) {
		if (error instanceof ApiError) {
			res
				.status(error.statusCode)
				.json(new ApiResponse(error.statusCode, null, error.message, false));
		} else {
			res
				.status(500)
				.json(new ApiResponse(500, null, "Internal Server Error", false));
		}
	}
});

export { resetPassword };
