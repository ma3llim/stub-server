import { useState } from "react";
import { CheckCircle2, FileJson, Loader2 } from "lucide-react";

import { importApis, previewApiImport, type ConflictStrategy, type ExportFile, type ImportItem, type ImportPreview, type ImportResult } from "../../api/transfer.api";
import { methodStyles } from "../mock-api/method-styles";
import FileDropZone from "./FileDropZone";
import TransferModal, { TransferErrorAlert } from "./TransferModal";
import { primaryButtonClass, readExportFile, secondaryButtonClass, toTransferError, type TransferErrorInfo } from "./transfer-utils";

interface ImportApisModalProps {
    onImported: () => void;
    onClose: () => void;
}

type Step =
    | { name: "select" }
    | { name: "preview"; fileName: string; file: ExportFile; preview: ImportPreview }
    | { name: "done"; result: ImportResult };

const statusBadge: Record<string, { label: string; className: string }> = {
    new: { label: "New", className: "border-success/30 bg-success/10 text-success" },
    conflict: { label: "Exists", className: "border-warning/30 bg-warning/10 text-warning" },
    created: { label: "Created", className: "border-success/30 bg-success/10 text-success" },
    replaced: { label: "Replaced", className: "border-primary/40 bg-primary/10 text-primary-text" },
    skipped: { label: "Skipped", className: "border-border-strong bg-surface-hover text-text-muted" },
};

function ItemList({ items, show }: { items: ImportItem[]; show: "status" | "result" }) {
    return (
        <ul className="max-h-72 divide-y divide-border overflow-y-auto rounded-lg border border-border">
            {items.map((item) => {
                const badge = statusBadge[(show === "result" ? item.result : item.status) ?? item.status];

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
    const [error, setError] = useState<TransferErrorInfo | null>(null);

    async function handleFile(file: File): Promise<void> {
        setChecking(true);
        setError(null);

        try {
            const parsed = await readExportFile(file);

            if (parsed.kind === "scenario") {
                throw new Error("This file contains a single scenario. Open the API you want to add it to and use Import in its Scenarios section.");
            }

            const preview = await previewApiImport(parsed);

            setStrategy("skip");
            setStep({ name: "preview", fileName: file.name, file: parsed, preview });
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
            const result = await importApis(file, strategy);

            setStep({ name: "done", result });
            onImported();
        } catch (importError) {
            setError(toTransferError(importError, "Failed to import the file."));
        } finally {
            setImporting(false);
        }
    }

    const description = "Add APIs and their scenarios from an exported file.";

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
                    <ItemList items={items} show="result" />
                </div>
            </TransferModal>
        );
    }

    if (step.name === "preview") {
        const { preview } = step;
        const { new: newCount, conflicts } = preview.summary;
        const total = preview.items.length;
        const willWrite = newCount + (strategy === "replace" ? conflicts : 0);

        return (
            <TransferModal
                title="Review import"
                description={description}
                busy={importing}
                onClose={onClose}
                footer={
                    <>
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
                            {total} API{total === 1 ? "" : "s"} · {newCount} new · {conflicts} already exist{conflicts === 1 ? "s" : ""}
                        </span>
                    </div>

                    <ItemList items={preview.items} show="status" />

                    {conflicts > 0 && (
                        <fieldset className="space-y-2">
                            <legend className="mb-2 text-sm font-medium text-text-primary">
                                {conflicts} API{conflicts === 1 ? "" : "s"} with the same method and path already exist{conflicts === 1 ? "s" : ""}
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
                                description="Overwrite name, description, mock responses and all scenarios with the file's version."
                            />
                        </fieldset>
                    )}

                    {willWrite === 0 && <p className="text-sm text-text-secondary">Every API in this file already exists. Choose "Replace existing APIs" to overwrite them.</p>}

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
