import { useState } from "react";

import type { HttpMethod, MockApi } from "../../api/mock-api.api";
import { ChevronDown, ChevronUp } from "lucide-react";

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
                    <div className="space-y-7 p-6">
                        <div>
                            <h3 className="text-base font-semibold text-white">{mockApi.name}</h3>

                            {mockApi.description && <p className="mt-2 text-sm leading-6 text-gray-400">{mockApi.description}</p>}
                        </div>

                        <section>
                            <h4 className="mb-3 text-sm font-semibold text-white">Scenarios</h4>

                            {mockApi.scenarios.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-gray-700 bg-gray-950 p-5 text-sm text-gray-500">No scenarios configured yet.</div>
                            ) : (
                                <div className="space-y-2">
                                    {mockApi.scenarios.map((scenario) => (
                                        <div key={scenario._id} className="flex items-center justify-between rounded-lg border border-gray-800 px-4 py-3">
                                            <span className="text-sm font-medium text-gray-200">{scenario.name}</span>

                                            <span className="font-mono text-xs text-gray-500">{scenario.statusCode}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section>
                            <h4 className="mb-3 text-sm font-semibold text-white">Endpoint</h4>

                            <div className="rounded-lg bg-gray-950 px-4 py-3 font-mono text-sm text-gray-200">
                                <span className="mr-3 text-green-400">{mockApi.method}</span>
                                {mockApi.path}
                            </div>
                        </section>

                        <div className="flex justify-end gap-3 border-t border-gray-800 pt-5">
                            <button type="button" onClick={() => onEdit(mockApi)} className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800">
                                Edit
                            </button>

                            <button type="button" onClick={() => onDelete(mockApi)} className="rounded-lg border border-red-900 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-950">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
