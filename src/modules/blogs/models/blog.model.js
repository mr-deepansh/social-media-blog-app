import mongoose, { Schema } from "mongoose";

const blogSchema = new Schema(
	{
		title: {
			type: String,
			trim: true,
			required: true,
		},
		content: {
			type: String,
			trim: true,
			required: true,
		},
		tags: [
			{
				type: String,
				trim: true,
			},
		],
		author: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		isPublic: {
			type: Boolean,
			default: true,
		},
		image: {
			type: String,
		},
	},
	{
		timestamps: true,
	},
);

export const Blog = mongoose.model("Blog", blogSchema);
