import { MockApi, type MockApiDocument } from "../../models/mock-api.model.js";
import { matchPath, normalizePath } from "../utils/path-matcher.js";

export interface StubResponse {
    statusCode: number;
    headers: Record<string, string>;
    body: unknown;
    delayMs: number;
}

function paramCount(path: string): number {
    return normalizePath(path)
        .split("/")
        .filter((part) => part.startsWith("{") && part.endsWith("}")).length;
}

/*
 * Several APIs can match one request: the same endpoint may exist twice, and a
 * pattern like /products/{id} can overlap /products/featured. Pick in order:
 *   1. the most specific path (fewest {params}),
 *   2. the most recently changed API, so the scenario someone just activated wins.
 */
function pickMockApi(candidates: MockApiDocument[]): MockApiDocument | undefined {
    return [...candidates].sort((a, b) => paramCount(a.path) - paramCount(b.path) || b.updatedAt.getTime() - a.updatedAt.getTime())[0];
}

export async function findMockResponse(method: string, requestPath: string): Promise<StubResponse | null> {
    const mockApis = await MockApi.find({
        method: method.toUpperCase(),
    });

    const mockApi = pickMockApi(mockApis.filter((api) => matchPath(api.path, requestPath)));

    if (!mockApi) {
        return null;
    }

    if (!mockApi.activeScenarioId) {
        return null;
    }

    const scenario = mockApi.scenarios.find((item) => item._id.toString() === mockApi.activeScenarioId!.toString());

    if (!scenario) {
        return null;
    }

    return {
        statusCode: scenario.statusCode,
        headers: scenario.headers,
        body: scenario.responseBody,
        delayMs: scenario.delayMs,
    };
}
