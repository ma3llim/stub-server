import mongoose from "mongoose";
import { ZodError, type ZodType } from "zod";

import { MockApi, type MockApiDocument, type MockScenario } from "../../../models/mock-api.model.js";
import { normalizePath } from "../../../stub/utils/path-matcher.js";
import { getMockApis } from "../mock-api.service.js";

import {
    EXPORT_FORMAT,
    EXPORT_VERSION,
    apiExportFileSchema,
    scenarioExportFileSchema,
    workspaceExportFileSchema,
    type ConflictStrategy,
    type ExportFile,
    type ExportKind,
    type ExportedApi,
    type ExportedScenario,
} from "./transfer.validation.js";

/**
 * A problem with an uploaded export file that the user can fix. The controller
 * turns it into a 4xx response with a readable message and optional field issues.
 */
export class TransferError extends Error {
    constructor(
        message: string,
        readonly status = 400,
        readonly issues: string[] = [],
    ) {
        super(message);
    }
}

const MAX_REPORTED_ISSUES = 10;

function endpointKey(method: string, path: string): string {
    return `${method.toUpperCase()} ${normalizePath(path)}`;
}

function formatIssuePath(path: PropertyKey[]): string {
    return path.reduce<string>((result, key) => (typeof key === "number" ? `${result}[${key}]` : result ? `${result}.${String(key)}` : String(key)), "");
}

function zodIssues(error: ZodError): string[] {
    const issues = error.issues.slice(0, MAX_REPORTED_ISSUES).map((issue) => {
        const path = formatIssuePath(issue.path);

        return path ? `${path}: ${issue.message}` : issue.message;
    });

    if (error.issues.length > MAX_REPORTED_ISSUES) {
        issues.push(`...and ${error.issues.length - MAX_REPORTED_ISSUES} more`);
    }

    return issues;
}

function parseWith<T>(schema: ZodType<T>, value: unknown): T {
    const result = schema.safeParse(value);

    if (!result.success) {
        throw new TransferError("The file has invalid or missing fields.", 400, zodIssues(result.error));
    }

    return result.data;
}

/**
 * Checks the envelope first so users get a specific message (wrong file, newer
 * version, unknown kind) before any field-level validation.
 */
export function parseExportFile(value: unknown): ExportFile {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new TransferError("The file is not a Mock API export.");
    }

    const { format, version, kind } = value as Record<string, unknown>;

    if (format !== EXPORT_FORMAT) {
        throw new TransferError("The file is not a Mock API export.");
    }

    if (typeof version !== "number" || version > EXPORT_VERSION) {
        throw new TransferError(`This file uses export version ${String(version)}, which this app doesn't support. Supported version: ${EXPORT_VERSION}.`);
    }

    switch (kind) {
        case "scenario":
            return parseWith(scenarioExportFileSchema, value);
        case "api":
            return parseWith(apiExportFileSchema, value);
        case "workspace":
            return parseWith(workspaceExportFileSchema, value);
        default:
            throw new TransferError("The file has an unknown export type.");
    }
}

function envelope<K extends ExportKind>(kind: K) {
    return {
        format: EXPORT_FORMAT,
        version: EXPORT_VERSION,
        kind,
        exportedAt: new Date().toISOString(),
    };
}

function toExportedScenario(scenario: MockScenario): ExportedScenario {
    return {
        name: scenario.name,
        statusCode: scenario.statusCode,
        headers: scenario.headers ?? {},
        responseBody: scenario.responseBody ?? {},
        delayMs: scenario.delayMs ?? 0,
    };
}

function toExportedApi(mockApi: MockApiDocument): ExportedApi {
    const activeIndex = mockApi.activeScenarioId ? mockApi.scenarios.findIndex((scenario) => scenario._id.equals(mockApi.activeScenarioId)) : -1;

    return {
        name: mockApi.name,
        method: mockApi.method,
        path: mockApi.path,
        ...(mockApi.description && { description: mockApi.description }),
        ...(mockApi.successResponse && { successResponse: mockApi.successResponse }),
        ...(mockApi.errorResponse && { errorResponse: mockApi.errorResponse }),
        ...(mockApi.requestBody !== undefined && mockApi.requestBody !== null && { requestBody: mockApi.requestBody }),
        activeScenarioIndex: activeIndex >= 0 ? activeIndex : null,
        scenarios: mockApi.scenarios.map(toExportedScenario),
    };
}

export async function exportWorkspace() {
    const mockApis = await getMockApis();

    return { ...envelope("workspace"), apis: mockApis.map(toExportedApi) };
}

export interface ExportSelection {
    id: string;
    scenarioIds: string[];
    activeScenarioId?: string;
}

/**
 * Exports only the chosen APIs, each with only the chosen scenarios (kept in the
 * API's own order). The active scenario is `activeScenarioId` when given, else the
 * API's current one; if that was left out, the file has no active scenario and the
 * importer falls back to the first one.
 */
