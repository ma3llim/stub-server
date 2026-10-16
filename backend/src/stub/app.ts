import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request } from "express";
import jwt from "jsonwebtoken";
import { findMockResponse } from "./services/stub.service.js";
import { errorHandler } from "../middleware/error-handler.js";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "../utils/cookies.js";
import { verifyAccessToken, verifyRefreshToken } from "../utils/jwt.js";

const app = express();

app.disable("x-powered-by");
// Mock responses must always reflect the currently active scenario, never a cached copy.
app.set("etag", false);
// Mock APIs are called from browser apps on any origin (e.g. the Demo page). Credentials are
// allowed so a signed-in browser sends its login cookie and gets its own APIs (see below).
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

/*
 * Reads the user ID from one login cookie. Returns null when the cookie is missing or
 * unusable; a bad cookie must never break the mock response, so nothing is rethrown.
 */
function userIdFromCookie(token: unknown, verify: (token: string) => { userId: string }, cookieName: string): string | null {
    if (typeof token !== "string" || !token) {
        return null;
    }

    try {
        return verify(token).userId;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            // Expected: access tokens only last 15 minutes. The caller falls back to the next option.
            return null;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            // Malformed, tampered, or signed with another secret (e.g. after a secret change).
            console.warn(`Stub Server: ignoring invalid ${cookieName} cookie (${error.message})`);

            return null;
        }

        console.error(`Stub Server: failed to read ${cookieName} cookie`, error);

        return null;
    }
}

/*
 * Identifies the signed-in user from the platform's login cookies, if the caller sent them.
 * The refresh token (7 days) is used when the short-lived access token has expired.
 * Anonymous callers get null and are served by the fallback rules in findMockResponse.
 */
function requesterId(req: Request): string | null {
    return (
        userIdFromCookie(req.cookies?.[ACCESS_COOKIE], verifyAccessToken, ACCESS_COOKIE) ??
        userIdFromCookie(req.cookies?.[REFRESH_COOKIE], verifyRefreshToken, REFRESH_COOKIE)
    );
}

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "UP", service: "stub" });
});

app.use(async (req, res) => {
    try {
        const result = await findMockResponse(req.method, req.path, requesterId(req));

        if (!result) {
            return res.status(404).json({ success: false, message: "Mock API not found" });
        }

        if (result.delayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, result.delayMs));
        }

        res.setHeader("Cache-Control", "no-store");

        for (const [name, value] of Object.entries(result.headers)) {
            res.setHeader(name, value);
        }

        // "*" isn't allowed for credentialed requests, so expose the scenario's headers by name.
        const exposed = Object.keys(result.headers);

        if (exposed.length > 0) {
            res.setHeader("Access-Control-Expose-Headers", exposed.join(", "));
        }

        return res.status(result.statusCode).json(result.body);
    } catch (error) {
        console.error(`Stub Server: failed to serve ${req.method} ${req.path}`, error);

        if (res.headersSent) {
            return;
        }

        return res.status(500).json({ success: false, message: "Stub simulation failed" });
    }
});

app.use(errorHandler);

export default app;
