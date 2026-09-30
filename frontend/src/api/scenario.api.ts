import api from "./axios";

export interface MockScenario {
    _id: string;
    name: string;
    statusCode: number;
    headers: Record<string, string>;
    responseBody: unknown;
    delayMs: number;
}

export interface CreateScenarioRequest {
    name: string;
    statusCode: number;
    headers?: Record<string, string>;
    responseBody?: unknown;
    delayMs?: number;
}

export type UpdateScenarioRequest = Partial<CreateScenarioRequest>;

interface ScenarioResponse {
    success: boolean;
    message?: string;
    data: MockScenario;
}

interface ScenarioListResponse {
    success: boolean;
    data: MockScenario[];
}

export async function getScenarios(mockApiId: string): Promise<MockScenario[]> {
    const response = await api.get<ScenarioListResponse>(`/mock-apis/${mockApiId}/scenarios`);

    return response.data.data;
}

export async function getScenario(mockApiId: string, scenarioId: string): Promise<MockScenario> {
    const response = await api.get<ScenarioResponse>(`/mock-apis/${mockApiId}/scenarios/${scenarioId}`);

    return response.data.data;
}

export async function createScenario(mockApiId: string, data: CreateScenarioRequest): Promise<MockScenario> {
    const response = await api.post<ScenarioResponse>(`/mock-apis/${mockApiId}/scenarios`, data);

    return response.data.data;
}

export async function updateScenario(mockApiId: string, scenarioId: string, data: UpdateScenarioRequest): Promise<MockScenario> {
    const response = await api.put<ScenarioResponse>(`/mock-apis/${mockApiId}/scenarios/${scenarioId}`, data);

    return response.data.data;
}

export async function deleteScenario(mockApiId: string, scenarioId: string): Promise<void> {
    await api.delete(`/mock-apis/${mockApiId}/scenarios/${scenarioId}`);
}

export async function activateScenario(mockApiId: string, scenarioId: string): Promise<MockScenario> {
    const response = await api.patch<ScenarioResponse>(`/mock-apis/${mockApiId}/scenarios/${scenarioId}/activate`);

    return response.data.data;
}
