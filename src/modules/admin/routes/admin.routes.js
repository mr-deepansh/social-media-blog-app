import express from "express";
import { verifyJWT } from "../../../shared/middleware/auth.middleware.js";
import { isAdmin } from "../../../shared/middleware/isAdmin.middleware.js";
import {
	getAllUsers,
	deleteUserById,
	updateUserById,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Get all users
router.get("/users", verifyJWT, isAdmin, getAllUsers);

// Delete a user by ID
router.delete("/users/:id", verifyJWT, isAdmin, deleteUserById);

// Update a user by ID (optional)
router.put("/users/:id", verifyJWT, isAdmin, updateUserById);

export default router;
