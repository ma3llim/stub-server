import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

import { env } from "../config/env.js";

export interface AccessTokenPayload extends JwtPayload {
    userId: string;
    role: "USER" | "ADMIN";
}

export interface RefreshTokenPayload extends JwtPayload {
    userId: string;
}

export function generateAccessToken(userId: string, role: "USER" | "ADMIN"): string {
    const payload: AccessTokenPayload = {
        userId,
        role,
    };

    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
    });
}

export function generateRefreshToken(userId: string): string {
    const payload: RefreshTokenPayload = {
        userId,
    };

    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
    });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
