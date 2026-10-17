import cors from "cors";
import express from "express";
import mockApiRoutes from "./mock-api/mock-api.routes.js";
import { errorHandler } from "../middleware/error-handler.js";
import aiRoutes from "./ai/ai.routes.js";
import mappingRoutes from "./mappings/mappings.routes.js";

const app = express();

app.disable("x-powered-by");
app.use(
    cors({
        origin: "http://localhost:5173",
    }),
);
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "UP", service: "api" });
});

app.use("/api/v1/mock-apis", mockApiRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/mappings", mappingRoutes);

app.use(errorHandler);

export default app;
