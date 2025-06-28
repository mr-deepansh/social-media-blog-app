import express from "express";
import { resetPassword } from "../controllers/resetPassword.controller.js";

const router = express.Router();

/**
 * @route   POST /api/v1/auth/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
router.post("/reset-password/:token", resetPassword);

export default router;
