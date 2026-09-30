import type { Request, Response } from "express";

import { createScenarioSchema, updateScenarioSchema } from "./scenario.validation.js";

import { createScenario, getScenarios, getScenarioById, updateScenario, deleteScenario, activateScenario } from "./scenario.service.js";

interface ScenarioParams {
    id: string;
    scenarioId: string;
}

export async function create(req: Request<Pick<ScenarioParams, "id">>, res: Response) {
    const result = createScenarioSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid scenario data",
            errors: result.error.flatten(),
        });
    }

    const userId = req.user!.userId;

    const scenario = await createScenario(userId, req.params.id, result.data);

    if (!scenario) {
        return res.status(404).json({
            success: false,
            message: "Mock API not found",
        });
    }

    return res.status(201).json({
        success: true,
        message: "Scenario created successfully",
        data: scenario,
    });
}

export async function getAll(req: Request<Pick<ScenarioParams, "id">>, res: Response) {
    const userId = req.user!.userId;

    const scenarios = await getScenarios(userId, req.params.id);

    if (!scenarios) {
        return res.status(404).json({
            success: false,
            message: "Mock API not found",
        });
    }

    return res.status(200).json({
        success: true,
        data: scenarios,
    });
}

export async function getById(req: Request<ScenarioParams>, res: Response) {
    const userId = req.user!.userId;

    const scenario = await getScenarioById(userId, req.params.id, req.params.scenarioId);

    if (!scenario) {
        return res.status(404).json({
            success: false,
            message: "Scenario not found",
        });
    }

    return res.status(200).json({
        success: true,
        data: scenario,
    });
}

export async function update(req: Request<ScenarioParams>, res: Response) {
    const result = updateScenarioSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid scenario data",
            errors: result.error.flatten(),
        });
    }

    const userId = req.user!.userId;

    const scenario = await updateScenario(userId, req.params.id, req.params.scenarioId, result.data);

    if (!scenario) {
        return res.status(404).json({
            success: false,
            message: "Scenario not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Scenario updated successfully",
        data: scenario,
    });
}

export async function remove(req: Request<ScenarioParams>, res: Response) {
    const userId = req.user!.userId;

    const deleted = await deleteScenario(userId, req.params.id, req.params.scenarioId);

    if (!deleted) {
        return res.status(404).json({
            success: false,
            message: "Scenario not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Scenario deleted successfully",
    });
}

export async function activate(req: Request<ScenarioParams>, res: Response) {
    const userId = req.user!.userId;

    const scenario = await activateScenario(userId, req.params.id, req.params.scenarioId);

    if (!scenario) {
        return res.status(404).json({
            success: false,
            message: "Scenario not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Scenario activated successfully",
        data: scenario,
    });
}
