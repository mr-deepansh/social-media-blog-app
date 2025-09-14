import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { uploadMedia } from "../middleware/upload.middleware.js";
import { uploadMedia as uploadController, uploadMultipleMedia, deleteMedia } from "../controllers/media.controller.js";

const router = express.Router();

// Single media upload
router.post("/upload", verifyJWT, uploadMedia.single("media"), uploadController);

// Multiple media upload
router.post("/upload-multiple", verifyJWT, uploadMedia.array("media", 10), uploadMultipleMedia);

// Delete media
router.delete("/:publicId", verifyJWT, deleteMedia);

export default router;
