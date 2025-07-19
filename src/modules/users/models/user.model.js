import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
	{
		username: {
			type: String,
			trim: true,
			index: true,
			unique: true,
			required: true,
			lowercase: true,
		},
		email: {
			type: String,
			trim: true,
			unique: true,
			required: true,
			lowercase: true,
		},
		firstName: {
			type: String,
			trim: true,
		},
		lastName: {
			type: String,
			trim: true,
		},
		bio: {
			type: String,
			default: "",
		},
		password: {
			type: String,
			minlength: 8,
			required: [true, "Password is required"],
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		refreshToken: String,
		forgotPasswordToken: String,
		forgotPasswordExpiry: Date,
		avatar: {
			type: String,
			default: "",
		},
		coverImage: {
			type: String,
			default: "",
		},
		followers: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],
		following: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],
		watchHistory: [
			{
				type: Schema.Types.ObjectId,
				ref: "Video",
			},
		],
		preferences: {
			theme: {
				type: String,
				enum: ["light", "dark"],
				default: "light",
			},
			emailNotifications: {
				type: Boolean,
				default: true,
			},
			pushNotifications: {
				type: Boolean,
				default: true,
			},
		},
	},
	{ timestamps: true },
);

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual("fullName").get(function () {
	return `${this.firstName} ${this.lastName}`;
});

// Virtual for followers count
userSchema.virtual("followersCount").get(function () {
	return this.followers?.length || 0;
});

// Virtual for following count
userSchema.virtual("followingCount").get(function () {
	return this.following?.length || 0;
});
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
	return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
	return Jwt.sign(
		{
			_id: this._id,
			email: this.email,
			username: this.username,
			firstName: this.firstName,
			lastName: this.lastName,
			bio: this.bio,
			avatar: this.avatar,
			role: this.role,
			isActive: this.isActive,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{
			expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
		},
	);
};

userSchema.methods.generateRefreshToken = function () {
	return Jwt.sign(
		{
			_id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET,
		{
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
		},
	);
};

userSchema.methods.generateForgotPasswordToken = function () {
	const resetToken = crypto.randomBytes(32).toString("hex");
	this.forgotPasswordToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");
	this.forgotPasswordExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
	return resetToken;
};

export const User = mongoose.model("User", userSchema);
