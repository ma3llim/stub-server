import type { Request, Response } from "express";
import { z } from "zod";
import { chatWithScenarioAgent } from "./ai.service.js";

const chatSchema = z.object({
    mockApiId: z.string().min(1),
    message: z.string().trim().min(1).max(10000),
});

export async function chat(req: Request, res: Response) {
    const input = chatSchema.parse(req.body);
    const result = await chatWithScenarioAgent(req.user!.userId, input.mockApiId, input.message);

    return res.status(200).json({ success: true, data: { message: result } });
}
