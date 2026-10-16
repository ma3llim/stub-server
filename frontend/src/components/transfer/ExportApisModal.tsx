import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Download, Loader2, Search } from "lucide-react";

import { getMockApis, type MockApi } from "../../api/mock-api.api";
import { exportSelectedApis } from "../../api/transfer.api";
import { methodStyles } from "../mock-api/method-styles";
import TransferModal, { TransferErrorAlert } from "./TransferModal";
import { downloadJson, primaryButtonClass, secondaryButtonClass, toTransferError, type TransferErrorInfo } from "./transfer-utils";

interface ExportApisModalProps {
    onClose: () => void;
}

// Selected scenario IDs per API. An API is exported only if it has an entry.
type Selection = Map<string, Set<string>>;

function scenarioIds(mockApi: MockApi): string[] {
    return mockApi.scenarios.flatMap((scenario) => (scenario._id ? [scenario._id] : []));
}

function selectAll(mockApis: MockApi[]): Selection {
    return new Map(mockApis.map((mockApi) => [mockApi._id, new Set(scenarioIds(mockApi))]));
}

function Checkbox({ checked, indeterminate = false, onChange, label }: { checked: boolean; indeterminate?: boolean; onChange: () => void; label: string }) {
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    return <input ref={ref} type="checkbox" checked={checked} onChange={onChange} aria-label={label} className="h-4 w-4 flex-none cursor-pointer accent-primary" />;
}

