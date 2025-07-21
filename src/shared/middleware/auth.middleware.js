// src/shared/middleware/auth.middleware.js
import { User } from "../../modules/users/models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import Jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
	/* 	console.log("🔐 verifyJWT middleware called");
	console.log("📋 Headers Authorization:", req.header("Authorization"));
	console.log("🍪 Cookies accessToken:", req.cookies?.accessToken); */

	const token =
		req.cookies?.accessToken ||
		req.header("Authorization")?.replace("Bearer ", "");

	/* 	console.log("🎫 Token found:", token ? "Yes" : "No");
	console.log(
		"🎫 Token preview:",
		token ? token.substring(0, 20) + "..." : "None",
	); */

	if (!token) {
		// console.log("❌ No token provided");
		throw new ApiError(401, "Unauthorized request");
	}

	const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
	// console.log("🔓 Token decoded successfully:", decodedToken);

	const user = await User.findById(decodedToken?._id).select(
		"-password -refreshToken",
	);

	// console.log("👤 User found:", user ? "Yes" : "No");
	// if (user) {
	// 	console.log("👤 User details:", {
	// 		id: user._id,
	// 		email: user.email,
	// 		role: user.role,
	// 		isActive: user.isActive,
	// 	});
	// }

	if (!user) {
		// console.log("❌ Invalid access token - user not found");
		throw new ApiError(401, "Invalid access token");
	}

	// Check if user is active
	if (user.isActive === false) {
		// console.log("❌ User account is suspended");
		throw new ApiError(403, "Account suspended. Contact administrator.");
	}

	req.user = user;
	// console.log("✅ Authentication successful");
	next();
});
