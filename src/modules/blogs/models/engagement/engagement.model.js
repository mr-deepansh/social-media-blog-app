// src/modules/blogs/models/engagement/engagement.model.js
import mongoose, { Schema } from "mongoose";
import { baseSchema, baseOptions } from "../shared/base.model.js";

// Like model
const likeSchema = new Schema(
	{
		...baseSchema,
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		target: { type: Schema.Types.ObjectId, required: true },
		targetType: { type: String, enum: ["post", "comment"], required: true },
		reaction: {
			type: String,
			enum: ["like", "love", "laugh", "angry", "sad"],
			default: "like",
		},
	},
	baseOptions,
);

likeSchema.index({ user: 1, target: 1, targetType: 1 }, { unique: true });
likeSchema.index({ target: 1, targetType: 1, createdAt: -1 });

// Share model
const shareSchema = new Schema(
	{
		...baseSchema,
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },
		post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
		platform: {
			type: String,
			enum: ["internal", "twitter", "facebook", "linkedin", "whatsapp"],
			default: "internal",
		},
		message: String,
		isPublic: { type: Boolean, default: true },
	},
	baseOptions,
);

shareSchema.index({ user: 1, post: 1 });
shareSchema.index({ post: 1, createdAt: -1 });

// Bookmark model
const bookmarkSchema = new Schema(
	{
		...baseSchema,
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },
		post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
		collection: String, // for organizing bookmarks
		notes: String,
	},
	baseOptions,
);

bookmarkSchema.index({ user: 1, post: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, collection: 1 });

// View model for analytics
const viewSchema = new Schema(
	{
		...baseSchema,
		user: { type: Schema.Types.ObjectId, ref: "User" },
		post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
		ip: String,
		userAgent: String,
		duration: Number, // time spent viewing
		source: String, // referrer
		device: String,
		location: {
			country: String,
			city: String,
			coordinates: { lat: Number, lng: Number },
		},
	},
	baseOptions,
);

viewSchema.index({ post: 1, createdAt: -1 });
viewSchema.index({ user: 1, createdAt: -1 });
viewSchema.index({ ip: 1, post: 1 });

// Repost model
const repostSchema = new Schema(
	{
		...baseSchema,
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },
		originalPost: { type: Schema.Types.ObjectId, ref: "Post", required: true },
		quote: { type: String, trim: true, maxlength: 280 },
		type: { type: String, enum: ["simple", "quote"], default: "simple" },
		visibility: {
			type: String,
			enum: ["public", "followers", "private"],
			default: "public",
		},
	},
	baseOptions,
);

repostSchema.index({ user: 1, originalPost: 1 }, { unique: true });
repostSchema.index({ originalPost: 1, createdAt: -1 });

export const Like = mongoose.model("Like", likeSchema);
export const Share = mongoose.model("Share", shareSchema);
export const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
export const View = mongoose.model("View", viewSchema);
export const Repost = mongoose.model("Repost", repostSchema);
