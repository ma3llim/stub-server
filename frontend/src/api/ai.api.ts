import api from "./axios";

export interface ChatRequest {
    mockApiId: string;
    message: string;
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
