import { z } from "zod";

export const registerSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3)
        .max(50)
        .regex(/^[a-zA-Z0-9_]+$/, "Username can contain only letters, numbers and underscores"),

    email: z.string().trim().email(),

    password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
    email: z.string().trim().email(),

    password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;
