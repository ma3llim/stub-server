import { useState } from "react";
import { CheckCircle2, FileJson, Loader2 } from "lucide-react";

import { importScenario, type ScenarioExportFile, type ScenarioImportResult } from "../../api/transfer.api";
import type { MockScenario } from "../../api/scenario.api";
import FileDropZone from "./FileDropZone";
import TransferModal, { TransferErrorAlert } from "./TransferModal";
import { KIND_LABELS, primaryButtonClass, readExportFile, secondaryButtonClass, toTransferError, type TransferErrorInfo } from "./transfer-utils";

interface ImportScenarioModalProps {
    mockApiId: string;
    mockApiLabel: string;
    onImported: (scenario: MockScenario, activated: boolean) => void;
    onClose: () => void;
}

type Step = { name: "select" } | { name: "preview"; fileName: string; file: ScenarioExportFile } | { name: "done"; result: ScenarioImportResult };

export default function ImportScenarioModal({ mockApiId, mockApiLabel, onImported, onClose }: ImportScenarioModalProps) {
    const [step, setStep] = useState<Step>({ name: "select" });
    const [reading, setReading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState<TransferErrorInfo | null>(null);

    async function handleFile(file: File): Promise<void> {
        setReading(true);
        setError(null);

        try {
            const parsed = await readExportFile(file);

            if (parsed.kind !== "scenario") {
                throw new Error(`This file contains ${KIND_LABELS[parsed.kind]}, not a scenario. Import it from the dashboard using "Import" instead.`);
            }

            setStep({ name: "preview", fileName: file.name, file: parsed });
        } catch (readError) {
            setError(toTransferError(readError, "Couldn't read the file."));
        } finally {
            setReading(false);
        }
    }

    async function handleImport(file: ScenarioExportFile): Promise<void> {
        setImporting(true);
        setError(null);

        try {
            const result = await importScenario(mockApiId, file);

            onImported(result.scenario, result.activated);
            setStep({ name: "done", result });
        } catch (importError) {
            setError(toTransferError(importError, "Failed to import the scenario."));
        } finally {
            setImporting(false);
        }
    }

    const description = (
        <>
            Add a shared scenario to <span className="font-mono text-text-primary">{mockApiLabel}</span>
        </>
    );

    if (step.name === "done") {
        const { scenario, renamedFrom, activated } = step.result;

        return (
            <TransferModal
                title="Scenario imported"
                description={description}
                onClose={onClose}
                footer={
                    <button type="button" onClick={onClose} className={primaryButtonClass}>
                        Done
                    </button>
                }
            >
                <div className="flex flex-col items-center py-4 text-center">
                    <CheckCircle2 className="h-10 w-10 text-success" />
                    <p className="mt-3 text-sm text-text-primary">
                        <span className="font-semibold">{scenario.name}</span> was added to this API.
                    </p>
                    {renamedFrom && <p className="mt-2 text-sm text-text-secondary">A scenario named "{renamedFrom}" already existed, so the import was renamed.</p>}
                    {activated && <p className="mt-2 text-sm text-text-secondary">It's now the active scenario because the API had none.</p>}
                </div>
            </TransferModal>
        );
    }

    if (step.name === "preview") {
        const { scenario } = step.file;
        const headerCount = Object.keys(scenario.headers ?? {}).length;

        return (
            <TransferModal
                title="Import scenario"
                description={description}
                busy={importing}
                onClose={onClose}
                footer={
                    <>
                        <button type="button" onClick={() => setStep({ name: "select" })} disabled={importing} className={secondaryButtonClass}>
                            Choose another file
                        </button>
                        <button type="button" onClick={() => void handleImport(step.file)} disabled={importing} className={primaryButtonClass}>
                            {importing && <Loader2 className="h-4 w-4 animate-spin" />}
                            {importing ? "Importing..." : "Import scenario"}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                        <FileJson className="h-4 w-4" />
                        <span className="truncate">{step.fileName}</span>
                    </div>

                    <div className="rounded-lg border border-border bg-inset p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-md border border-border-strong px-2 py-1 font-mono text-xs font-medium text-text-primary">{scenario.statusCode}</span>
                            <span className="text-sm font-medium text-text-primary">{scenario.name}</span>
                        </div>

                        <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                            <div>
                                <dt className="text-text-muted">Delay</dt>
                                <dd className="mt-0.5 font-mono text-text-secondary">{scenario.delayMs} ms</dd>
                            </div>
                            <div>
                                <dt className="text-text-muted">Headers</dt>
                                <dd className="mt-0.5 font-mono text-text-secondary">{headerCount}</dd>
                            </div>
                            <div>
                                <dt className="text-text-muted">Body</dt>
                                <dd className="mt-0.5 font-mono text-text-secondary">{JSON.stringify(scenario.responseBody ?? {}).length.toLocaleString()} chars</dd>
                            </div>
                        </dl>
                    </div>

                    <p className="text-xs text-text-muted">If this API already has a scenario with the same name, the imported one gets a number added, like "(2)".</p>

                    {error && <TransferErrorAlert error={error} />}
                </div>
            </TransferModal>
        );
    }

    return (
        <TransferModal title="Import scenario" description={description} busy={reading} onClose={onClose}>
            <div className="space-y-4">
                <FileDropZone hint="Use a file from Export on a scenario row" loading={reading} onFile={(file) => void handleFile(file)} />
                {error && <TransferErrorAlert error={error} />}
            </div>
        </TransferModal>
    );
}
