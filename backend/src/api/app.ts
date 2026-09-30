import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import authRoutes from "./auth/auth.routes.js";
import mockApiRoutes from "./mock-api/mock-api.routes.js";
import { errorHandler } from "../middleware/error-handler.js";
import aiRoutes from "./ai/ai.routes.js";

const app = express();

app.disable("x-powered-by");
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    }),
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "UP", service: "api" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/mock-apis", mockApiRoutes);
app.use("/api/v1/ai", aiRoutes);

app.use(errorHandler);

export default app;
