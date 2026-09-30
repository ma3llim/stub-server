import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    API_PORT: z.coerce.number().int().positive().default(8080),

    STUB_PORT: z.coerce.number().int().positive().default(8081),

    MONGODB_URI: z.string().min(1),
});

export const env = envSchema.parse(process.env);
