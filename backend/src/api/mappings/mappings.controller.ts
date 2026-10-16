import type { NextFunction, Request, Response } from "express";

import { MockApi } from "../../models/mock-api.model.js";
import { User } from "../../models/user.model.js";

/*
 * Returns every API and scenario of every user as one JSON document, with the
 * owner's username next to each API. Only the username is exposed, never email or
 * password data. Meant to be opened directly in the browser, so it's pretty-printed.
 */
export async function getMappings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const mockApis = await MockApi.find().sort({ createdAt: -1 }).lean();

        const userIds = [...new Set(mockApis.map((mockApi) => mockApi.userId.toString()))];
        const users = await User.find({ _id: { $in: userIds } }, { username: 1 }).lean();
        const usernames = new Map(users.map((user) => [user._id.toString(), user.username]));

        const data = mockApis.map(({ userId, ...mockApi }) => ({
            ...mockApi,
            userId,
            user: {
                id: userId.toString(),
                // The owner may have been deleted while their APIs remain.
                username: usernames.get(userId.toString()) ?? null,
            },
        }));

        const body = {
            success: true,
            meta: {
                users: userIds.length,
                apis: mockApis.length,
                scenarios: mockApis.reduce((total, mockApi) => total + mockApi.scenarios.length, 0),
                generatedAt: new Date().toISOString(),
            },
            data,
        };

        res.status(200).type("application/json").send(JSON.stringify(body, null, 2));
    } catch (error) {
        next(error);
    }
}
