import { Router } from "express";

import { getMappings } from "./mappings.controller.js";

const router = Router();

router.get("/", getMappings);

export default router;
