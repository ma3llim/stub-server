import { useMemo, useState } from "react";
import { CheckCircle2, FileJson, Loader2 } from "lucide-react";

import { importApis, previewApiImport, type ConflictStrategy, type ExportFile, type ImportItem, type ImportPreview, type ImportResult } from "../../api/transfer.api";
import { methodStyles } from "../mock-api/method-styles";
import ApiScenarioPicker from "./ApiScenarioPicker";
import FileDropZone from "./FileDropZone";
import TransferModal, { TransferErrorAlert } from "./TransferModal";
import {
    apisInFile,
    countSelection,
    filterExportFile,
    initialActive,
    primaryButtonClass,
    readExportFile,
    secondaryButtonClass,
    selectAllPicker,
    toTransferError,
    type PickerActive,
    type PickerApi,
    type PickerSelection,
    type TransferErrorInfo,
} from "./transfer-utils";

interface ImportApisModalProps {
    onImported: () => void;
    onClose: () => void;
}

type Step =
    | { name: "select" }
    | { name: "preview"; fileName: string; file: ExportFile; preview: ImportPreview; pickerApis: PickerApi[] }
    | { name: "done"; result: ImportResult };

const statusBadge: Record<string, { label: string; className: string }> = {
    new: { label: "New", className: "border-success/30 bg-success/10 text-success" },
    conflict: { label: "Exists", className: "border-warning/30 bg-warning/10 text-warning" },
    created: { label: "Created", className: "border-success/30 bg-success/10 text-success" },
    replaced: { label: "Replaced", className: "border-primary/40 bg-primary/10 text-primary-text" },
    skipped: { label: "Skipped", className: "border-border-strong bg-surface-hover text-text-muted" },
};

/*
 * Picker keys are indexes into the file: API "i" is apisInFile(file)[i] and scenario "j"
 * is its scenarios[j]. The server's preview items are returned in the same order.
 */
function toPickerApis(file: ExportFile, preview: ImportPreview): PickerApi[] {
    return apisInFile(file).map((api, apiIndex) => ({
        key: String(apiIndex),
        method: api.method,
        name: api.name,
        path: api.path,
        badge: statusBadge[preview.items[apiIndex]?.status ?? "new"],
        scenarios: api.scenarios.map((scenario, index) => ({
            key: String(index),
            name: scenario.name,
            statusCode: scenario.statusCode,
            active: api.activeScenarioIndex === index,
        })),
    }));
}

function ResultList({ items }: { items: ImportItem[] }) {
    return (
        <ul className="max-h-72 divide-y divide-border overflow-y-auto overscroll-contain rounded-lg border border-border">
            {items.map((item) => {
                const badge = statusBadge[item.result ?? item.status];

                return (
                    <li key={`${item.method} ${item.path}`} className="flex items-center gap-3 px-3 py-2.5">
                        <span className={`w-16 flex-none rounded px-1.5 py-0.5 text-center font-mono text-[11px] font-bold ${methodStyles[item.method]}`}>{item.method}</span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-text-primary">{item.name}</p>
                            <p className="truncate font-mono text-xs text-text-muted">{item.path}</p>
                        </div>
                        <span className="hidden flex-none text-xs text-text-muted sm:block">
                            {item.scenarioCount} scenario{item.scenarioCount === 1 ? "" : "s"}
                        </span>
                        <span className={`flex-none rounded-full border px-2 py-0.5 text-xs font-medium ${badge.className}`}>{badge.label}</span>
                    </li>
                );
            })}
        </ul>
    );
}

