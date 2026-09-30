import api from "./axios";

export interface User {
    id: string;
    username: string;
    email: string;
    role: "USER" | "ADMIN";
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        user: User;
    };
}

interface MeResponse {
    success: boolean;
    data: User;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", data);

    return response.data;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", data);

    return response.data;
}

export async function refreshToken(): Promise<void> {
    await api.post("/auth/refresh");
}

export async function logout(): Promise<void> {
    await api.post("/auth/logout");
}

export async function getCurrentUser(): Promise<User> {
    const response = await api.get<MeResponse>("/auth/me");

    return response.data.data;
}
