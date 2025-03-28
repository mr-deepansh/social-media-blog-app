import { Router } from "express";
import { resetPassword } from "../controllers/reset.pass.controller.js";

const router = Router();

router.route("/:token").post(resetPassword);

export default router;
