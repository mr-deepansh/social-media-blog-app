import mongoose, { Schema } from 'mongoose';

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
		isPublic: {
			type: Boolean,
			default: true,
		},
		image: {
			type: String,
			// required: true,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{
		timestamps: true,
	},
);

export const Blog = mongoose.model('Blog', blogSchema);
