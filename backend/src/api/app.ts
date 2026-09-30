import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import authRoutes from "./auth/auth.routes.js";
import mockApiRoutes from "./mock-api/mock-api.routes.js";
import { pinoHttp } from "pino-http";
import pino from "pino";

const app = express();

app.disable("x-powered-by");
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

const logger = pino({
    level: process.env.LOG_LEVEL || "info",
});

app.use(pinoHttp({ logger }));

app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "UP",
        service: "api",
    });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/mock-apis", mockApiRoutes);

export default app;
