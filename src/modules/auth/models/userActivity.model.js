// src/modules/auth/models/userActivity.model.js
import mongoose, { Schema } from "mongoose";

const userActivitySchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		email: {
			type: String,
			required: true,
			index: true,
		},
		action: {
			type: String,
			required: true,
			enum: [
				"login",
				"logout",
				"register",
				"password_reset",
				"profile_update",
				"email_change",
				"password_change",
				"account_locked",
				"account_unlocked",
				"mfa_enabled",
				"mfa_disabled",
			],
			index: true,
		},
		ip: {
			type: String,
			required: true,
		},
		location: {
			country: String,
			region: String,
			city: String,
			timezone: String,
		},
		device: {
			browser: String,
			version: String,
			os: String,
			device: String,
			userAgent: String,
		},
		success: {
			type: Boolean,
			default: true,
		},
		errorMessage: String,
		sessionId: String,
	},
	{
		timestamps: true,
		collection: "useractivities",
	},
);

// Compound indexes for optimal query performance
userActivitySchema.index({ userId: 1, action: 1, createdAt: -1 });
userActivitySchema.index({ userId: 1, success: 1, createdAt: -1 });
userActivitySchema.index({ userId: 1, action: 1, success: 1 });

// Location-based indexes for geographic queries
userActivitySchema.index({ "location.country": 1, createdAt: -1 });
userActivitySchema.index({ "location.city": 1, "location.country": 1 });

// Security monitoring indexes
userActivitySchema.index({ ip: 1, createdAt: -1 });
userActivitySchema.index({ ip: 1, success: 1 });

// General performance indexes
userActivitySchema.index({ email: 1, createdAt: -1 });
userActivitySchema.index({ sessionId: 1 });

// TTL index to auto-delete old logs after 90 days (enterprise compliance)
// Note: Using createdAt from timestamps: true
userActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export const UserActivity = mongoose.model("UserActivity", userActivitySchema);
