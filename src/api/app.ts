import cors from "cors";
import express from "express";
import pinoHttp from "pino-http";

const app = express();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(pinoHttp());

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "UP", service: "api" });
});

export default app;
