import { NextFunction, Request, Response } from "express";
import { ACCESS_COOKIE } from "../utils/cookies.js";
import { verifyAccessToken } from "../utils/jwt.js";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: "USER" | "ADMIN";
            };
        }
    }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const token = req.cookies?.[ACCESS_COOKIE];

    if (!token) {
        res.status(401).json({
            success: false,
            message: "Authentication required",
        });

        return;
    }

    try {
        const payload = verifyAccessToken(token);
        req.user = { userId: payload.userId, role: payload.role };

        next();
    } catch {
        res.status(401).json({
            success: false,
            message: "Access token is invalid or expired",
        });
    }
}
