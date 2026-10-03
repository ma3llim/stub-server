import { useEffect, useState } from "react";
import axios from "axios";
import { Braces, X } from "lucide-react";
import { createMockResponse, deleteMockResponse, updateMockResponse, type MockResponseType } from "../../api/response.api";
import type { MockApi, MockResponseData } from "../../api/mock-api.api";

interface MockResponseModalProps {
    mockApi: MockApi;
    type: MockResponseType;
    onClose: () => void;
    onResponseChange: (type: MockResponseType, response?: MockResponseData) => void;
}

interface ResponseEditorState {
    body: string;
    configured: boolean;
}

function createEditorState(response: MockResponseData | undefined): ResponseEditorState {
    return {
        body: JSON.stringify(response ?? {}, null, 2),
        configured: Boolean(response),
    };
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError<{ message?: string }>(error)) {
        return error.response?.data?.message ?? fallback;
    }

    return error instanceof Error ? error.message : fallback;
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default function MockResponseModal({ mockApi, type, onClose, onResponseChange }: MockResponseModalProps) {
    const response = type === "success" ? mockApi.successResponse : mockApi.errorResponse;
    const [editor, setEditor] = useState(() => createEditorState(response));
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape" && !loading) {
                onClose();
            }
        }

        document.addEventListener("keydown", handleEscape);

        return () => document.removeEventListener("keydown", handleEscape);
    }, [loading, onClose]);

    function updateEditor(updates: Partial<ResponseEditorState>) {
        setEditor((current) => ({ ...current, ...updates }));
    }

    async function saveResponse() {
        setError("");

        let parsedBody: unknown;

        try {
            parsedBody = JSON.parse(editor.body);
        } catch {
            setError("Enter valid JSON for the response body.");
            return;
        }

        if (!isJsonObject(parsedBody)) {
            setError("The response body must be a JSON object.");
            return;
        }

        setLoading(true);

        try {
            let savedResponse: MockResponseData;
            if (editor.configured) {
                savedResponse = await updateMockResponse(mockApi._id, type, parsedBody);
            } else {
                savedResponse = await createMockResponse(mockApi._id, type, parsedBody);
            }

            updateEditor({ configured: true });
            onResponseChange(type, savedResponse);
        } catch (error) {
            setError(getErrorMessage(error, `Unable to save the ${type} response.`));
        } finally {
            setLoading(false);
        }
    }

    async function removeResponse() {
        setError("");
        setLoading(true);

        try {
            await deleteMockResponse(mockApi._id, type);
            updateEditor({ configured: false });
            onResponseChange(type);
        } catch (error) {
            setError(getErrorMessage(error, `Unable to delete the ${type} response.`));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !loading) {
                    onClose();
                }
            }}
        >
            <div className="flex h-[90vh] w-[70vw] flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Braces className="h-5 w-5 text-indigo-400" />
                        <div>
                            <h2 className="font-semibold text-white">{type === "success" ? "Success Mock" : "Error Mock"}</h2>
                            <p className="mt-1 text-sm text-gray-400">JSON response body for {mockApi.method} {mockApi.path}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-md p-1 text-gray-500 transition hover:bg-gray-800 hover:text-gray-300 disabled:opacity-50"
                        aria-label="Close modal"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <section className="flex min-h-0 flex-1 flex-col gap-4 p-5">
                    <div className="flex min-h-0 flex-1">
                        <textarea
                            id="response-body"
                            value={editor.body}
                            onChange={(event) => updateEditor({ body: event.target.value })}
                            spellCheck={false}
                            placeholder={'{\n  "message": "Example response"\n}'}
                            className="h-full min-h-0 w-full resize-none rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-2">
                        {editor.configured && (
                            <button
                                type="button"
                                onClick={() => void removeResponse()}
                                disabled={loading}
                                className="rounded-lg border border-red-900 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => void saveResponse()}
                            disabled={loading}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Saving..." : `Save ${type} response`}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
