import { z } from "zod";

const httpMethodSchema = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);

const scenarioSchema = z.object({
    name: z.string().trim().min(1).max(100),

    statusCode: z.number().int().min(100).max(599),

    headers: z.record(z.string(), z.string()).default({}),

    responseBody: z.unknown().default({}),

    delayMs: z.number().int().min(0).max(30000).default(0),
});

export const createMockApiSchema = z.object({
    name: z.string().trim().min(1).max(100),

    method: httpMethodSchema,

    path: z.string().trim().min(1).max(500),

    description: z.string().trim().max(500).optional(),

    scenarios: z.array(scenarioSchema).default([]),
});

export const updateMockApiSchema = createMockApiSchema.partial();

export type CreateMockApiInput = z.infer<typeof createMockApiSchema>;

export type UpdateMockApiInput = z.infer<typeof updateMockApiSchema>;