function StrategyOption({ value, current, title, description, onChange }: { value: ConflictStrategy; current: ConflictStrategy; title: string; description: string; onChange: (value: ConflictStrategy) => void }) {
    const selected = value === current;

    return (
        <label className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition ${selected ? "border-primary bg-primary/10" : "border-border hover:bg-surface-hover"}`}>
            <input type="radio" name="conflict-strategy" value={value} checked={selected} onChange={() => onChange(value)} className="mt-0.5 accent-primary" />
            <span>
                <span className="block text-sm font-medium text-text-primary">{title}</span>
                <span className="block text-xs text-text-secondary">{description}</span>
            </span>
        </label>
    );
}

export default function ImportApisModal({ onImported, onClose }: ImportApisModalProps) {
    const [step, setStep] = useState<Step>({ name: "select" });
    const [checking, setChecking] = useState(false);
    const [importing, setImporting] = useState(false);
    const [strategy, setStrategy] = useState<ConflictStrategy>("skip");
    const [selection, setSelection] = useState<PickerSelection>(new Map());
    const [active, setActive] = useState<PickerActive>(new Map());
    const [error, setError] = useState<TransferErrorInfo | null>(null);

    async function handleFile(file: File): Promise<void> {
        setChecking(true);
        setError(null);

        try {
            const parsed = await readExportFile(file);

            if (parsed.kind === "scenario") {
                throw new Error("This file contains a single scenario. Open the API you want to add it to and use Import in its Scenarios section.");
            }

            // The preview validates the whole file and flags APIs that already exist.
            const preview = await previewApiImport(parsed);
            const pickerApis = toPickerApis(parsed, preview);

            setStrategy("skip");
            setSelection(selectAllPicker(pickerApis));
            setActive(initialActive(pickerApis));
            setStep({ name: "preview", fileName: file.name, file: parsed, preview, pickerApis });
        } catch (checkError) {
            setError(toTransferError(checkError, "Couldn't check the file."));
        } finally {
            setChecking(false);
        }
    }

    async function handleImport(file: ExportFile): Promise<void> {
        setImporting(true);
        setError(null);

        try {
            const result = await importApis(filterExportFile(file, selection, active), strategy);

            setStep({ name: "done", result });
            onImported();
        } catch (importError) {
            setError(toTransferError(importError, "Failed to import the file."));
        } finally {
            setImporting(false);
        }
    }

    const selectedStats = useMemo(() => {
        if (step.name !== "preview") {
            return { new: 0, conflicts: 0 };
        }

        const statuses = [...selection.keys()].map((key) => step.preview.items[Number(key)]?.status);

        return { new: statuses.filter((status) => status === "new").length, conflicts: statuses.filter((status) => status === "conflict").length };
    }, [step, selection]);

    const description = "Choose which APIs and scenarios to add from an exported file.";

    if (step.name === "done") {
        const { summary, items } = step.result;
        const parts = [
            summary.created > 0 && `${summary.created} created`,
            summary.replaced > 0 && `${summary.replaced} replaced`,
            summary.skipped > 0 && `${summary.skipped} skipped`,
        ].filter(Boolean);

        return (
            <TransferModal
                title="Import complete"
                description={description}
                onClose={onClose}
                footer={
                    <button type="button" onClick={onClose} className={primaryButtonClass}>
                        Done
                    </button>
                }
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-4">
                        <CheckCircle2 className="h-6 w-6 flex-none text-success" />
                        <div className="text-sm">
                            <p className="font-medium text-text-primary">APIs: {parts.join(", ")}</p>
                            <p className="text-text-secondary">
                                {summary.scenarios} scenario{summary.scenarios === 1 ? "" : "s"} imported.
                            </p>
                        </div>
                    </div>
                    <ResultList items={items} />
                </div>
            </TransferModal>
        );
    }

    if (step.name === "preview") {
        const { preview, pickerApis } = step;
        const counts = countSelection(selection);
        const willWrite = selectedStats.new + (strategy === "replace" ? selectedStats.conflicts : 0);

        return (
            <TransferModal
                title="Review import"
                description={description}
                busy={importing}
                onClose={onClose}
                footer={
                    <>
                        <span className="mr-auto text-xs text-text-muted">
                            {counts.apis} API{counts.apis === 1 ? "" : "s"} · {counts.scenarios} scenario{counts.scenarios === 1 ? "" : "s"} selected
                        </span>
                        <button type="button" onClick={() => setStep({ name: "select" })} disabled={importing} className={secondaryButtonClass}>
                            Choose another file
                        </button>
                        <button type="button" onClick={() => void handleImport(step.file)} disabled={importing || willWrite === 0} className={primaryButtonClass}>
                            {importing && <Loader2 className="h-4 w-4 animate-spin" />}
                            {importing ? "Importing..." : `Import ${willWrite} API${willWrite === 1 ? "" : "s"}`}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                        <span className="flex min-w-0 items-center gap-1.5">
                            <FileJson className="h-4 w-4 flex-none" />
                            <span className="truncate">{step.fileName}</span>
                        </span>
                        <span>
                            {pickerApis.length} API{pickerApis.length === 1 ? "" : "s"} in file · {preview.summary.new} new · {preview.summary.conflicts} already exist
                            {preview.summary.conflicts === 1 ? "s" : ""}
                        </span>
                    </div>

                    <ApiScenarioPicker apis={pickerApis} selection={selection} onChange={setSelection} active={active} onActiveChange={setActive} />

                    {selectedStats.conflicts > 0 && (
                        <fieldset className="space-y-2">
                            <legend className="mb-2 text-sm font-medium text-text-primary">
                                {selectedStats.conflicts} selected API{selectedStats.conflicts === 1 ? "" : "s"} already exist{selectedStats.conflicts === 1 ? "s" : ""}
                            </legend>
                            <StrategyOption
                                value="skip"
                                current={strategy}
                                onChange={setStrategy}
                                title="Skip existing APIs"
                                description="Keep your current versions and only add the new ones."
                            />
                            <StrategyOption
                                value="replace"
                                current={strategy}
                                onChange={setStrategy}
                                title="Replace existing APIs"
                                description="Overwrite name, description, mock responses and all scenarios with the selected scenarios from the file."
                            />
                        </fieldset>
                    )}

                    {counts.apis === 0 && <p className="text-sm text-text-secondary">Select at least one API to import.</p>}
                    {counts.apis > 0 && willWrite === 0 && <p className="text-sm text-text-secondary">All selected APIs already exist. Choose "Replace existing APIs" to overwrite them.</p>}

                    {error && <TransferErrorAlert error={error} />}
                </div>
            </TransferModal>
        );
    }

    return (
        <TransferModal title="Import APIs" description={description} busy={checking} onClose={onClose}>
            <div className="space-y-4">
                <FileDropZone hint="Use a file from Export API or Export all" loading={checking} onFile={(file) => void handleFile(file)} />
                {error && <TransferErrorAlert error={error} />}
            </div>
        </TransferModal>
    );
}
