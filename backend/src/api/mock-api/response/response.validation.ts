import { z } from "zod";

export const responseTypeSchema = z.enum(["success", "error"]);

export const responseDataSchema = z.record(z.string(), z.unknown());

export const createResponseSchema = responseDataSchema;
export const updateResponseSchema = responseDataSchema;

export type ResponseDataInput = z.infer<typeof responseDataSchema>;
