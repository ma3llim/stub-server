import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { getMockApis, type MockApi } from "../../api/mock-api.api";
import { exportSelectedApis } from "../../api/transfer.api";
import ApiScenarioPicker from "./ApiScenarioPicker";
import TransferModal, { TransferErrorAlert } from "./TransferModal";
import {
    countSelection,
    downloadJson,
    effectiveActive,
    initialActive,
    primaryButtonClass,
    secondaryButtonClass,
    selectAllPicker,
    toTransferError,
    type PickerActive,
    type PickerApi,
    type PickerSelection,
    type TransferErrorInfo,
} from "./transfer-utils";

interface ExportApisModalProps {
    onClose: () => void;
}

function toPickerApis(mockApis: MockApi[]): PickerApi[] {
    return mockApis.map((mockApi) => ({
        key: mockApi._id,
        method: mockApi.method,
        name: mockApi.name,
        path: mockApi.path,
        scenarios: mockApi.scenarios.flatMap((scenario) =>
            scenario._id ? [{ key: scenario._id, name: scenario.name, statusCode: scenario.statusCode, active: mockApi.activeScenarioId === scenario._id }] : [],
        ),
    }));
}

export default function ExportApisModal({ onClose }: ExportApisModalProps) {
    const [pickerApis, setPickerApis] = useState<PickerApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<TransferErrorInfo | null>(null);
    const [selection, setSelection] = useState<PickerSelection>(new Map());
    const [active, setActive] = useState<PickerActive>(new Map());
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<TransferErrorInfo | null>(null);

    // Loads a fresh list so scenarios edited since the dashboard loaded are included.
    const loadApis = useCallback(async () => {
        setLoading(true);
        setLoadError(null);

        try {
            const apis = toPickerApis(await getMockApis());

            setPickerApis(apis);
            setSelection(selectAllPicker(apis));
            setActive(initialActive(apis));
        } catch (error) {
            setLoadError(toTransferError(error, "Failed to load your APIs."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadApis();
    }, [loadApis]);

    const counts = countSelection(selection);
    const everything = useMemo(() => {
        const all = countSelection(selectAllPicker(pickerApis));

        return counts.apis === all.apis && counts.scenarios === all.scenarios;
    }, [pickerApis, counts.apis, counts.scenarios]);

    async function handleExport(): Promise<void> {
        setExporting(true);
        setExportError(null);

        try {
            // Keep the dashboard's order in the file.
            const apis = pickerApis.filter((api) => selection.has(api.key)).map((api) => {
                const selected = selection.get(api.key);
                const activeScenarioId = effectiveActive(
                    api.scenarios.map((scenario) => scenario.key),
                    selected,
                    active.get(api.key),
                );

                return { id: api.key, scenarioIds: [...(selected ?? [])], ...(activeScenarioId && { activeScenarioId }) };
            });
            const file = await exportSelectedApis(apis);
            const date = new Date().toISOString().slice(0, 10);

            downloadJson(file, `mock-apis-${everything ? "" : "selection-"}${date}.mock-api.json`);
            onClose();
        } catch (error) {
            setExportError(toTransferError(error, "Failed to export the selected APIs."));
        } finally {
            setExporting(false);
        }
    }

    const footer = (
        <>
            <span className="mr-auto text-xs text-text-muted">
                {counts.apis} API{counts.apis === 1 ? "" : "s"} · {counts.scenarios} scenario{counts.scenarios === 1 ? "" : "s"} selected
            </span>
            <button type="button" onClick={onClose} disabled={exporting} className={secondaryButtonClass}>
                Cancel
            </button>
            <button type="button" onClick={() => void handleExport()} disabled={exporting || loading || counts.apis === 0} className={primaryButtonClass}>
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {exporting ? "Exporting..." : "Export"}
            </button>
        </>
    );

    return (
        <TransferModal title="Export APIs" description="Choose the APIs and scenarios to include in the file." busy={exporting} onClose={onClose} footer={footer}>
            {loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-text-secondary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading your APIs...
                </div>
            ) : loadError ? (
                <div className="space-y-4">
                    <TransferErrorAlert error={loadError} />
                    <button type="button" onClick={() => void loadApis()} className={secondaryButtonClass}>
                        Try again
                    </button>
                </div>
            ) : pickerApis.length === 0 ? (
                <p className="py-16 text-center text-sm text-text-muted">You don't have any APIs to export yet.</p>
            ) : (
                <div className="space-y-3">
                    <ApiScenarioPicker apis={pickerApis} selection={selection} onChange={setSelection} active={active} onActiveChange={setActive} />
                    {exportError && <TransferErrorAlert error={exportError} />}
                </div>
            )}
        </TransferModal>
    );
}
