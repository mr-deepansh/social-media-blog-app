// src/modules/blogs/controllers/engagement/engagement.controller.js
import { Like, Share, Bookmark, View } from "../../models/index.js";
import { Post } from "../../models/index.js";
import { asyncHandler } from "../../../../shared/utils/AsyncHandler.js";
import { ApiError } from "../../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../../shared/utils/ApiResponse.js";
import {
	safeAsyncOperation,
	handleControllerError,
} from "../../../../shared/utils/ErrorHandler.js";
import { Logger } from "../../../../shared/utils/Logger.js";
import mongoose from "mongoose";

const logger = new Logger("EngagementController");

// Toggle like
const toggleLike = asyncHandler(async (req, res) => {
	const startTime = Date.now();
	const { postId } = req.params;
	const userId = req.user._id;

	try {
		const session = await mongoose.startSession();
		session.startTransaction();

		const existingLike = await Like.findOne({
			user: userId,
			target: postId,
			targetType: "post",
		});

		if (existingLike) {
			await Like.findByIdAndDelete(existingLike._id, { session });
			await Post.findByIdAndUpdate(
				postId,
				{ $inc: { "engagement.likeCount": -1 } },
				{ session },
			);
		} else {
			await Like.create(
				[{ user: userId, target: postId, targetType: "post" }],
				{ session },
			);
			await Post.findByIdAndUpdate(
				postId,
				{ $inc: { "engagement.likeCount": 1 } },
				{ session },
			);
		}

		await session.commitTransaction();
		session.endSession();

		const executionTime = Date.now() - startTime;
		logger.info("Like toggled", {
			postId,
			userId,
			liked: !existingLike,
			executionTime,
		});

		res.status(200).json(
			new ApiResponse(
				200,
				{
					liked: !existingLike,
					meta: { executionTime: `${executionTime}ms` },
				},
				"Like toggled successfully",
			),
		);
	} catch (error) {
		handleControllerError(error, req, res, startTime, logger);
	}
});

// Track view
const trackView = asyncHandler(async (req, res) => {
	const { postId } = req.params;
	const userId = req.user?._id;

	try {
		// Create view record asynchronously
		setImmediate(async () => {
			try {
				const viewData = {
					user: userId,
					post: postId,
					ip: req.ip,
					userAgent: req.headers["user-agent"],
					device: req.headers["user-agent"],
				};

				await View.create(viewData);

				// Update post view count
				const isUniqueView = userId
					? !(await View.findOne({ user: userId, post: postId }))
					: !(await View.findOne({ ip: req.ip, post: postId }));

				await Post.findByIdAndUpdate(postId, {
					$inc: {
						"engagement.viewCount": 1,
						...(isUniqueView && { "engagement.uniqueViewCount": 1 }),
					},
				});
			} catch (error) {
				logger.error("View tracking failed:", error);
			}
		});

		res
			.status(200)
			.json(new ApiResponse(200, { tracked: true }, "View tracked"));
	} catch (error) {
		// Don't fail the request if view tracking fails
		res
			.status(200)
			.json(new ApiResponse(200, { tracked: false }, "View tracking failed"));
	}
});

export { toggleLike, trackView };
