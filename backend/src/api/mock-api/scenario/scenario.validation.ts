import { z } from "zod";

export const createScenarioSchema = z.object({
    name: z.string().trim().min(1).max(100),
    statusCode: z.number().int().min(100).max(599),
    headers: z.record(z.string(), z.string()).default({}),
    responseBody: z.unknown().default({}),
    delayMs: z.number().int().min(0).max(30000).default(0),
});

export const updateScenarioSchema = createScenarioSchema.partial();

export type CreateScenarioInput = z.infer<typeof createScenarioSchema>;

export type UpdateScenarioInput = z.infer<typeof updateScenarioSchema>;
