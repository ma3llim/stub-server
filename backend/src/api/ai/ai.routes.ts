import { Router } from "express";
import { chat } from "./ai.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.post("/chat", chat);

export default router;
