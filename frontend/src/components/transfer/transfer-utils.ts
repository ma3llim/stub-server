import { isAxiosError } from "axios";

import type { HttpMethod } from "../../api/mock-api.api";
import { EXPORT_FORMAT, EXPORT_VERSION, type ExportedApi, type ExportFile, type WorkspaceExportFile } from "../../api/transfer.api";

export interface PickerScenario {
    key: string;
    name: string;
    statusCode: number;
    active: boolean;
}

export interface PickerApi {
    key: string;
    method: HttpMethod;
    name: string;
    path: string;
    scenarios: PickerScenario[];
    badge?: { label: string; className: string };
}

// Selected scenario keys per API key. An API is included only if it has an entry.
export type PickerSelection = Map<string, Set<string>>;

export function selectAllPicker(apis: PickerApi[]): PickerSelection {
    return new Map(apis.map((api) => [api.key, new Set(api.scenarios.map((scenario) => scenario.key))]));
}

// The scenario the user chose as active, per API key.
export type PickerActive = Map<string, string>;

export function initialActive(apis: PickerApi[]): PickerActive {
    return new Map(apis.flatMap((api) => api.scenarios.filter((scenario) => scenario.active).map((scenario) => [api.key, scenario.key] as const)));
}

/**
 * The scenario that will actually be active: the chosen one if it's selected,
 * otherwise the first selected scenario (what the importer does by default).
 */
export function effectiveActive(scenarioKeys: string[], selected: Set<string> | undefined, chosen: string | undefined): string | null {
    if (!selected || selected.size === 0) {
        return null;
    }

    if (chosen && selected.has(chosen)) {
        return chosen;
    }

    return scenarioKeys.find((key) => selected.has(key)) ?? null;
}

export function countSelection(selection: PickerSelection): { apis: number; scenarios: number } {
    return { apis: selection.size, scenarios: [...selection.values()].reduce((total, keys) => total + keys.size, 0) };
}

export function apisInFile(file: ExportFile): ExportedApi[] {
    if (file.kind === "api") {
        return [file.api];
    }

    return file.kind === "workspace" ? file.apis : [];
}

/**
 * Builds a workspace file with only the selected APIs and scenarios, using the
 * index-based keys from {@link apisInFile}. The active scenario index points at the
 * user's chosen active scenario (see {@link effectiveActive}) within the kept scenarios.
 */
export function filterExportFile(file: ExportFile, selection: PickerSelection, active: PickerActive): WorkspaceExportFile {
    const apis = apisInFile(file).flatMap((api, apiIndex) => {
        const selected = selection.get(String(apiIndex));

        if (!selected) {
            return [];
        }

        const kept = api.scenarios.map((scenario, index) => ({ scenario, key: String(index) })).filter(({ key }) => selected.has(key));
        const activeKey = effectiveActive(
            kept.map(({ key }) => key),
            selected,
            active.get(String(apiIndex)),
        );
        const activeIndex = kept.findIndex(({ key }) => key === activeKey);

        return [{ ...api, scenarios: kept.map(({ scenario }) => scenario), activeScenarioIndex: activeIndex >= 0 ? activeIndex : null }];
    });

    return { format: file.format, version: file.version, kind: "workspace", exportedAt: file.exportedAt, apis };
}

// Matches the management API's JSON body limit.
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export const secondaryButtonClass =
    "rounded-lg border border-border-strong px-4 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-surface-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50";

export const primaryButtonClass =
    "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50";

export interface TransferErrorInfo {
    message: string;
    issues: string[];
}

export function toTransferError(error: unknown, fallback: string): TransferErrorInfo {
    if (isAxiosError(error)) {
        if (!error.response) {
            return { message: "Can't reach the server. Check your connection and try again.", issues: [] };
        }

        const data = error.response.data as { message?: unknown; issues?: unknown } | undefined;
        const issues = Array.isArray(data?.issues) ? data.issues.filter((issue): issue is string => typeof issue === "string") : [];

        return { message: typeof data?.message === "string" ? data.message : fallback, issues };
    }

    if (error instanceof Error) {
        return { message: error.message, issues: [] };
    }

    return { message: fallback, issues: [] };
}

/**
 * Reads and sanity-checks an export file in the browser so obvious mistakes
 * (wrong file, broken JSON) are reported before anything is sent. The server
 * still does the full validation.
 */
export async function readExportFile(file: File): Promise<ExportFile> {
    if (!file.name.toLowerCase().endsWith(".json")) {
        throw new Error("Choose a .json export file.");
    }

    if (file.size === 0) {
        throw new Error("The file is empty.");
    }

    if (file.size > MAX_FILE_BYTES) {
        throw new Error("The file is larger than 10 MB.");
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(await file.text());
    } catch {
        throw new Error("The file isn't valid JSON.");
    }

    if (typeof parsed !== "object" || parsed === null || (parsed as { format?: unknown }).format !== EXPORT_FORMAT) {
        throw new Error("The file is not a Mock API export.");
    }

    const { version, kind } = parsed as { version?: unknown; kind?: unknown };

    if (typeof version !== "number" || version > EXPORT_VERSION) {
        throw new Error(`This file uses export version ${String(version)}, which this app doesn't support.`);
    }

    if (kind !== "scenario" && kind !== "api" && kind !== "workspace") {
        throw new Error("The file has an unknown export type.");
    }

    return parsed as ExportFile;
}

export function downloadJson(data: unknown, fileName: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Give the browser a moment to start the download before releasing the blob.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
