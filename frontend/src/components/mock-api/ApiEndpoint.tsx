import { useState } from "react";
import type { HttpMethod, MockApi, MockResponseData } from "../../api/mock-api.api";
import { ChevronDown, ChevronUp, Bot, Copy, Check, Braces } from "lucide-react";
import ScenarioList from "./ScenarioList";
import ScenarioChat from "../ai/ScenarioChat";
import MockResponseModal from "./MockResponseModal";
import type { MockResponseType } from "../../api/response.api";

interface ApiEndpointProps {
    mockApi: MockApi;
    onEdit: (mockApi: MockApi) => void;
    onDelete: (mockApi: MockApi) => void;
}

const methodStyles: Record<HttpMethod, string> = {
    GET: "bg-green-700 text-white",
    POST: "bg-blue-600 text-white",
    PUT: "bg-orange-700 text-white",
    PATCH: "bg-purple-600 text-white",
    DELETE: "bg-red-600 text-white",
};

const methodStylesText: Record<HttpMethod, string> = {
    GET: "text-green-700 dark:text-green-400",
    POST: "text-blue-700 dark:text-blue-400",
    PUT: "text-orange-700 dark:text-orange-400",
    PATCH: "text-purple-700 dark:text-purple-400",
    DELETE: "text-red-700 dark:text-red-400",
};

export default function ApiEndpoint({ mockApi, onEdit, onDelete }: ApiEndpointProps) {
    const [expanded, setExpanded] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [mockResponseType, setMockResponseType] = useState<MockResponseType | null>(null);
    const [scenarioRefreshTrigger, setScenarioRefreshTrigger] = useState(0);
    const [activeScenarioId, setActiveScenarioId] = useState(mockApi.activeScenarioId);
    const [successResponse, setSuccessResponse] = useState(mockApi.successResponse);
    const [errorResponse, setErrorResponse] = useState(mockApi.errorResponse);
    const [copied, setCopied] = useState(false);

    const customEndpoint = `${import.meta.env.VITE_MOCK_SERVER_URL}${mockApi.path}`;

    const handleCopy = async (endpoint: string) => {
        await navigator.clipboard.writeText(endpoint);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 1500);
    };

    function handleScenarioChanged(scenarioId?: string) {
        if (scenarioId) {
            setActiveScenarioId(scenarioId);
        }

        setScenarioRefreshTrigger((current) => current + 1);
    }

    function handleResponseChanged(type: MockResponseType, response?: MockResponseData) {
        if (type === "success") {
            setSuccessResponse(response);
        } else {
            setErrorResponse(response);
        }
    }

    return (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <button type="button" onClick={() => setExpanded((value) => !value)} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-surface-hover">
                <span className={`min-w-19 flex-none rounded border px-2.5 py-1 text-center font-mono text-xs font-bold ${methodStyles[mockApi.method]}`}>{mockApi.method}</span>
                <span className="flex-none text-sm font-medium text-text-primary">{mockApi.name}</span>
                <span className="min-w-0 truncate font-mono text-sm text-text-secondary">{mockApi.path}</span>
                <span className="ml-auto flex-none text-text-muted">{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
            </button>

            {expanded && (
                <div className="border-t border-border bg-surface">
                    <div className="space-y-4 p-6">
                        <div>
                            <h3 className="text-base font-semibold text-text-primary">{mockApi.name}</h3>
                            {mockApi.description && <p className="mt-2 text-sm leading-6 text-text-secondary">{mockApi.description}</p>}
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => setMockResponseType("success")}
                                className="flex items-center gap-2 rounded-lg border border-success/30 px-4 py-2 text-sm font-medium text-success transition hover:bg-success/10"
                            >
                                <Braces className="h-4 w-4" />
                                Success Mock
                            </button>
                            <button
                                type="button"
                                onClick={() => setMockResponseType("error")}
                                className="flex items-center gap-2 rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition hover:bg-danger/10"
                            >
                                <Braces className="h-4 w-4" />
                                Error Mock
                            </button>
                            <button
                                type="button"
                                onClick={() => onEdit(mockApi)}
                                className="rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-hover"
                            >
                                Edit
                            </button>
                            <button type="button" onClick={() => onDelete(mockApi)} className="rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition hover:bg-danger/10">
                                Delete
                            </button>
                            <button
                                type="button"
                                onClick={() => setChatOpen(true)}
                                className="flex items-center gap-2 rounded-lg border border-primary/40 px-4 py-2 text-sm font-medium text-primary-text transition hover:bg-primary/10"
                            >
                                <Bot className="h-4 w-4" />
                                AI Assistant
                            </button>
                        </div>
                        <section>
                            <h4 className="mb-3 text-sm font-semibold text-text-primary">Endpoint</h4>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="relative rounded-lg bg-inset px-4 py-3 pr-12 font-mono text-sm text-text-primary">
                                    <span className={`mr-3 ${methodStylesText[mockApi.method]}`}>{mockApi.method}</span>
                                    {mockApi.path}
                                </div>

                                <div className="relative rounded-lg bg-inset px-4 py-3 pr-12 font-mono text-sm text-text-primary">
                                    <span className={`mr-3 ${methodStylesText[mockApi.method]}`}>{mockApi.method}</span>
                                    {customEndpoint}
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(customEndpoint)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-text-muted transition-all duration-200 hover:bg-surface-hover hover:text-text-primary"
                                        title={copied ? "Copied" : "Copy endpoint"}
                                    >
                                        {copied ? <Check size={16} strokeWidth={2} className="text-success" /> : <Copy size={16} strokeWidth={1.8} />}
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-lg border border-border p-4">
                            <ScenarioList mockApiId={mockApi._id} activeScenarioId={activeScenarioId} onActiveScenarioChange={handleScenarioChanged} refreshTrigger={scenarioRefreshTrigger} />
                        </section>
                    </div>
                </div>
            )}
            {chatOpen && (
                <ScenarioChat
                    mockApiId={mockApi._id}
                    successResponse={successResponse}
                    errorResponse={errorResponse}
                    onClose={() => setChatOpen(false)}
                    onScenarioChanged={handleScenarioChanged}
                />
            )}
            {mockResponseType && (
                <MockResponseModal
                    mockApi={{ ...mockApi, successResponse, errorResponse }}
                    type={mockResponseType}
                    onClose={() => setMockResponseType(null)}
                    onResponseChange={handleResponseChanged}
                />
            )}
        </div>
    );
}
