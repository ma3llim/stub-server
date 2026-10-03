import api from "./axios";
import type { MockResponseData } from "./mock-api.api";

export type MockResponseType = "success" | "error";

interface MockResponseResult {
    success: boolean;
    message?: string;
    data: MockResponseData;
}

function getResponseUrl(mockApiId: string, type: MockResponseType): string {
    return `/mock-apis/${mockApiId}/responses/${type}`;
}

export async function createMockResponse(mockApiId: string, type: MockResponseType, data: MockResponseData): Promise<MockResponseData> {
    const response = await api.post<MockResponseResult>(getResponseUrl(mockApiId, type), data);

    return response.data.data;
}

export async function updateMockResponse(mockApiId: string, type: MockResponseType, data: MockResponseData): Promise<MockResponseData> {
    const response = await api.put<MockResponseResult>(getResponseUrl(mockApiId, type), data);

    return response.data.data;
}
