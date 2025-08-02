// src/shared/middleware/isAdmin.middleware.js
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export const isAdmin = (req, res, next) => {
	// console.log("🛡️ isAdmin middleware called");
	// console.log("👤 User from req:", req.user ? "Exists" : "Not found");

	// if (req.user) {
	// 	console.log("👤 User details:", {
	// 		id: req.user._id,
	// 		email: req.user.email,
	// 		role: req.user.role,
	// 		isActive: req.user.isActive,
	// 	});
	// }

	if (!req.user) {
		// console.log("❌ No user found in request");
		throw new ApiError(401, "User not authenticated");
	}
	if (!req.user.role || req.user.role !== "admin") {
		// console.log("❌ User is not admin. Current role:", req.user.role);
		throw new ApiError(403, "Access denied. Admins only.");
	}
	// console.log("✅ Admin access granted");
	next();
};
export const verifySuperAdmin = asyncHandler(async (req, res, next) => {
	if (!req.user) {
		throw new ApiError(401, "Authentication required");
	}
	if (req.user.role !== "superadmin") {
		throw new ApiError(403, "Super admin access required");
	}
	next();
});
