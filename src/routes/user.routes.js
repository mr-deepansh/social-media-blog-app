import { Router } from "express";
import {
	getAllUsers,
	login,
	signup,
	logout,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/all-users").get(getAllUsers);
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(verifyJWT, logout);

export default router;
