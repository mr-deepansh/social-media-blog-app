import { z } from "zod";

const passwordRegex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const zodValidation = {
	// Register/Create user
	createUser: z
		.object({
			username: z
				.string()
				.min(3, "Username must be at least 3 characters")
				.max(30, "Username cannot exceed 30 characters")
				.regex(
					/^[a-zA-Z0-9_]+$/,
					"Only alphanumeric characters and underscores",
				)
				.trim(),
			email: z.string().email("Enter a valid email").trim().toLowerCase(),
			password: z
				.string()
				.min(8, "Password must be at least 8 characters")
				.regex(
					passwordRegex,
					"Password must contain uppercase, lowercase, number, and special character",
				),
			confirmPassword: z.string(),
			firstName: z.string().min(2).max(50).trim(),
			lastName: z.string().min(2).max(50).trim(),
			bio: z.string().max(500).optional(),
			avatar: z.string().url("Avatar must be a valid URL").optional(),
			role: z.enum(["user", "admin", "moderator"]).optional(),
		})
		.strict()
		.refine((data) => data.password === data.confirmPassword, {
			message: "Passwords don't match",
			path: ["confirmPassword"],
		})
		.refine((data) => data.username !== data.password, {
			message: "Username and password cannot be the same",
			path: ["password"],
		}),

	// Login
	loginUser: z
		.object({
			email: z.string().email().trim().toLowerCase(),
			password: z.string().min(1, "Password is required"),
		})
		.strict(),

	// Update user
	updateUser: z
		.object({
			username: z
				.string()
				.min(3)
				.max(30)
				.regex(/^[a-zA-Z0-9_]+$/)
				.trim()
				.optional(),
			email: z.string().email().trim().toLowerCase().optional(),
			firstName: z.string().min(2).max(50).trim().optional(),
			lastName: z.string().min(2).max(50).trim().optional(),
			bio: z.string().max(500).optional(),
			avatar: z.string().url().optional(),
			isActive: z.boolean().optional(),
			role: z
				.enum(["user", "admin", "moderator"], {
					errorMap: () => ({
						message: "Role must be one of: user, admin, moderator",
					}),
				})
				.optional(),
		})
		.strict(),
	// Search users
	searchUser: z
		.object({
			search: z
				.string()
				.min(2, "Search query must be at least 2 characters")
				.optional(),
			username: z
				.string()
				.min(2, "Username must be at least 2 characters")
				.optional(),
			firstName: z
				.string()
				.min(2, "First name must be at least 2 characters")
				.optional(),
			lastName: z
				.string()
				.min(2, "Last name must be at least 2 characters")
				.optional(),
			page: z
				.string()
				.regex(/^\d+$/, "Page must be a number")
				.transform(Number)
				.optional(),
			limit: z
				.string()
				.regex(/^\d+$/, "Limit must be a number")
				.transform(Number)
				.optional(),
			sortBy: z
				.enum(["relevance", "followers", "newest", "username"])
				.optional(),
			includePrivate: z
				.string()
				.transform((val) => val === "true")
				.optional(),
		})
		.refine(
			(data) => data.search || data.username || data.firstName || data.lastName,
			{
				message: "At least one search parameter is required",
				path: ["search"],
			},
		),
	// .strict(),

	// Update own profile
	updateProfile: z
		.object({
			username: z
				.string()
				.min(3)
				.max(30)
				.regex(/^[a-zA-Z0-9_]+$/)
				.trim()
				.optional(),
			firstName: z.string().min(2).max(50).trim().optional(),
			lastName: z.string().min(2).max(50).trim().optional(),
			bio: z.string().max(500).optional(),
			avatar: z.string().url().optional(),
		})
		.strict(),

	// Change password
	changePassword: z
		.object({
			currentPassword: z.string().min(1, "Current password is required"),
			newPassword: z
				.string()
				.min(8)
				.regex(
					passwordRegex,
					"New password must contain uppercase, lowercase, number, and special character",
				),
			confirmNewPassword: z.string(),
		})
		.strict()
		.refine((data) => data.newPassword === data.confirmNewPassword, {
			message: "New passwords don't match",
			path: ["confirmNewPassword"],
		})
		.refine((data) => data.currentPassword !== data.newPassword, {
			message: "New password must be different from current password",
			path: ["newPassword"],
		}),

	// User ID param
	userId: z
		.object({
			id: z
				.string()
				.regex(/^[0-9a-fA-F]{24}$/, "Must be a valid MongoDB ObjectId"),
		})
		.strict(),

	// Get users with filters
	getUsers: z
		.object({
			page: z.coerce.number().int().min(1).default(1),
			limit: z.coerce.number().int().min(1).max(100).default(10),
			search: z.string().min(2).max(50).optional(),
			role: z.enum(["user", "admin", "moderator"]).optional(),
			isActive: z.coerce.boolean().optional(),
			sortBy: z
				.enum([
					"username",
					"email",
					"firstName",
					"lastName",
					"createdAt",
					"updatedAt",
				])
				.default("createdAt"),
			sortOrder: z.enum(["asc", "desc"]).default("desc"),
		})
		.strict(),
	getFollowers: z
		.object({
			page: z.coerce.number().int().min(1).default(1),
			limit: z.coerce.number().int().min(1).max(100).default(50),
		})
		.strict(),

	getFollowing: z
		.object({
			page: z.coerce.number().int().min(1).default(1),
			limit: z.coerce.number().int().min(1).max(100).default(50),
		})
		.strict(),

	getFeed: z
		.object({
			page: z.coerce.number().int().min(1).default(1),
			limit: z.coerce.number().int().min(1).max(100).default(20),
			sort: z
				.enum(["recent", "popular", "trending"])
				.optional()
				.default("recent"),
		})
		.strict(),
};
