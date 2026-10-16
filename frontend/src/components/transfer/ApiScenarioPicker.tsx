import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

import { methodStyles } from "../mock-api/method-styles";
import { effectiveActive, type PickerActive, type PickerApi, type PickerSelection } from "./transfer-utils";

interface ApiScenarioPickerProps {
    apis: PickerApi[];
    selection: PickerSelection;
    onChange: (selection: PickerSelection) => void;
    active: PickerActive;
    onActiveChange: (active: PickerActive) => void;
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

/**
 * Tick APIs as a whole, or expand one to tick individual scenarios. Unticking
 * an API's last scenario removes the API, so "nothing ticked" means "left out".
 */
export default function ApiScenarioPicker({ apis, selection, onChange, active, onActiveChange }: ApiScenarioPickerProps) {
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [query, setQuery] = useState("");

    const visibleApis = useMemo(() => {
        const term = query.trim().toLowerCase();

        if (!term) {
            return apis;
        }

        return apis.filter((api) => [api.name, api.path, api.method].some((field) => field.toLowerCase().includes(term)));
    }, [apis, query]);

    function update(change: (next: PickerSelection) => void): void {
        const next = new Map(selection);

        change(next);
        onChange(next);
    }

    function allKeys(api: PickerApi): Set<string> {
        return new Set(api.scenarios.map((scenario) => scenario.key));
    }

    function toggleApi(api: PickerApi): void {
        const selected = selection.get(api.key);

        update((next) => {
            // Fully selected -> remove; otherwise (none or partial) -> select everything.
            if (selected && selected.size === api.scenarios.length) {
                next.delete(api.key);
            } else {
                next.set(api.key, allKeys(api));
            }
        });
    }

    function toggleScenario(api: PickerApi, scenarioKey: string): void {
        update((next) => {
            const keys = new Set(next.get(api.key) ?? []);

            if (keys.has(scenarioKey)) {
                keys.delete(scenarioKey);
            } else {
                keys.add(scenarioKey);
            }

            if (keys.size === 0) {
                next.delete(api.key);
            } else {
                next.set(api.key, keys);
            }
        });
    }

    // Making a scenario active also ticks it, since only exported/imported scenarios can be active.
    function setActive(api: PickerApi, scenarioKey: string): void {
        if (!selection.get(api.key)?.has(scenarioKey)) {
            update((next) => next.set(api.key, new Set([...(next.get(api.key) ?? []), scenarioKey])));
        }

        onActiveChange(new Map(active).set(api.key, scenarioKey));
    }

    function setVisible(select: boolean): void {
        update((next) => {
            for (const api of visibleApis) {
                if (select) {
                    next.set(api.key, allKeys(api));
                } else {
                    next.delete(api.key);
                }
            }
        });
    }

    function toggleExpanded(key: string): void {
        setExpanded((current) => {
            const next = new Set(current);

            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }

            return next;
        });
    }

    return (
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
                    {visibleApis.map((api) => {
                        const selected = selection.get(api.key);
                        const total = api.scenarios.length;
                        const isOpen = expanded.has(api.key);
                        const fully = selected !== undefined && selected.size === total;
                        const activeKey = effectiveActive(
                            api.scenarios.map((scenario) => scenario.key),
                            selected,
                            active.get(api.key),
                        );
                        const activeName = api.scenarios.find((scenario) => scenario.key === activeKey)?.name;

                        return (
                            <li key={api.key}>
                                <div className="flex items-center gap-3 px-3 py-2.5">
                                    <Checkbox checked={fully} indeterminate={selected !== undefined && !fully} onChange={() => toggleApi(api)} label={`Select ${api.name}`} />

                                    <button
                                        type="button"
                                        onClick={() => total > 0 && toggleExpanded(api.key)}
                                        disabled={total === 0}
                                        aria-expanded={total > 0 ? isOpen : undefined}
                                        className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
                                    >
                                        <span className={`w-16 flex-none rounded px-1.5 py-0.5 text-center font-mono text-[11px] font-bold ${methodStyles[api.method]}`}>{api.method}</span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-medium text-text-primary">{api.name}</span>
                                            <span className="block truncate font-mono text-xs text-text-muted">{api.path}</span>
                                            {activeName && <span className="block truncate text-xs text-primary-text">Active: {activeName}</span>}
                                        </span>
                                        <span className="hidden flex-none text-xs text-text-muted sm:block">{total === 0 ? "No scenarios" : `${selected?.size ?? 0}/${total} scenarios`}</span>
                                        {api.badge && <span className={`flex-none rounded-full border px-2 py-0.5 text-xs font-medium ${api.badge.className}`}>{api.badge.label}</span>}
                                        {total > 0 && <span className="flex-none text-text-muted">{isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span>}
                                    </button>
                                </div>

                                {isOpen && (
                                    <ul className="space-y-1 border-t border-border bg-inset py-2 pr-3 pl-10">
                                        {api.scenarios.map((scenario) => {
                                            const isActive = scenario.key === activeKey;

                                            return (
                                                <li key={scenario.key} className="group/row flex items-center gap-2 rounded-md pr-1 hover:bg-surface-hover">
                                                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-2 py-1.5">
                                                        <Checkbox checked={selected?.has(scenario.key) ?? false} onChange={() => toggleScenario(api, scenario.key)} label={`Select scenario ${scenario.name}`} />
                                                        <span className="w-10 flex-none font-mono text-xs text-text-secondary">{scenario.statusCode}</span>
                                                        <span className="min-w-0 flex-1 truncate text-sm text-text-primary">{scenario.name}</span>
                                                    </label>

                                                    <button
                                                        type="button"
                                                        onClick={() => setActive(api, scenario.key)}
                                                        aria-pressed={isActive}
                                                        title={isActive ? "This scenario will be active" : "Make this the active scenario"}
                                                        className={`flex-none rounded-md px-2 py-0.5 text-xs font-medium transition ${
                                                            isActive
                                                                ? "bg-primary/10 text-primary-text"
                                                                : "text-text-muted opacity-0 group-hover/row:opacity-100 hover:bg-primary/10 hover:text-primary-text focus-visible:opacity-100"
                                                        }`}
                                                    >
                                                        {isActive ? "Active" : "Set active"}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
