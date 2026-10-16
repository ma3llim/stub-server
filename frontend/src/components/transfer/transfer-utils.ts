import { isAxiosError } from "axios";

import { EXPORT_FORMAT, EXPORT_VERSION, type ExportFile, type ExportKind } from "../../api/transfer.api";

// Matches the management API's JSON body limit.
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export const secondaryButtonClass =
    "rounded-lg border border-border-strong px-4 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-surface-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50";

export const primaryButtonClass =
    "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50";

export const KIND_LABELS: Record<ExportKind, string> = {
    scenario: "a single scenario",
    api: "a single API",
    workspace: "a full workspace export",
};

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

function slugify(value: string): string {
    return (
        value
            .toLowerCase()
            .replace(/\{([^}]*)\}/g, "$1")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 60) || "export"
    );
}

export function exportFileName(...parts: string[]): string {
    return `${slugify(parts.join(" "))}.mock-api.json`;
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
