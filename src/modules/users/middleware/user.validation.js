// src/modules/users/middleware/user.validation.js
import { body, query, param } from "express-validator";

// Validation for feed endpoint
const getFeed = [
	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Page must be a positive integer"),
	query("limit")
		.optional()
		.isInt({ min: 1, max: 50 })
		.withMessage("Limit must be between 1 and 50"),
	query("sortBy")
		.optional()
		.isIn(["createdAt", "updatedAt", "likes", "comments"])
		.withMessage("Invalid sort field"),
	query("sortOrder")
		.optional()
		.isIn(["asc", "desc"])
		.withMessage("Sort order must be 'asc' or 'desc'"),
];

// Validation for followers endpoint
const getFollowers = [
	param("userId").isMongoId().withMessage("Invalid user ID"),
	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Page must be a positive integer"),
	query("limit")
		.optional()
		.isInt({ min: 1, max: 50 })
		.withMessage("Limit must be between 1 and 50"),
	query("search")
		.optional()
		.isString()
		.trim()
		.isLength({ min: 1, max: 50 })
		.withMessage("Search query must be between 1 and 50 characters"),
];

// Validation for following endpoint
const getFollowing = [
	param("userId").isMongoId().withMessage("Invalid user ID"),
	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Page must be a positive integer"),
	query("limit")
		.optional()
		.isInt({ min: 1, max: 50 })
		.withMessage("Limit must be between 1 and 50"),
	query("search")
		.optional()
		.isString()
		.trim()
		.isLength({ min: 1, max: 50 })
		.withMessage("Search query must be between 1 and 50 characters"),
];

// Validation for follow/unfollow
const followUser = [param("userId").isMongoId().withMessage("Invalid user ID")];

// Export these along with your existing validations
export const userValidation = {
	// ... your existing validations
	getFeed,
	getFollowers,
	getFollowing,
	followUser,
};
