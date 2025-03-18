import { Router } from "express";
import { forgetPassword } from "../controllers/forget.pass.controller.js";

const router = Router();

router.route("/forget-password").post(forgetPassword);

export default router;
