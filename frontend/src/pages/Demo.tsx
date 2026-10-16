import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertTriangle, Loader2, Send } from "lucide-react";

import type { HttpMethod } from "../api/mock-api.api";
import JsonCodeEditor from "../components/mock-api/JsonCodeEditor";
import { methodStylesText } from "../components/mock-api/method-styles";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const TIMEOUT_MS = 15000;

interface DemoResponse {
    status: number;
    statusText: string;
    durationMs: number;
    sizeBytes: number;
    contentType: string;
    body: string;
    isJson: boolean;
    headers: Record<string, string>;
}

interface DemoError {
    title: string;
    message: string;
}

type DemoState = { status: "idle" } | { status: "loading" } | { status: "done"; response: DemoResponse } | { status: "error"; error: DemoError };

// Pretty-prints JSON when the body is JSON; otherwise returns the text unchanged.
function formatBody(text: string): { body: string; isJson: boolean } {
    if (!text.trim()) {
        return { body: "", isJson: false };
    }

    try {
        return { body: JSON.stringify(JSON.parse(text), null, 2), isJson: true };
    } catch {
        return { body: text, isJson: false };
    }
}

function formatBytes(bytes: number): string {
    return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}

function statusClass(status: number): string {
    if (status >= 200 && status < 300) {
        return "border-success/30 bg-success/10 text-success";
    }

    if (status >= 300 && status < 400) {
        return "border-warning/30 bg-warning/10 text-warning";
    }

    return "border-danger/30 bg-danger/10 text-danger";
}

export default function Demo() {
    const [method, setMethod] = useState<HttpMethod>("GET");
    const [url, setUrl] = useState("");
    const [state, setState] = useState<DemoState>({ status: "idle" });
    const [tab, setTab] = useState<"body" | "headers">("body");

    const controllerRef = useRef<AbortController | null>(null);

    useEffect(() => () => controllerRef.current?.abort(), []);

    async function sendRequest(): Promise<void> {
        const target = url.trim();

        if (!target) {
            return;
        }

        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        let timedOut = false;
        const timer = window.setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, TIMEOUT_MS);

        setState({ status: "loading" });
        const startedAt = performance.now();

        try {
            const response = await fetch(target, {
                method,
                signal: controller.signal,
                // Sends the login cookie so the mock server answers with this user's own APIs.
                credentials: "include",
            });
            const text = await response.text();

            if (controller !== controllerRef.current) {
                return;
            }

            setState({
                status: "done",
                response: {
                    status: response.status,
                    statusText: response.statusText,
                    durationMs: Math.round(performance.now() - startedAt),
                    sizeBytes: new Blob([text]).size,
                    contentType: response.headers.get("content-type") ?? "",
                    headers: Object.fromEntries(response.headers.entries()),
                    ...formatBody(text),
                },
            });
        } catch (error) {
            if (controller !== controllerRef.current) {
                return;
            }

            let demoError: DemoError = { title: "Request failed", message: error instanceof Error ? error.message : "Unknown error" };

            if (timedOut) {
                demoError = { title: "Request timed out", message: `No response within ${TIMEOUT_MS / 1000} seconds. Check the scenario's delay.` };
            } else if (error instanceof TypeError) {
                demoError = {
                    title: "Can't reach the server",
                    message: "The request failed before a response arrived. Check the URL, that the mock server is running, and that it allows cross-origin requests.",
                };
            }

            setState({ status: "error", error: demoError });
        } finally {
            window.clearTimeout(timer);
        }
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        void sendRequest();
    }

    const loading = state.status === "loading";

    return (
        <main className="mx-auto w-full max-w-7xl px-6 py-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-text-primary">Demo</h2>
                <p className="mt-2 text-sm text-text-secondary">Call any mock API and see exactly what it returns.</p>
            </div>

            <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2 sm:flex-row">
                <select
                    value={method}
                    onChange={(event) => setMethod(event.target.value as HttpMethod)}
                    aria-label="HTTP method"
                    className={`rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-sm font-bold outline-none focus:border-primary ${methodStylesText[method]}`}
                >
                    {METHODS.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>

                <input
                    type="url"
                    required
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="Enter mock API URL"
                    aria-label="Request URL"
                    className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 font-mono text-sm text-text-primary outline-none focus:border-primary"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-progress disabled:opacity-60"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {loading ? "Sending..." : state.status === "done" ? "Send again" : "Send"}
                </button>
            </form>

            {state.status === "idle" && (
                <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center text-sm text-text-muted">The response will appear here.</div>
            )}

            {loading && (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 py-16 text-sm text-text-secondary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Waiting for response...
                </div>
            )}

            {state.status === "error" && (
                <div role="alert" className="flex gap-3 rounded-lg border border-danger/30 bg-danger/10 px-5 py-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-danger" />
                    <div>
                        <p className="text-sm font-semibold text-danger">{state.error.title}</p>
                        <p className="mt-1 text-sm text-text-secondary">{state.error.message}</p>
                    </div>
                </div>
            )}

            {state.status === "done" && (
                <section className="overflow-hidden rounded-lg border border-border bg-surface">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-4 py-3">
                        <span className={`rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${statusClass(state.response.status)}`}>
                            {state.response.status} {state.response.statusText}
                        </span>
                        <span className="font-mono text-xs text-text-muted">{state.response.durationMs} ms</span>
                        <span className="font-mono text-xs text-text-muted">{formatBytes(state.response.sizeBytes)}</span>
                        {state.response.contentType && <span className="truncate font-mono text-xs text-text-muted">{state.response.contentType}</span>}

                        <div className="ml-auto flex rounded-lg border border-border p-0.5" role="tablist">
                            {(["body", "headers"] as const).map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    role="tab"
                                    aria-selected={tab === item}
                                    onClick={() => setTab(item)}
                                    className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition ${tab === item ? "bg-surface-hover text-text-primary" : "text-text-muted hover:text-text-primary"}`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {tab === "body" &&
                        (state.response.body ? (
                            <>
                                {!state.response.isJson && <p className="border-b border-border px-4 py-2 text-xs text-text-muted">Response isn't JSON, showing raw text.</p>}
                                <JsonCodeEditor value={state.response.body} onChange={() => {}} readOnly showFormatButton={false} aria-label="Response body" className="h-112 text-xs" />
                            </>
                        ) : (
                            <p className="px-4 py-12 text-center text-sm text-text-muted">The response has no body.</p>
                        ))}

                    {tab === "headers" && (
                        <JsonCodeEditor
                            value={JSON.stringify(state.response.headers, null, 2)}
                            onChange={() => {}}
                            readOnly
                            showFormatButton={false}
                            aria-label="Response headers"
                            className="h-64 text-xs"
                        />
                    )}
                </section>
            )}
        </main>
    );
}
