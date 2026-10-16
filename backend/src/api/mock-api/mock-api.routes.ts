import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { create, getAll, getById, update, remove, removeAll } from "./mock-api.controller.js";
import scenarioRoutes from "./scenario/scenario.routes.js";
import responseRoutes from "./response/response.routes.js";
import { exportAll, exportOne, exportSelected, importMany } from "./transfer/transfer.controller.js";

const router = Router();

router.use(authenticate);
router.post("/", create);
router.get("/", getAll);
router.delete("/", removeAll);
// Registered before "/:id" so "export" and "import" aren't treated as IDs.
router.get("/export", exportAll);
router.post("/export", exportSelected);
router.post("/import", importMany);
router.get("/:id/export", exportOne);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", remove);
router.use("/:id/scenarios", scenarioRoutes);
router.use("/:id/responses/:responseType", responseRoutes);

export default router;
