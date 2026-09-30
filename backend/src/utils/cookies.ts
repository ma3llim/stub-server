import { Response } from "express";
import { env } from "../config/env.js";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

const baseCookieOptions = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE as "strict" | "lax" | "none",
    path: "/",
} as const;

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    res.cookie(ACCESS_COOKIE, accessToken, {
        ...baseCookieOptions,
        maxAge: 15 * 60 * 1000,
    });

    res.cookie(REFRESH_COOKIE, refreshToken, {
        ...baseCookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

export function clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_COOKIE, baseCookieOptions);

    res.clearCookie(REFRESH_COOKIE, baseCookieOptions);
}

export { ACCESS_COOKIE, REFRESH_COOKIE };
