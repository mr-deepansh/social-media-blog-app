// src/shared/middleware/isAdmin.middleware.js
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { USER_ROLES } from "../constants/app.constants.js";

// Admin access (admin + super_admin)
export const isAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user?.role) {
    throw new ApiError(401, "Authentication required");
  }

  if (req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Admin access required");
  }

  next();
});

// Super admin exclusive access
export const isSuperAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user?.role) {
    throw new ApiError(401, "Authentication required");
  }

  if (req.user.role !== USER_ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Super admin access required");
  }

  next();
});
