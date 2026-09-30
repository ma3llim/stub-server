import { useState } from "react";

import { deleteMockApi, type MockApi } from "../../api/mock-api.api";

interface DeleteMockApiDialogProps {
    mockApi: MockApi;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function DeleteMockApiDialog({ mockApi, onSuccess, onCancel }: DeleteMockApiDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleDelete(): Promise<void> {
        setLoading(true);
        setError("");

        try {
            await deleteMockApi(mockApi._id);

            onSuccess();
        } catch (error: any) {
            setError(error.response?.data?.message ?? "Failed to delete API.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
                <h2 className="text-lg font-semibold text-white">Delete API</h2>

                <p className="mt-3 text-sm leading-6 text-gray-400">
                    Are you sure you want to delete <strong className="font-semibold text-gray-200">{mockApi.name}</strong>?
                </p>

                <p className="mt-2 font-mono text-xs text-gray-500">
                    {mockApi.method} {mockApi.path}
                </p>

                {error && <div className="mt-4 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-400">{error}</div>}

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}
