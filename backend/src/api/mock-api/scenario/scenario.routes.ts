import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { create, getAll, getById, update, remove, activate } from "./scenario.controller.js";
import { exportOneScenario, importOneScenario } from "../transfer/transfer.controller.js";

const router = Router({ mergeParams: true });

router.use(authenticate);
router.post("/", create);
router.post("/import", importOneScenario);
router.get("/", getAll);
router.get("/:scenarioId/export", exportOneScenario);
router.get("/:scenarioId", getById);
router.put("/:scenarioId", update);
router.delete("/:scenarioId", remove);
router.patch("/:scenarioId/activate", activate);

export default router;
