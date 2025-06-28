import express from "express";
import { forgetPassword } from "../controllers/forgotPassword.controller.js";

const router = express.Router();

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post("/forgot-password", forgetPassword);

export default router;
