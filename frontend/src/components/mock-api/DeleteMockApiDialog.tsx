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
            <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl">
                <h2 className="text-lg font-semibold text-text-primary">Delete API</h2>

                <p className="mt-3 text-sm leading-6">
                    Are you sure you want to delete <strong className="font-semibold text-text-primary">{mockApi.name}</strong>?
                </p>

                <p className="mt-2 font-mono text-xs">
                    {mockApi.method} {mockApi.path}
                </p>

                {error && <div className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-lg border border-border-strong px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="rounded-lg bg-danger-solid px-4 py-2.5 text-sm font-medium text-white hover:bg-danger-solid-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}
