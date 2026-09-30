import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    API_PORT: z.coerce.number().int().positive().default(8080),

    STUB_PORT: z.coerce.number().int().positive().default(8081),

    MONGODB_URI: z.string().min(1),

    JWT_ACCESS_SECRET: z.string().min(32),

    JWT_REFRESH_SECRET: z.string().min(32),

    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),

    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

    COOKIE_SECURE: z.coerce.boolean().default(false),

    COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("lax"),
});

export const env = envSchema.parse(process.env);