export async function exportSelectedApis(selection: ExportSelection[]) {
    const byId = new Map((await getMockApis()).map((mockApi) => [mockApi.id as string, mockApi]));
    const apis: ExportedApi[] = [];
    const seen = new Set<string>();

    for (const { id, scenarioIds, activeScenarioId } of selection) {
        if (seen.has(id)) {
            continue;
        }

        seen.add(id);

        const mockApi = byId.get(id);

        if (!mockApi) {
            throw new TransferError("Some selected APIs no longer exist. Refresh the list and try again.", 404);
        }

        const wanted = new Set(scenarioIds);
        const scenarios = mockApi.scenarios.filter((scenario) => wanted.has(scenario._id.toString()));

        if (scenarios.length !== wanted.size) {
            throw new TransferError(`Some selected scenarios of "${mockApi.name}" no longer exist. Refresh the list and try again.`, 404);
        }

        if (activeScenarioId !== undefined && !wanted.has(activeScenarioId)) {
            throw new TransferError(`The active scenario chosen for "${mockApi.name}" must be one of its selected scenarios.`);
        }

        const exported = toExportedApi(mockApi);
        const activeId = activeScenarioId ?? mockApi.activeScenarioId?.toString();
        const activeIndex = scenarios.findIndex((scenario) => scenario._id.toString() === activeId);

        apis.push({
            ...exported,
            scenarios: scenarios.map(toExportedScenario),
            activeScenarioIndex: activeIndex >= 0 ? activeIndex : null,
        });
    }

    return { ...envelope("workspace"), apis };
}

function buildScenarios(api: ExportedApi) {
    const scenarios = api.scenarios.map((scenario) => ({ _id: new mongoose.Types.ObjectId(), ...scenario }) as MockScenario);
    const active = scenarios[api.activeScenarioIndex ?? 0];

    return { scenarios, activeScenarioId: active?._id };
}

export type ImportItemStatus = "new" | "conflict";
export type ImportItemResult = "created" | "replaced" | "skipped";

interface ImportItem {
    name: string;
    method: string;
    path: string;
    scenarioCount: number;
    status: ImportItemStatus;
    result?: ImportItemResult;
}

export async function importApis(rawFile: unknown, conflictStrategy: ConflictStrategy, dryRun: boolean) {
    const file = parseExportFile(rawFile);

    if (file.kind === "scenario") {
        throw new TransferError("This file contains a single scenario. Importing single scenarios is no longer supported; use a file from Export all.");
    }

    const apis = file.kind === "api" ? [file.api] : file.apis;

    if (apis.length === 0) {
        throw new TransferError("The file doesn't contain any APIs.");
    }

    const seen = new Set<string>();

    for (const api of apis) {
        const key = endpointKey(api.method, api.path);

        if (seen.has(key)) {
            throw new TransferError(`The file contains ${api.method} ${api.path} more than once.`);
        }

        seen.add(key);
    }

    const existing = new Map<string, MockApiDocument>();

    for (const mockApi of await getMockApis()) {
        const key = endpointKey(mockApi.method, mockApi.path);

        if (!existing.has(key)) {
            existing.set(key, mockApi);
        }
    }

    const plan = apis.map((api) => ({ api, match: existing.get(endpointKey(api.method, api.path)) }));

    const items: ImportItem[] = plan.map(({ api, match }) => ({
        name: api.name,
        method: api.method,
        path: api.path,
        scenarioCount: api.scenarios.length,
        status: match ? "conflict" : "new",
    }));

    if (dryRun) {
        return {
            dryRun: true,
            items,
            summary: {
                new: items.filter((item) => item.status === "new").length,
                conflicts: items.filter((item) => item.status === "conflict").length,
            },
        };
    }

    /*
     * Everything has been validated above, so writes are not expected to fail.
     * Standalone MongoDB has no multi-document transactions; if a write does fail
     * the request errors and earlier APIs in this import stay saved.
     */
    const toCreate = [];

    for (const [index, { api, match }] of plan.entries()) {
        if (!match) {
            toCreate.push({
                name: api.name,
                method: api.method,
                path: api.path,
                description: api.description,
                successResponse: api.successResponse,
                errorResponse: api.errorResponse,
                requestBody: api.requestBody ?? undefined,
                ...buildScenarios(api),
            });
            items[index].result = "created";
            continue;
        }

        if (conflictStrategy === "skip") {
            items[index].result = "skipped";
            continue;
        }

        match.set({
            name: api.name,
            description: api.description,
            successResponse: api.successResponse,
            errorResponse: api.errorResponse,
            requestBody: api.requestBody ?? undefined,
            ...buildScenarios(api),
        });
        await match.save();
        items[index].result = "replaced";
    }

    if (toCreate.length > 0) {
        await MockApi.insertMany(toCreate);
    }

    const count = (result: ImportItemResult) => items.filter((item) => item.result === result).length;

    return {
        dryRun: false,
        items,
        summary: {
            created: count("created"),
            replaced: count("replaced"),
            skipped: count("skipped"),
            scenarios: items.filter((item) => item.result !== "skipped").reduce((total, item) => total + item.scenarioCount, 0),
        },
    };
}
