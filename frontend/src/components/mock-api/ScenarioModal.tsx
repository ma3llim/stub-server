import { useEffect, useState } from "react";
import { createScenario, updateScenario, type CreateScenarioRequest, type MockScenario } from "../../api/scenario.api";
import { X } from "lucide-react";
import JsonCodeEditor from "./JsonCodeEditor";

interface ScenarioModalProps {
    mockApiId: string;
    scenario?: MockScenario | null;
    onSuccess: (scenario: MockScenario) => void;
    onClose: () => void;
}

export default function ScenarioModal({ mockApiId, scenario, onSuccess, onClose }: ScenarioModalProps) {
    const [name, setName] = useState("");
    const [statusCode, setStatusCode] = useState(200);
    const [headers, setHeaders] = useState("{}");
    const [responseBody, setResponseBody] = useState("{}");
    const [delayMs, setDelayMs] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const isEditing = Boolean(scenario);

    useEffect(() => {
        if (!scenario) {
            setName("");
            setStatusCode(200);
            setHeaders(JSON.stringify({ "Content-Type": "application/json" }, null, 2));
            setResponseBody("{}");
            setDelayMs(0);
            return;
        }

        setName(scenario.name);
        setStatusCode(scenario.statusCode);
        setHeaders(JSON.stringify(scenario.headers, null, 2));
        setResponseBody(JSON.stringify(scenario.responseBody, null, 2));
        setDelayMs(scenario.delayMs);
    }, [scenario]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        let parsedHeaders: Record<string, string>;
        let parsedResponseBody: unknown;

        try {
            parsedHeaders = JSON.parse(headers);

            if (typeof parsedHeaders !== "object" || Array.isArray(parsedHeaders) || parsedHeaders === null) {
                throw new Error();
            }
        } catch {
            setError("Response headers must contain a valid JSON object.");
            return;
        }

        try {
            parsedResponseBody = JSON.parse(responseBody);
        } catch {
            setError("Response body must contain valid JSON.");
            return;
        }

        const data: CreateScenarioRequest = {
            name: name.trim(),
            statusCode,
            headers: parsedHeaders,
            responseBody: parsedResponseBody,
            delayMs,
        };

        try {
            setLoading(true);

            const result = isEditing ? await updateScenario(mockApiId, scenario!._id, data) : await createScenario(mockApiId, data);

            onSuccess(result);
        } catch (error: any) {
            setError(error?.response?.data?.message ?? "Failed to save scenario.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-surface shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-border px-6 py-5">
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">{isEditing ? "Edit Scenario" : "Add Scenario"}</h2>
                        <p className="mt-1 text-sm text-text-muted">Configure the response for this scenario.</p>
                    </div>

                    <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-xl text-text-muted transition hover:bg-surface-hover hover:text-text-primary">
                        <X />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Scenario Name</label>

                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Success"
                            required
                            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Status Code</label>
                        <input
                            value={statusCode}
                            onChange={(event) => setStatusCode(Number(event.target.value))}
                            min={100}
                            max={599}
                            required
                            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Response Headers</label>

                        <JsonCodeEditor
                            value={headers}
                            onChange={setHeaders}
                            className="h-36 w-full rounded-lg border border-border bg-background text-text-primary focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                            onFormatError={() => setError("Response headers must contain a valid JSON object.")}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Response Body</label>

                        <JsonCodeEditor
                            value={responseBody}
                            onChange={setResponseBody}
                            className="h-64 w-full rounded-lg border border-border bg-background text-text-primary focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                            onFormatError={() => setError("Response body must contain valid JSON.")}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Response Delay</label>

                        <div className="relative">
                            <input
                                value={delayMs}
                                onChange={(event) => setDelayMs(Number(event.target.value))}
                                min={0}
                                max={30000}
                                className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-16 text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />

                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-muted">ms</span>
                        </div>
                    </div>

                    {error && <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}

                    <div className="flex justify-end gap-3 border-t border-border pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-surface-hover hover:text-text-primary disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Saving..." : isEditing ? "Update Scenario" : "Create Scenario"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
