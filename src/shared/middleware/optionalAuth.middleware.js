// src/shared/middleware/optionalAuth.middleware.js
import jwt from "jsonwebtoken";
import { User } from "../../modules/users/models/user.model.js";

export const optionalAuth = async (req, res, next) => {
  try {
    const token =
			req.cookies?.accessToken ||
			req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      req.user = null;
      return next();
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken",
    );

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without user
    req.user = null;
    next();
  }
};
