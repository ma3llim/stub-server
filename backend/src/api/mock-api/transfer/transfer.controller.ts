import type { NextFunction, Request, Response } from "express";

import { exportSelectedApis, exportWorkspace, importApis, TransferError } from "./transfer.service.js";
import { exportSelectionRequestSchema, importApisRequestSchema } from "./transfer.validation.js";

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
        const data = await exportWorkspace();

        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
}

export async function exportSelected(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { apis } = exportSelectionRequestSchema.parse(req.body);

        const data = await exportSelectedApis(apis);

        res.status(200).json({ success: true, data });
    } catch (error) {
        handleError(error, res, next);
    }
}

export async function importMany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { file, conflictStrategy, dryRun } = importApisRequestSchema.parse(req.body);

        const data = await importApis(file, conflictStrategy, dryRun);

        res.status(dryRun ? 200 : 201).json({
            success: true,
            message: dryRun ? "Import preview ready" : "Import completed",
            data,
        });
    } catch (error) {
        handleError(error, res, next);
    }
}

