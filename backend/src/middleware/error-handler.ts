import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
    if (error instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.flatten().fieldErrors,
        });
    }

    if (error instanceof Error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
