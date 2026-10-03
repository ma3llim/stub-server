import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { create, getAll, getById, update, remove } from "./mock-api.controller.js";
import scenarioRoutes from "./scenario/scenario.routes.js";
import responseRoutes from "./response/response.routes.js";

const router = Router();

router.use(authenticate);
router.post("/", create);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", remove);
router.use("/:id/scenarios", scenarioRoutes);
router.use("/:id/responses/:responseType", responseRoutes);

export default router;
