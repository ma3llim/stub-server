import api from "./axios";
import type { HttpMethod } from "./mock-api.api";
import type { MockScenario } from "./scenario.api";

export const EXPORT_FORMAT = "mock-api-platform/export";
export const EXPORT_VERSION = 1;

export type ExportKind = "scenario" | "api" | "workspace";

export interface ExportedScenario {
    name: string;
    statusCode: number;
    headers: Record<string, string>;
    responseBody: unknown;
    delayMs: number;
}

export interface ExportedApi {
    name: string;
    method: HttpMethod;
    path: string;
    description?: string;
    successResponse?: Record<string, unknown>;
    errorResponse?: Record<string, unknown>;
    activeScenarioIndex?: number | null;
    scenarios: ExportedScenario[];
}

interface ExportEnvelope<K extends ExportKind> {
    format: typeof EXPORT_FORMAT;
    version: number;
    kind: K;
    exportedAt?: string;
}

export type ScenarioExportFile = ExportEnvelope<"scenario"> & { scenario: ExportedScenario };
export type ApiExportFile = ExportEnvelope<"api"> & { api: ExportedApi };
export type WorkspaceExportFile = ExportEnvelope<"workspace"> & { apis: ExportedApi[] };
export type ExportFile = ScenarioExportFile | ApiExportFile | WorkspaceExportFile;

export type ConflictStrategy = "skip" | "replace";

export interface ImportItem {
    name: string;
    method: HttpMethod;
    path: string;
    scenarioCount: number;
    status: "new" | "conflict";
    result?: "created" | "replaced" | "skipped";
}

export interface ImportPreview {
    dryRun: true;
    items: ImportItem[];
    summary: { new: number; conflicts: number };
}

export interface ImportResult {
    dryRun: false;
    items: ImportItem[];
    summary: { created: number; replaced: number; skipped: number; scenarios: number };
}

export interface ScenarioImportResult {
    scenario: MockScenario;
    renamedFrom?: string;
    activated: boolean;
}

interface DataResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export async function exportWorkspace(): Promise<WorkspaceExportFile> {
    const response = await api.get<DataResponse<WorkspaceExportFile>>("/mock-apis/export");

    return response.data.data;
}

export interface ExportSelectionItem {
    id: string;
    scenarioIds: string[];
    // Must be one of scenarioIds; written to the file as the active scenario.
    activeScenarioId?: string;
}

export async function exportSelectedApis(apis: ExportSelectionItem[]): Promise<WorkspaceExportFile> {
    const response = await api.post<DataResponse<WorkspaceExportFile>>("/mock-apis/export", { apis });

    return response.data.data;
}

export async function exportApi(mockApiId: string): Promise<ApiExportFile> {
    const response = await api.get<DataResponse<ApiExportFile>>(`/mock-apis/${mockApiId}/export`);

    return response.data.data;
}

export async function exportScenario(mockApiId: string, scenarioId: string): Promise<ScenarioExportFile> {
    const response = await api.get<DataResponse<ScenarioExportFile>>(`/mock-apis/${mockApiId}/scenarios/${scenarioId}/export`);

    return response.data.data;
}

export async function previewApiImport(file: unknown): Promise<ImportPreview> {
    const response = await api.post<DataResponse<ImportPreview>>("/mock-apis/import", { file, dryRun: true });

    return response.data.data;
}

export async function importApis(file: unknown, conflictStrategy: ConflictStrategy): Promise<ImportResult> {
    const response = await api.post<DataResponse<ImportResult>>("/mock-apis/import", { file, conflictStrategy, dryRun: false });

    return response.data.data;
}

export async function importScenario(mockApiId: string, file: unknown): Promise<ScenarioImportResult> {
    const response = await api.post<DataResponse<ScenarioImportResult>>(`/mock-apis/${mockApiId}/scenarios/import`, { file });

    return response.data.data;
}
