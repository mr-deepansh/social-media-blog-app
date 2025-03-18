import { Router } from "express";
import { resetPassword } from "../controllers/reset.pass.controller.js";

const router = Router();

router.route("/reset-password/:token").post(resetPassword);

export default router;
