import { useEffect, useState } from "react";
import { createScenario, updateScenario, type CreateScenarioRequest, type MockScenario } from "../../api/scenario.api";

interface ScenarioFormProps {
    mockApiId: string;
    scenario?: MockScenario | null;
    onSuccess: (scenario: MockScenario) => void;
    onCancel: () => void;
}

export default function ScenarioForm({ mockApiId, scenario, onSuccess, onCancel }: ScenarioFormProps) {
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
        } catch {
            setError("Headers must contain valid JSON.");
            return;
        }

        try {
            parsedResponseBody = JSON.parse(responseBody);
        } catch {
            setError("Response body must contain valid JSON.");
            return;
        }

        const data: CreateScenarioRequest = {
            name,
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

    return (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-surface p-5">
            <div>
                <h3 className="text-base font-semibold text-text-primary">{isEditing ? "Edit Scenario" : "Create Scenario"}</h3>
                <p className="mt-1 text-sm text-text-muted">Define the response behavior for this scenario.</p>
            </div>

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

                <textarea
                    value={headers}
                    onChange={(event) => setHeaders(event.target.value)}
                    rows={5}
                    className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Response Body</label>

                <textarea
                    value={responseBody}
                    onChange={(event) => setResponseBody(event.target.value)}
                    rows={10}
                    className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Response Delay (ms)</label>

                <input
                    type="number"
                    value={delayMs}
                    onChange={(event) => setDelayMs(Number(event.target.value))}
                    min={0}
                    max={30000}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
            </div>

            {error && <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-surface-hover hover:text-text-primary disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Saving..." : isEditing ? "Update Scenario" : "Create Scenario"}
                </button>
            </div>
        </form>
    );
}
