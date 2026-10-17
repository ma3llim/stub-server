import type { NextFunction, Request, Response } from "express";

import { createMockApiSchema, updateMockApiSchema } from "./mock-api.validation.js";

import { createMockApi, deleteAllMockApis, deleteMockApi, getMockApiById, getMockApis, updateMockApi } from "./mock-api.service.js";

interface MockApiParams {
    id: string;
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = createMockApiSchema.parse(req.body);

        const mockApi = await createMockApi(data);

        res.status(201).json({
            success: true,
            message: "Mock API created successfully",
            data: mockApi,
        });
    } catch (error) {
        next(error);
    }
}

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const mockApis = await getMockApis();

        res.status(200).json({
            success: true,
            data: mockApis,
        });
    } catch (error) {
        next(error);
    }
}

export async function getById(req: Request<MockApiParams>, res: Response, next: NextFunction): Promise<void> {
    try {
        const mockApi = await getMockApiById(req.params.id);

        if (!mockApi) {
            res.status(404).json({
                success: false,
                message: "Mock API not found",
            });

            return;
        }

        res.status(200).json({
            success: true,
            data: mockApi,
        });
    } catch (error) {
        next(error);
    }
}

export async function update(req: Request<MockApiParams>, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = updateMockApiSchema.parse(req.body);

        const mockApi = await updateMockApi(req.params.id, data);

        if (!mockApi) {
            res.status(404).json({
                success: false,
                message: "Mock API not found",
            });

            return;
        }

        res.status(200).json({
            success: true,
            message: "Mock API updated successfully",
            data: mockApi,
        });
    } catch (error) {
        next(error);
    }
}

export async function removeAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Guard against accidental calls: deleting every API must be asked for explicitly.
        if (req.query.confirm !== "all") {
            res.status(400).json({
                success: false,
                message: 'Add ?confirm=all to delete all APIs',
            });

            return;
        }

        const deletedCount = await deleteAllMockApis();

        res.status(200).json({
            success: true,
            message: `${deletedCount} Mock API${deletedCount === 1 ? "" : "s"} deleted`,
            data: { deletedCount },
        });
    } catch (error) {
        next(error);
    }
}

export async function remove(req: Request<MockApiParams>, res: Response, next: NextFunction): Promise<void> {
    try {
        const deleted = await deleteMockApi(req.params.id);

        if (!deleted) {
            res.status(404).json({
                success: false,
                message: "Mock API not found",
            });

            return;
        }

        res.status(200).json({
            success: true,
            message: "Mock API deleted successfully",
        });
    } catch (error) {
        next(error);
    }
}
