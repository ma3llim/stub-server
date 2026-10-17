import api from "./axios";
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface MockScenario {
    _id?: string;
    name: string;
    statusCode: number;
    headers: Record<string, string>;
    responseBody: unknown;
    delayMs: number;
}

export type MockResponseData = Record<string, unknown>;

export interface MockApi {
    _id: string;
    name: string;
    method: HttpMethod;
    path: string;
    description?: string;
    activeScenarioId?: string;
    scenarios: MockScenario[];
    successResponse?: MockResponseData;
    errorResponse?: MockResponseData;
    // Optional example of the JSON this endpoint expects.
    requestBody?: unknown;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMockApiRequest {
    name: string;
    method: HttpMethod;
    path: string;
    description?: string;
    scenarios?: MockScenario[];
    // Any JSON value; null on update removes it.
    requestBody?: unknown;
}

export type UpdateMockApiRequest = Partial<CreateMockApiRequest>;

interface MockApiResponse {
    success: boolean;
    message?: string;
    data: MockApi;
}

interface MockApiListResponse {
    success: boolean;
    data: MockApi[];
}

export async function getMockApis(): Promise<MockApi[]> {
    const response = await api.get<MockApiListResponse>("/mock-apis");

    return response.data.data;
}

export async function getMockApi(id: string): Promise<MockApi> {
    const response = await api.get<MockApiResponse>(`/mock-apis/${id}`);

    return response.data.data;
}

export async function createMockApi(data: CreateMockApiRequest): Promise<MockApi> {
    const response = await api.post<MockApiResponse>("/mock-apis", data);

    return response.data.data;
}

export async function updateMockApi(id: string, data: UpdateMockApiRequest): Promise<MockApi> {
    const response = await api.put<MockApiResponse>(`/mock-apis/${id}`, data);

    return response.data.data;
}

export async function deleteAllMockApis(): Promise<number> {
    const response = await api.delete<{ success: boolean; data: { deletedCount: number } }>("/mock-apis", { params: { confirm: "all" } });

    return response.data.data.deletedCount;
}

export async function deleteMockApi(id: string): Promise<void> {
    await api.delete(`/mock-apis/${id}`);
}
