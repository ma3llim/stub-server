import { z } from "zod";

import { createScenarioSchema } from "../scenario/scenario.validation.js";

export const EXPORT_FORMAT = "mock-api-platform/export";
export const EXPORT_VERSION = 1;

export const MAX_IMPORT_APIS = 500;
export const MAX_SCENARIOS_PER_API = 100;

/*
 * Export files never contain database IDs or user data, so they can be shared
 * between accounts. The active scenario is stored as an index into `scenarios`.
 */
export const exportedScenarioSchema = createScenarioSchema;

export const exportedApiSchema = z
    .object({
        name: z.string().trim().min(1).max(100),
        method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
        path: z.string().trim().min(1).max(500),
        description: z.string().trim().max(500).optional(),
        successResponse: z.record(z.string(), z.unknown()).optional(),
        errorResponse: z.record(z.string(), z.unknown()).optional(),
        activeScenarioIndex: z.number().int().min(0).nullable().optional(),
        scenarios: z.array(exportedScenarioSchema).max(MAX_SCENARIOS_PER_API).default([]),
    })
    .refine((api) => api.activeScenarioIndex == null || api.activeScenarioIndex < api.scenarios.length, {
        message: "Must point to one of the API's scenarios",
        path: ["activeScenarioIndex"],
    });

const envelopeShape = {
    format: z.literal(EXPORT_FORMAT),
    version: z.literal(EXPORT_VERSION),
    exportedAt: z.string().optional(),
};

export const scenarioExportFileSchema = z.object({
    ...envelopeShape,
    kind: z.literal("scenario"),
    scenario: exportedScenarioSchema,
});

export const apiExportFileSchema = z.object({
    ...envelopeShape,
    kind: z.literal("api"),
    api: exportedApiSchema,
});

export const workspaceExportFileSchema = z.object({
    ...envelopeShape,
    kind: z.literal("workspace"),
    apis: z.array(exportedApiSchema).max(MAX_IMPORT_APIS),
});

export const importApisRequestSchema = z.object({
    file: z.unknown(),
    conflictStrategy: z.enum(["skip", "replace"]).default("skip"),
    dryRun: z.boolean().default(false),
});

export const exportSelectionRequestSchema = z.object({
    apis: z
        .array(
            z.object({
                id: z.string().min(1),
                scenarioIds: z.array(z.string().min(1)).max(MAX_SCENARIOS_PER_API),
            }),
        )
        .min(1, "Select at least one API to export")
        .max(MAX_IMPORT_APIS),
});

export const importScenarioRequestSchema = z.object({
    file: z.unknown(),
});

export type ExportedScenario = z.infer<typeof exportedScenarioSchema>;
export type ExportedApi = z.infer<typeof exportedApiSchema>;
export type ExportKind = "scenario" | "api" | "workspace";
export type ConflictStrategy = z.infer<typeof importApisRequestSchema>["conflictStrategy"];

export type ExportFile =
    | z.infer<typeof scenarioExportFileSchema>
    | z.infer<typeof apiExportFileSchema>
    | z.infer<typeof workspaceExportFileSchema>;
