import { Router } from "express";
import { create, get, update } from "./response.controller.js";

const router = Router({ mergeParams: true });

router.post("/", create);
router.get("/", get);
router.put("/", update);

export default router;
