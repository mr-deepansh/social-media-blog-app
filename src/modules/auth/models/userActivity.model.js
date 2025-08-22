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

// Indexes for performance
userActivitySchema.index({ userId: 1, createdAt: -1 });
userActivitySchema.index({ action: 1, createdAt: -1 });
userActivitySchema.index({ ip: 1 });
userActivitySchema.index({ createdAt: -1 });

// TTL index to auto-delete old logs after 90 days
userActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export const UserActivity = mongoose.model("UserActivity", userActivitySchema);
