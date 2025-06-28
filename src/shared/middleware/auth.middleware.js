import { User } from "../../modules/users/models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import Jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
	try {
		const token =
			req.cookies?.accessToken ||
			req.header("Authorization")?.replace("Bearer ", "");

		if (!token) {
			throw new ApiError(401, "Unauthorized request");
		}

		const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

		const user = await User.findById(decodedToken?._id).select(
			"-password -refreshToken",
		);

		if (!user) {
			throw new ApiError(401, "Invalid access token");
		}

		req.user = user;
		next();
	} catch (error) {
		const statusCode = error instanceof ApiError ? error.statusCode : 500;
		const responseMessage =
			error instanceof ApiError ? error.message : "Internal Server Error";

		return res.status(statusCode).json({
			success: false,
			error: responseMessage,
		});
	}
});
