// src/modules/blogs/services/media.service.js
import { Media } from "../models/index.js";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { Logger } from "../../../shared/utils/Logger.js";

const logger = new Logger("MediaService");

class MediaService {
	constructor() {
		this.uploadDir = "./uploads";
		this.maxFileSize = 10 * 1024 * 1024; // 10MB
		this.allowedTypes = [
			"image/jpeg",
			"image/png",
			"image/webp",
			"video/mp4",
			"video/webm",
		];
		this.initUploadDir();
	}

	async initUploadDir() {
		try {
			await fs.mkdir(path.join(this.uploadDir, "images"), { recursive: true });
			await fs.mkdir(path.join(this.uploadDir, "videos"), { recursive: true });
		} catch (error) {
			logger.error("Upload dir creation failed:", error);
		}
	}

	getMulterConfig() {
		const storage = multer.diskStorage({
			destination: async (req, file, cb) => {
				const subDir = file.mimetype.startsWith("image") ? "images" : "videos";
				const uploadPath = path.join(this.uploadDir, subDir);
				await fs.mkdir(uploadPath, { recursive: true });
				cb(null, uploadPath);
			},
			filename: (req, file, cb) => {
				const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
				cb(
					null,
					`${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`,
				);
			},
		});

		return multer({
			storage,
			fileFilter: (req, file, cb) => {
				cb(null, this.allowedTypes.includes(file.mimetype));
			},
			limits: { fileSize: this.maxFileSize, files: 5 },
		});
	}

	async processUploadedFiles(files, userId) {
		const processedFiles = [];

		for (const file of files) {
			try {
				const mediaData = {
					type: file.mimetype.startsWith("image") ? "image" : "video",
					originalName: file.originalname,
					filename: file.filename,
					url: `/uploads/${file.mimetype.startsWith("image") ? "images" : "videos"}/${file.filename}`,
					size: file.size,
					mimeType: file.mimetype,
					uploadedBy: userId,
				};

				const media = await Media.create(mediaData);
				processedFiles.push(media);
			} catch (error) {
				logger.error(`File processing failed: ${file.originalname}`, error);
				await fs.unlink(file.path).catch(() => {});
			}
		}

		return processedFiles;
	}

	async getUserMedia(userId, filters = {}) {
		const { page = 1, limit = 20, type } = filters;
		const skip = (page - 1) * limit;
		const query = { uploadedBy: userId, isDeleted: false };
		if (type) query.type = type;

		const [media, total] = await Promise.all([
			Media.find(query)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(parseInt(limit)),
			Media.countDocuments(query),
		]);

		return {
			media,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(total / limit),
				totalMedia: total,
			},
		};
	}

	async deleteMedia(mediaId, userId) {
		const media = await Media.findOne({ _id: mediaId, uploadedBy: userId });
		if (!media) throw new ApiError(404, "Media not found");

		await Media.findByIdAndUpdate(mediaId, { isDeleted: true });
		return { success: true };
	}
}

export default new MediaService();
