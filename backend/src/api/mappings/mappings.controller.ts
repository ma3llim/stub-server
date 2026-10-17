import type { NextFunction, Request, Response } from "express";

import { getMockApis } from "../mock-api/mock-api.service.js";

/*
 * Returns every API and scenario as one JSON document.
 * Meant to be opened directly in the browser, so the output is pretty-printed.
 */
export async function getMappings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const mockApis = await getMockApis();

        const body = {
            success: true,
            meta: {
                apis: mockApis.length,
                scenarios: mockApis.reduce((total, mockApi) => total + mockApi.scenarios.length, 0),
                generatedAt: new Date().toISOString(),
            },
            data: mockApis,
        };

        res.status(200).type("application/json").send(JSON.stringify(body, null, 2));
    } catch (error) {
        next(error);
    }
}
