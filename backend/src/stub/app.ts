import express from "express";
import { findMockResponse } from "./services/stub.service.js";
import pino from "pino";
import { pinoHttp } from "pino-http";

const app = express();

const logger = pino({
    level: process.env.LOG_LEVEL || "info",
});

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(pinoHttp({ logger }));

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "UP", service: "stub" });
});

app.use(async (req, res) => {
    try {
        const result = await findMockResponse(req.method, req.path);

        if (!result) {
            return res.status(404).json({ success: false, message: "Mock API not found" });
        }

        if (result.delayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, result.delayMs));
        }

        for (const [name, value] of Object.entries(result.headers)) {
            res.setHeader(name, value);
        }

        return res.status(result.statusCode).json(result.body);
    } catch (error) {
        req.log.error(error);
        return res.status(500).json({ success: false, message: "Stub simulation failed" });
    }
});

export default app;
