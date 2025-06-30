// user.validator.js
import { z } from "zod";

export const userValidation = {
	// Schema for user registration
	createUser: z
		.object({
			username: z
				.string()
				.min(3, "Username must be at least 3 characters long")
				.max(30, "Username cannot exceed 30 characters")
				.regex(
					/^[a-zA-Z0-9_]+$/,
					"Username must contain only alphanumeric characters and underscores",
				),
			email: z.string().email("Please provide a valid email address"),
			password: z
				.string()
				.min(8, "Password must be at least 8 characters long")
				.regex(
					/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
					"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
				),
			confirmPassword: z.string(),
			firstName: z
				.string()
				.min(2, "First name must be at least 2 characters long")
				.max(50, "First name cannot exceed 50 characters"),
			lastName: z
				.string()
				.min(2, "Last name must be at least 2 characters long")
				.max(50, "Last name cannot exceed 50 characters"),
			bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
			avatar: z.string().url("Avatar must be a valid URL").optional(),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "Passwords don't match",
			path: ["confirmPassword"],
		}),

	// Schema for user login
	loginUser: z.object({
		email: z.string().email("Please provide a valid email address"),
		password: z.string().min(1, "Password is required"),
	}),

	// Schema for user profile updates
	updateUser: z.object({
		username: z
			.string()
			.min(3, "Username must be at least 3 characters long")
			.max(30, "Username cannot exceed 30 characters")
			.regex(
				/^[a-zA-Z0-9_]+$/,
				"Username must contain only alphanumeric characters and underscores",
			)
			.optional(),
		email: z.string().email("Please provide a valid email address").optional(),
		firstName: z
			.string()
			.min(2, "First name must be at least 2 characters long")
			.max(50, "First name cannot exceed 50 characters")
			.optional(),
		lastName: z
			.string()
			.min(2, "Last name must be at least 2 characters long")
			.max(50, "Last name cannot exceed 50 characters")
			.optional(),
		bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
		avatar: z.string().url("Avatar must be a valid URL").optional(),
		isActive: z.boolean().optional(),
		role: z
			.enum(["user", "admin", "moderator"], {
				errorMap: () => ({
					message: "Role must be one of: user, admin, moderator",
				}),
			})
			.optional(),
	}),

	// Schema for profile updates (current user)
	updateProfile: z.object({
		username: z
			.string()
			.min(3, "Username must be at least 3 characters long")
			.max(30, "Username cannot exceed 30 characters")
			.regex(
				/^[a-zA-Z0-9_]+$/,
				"Username must contain only alphanumeric characters and underscores",
			)
			.optional(),
		firstName: z
			.string()
			.min(2, "First name must be at least 2 characters long")
			.max(50, "First name cannot exceed 50 characters")
			.optional(),
		lastName: z
			.string()
			.min(2, "Last name must be at least 2 characters long")
			.max(50, "Last name cannot exceed 50 characters")
			.optional(),
		bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
		avatar: z.string().url("Avatar must be a valid URL").optional(),
	}),

	// Schema for password change
	changePassword: z
		.object({
			currentPassword: z.string().min(1, "Current password is required"),
			newPassword: z
				.string()
				.min(8, "New password must be at least 8 characters long")
				.regex(
					/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
					"New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
				),
			confirmNewPassword: z.string(),
		})
		.refine((data) => data.newPassword === data.confirmNewPassword, {
			message: "New passwords don't match",
			path: ["confirmNewPassword"],
		}),

	// Schema for user ID parameter
	userId: z.object({
		id: z
			.string()
			.regex(/^[0-9a-fA-F]{24}$/, "User ID must be a valid MongoDB ObjectId"),
	}),

	// Schema for pagination and filtering
	getUsers: z.object({
		page: z.coerce
			.number()
			.int("Page must be an integer")
			.min(1, "Page must be at least 1")
			.default(1),
		limit: z.coerce
			.number()
			.int("Limit must be an integer")
			.min(1, "Limit must be at least 1")
			.max(100, "Limit cannot exceed 100")
			.default(10),
		search: z
			.string()
			.min(2, "Search term must be at least 2 characters long")
			.max(50, "Search term cannot exceed 50 characters")
			.optional(),
		role: z
			.enum(["user", "admin", "moderator"], {
				errorMap: () => ({
					message: "Role must be one of: user, admin, moderator",
				}),
			})
			.optional(),
		isActive: z.coerce.boolean().optional(),
		sortBy: z
			.enum(
				[
					"username",
					"email",
					"firstName",
					"lastName",
					"createdAt",
					"updatedAt",
				],
				{
					errorMap: () => ({
						message:
							"Sort by must be one of: username, email, firstName, lastName, createdAt, updatedAt",
					}),
				},
			)
			.default("createdAt"),
		sortOrder: z
			.enum(["asc", "desc"], {
				errorMap: () => ({ message: "Sort order must be either asc or desc" }),
			})
			.default("desc"),
	}),
};
