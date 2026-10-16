import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";
import { getMappings } from "./mappings.controller.js";

const router = Router();

router.use(authenticate);
router.get("/", getMappings);

export default router;
