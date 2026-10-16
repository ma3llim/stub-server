import type { NextFunction, Request, Response } from "express";

import { exportApi, exportScenario, exportSelectedApis, exportWorkspace, importApis, importScenario, TransferError } from "./transfer.service.js";
import { exportSelectionRequestSchema, importApisRequestSchema, importScenarioRequestSchema } from "./transfer.validation.js";

interface MockApiParams {
    id: string;
}

interface ScenarioParams extends MockApiParams {
    scenarioId: string;
}

function handleError(error: unknown, res: Response, next: NextFunction): void {
    if (error instanceof TransferError) {
        res.status(error.status).json({
            success: false,
            message: error.message,
            issues: error.issues,
        });

        return;
    }

    next(error);
}

export async function exportAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = await exportWorkspace(req.user!.userId);

        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
}

export async function exportSelected(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { apis } = exportSelectionRequestSchema.parse(req.body);

        const data = await exportSelectedApis(req.user!.userId, apis);

        res.status(200).json({ success: true, data });
    } catch (error) {
        handleError(error, res, next);
    }
}

export async function exportOne(req: Request<MockApiParams>, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = await exportApi(req.user!.userId, req.params.id);

        if (!data) {
            res.status(404).json({ success: false, message: "Mock API not found" });

            return;
        }

        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
}

export async function exportOneScenario(req: Request<ScenarioParams>, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = await exportScenario(req.user!.userId, req.params.id, req.params.scenarioId);

        if (!data) {
            res.status(404).json({ success: false, message: "Scenario not found" });

            return;
        }

        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
}

export async function importMany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { file, conflictStrategy, dryRun } = importApisRequestSchema.parse(req.body);

        const data = await importApis(req.user!.userId, file, conflictStrategy, dryRun);

        res.status(dryRun ? 200 : 201).json({
            success: true,
            message: dryRun ? "Import preview ready" : "Import completed",
            data,
        });
    } catch (error) {
        handleError(error, res, next);
    }
}

export async function importOneScenario(req: Request<MockApiParams>, res: Response, next: NextFunction): Promise<void> {
    try {
        const { file } = importScenarioRequestSchema.parse(req.body);

        const data = await importScenario(req.user!.userId, req.params.id, file);

        if (!data) {
            res.status(404).json({ success: false, message: "Mock API not found" });

            return;
        }

        res.status(201).json({
            success: true,
            message: "Scenario imported successfully",
            data,
        });
    } catch (error) {
        handleError(error, res, next);
    }
}