export default function ExportApisModal({ onClose }: ExportApisModalProps) {
    const [mockApis, setMockApis] = useState<MockApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<TransferErrorInfo | null>(null);
    const [selection, setSelection] = useState<Selection>(new Map());
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [query, setQuery] = useState("");
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<TransferErrorInfo | null>(null);

    // Loads a fresh list so scenarios edited since the dashboard loaded are included.
    const loadApis = useCallback(async () => {
        setLoading(true);
        setLoadError(null);

        try {
            const data = await getMockApis();

            setMockApis(data);
            setSelection(selectAll(data));
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

    const visibleApis = useMemo(() => {
        const term = query.trim().toLowerCase();

        if (!term) {
            return mockApis;
        }

        return mockApis.filter((mockApi) => [mockApi.name, mockApi.path, mockApi.method].some((field) => field.toLowerCase().includes(term)));
    }, [mockApis, query]);

    const selectedApiCount = selection.size;
    const selectedScenarioCount = [...selection.values()].reduce((total, ids) => total + ids.size, 0);

    function updateSelection(update: (next: Selection) => void): void {
        setSelection((current) => {
            const next = new Map(current);

            update(next);

            return next;
        });
    }

    function toggleApi(mockApi: MockApi): void {
        const selected = selection.get(mockApi._id);
        const total = scenarioIds(mockApi).length;

        updateSelection((next) => {
            // Fully selected -> remove; otherwise (none or partial) -> select everything.
            if (selected && selected.size === total) {
                next.delete(mockApi._id);
            } else {
                next.set(mockApi._id, new Set(scenarioIds(mockApi)));
            }
        });
    }

    function toggleScenario(mockApi: MockApi, scenarioId: string): void {
        updateSelection((next) => {
            const ids = new Set(next.get(mockApi._id) ?? []);

            if (ids.has(scenarioId)) {
                ids.delete(scenarioId);
            } else {
                ids.add(scenarioId);
            }

            // Unticking the last scenario removes the API, so "nothing ticked" means "not exported".
            if (ids.size === 0) {
                next.delete(mockApi._id);
            } else {
                next.set(mockApi._id, ids);
            }
        });
    }

    function setVisible(select: boolean): void {
        updateSelection((next) => {
            for (const mockApi of visibleApis) {
                if (select) {
                    next.set(mockApi._id, new Set(scenarioIds(mockApi)));
                } else {
                    next.delete(mockApi._id);
                }
            }
        });
    }

    function toggleExpanded(id: string): void {
        setExpanded((current) => {
            const next = new Set(current);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    }

    async function handleExport(): Promise<void> {
        setExporting(true);
        setExportError(null);

        try {
            // Keep the dashboard's order in the file.
            const apis = mockApis.filter((mockApi) => selection.has(mockApi._id)).map((mockApi) => ({ id: mockApi._id, scenarioIds: [...(selection.get(mockApi._id) ?? [])] }));
            const file = await exportSelectedApis(apis);
            const date = new Date().toISOString().slice(0, 10);
            const everything = selectedApiCount === mockApis.length && selectedScenarioCount === mockApis.reduce((total, mockApi) => total + scenarioIds(mockApi).length, 0);

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
                {selectedApiCount} API{selectedApiCount === 1 ? "" : "s"} · {selectedScenarioCount} scenario{selectedScenarioCount === 1 ? "" : "s"} selected
            </span>
            <button type="button" onClick={onClose} disabled={exporting} className={secondaryButtonClass}>
                Cancel
            </button>
            <button type="button" onClick={() => void handleExport()} disabled={exporting || loading || selectedApiCount === 0} className={primaryButtonClass}>
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
            ) : mockApis.length === 0 ? (
                <p className="py-16 text-center text-sm text-text-muted">You don't have any APIs to export yet.</p>
            ) : (
                <div className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
                            <input
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Filter by name, method or path"
                                aria-label="Filter APIs"
                                className="w-full rounded-lg border border-border bg-inset py-2 pr-3 pl-9 text-sm text-text-primary outline-none focus:border-primary"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setVisible(true)} className="rounded-lg px-3 py-2 text-xs font-medium text-primary-text hover:bg-primary/10">
                                Select all
                            </button>
                            <button type="button" onClick={() => setVisible(false)} className="rounded-lg px-3 py-2 text-xs font-medium text-text-secondary hover:bg-surface-hover">
                                Clear
                            </button>
                        </div>
                    </div>

                    {visibleApis.length === 0 ? (
                        <p className="py-10 text-center text-sm text-text-muted">No APIs match your filter.</p>
                    ) : (
                        <ul className="divide-y divide-border rounded-lg border border-border">
                            {visibleApis.map((mockApi) => {
                                const selected = selection.get(mockApi._id);
                                const total = scenarioIds(mockApi).length;
                                const isOpen = expanded.has(mockApi._id);
                                const fully = Boolean(selected) && selected!.size === total;

                                return (
                                    <li key={mockApi._id}>
                                        <div className="flex items-center gap-3 px-3 py-2.5">
                                            <Checkbox checked={fully} indeterminate={Boolean(selected) && !fully} onChange={() => toggleApi(mockApi)} label={`Export ${mockApi.name}`} />

                                            <button
                                                type="button"
                                                onClick={() => total > 0 && toggleExpanded(mockApi._id)}
                                                disabled={total === 0}
                                                aria-expanded={total > 0 ? isOpen : undefined}
                                                className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
                                            >
                                                <span className={`w-16 flex-none rounded px-1.5 py-0.5 text-center font-mono text-[11px] font-bold ${methodStyles[mockApi.method]}`}>{mockApi.method}</span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-medium text-text-primary">{mockApi.name}</span>
                                                    <span className="block truncate font-mono text-xs text-text-muted">{mockApi.path}</span>
                                                </span>
                                                <span className="flex-none text-xs text-text-muted">{total === 0 ? "No scenarios" : `${selected?.size ?? 0}/${total} scenarios`}</span>
                                                {total > 0 && <span className="flex-none text-text-muted">{isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span>}
                                            </button>
                                        </div>

                                        {isOpen && (
                                            <ul className="space-y-1 border-t border-border bg-inset py-2 pr-3 pl-10">
                                                {mockApi.scenarios.map((scenario) =>
                                                    scenario._id ? (
                                                        <li key={scenario._id}>
                                                            <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-surface-hover">
                                                                <Checkbox checked={selected?.has(scenario._id) ?? false} onChange={() => toggleScenario(mockApi, scenario._id!)} label={`Export scenario ${scenario.name}`} />
                                                                <span className="w-10 flex-none font-mono text-xs text-text-secondary">{scenario.statusCode}</span>
                                                                <span className="min-w-0 flex-1 truncate text-sm text-text-primary">{scenario.name}</span>
                                                                {mockApi.activeScenarioId === scenario._id && (
                                                                    <span className="flex-none rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary-text">Active</span>
                                                                )}
                                                            </label>
                                                        </li>
                                                    ) : null,
                                                )}
                                            </ul>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {exportError && <TransferErrorAlert error={exportError} />}
                </div>
            )}
        </TransferModal>
    );
}
