import { useState } from "react";
import type { HttpMethod, MockApi } from "../../api/mock-api.api";
import { ChevronDown, ChevronUp, Bot } from "lucide-react";
import ScenarioList from "./ScenarioList";
import ScenarioChat from "../ai/ScenarioChat";

interface ApiEndpointProps {
    mockApi: MockApi;
    onEdit: (mockApi: MockApi) => void;
    onDelete: (mockApi: MockApi) => void;
}

const methodStyles: Record<HttpMethod, string> = {
    GET: "bg-green-600 text-white",
    POST: "bg-blue-600 text-white",
    PUT: "bg-orange-600 text-white",
    PATCH: "bg-purple-600 text-white",
    DELETE: "bg-red-600 text-white",
};

export default function ApiEndpoint({ mockApi, onEdit, onDelete }: ApiEndpointProps) {
    const [expanded, setExpanded] = useState(false);
    const [scenariosExpanded, setScenariosExpanded] = useState(true);
    const [activeScenarioId, setActiveScenarioId] = useState(mockApi.activeScenarioId);
    const [chatOpen, setChatOpen] = useState(false);

    return (
        <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
            <button type="button" onClick={() => setExpanded((value) => !value)} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-gray-800">
                <span className={`min-w-[76px] rounded border px-2.5 py-1 text-center font-mono text-xs font-bold ${methodStyles[mockApi.method]}`}>{mockApi.method}</span>
                <span className="font-mono text-sm text-gray-200">{mockApi.path}</span>
                <span className="ml-auto hidden text-sm text-gray-400 md:block">{mockApi.name}</span>
                <span className="ml-2 text-gray-500">{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
            </button>

            {expanded && (
                <div className="border-t border-gray-800 bg-gray-900">
                    <div className="space-y-4 p-6">
                        <div>
                            <h3 className="text-base font-semibold text-white">{mockApi.name}</h3>

                            {mockApi.description && <p className="mt-2 text-sm leading-6 text-gray-400">{mockApi.description}</p>}
                        </div>
                        <section>
                            <h4 className="mb-3 text-sm font-semibold text-white">Endpoint</h4>

                            <div className="rounded-lg bg-gray-950 px-4 py-3 font-mono text-sm text-gray-200">
                                <span className="mr-3 text-green-400">{mockApi.method}</span>
                                {mockApi.path}
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-lg border border-gray-800">
                            <button
                                type="button"
                                onClick={() => setScenariosExpanded((value) => !value)}
                                className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-gray-800"
                            >
                                <div>
                                    <h4 className="text-sm font-semibold text-white">Response Scenarios</h4>

                                    <p className="mt-1 text-xs text-gray-500">Configure different responses for this endpoint</p>
                                </div>

                                {scenariosExpanded ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                            </button>

                            {scenariosExpanded && (
                                <div className="border-t border-gray-800 p-4">
                                    <ScenarioList mockApiId={mockApi._id} activeScenarioId={activeScenarioId} onActiveScenarioChange={setActiveScenarioId} />
                                </div>
                            )}
                        </section>

                        <div className="flex justify-end gap-3 border-t border-gray-800 pt-5">
                            <button
                                type="button"
                                onClick={() => onEdit(mockApi)}
                                className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800"
                            >
                                Edit
                            </button>

                            <button type="button" onClick={() => onDelete(mockApi)} className="rounded-lg border border-red-900 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-950">
                                Delete
                            </button>
                            <button
                                type="button"
                                onClick={() => setChatOpen(true)}
                                className="flex items-center gap-2 rounded-lg border border-indigo-800 px-4 py-2 text-sm font-medium text-indigo-400 transition hover:bg-indigo-950"
                            >
                                <Bot className="h-4 w-4" />
                                AI Assistant
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {chatOpen && <ScenarioChat mockApiId={mockApi._id} onClose={() => setChatOpen(false)} />}
        </div>
    );
}
