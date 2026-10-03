import api from "./axios";
import type { MockResponseData } from "./mock-api.api";

export interface ChatRequest {
    mockApiId: string;
    message: string;
    mock: {
        successResponse?: MockResponseData;
        errorResponse?: MockResponseData;
    };
}

export interface ChatResponse {
    success: boolean;
    data: {
        message: string;
    };
}

export async function sendAiMessage(data: ChatRequest): Promise<string> {
    const response = await api.post<ChatResponse>("/ai/chat", data);
    return response.data.data.message;
}
