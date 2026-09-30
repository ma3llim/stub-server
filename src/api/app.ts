import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import pinoHttp from "pino-http";
import authRoutes from "./auth/auth.routes.js";

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
app.use(pinoHttp());

app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "UP",
        service: "api",
    });
});

app.use("/api/v1/auth", authRoutes);

export default app;
