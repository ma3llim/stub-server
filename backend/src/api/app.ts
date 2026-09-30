import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import authRoutes from "./auth/auth.routes.js";
import mockApiRoutes from "./mock-api/mock-api.routes.js";

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

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "UP", service: "api" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/mock-apis", mockApiRoutes);

export default app;
