import { MockApi } from "../../models/mock-api.model.js";
import { matchPath } from "../utils/path-matcher.js";

export interface StubResponse {
    statusCode: number;
    headers: Record<string, string>;
    body: unknown;
    delayMs: number;
}

export async function findMockResponse(method: string, requestPath: string): Promise<StubResponse | null> {
    const mockApis = await MockApi.find({
        method: method.toUpperCase(),
    });

    const mockApi = mockApis.find((api) => matchPath(api.path, requestPath));

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
