import { useEffect, useState } from "react";
import axios from "axios";
import { Braces, X } from "lucide-react";
import { createMockResponse, updateMockResponse, type MockResponseType } from "../../api/response.api";
import type { MockApi, MockResponseData } from "../../api/mock-api.api";
import JsonCodeEditor from "./JsonCodeEditor";

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
    const [isEditing, setIsEditing] = useState(() => !response);

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
            setIsEditing(false);
        } catch (error) {
            setError(getErrorMessage(error, `Unable to save the ${type} response.`));
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
                    <div className="flex items-center gap-2">
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
                </div>

                <section className="flex min-h-0 flex-1 flex-col gap-4 p-5">
                    <div className="flex min-h-0 flex-1">
                        <JsonCodeEditor
                            id="response-body"
                            value={editor.body}
                            onChange={(body) => updateEditor({ body })}
                            readOnly={!isEditing}
                            className="h-full min-h-0 w-full rounded-lg border border-gray-700 bg-gray-950 focus-within:border-gray-500 focus-within:ring-2 focus-within:ring-gray-500/20"
                            onFormatError={() => setError("Enter valid JSON before formatting.")}
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-2">
                        {editor.configured && !isEditing ? (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                            >
                                Edit {type} response
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => void saveResponse()}
                                disabled={loading}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? "Saving..." : editor.configured ? "Save changes" : `Save ${type} response`}
                            </button>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
