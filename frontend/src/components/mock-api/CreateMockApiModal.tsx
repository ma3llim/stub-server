import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { type FormEvent, useEffect, useState } from "react";
import { createMockApi, updateMockApi, type HttpMethod, type MockApi } from "../../api/mock-api.api";
import { X } from "lucide-react";
import JsonCodeEditor from "./JsonCodeEditor";

const BODY_METHODS = new Set<HttpMethod>(["POST", "PUT", "PATCH"]);

function formatRequestBody(value: unknown): string {
    return value === undefined || value === null ? "" : JSON.stringify(value, null, 2);
}

interface CreateMockApiModalProps {
    mockApi?: MockApi | null;
    onSuccess: () => void;
    onClose: () => void;
}

export default function CreateMockApiModal({ mockApi, onSuccess, onClose }: CreateMockApiModalProps) {
    useBodyScrollLock();

    const isEditMode = Boolean(mockApi);

    const [name, setName] = useState("");
    const [method, setMethod] = useState<HttpMethod>("GET");
    const [path, setPath] = useState("");
    const [description, setDescription] = useState("");
    const [requestBody, setRequestBody] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!mockApi) {
            setName("");
            setMethod("GET");
            setPath("");
            setDescription("");
            setRequestBody("");
            return;
        }

        setName(mockApi.name);
        setMethod(mockApi.method);
        setPath(mockApi.path);
        setDescription(mockApi.description ?? "");
        setRequestBody(formatRequestBody(mockApi.requestBody));
    }, [mockApi]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        setError("");

        // Empty means "no request body"; anything else must be valid JSON.
        let parsedRequestBody: unknown = undefined;

        if (requestBody.trim()) {
            try {
                parsedRequestBody = JSON.parse(requestBody);
            } catch {
                setError("Request body must be valid JSON, or leave it empty.");
                return;
            }
        }

        setLoading(true);

        try {
            if (mockApi) {
                await updateMockApi(mockApi._id, {
                    name,
                    method,
                    path,
                    description,
                    // null clears a previously saved body.
                    requestBody: parsedRequestBody ?? null,
                });
            } else {
                await createMockApi({
                    name,
                    method,
                    path,
                    description,
                    scenarios: [],
                    ...(parsedRequestBody !== undefined && { requestBody: parsedRequestBody }),
                });
            }

            onSuccess();
        } catch (error: any) {
            setError(error.response?.data?.message ?? "Unable to save API.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-xl border border-border bg-surface shadow-2xl">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">{isEditMode ? "Edit API" : "Create Mock API"}</h2>

                        <p className="mt-1 text-xs text-text-secondary">Define the endpoint for your mock server.</p>
                    </div>

                    <button type="button" onClick={onClose} className="rounded-md p-1 text-text-muted hover:bg-surface-hover hover:text-text-primary" aria-label="Close modal">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="min-h-0 space-y-5 overflow-y-auto overscroll-contain p-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">API Name</label>

                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Get Users"
                            required
                            className="w-full rounded-lg border border-border-strong bg-inset px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Endpoint</label>

                        <div className="flex">
                            <select
                                value={method}
                                onChange={(event) => setMethod(event.target.value as HttpMethod)}
                                className="rounded-l-lg border border-r-0 border-border-strong bg-surface-hover px-3 text-sm font-semibold text-text-primary outline-none focus:border-primary"
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="PATCH">PATCH</option>
                                <option value="DELETE">DELETE</option>
                            </select>

                            <input
                                value={path}
                                onChange={(event) => setPath(event.target.value)}
                                placeholder="/api/users"
                                required
                                className="min-w-0 flex-1 rounded-r-lg border border-border-strong bg-inset px-3 py-2.5 font-mono text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Description</label>

                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Returns a list of users."
                            rows={3}
                            className="w-full resize-none rounded-lg border border-border-strong bg-inset px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div>
                        <div className="mb-2 flex items-baseline justify-between gap-2">
                            <label htmlFor="request-body" className="block text-sm font-medium text-text-secondary">
                                Request Body <span className="font-normal text-text-muted">(optional)</span>
                            </label>
                            <span className="text-xs text-text-muted">{BODY_METHODS.has(method) ? "Example JSON this endpoint expects" : `${method} requests usually have no body`}</span>
                        </div>

                        <JsonCodeEditor
                            id="request-body"
                            aria-label="Request body"
                            value={requestBody}
                            onChange={setRequestBody}
                            onFormatError={() => setError("Request body must be valid JSON before it can be formatted.")}
                            className="h-44 rounded-lg border border-border-strong text-xs"
                        />
                    </div>

                    {error && <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}

                    <div className="flex justify-end gap-3 border-t border-border pt-5">
                        <button type="button" onClick={onClose} className="rounded-lg border border-border-strong px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover">
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-text-primary px-5 py-2.5 text-sm font-medium text-surface hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Saving..." : isEditMode ? "Save Changes" : "Create API"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
