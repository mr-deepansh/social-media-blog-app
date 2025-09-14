import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinary.service.js";
import fs from "fs/promises";

// Universal media upload
export const uploadMedia = asyncHandler(async (req, res) => {
	if (!req.file) {
		throw new ApiError(400, "Media file is required");
	}

	try {
		const { folder = "media" } = req.body;

		// Upload to Cloudinary
		const result = await uploadToCloudinary(req.file.path, folder);

		// Delete temp file
		await fs.unlink(req.file.path).catch(() => {});

		res.status(200).json(new ApiResponse(200, result, "Media uploaded successfully"));
	} catch (error) {
		// Delete temp file on error
		await fs.unlink(req.file.path).catch(() => {});
		throw error;
	}
});

// Multiple media upload
export const uploadMultipleMedia = asyncHandler(async (req, res) => {
	if (!req.files || req.files.length === 0) {
		throw new ApiError(400, "Media files are required");
	}

	try {
		const { folder = "media" } = req.body;
		const uploadPromises = req.files.map(file => uploadToCloudinary(file.path, folder));

		const results = await Promise.all(uploadPromises);

		// Delete temp files
		await Promise.all(req.files.map(file => fs.unlink(file.path).catch(() => {})));

		res.status(200).json(new ApiResponse(200, results, "Media files uploaded successfully"));
	} catch (error) {
		// Delete temp files on error
		await Promise.all(req.files.map(file => fs.unlink(file.path).catch(() => {})));
		throw error;
	}
});

// Delete media
export const deleteMedia = asyncHandler(async (req, res) => {
	const { publicId } = req.params;

	if (!publicId) {
		throw new ApiError(400, "Public ID is required");
	}

	try {
		await deleteFromCloudinary(publicId);
		res.status(200).json(new ApiResponse(200, {}, "Media deleted successfully"));
	} catch (error) {
		throw new ApiError(500, "Failed to delete media");
	}
});
