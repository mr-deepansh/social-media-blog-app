import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../../users/models/user.model.js";
import { UserActivity } from "../models/userActivity.model.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { sendEmail } from "../../../shared/utils/sendEmail.js";
import { UAParser } from "ua-parser-js";
import * as geoip from "geoip-lite";

/**
 * Enterprise AuthService - Handles authentication & authorization
 */
class AuthService {
	// Register User
	static async registerUser(userData, req) {
		const { username, email, password, firstName, lastName, bio, avatar } =
			userData;

		// Ensure role is not passed from client - always default to 'user'
		delete userData.role;
		// Check for existing email and username separately for specific error messages
		const [existingEmail, existingUsername] = await Promise.all([
			User.findOne({ email: email.toLowerCase() }).lean(),
			User.findOne({ username: username.toLowerCase() }).lean(),
		]);
		if (existingEmail && existingUsername) {
			throw new ApiError(
				409,
				"Both username and email are already registered",
				{
					conflicts: ["username", "email"],
					suggestions: [
						"Try a different username and email",
						"Login if you already have an account",
					],
				},
			);
		}
		if (existingEmail) {
			throw new ApiError(409, "Email address is already registered", {
				conflicts: ["email"],
				suggestions: [
					"Use a different email address",
					"Try logging in instead",
				],
			});
		}
		if (existingUsername) {
			throw new ApiError(409, "Username is already taken", {
				conflicts: ["username"],
				suggestions: [
					"Choose a different username",
					"Try adding numbers or underscores",
				],
			});
		}
		// Create user
		const hashedPassword = await bcrypt.hash(password, 12);
		const user = await User.create({
			username: username.toLowerCase(),
			email: email.toLowerCase(),
			password: hashedPassword,
			firstName,
			lastName,
			bio,
			avatar,
			isActive: true,
			// role will default to 'user' from schema
		});

		await this.logActivity(user, "register", req);
		return user;
	}
	// Check Availability
	static async checkAvailability(field, value) {
		const query =
			field === "email"
				? { email: value.toLowerCase() }
				: { username: value.toLowerCase() };
		const exists = await User.findOne(query).lean();
		return {
			available: !exists,
			field,
			value,
			message: exists
				? `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken`
				: `${field.charAt(0).toUpperCase() + field.slice(1)} is available`,
		};
	}
	// Login User
	static async loginUser({ identifier, password }, req) {
		const user = await User.findOne({
			$or: [
				{ email: identifier.toLowerCase() },
				{ username: identifier.toLowerCase() },
			],
			isActive: true,
		});
		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw new ApiError(401, "Invalid credentials");
		}
		const { accessToken, refreshToken } = this.generateTokens(user._id);
		user.refreshToken = refreshToken;
		user.lastActive = new Date();
		await user.save({ validateBeforeSave: false });
		await this.logActivity(user, "login", req);
		return {
			user: await User.findById(user._id).select("-password -refreshToken"),
			accessToken,
			refreshToken,
		};
	}
	// Generate JWT Tokens
	static generateTokens(userId) {
		const accessToken = jwt.sign(
			{ _id: userId },
			process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET,
			{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1h" },
		);
		const refreshToken = jwt.sign(
			{ _id: userId },
			process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
			{ expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" },
		);
		return { accessToken, refreshToken };
	}
	// Refresh Token
	static async refreshToken(oldRefreshToken) {
		try {
			const decoded = jwt.verify(
				oldRefreshToken,
				process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
			);
			const user = await User.findById(decoded._id);
			if (!user || user.refreshToken !== oldRefreshToken) {
				throw new ApiError(401, "Invalid refresh token");
			}
			const { accessToken, refreshToken } = this.generateTokens(user._id);
			user.refreshToken = refreshToken;
			await user.save({ validateBeforeSave: false });
			return { accessToken, refreshToken };
		} catch {
			throw new ApiError(401, "Invalid or expired refresh token");
		}
	}
	// Forgot Password
	static async processForgotPassword(email, req) {
		const user = await User.findOne({ email: email.toLowerCase() });
		if (!user) throw new ApiError(404, "User not found");
		const resetToken = crypto.randomBytes(32).toString("hex");
		const resetPasswordToken = crypto
			.createHash("sha256")
			.update(resetToken)
			.digest("hex");
		user.resetPasswordToken = resetPasswordToken;
		user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
		await user.save({ validateBeforeSave: false });
		const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${resetToken}`;
		await sendEmail({
			email: user.email,
			subject: "Password Reset Request",
			message: `Reset your password: ${resetUrl}`,
		});

		return true;
	}
	// Reset Password
	static async resetPassword(resetToken, newPassword) {
		const hashedToken = crypto
			.createHash("sha256")
			.update(resetToken)
			.digest("hex");
		const user = await User.findOne({
			resetPasswordToken: hashedToken,
			resetPasswordExpire: { $gt: Date.now() },
		});
		if (!user) throw new ApiError(400, "Invalid or expired reset token");
		user.password = await bcrypt.hash(newPassword, 12);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;
		user.refreshToken = undefined; // Invalidate existing sessions
		await user.save();
		// Send confirmation email
		await sendEmail({
			email: user.email,
			subject: "Password Reset Confirmation",
			message: "Your password has been successfully reset.",
		});
		return true;
	}
	// Verify Email
	static async verifyEmail(token) {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded._id);
		if (!user) throw new ApiError(404, "User not found");
		if (user.isVerified) throw new ApiError(400, "Email already verified");
		user.isVerified = true;
		await user.save();
		return true;
	}
	// Logout User
	static async logoutUser(user, req) {
		user.refreshToken = undefined;
		await user.save({ validateBeforeSave: false });
		await this.logActivity(user, "logout", req);
		return true;
	}
	// Activity Logger
	static async logActivity(
		user,
		action,
		req,
		success = true,
		errorMessage = null,
	) {
		try {
			if (!req) return; // Skip if no request context
			const ip =
				req.headers["x-forwarded-for"]?.split(",")[0] ||
				req.connection?.remoteAddress ||
				"127.0.0.1";
			const uaParser = new UAParser(req.headers["user-agent"]);
			const uaResult = uaParser.getResult();
			const geo = geoip.lookup(ip === "127.0.0.1" ? null : ip) || {};
			await UserActivity.create({
				userId: user._id,
				email: user.email,
				action,
				ip,
				location: {
					country: geo.country || "Unknown",
					region: geo.region || "Unknown",
					city: geo.city || "Unknown",
					timezone: geo.timezone || "UTC",
				},
				device: {
					browser: uaResult.browser?.name || "Unknown",
					version: uaResult.browser?.version || "Unknown",
					os: uaResult.os?.name || "Unknown",
					device: uaResult.device?.model || "Desktop",
					userAgent: req.headers["user-agent"] || "Unknown",
				},
				success,
				errorMessage,
			});
		} catch (error) {
			console.error("Activity logging failed:", error.message);
		}
	}
}

export { AuthService };
