import { Request, Response } from "express";
import crypto from "crypto";
import { User } from "../../models/user.model.js";
import { RefreshToken } from "../../models/refresh-token.model.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { clearAuthCookies, REFRESH_COOKIE, setAuthCookies } from "../../utils/cookies.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

function hashRefreshToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
}

export async function register(req: Request, res: Response): Promise<void> {
    const data = registerSchema.parse(req.body);

    const existingUser = await User.findOne({
        $or: [{ email: data.email.toLowerCase() }, { username: data.username }],
    });

    if (existingUser) {
        res.status(409).json({
            success: false,
            message: "Username or email already exists",
        });

        return;
    }

    const passwordHash = await hashPassword(data.password);

    const user = await User.create({
        username: data.username,
        email: data.email.toLowerCase(),
        passwordHash,
    });

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
            id: user.id,
            username: user.username,
            email: user.email,
        },
    });
}

export async function login(req: Request, res: Response): Promise<void> {
    const data = loginSchema.parse(req.body);

    const user = await User.findOne({
        email: data.email.toLowerCase(),
    }).select("+passwordHash");

    if (!user || !user.isActive) {
        res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });

        return;
    }

    const passwordValid = await comparePassword(data.password, user.passwordHash);

    if (!passwordValid) {
        res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });

        return;
    }

    const accessToken = generateAccessToken(user.id, user.role);

    const refreshToken = generateRefreshToken(user.id);

    const tokenHash = hashRefreshToken(refreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
        userId: user._id,
        tokenHash,
        expiresAt,
    });

    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        },
    });
}

export async function refresh(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];

    if (!refreshToken) {
        res.status(401).json({
            success: false,
            message: "Refresh token missing",
        });

        return;
    }

    let payload;

    try {
        payload = verifyRefreshToken(refreshToken);
    } catch {
        clearAuthCookies(res);

        res.status(401).json({
            success: false,
            message: "Invalid refresh token",
        });

        return;
    }

    const tokenHash = hashRefreshToken(refreshToken);

    const storedToken = await RefreshToken.findOne({
        tokenHash,
        userId: payload.userId,
        revokedAt: { $exists: false },
    });

    if (!storedToken) {
        clearAuthCookies(res);

        res.status(401).json({
            success: false,
            message: "Refresh token is invalid or revoked",
        });

        return;
    }

    if (storedToken.expiresAt.getTime() < Date.now()) {
        await RefreshToken.updateOne(
            { _id: storedToken._id },
            {
                revokedAt: new Date(),
            },
        );

        clearAuthCookies(res);

        res.status(401).json({
            success: false,
            message: "Refresh token expired",
        });

        return;
    }

    const user = await User.findById(payload.userId);

    if (!user || !user.isActive) {
        clearAuthCookies(res);

        res.status(401).json({
            success: false,
            message: "User is inactive or does not exist",
        });

        return;
    }

    // Refresh-token rotation
    await RefreshToken.updateOne(
        { _id: storedToken._id },
        {
            revokedAt: new Date(),
        },
    );

    const newAccessToken = generateAccessToken(user.id, user.role);

    const newRefreshToken = generateRefreshToken(user.id);

    await RefreshToken.create({
        userId: user._id,
        tokenHash: hashRefreshToken(newRefreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
    });
}

export async function logout(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];

    if (refreshToken) {
        const tokenHash = hashRefreshToken(refreshToken);

        await RefreshToken.updateOne(
            {
                tokenHash,
                revokedAt: { $exists: false },
            },
            {
                revokedAt: new Date(),
            },
        );
    }

    clearAuthCookies(res);

    res.status(200).json({
        success: true,
        message: "Logout successful",
    });
}

export async function me(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Unauthorized",
        });

        return;
    }

    const user = await User.findById(userId);

    if (!user || !user.isActive) {
        res.status(401).json({
            success: false,
            message: "User not found",
        });

        return;
    }

    res.status(200).json({
        success: true,
        data: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        },
    });
}
