import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { activateScenario, getScenarios, type MockScenario } from "../../api/scenario.api";
import ScenarioModal from "./ScenarioModal";
import DeleteScenarioDialog from "./DeleteScenarioDialog";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";

interface ScenarioListProps {
    mockApiId: string;
    activeScenarioId?: string;
    onActiveScenarioChange?: (scenarioId: string) => void;
    refreshTrigger?: number;
}

type SortOption = "created" | "status";

const getStatusCodeStyle = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
        return "bg-green-500/10 text-green-400 border-green-500/20";
    }

    if (statusCode >= 300 && statusCode < 400) {
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }

    if (statusCode >= 400 && statusCode < 500) {
        return "bg-red-500/10 text-red-400 border-red-500/20";
    }

    if (statusCode >= 500 && statusCode < 600) {
        return "bg-red-500/10 text-red-400 border-red-500/20";
    }

    return "bg-surface-hover text-text-secondary border-border";
};

export default function ScenarioList({ mockApiId, activeScenarioId, onActiveScenarioChange, refreshTrigger = 0 }: ScenarioListProps) {
    const [scenarios, setScenarios] = useState<MockScenario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sortOption, setSortOption] = useState<SortOption>("created");
    const [expandedScenarioId, setExpandedScenarioId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingScenario, setEditingScenario] = useState<MockScenario | null>(null);
    const [deletingScenario, setDeletingScenario] = useState<MockScenario | null>(null);

    async function loadScenarios() {
        try {
            setLoading(true);
            setError("");

            const result = await getScenarios(mockApiId);

            setScenarios(result);
        } catch (error: any) {
            setError(error?.response?.data?.message ?? "Failed to load scenarios.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadScenarios();
    }, [mockApiId, refreshTrigger]);

    async function handleActivate(scenarioId: string) {
        try {
            setError("");

            await activateScenario(mockApiId, scenarioId);

            onActiveScenarioChange?.(scenarioId);

            await loadScenarios();
        } catch (error: any) {
            setError(error?.response?.data?.message ?? "Failed to activate scenario.");
        }
    }

    function handleScenarioSaved(scenario: MockScenario) {
        setScenarios((current) => {
            const exists = current.some((item) => item._id === scenario._id);
            if (exists) {
                return current.map((item) => (item._id === scenario._id ? scenario : item));
            }
            return [...current, scenario];
        });

        setShowModal(false);
        setEditingScenario(null);
    }

    function handleScenarioDeleted() {
        if (!deletingScenario) {
            return;
        }

        setScenarios((current) => current.filter((scenario) => scenario._id !== deletingScenario._id));

        setDeletingScenario(null);
    }

    function handleDragEnd(result: DropResult) {
        if (!result.destination) {
            return;
        }

        if (sortOption !== "created") {
            return;
        }

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        if (sourceIndex === destinationIndex) {
            return;
        }

        setScenarios((current) => {
            const updated = [...current];

            const [movedScenario] = updated.splice(sourceIndex, 1);

            updated.splice(destinationIndex, 0, movedScenario);

            return updated;
        });
    }

    const displayedScenarios = sortOption === "status" ? [...scenarios].sort((a, b) => a.statusCode - b.statusCode) : scenarios;

    if (loading) {
        return (
            <section>
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-text-primary">Scenarios</h4>
                </div>
                <div className="mt-3 rounded-lg border border-border bg-background p-5 text-sm text-text-muted">Loading scenarios...</div>
            </section>
        );
    }

    return (
        <>
            <section>
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-semibold text-text-primary">Scenarios</h4>
                        <p className="mt-1 text-xs text-text-muted">Define different responses for this endpoint.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={sortOption}
                                onChange={(event) => setSortOption(event.target.value as SortOption)}
                                className="appearance-none rounded-lg border border-border bg-surface py-2 pl-3 pr-9 text-xs text-text-primary outline-none transition focus:border-primary"
                            >
                                <option value="created">Created</option>
                                <option value="status">Status Code</option>
                            </select>

                            <ChevronDown size={14} strokeWidth={1.8} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setEditingScenario(null);
                                setShowModal(true);
                            }}
                            className="rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-white transition hover:bg-primary-hover"
                        >
                            + Add Scenario
                        </button>
                    </div>
                </div>

                {error && <div className="mt-4 rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}

                {scenarios.length === 0 ? (
                    <div className="mt-3 rounded-lg border border-dashed border-border bg-background p-5 text-sm text-text-muted">No scenarios configured yet.</div>
                ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="scenario-list" isDropDisabled={sortOption !== "created"}>
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="mt-3 space-y-2">
                                    {displayedScenarios.map((scenario, index) => {
                                        const isExpanded = expandedScenarioId === scenario._id;

                                        const isActive = activeScenarioId === scenario._id;

                                        return (
                                            <Draggable key={scenario._id} draggableId={scenario._id} index={index} isDragDisabled={sortOption !== "created"}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`overflow-hidden rounded-lg border ${isActive ? "border-primary/40" : "border-border"} ${
                                                            snapshot.isDragging ? "shadow-xl ring-1 ring-primary/30" : ""
                                                        }`}
                                                    >
                                                        <div className="flex items-center">
                                                            <div
                                                                {...provided.dragHandleProps}
                                                                className="cursor-grab px-2 text-text-muted transition hover:text-text-primary active:cursor-grabbing"
                                                                title="Drag to reorder"
                                                            >
                                                                <GripVertical className="h-4 w-4" />
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => setExpandedScenarioId(isExpanded ? null : scenario._id)}
                                                                className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left transition"
                                                            >
                                                                <span className="text-text-muted">{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
                                                                <span className={`rounded-md border px-2 py-1 font-mono text-xs font-medium ${getStatusCodeStyle(scenario.statusCode)}`}>
                                                                    {scenario.statusCode}
                                                                </span>

                                                                <span className="truncate text-sm font-medium text-text-primary">{scenario.name}</span>

                                                                <span className="shrink-0 rounded-md bg-surface-hover px-2 py-1 font-mono text-xs text-text-muted">
                                                                    {scenario.delayMs}
                                                                    ms
                                                                </span>

                                                                {isActive && <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Active</span>}
                                                            </button>

                                                            <div className="flex items-center gap-1.5 px-3">
                                                                {!isActive && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => void handleActivate(scenario._id)}
                                                                        className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary shadow-sm transition hover:border-primary/30 hover:bg-surface-hover hover:text-text-primary"
                                                                    >
                                                                        Activate
                                                                    </button>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingScenario(scenario);
                                                                        setShowModal(true);
                                                                    }}
                                                                    className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary shadow-sm transition hover:border-border-hover hover:bg-surface-hover hover:text-text-primary"
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => setDeletingScenario(scenario)}
                                                                    className="rounded-md border border-danger/20 bg-danger/5 px-3 py-1.5 text-xs font-medium text-danger shadow-sm transition hover:bg-danger/10"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {isExpanded && (
                                                            <div className="border-t border-border bg-background p-4">
                                                                <div className="mb-4">
                                                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Response Headers</p>

                                                                    <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs leading-6 text-text-secondary">
                                                                        {scenario.headers && Object.keys(scenario.headers).length > 0 ? JSON.stringify(scenario.headers, null, 2) : "-"}
                                                                    </pre>
                                                                </div>

                                                                <div>
                                                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Response Body</p>

                                                                    <pre className="max-h-80 overflow-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs leading-6 text-text-secondary">
                                                                        {JSON.stringify(scenario.responseBody, null, 2)}
                                                                    </pre>
                                                                </div>

                                                                <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
                                                                    <span>Response delay:</span>

                                                                    <span className="font-mono text-text-secondary">
                                                                        {scenario.delayMs}
                                                                        ms
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        );
                                    })}

                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </section>

            {showModal && (
                <ScenarioModal
                    mockApiId={mockApiId}
                    scenario={editingScenario}
                    onSuccess={handleScenarioSaved}
                    onClose={() => {
                        setShowModal(false);
                        setEditingScenario(null);
                    }}
                />
            )}

            {deletingScenario && (
                <DeleteScenarioDialog
                    mockApiId={mockApiId}
                    scenarioId={deletingScenario._id}
                    scenarioName={deletingScenario.name}
                    onSuccess={handleScenarioDeleted}
                    onClose={() => setDeletingScenario(null)}
                />
            )}
        </>
    );
}
