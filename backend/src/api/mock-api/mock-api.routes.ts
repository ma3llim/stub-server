import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";

import { create, getAll, getById, update, remove } from "./mock-api.controller.js";

const router = Router();

router.use(authenticate);
router.post("/", create);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
