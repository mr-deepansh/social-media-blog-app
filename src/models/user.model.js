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
		name: {
			type: String,
			trim: true,
			index: true,
			required: true,
		},
		password: {
			type: String,
			minlength: 8,
			required: [true, "Password is Required"],
		},
		refreshToken: {
			type: String,
		},
		forgotPasswordToken: String,
		forgotPasswordExpiry: Date,
	},
	{
		timestamps: true,
	},
);

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
			name: this.name,
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
	this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;
	return resetToken;
};

userSchema.methods.resetPassword = async function () {
	this.password = await bcrypt.hash(newPassword, 10);
	this.forgotPasswordToken = undefined;
	this.forgotPasswordExpiry = undefined;
};

export const User = mongoose.model("User", userSchema);
