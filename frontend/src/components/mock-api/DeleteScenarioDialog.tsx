import { useState } from "react";
import { deleteScenario } from "../../api/scenario.api";

interface DeleteScenarioDialogProps {
    mockApiId: string;
    scenarioId: string;
    scenarioName: string;
    onSuccess: () => void;
    onClose: () => void;
}

export default function DeleteScenarioDialog({ mockApiId, scenarioId, scenarioName, onSuccess, onClose }: DeleteScenarioDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleDelete() {
        try {
            setLoading(true);
            setError("");

            await deleteScenario(mockApiId, scenarioId);

            onSuccess();
        } catch (error: any) {
            setError(error?.response?.data?.message ?? "Failed to delete scenario.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-border bg-surface shadow-2xl">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-text-primary">Delete Scenario</h2>

                    <p className="mt-3 text-sm leading-6 text-text-secondary">
                        Are you sure you want to delete <span className="font-medium text-text-primary">{scenarioName}</span>?
                    </p>

                    <p className="mt-2 text-xs text-text-muted">This action cannot be undone.</p>

                    {error && <div className="mt-4 rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
                </div>

                <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="rounded-lg bg-danger px-4 py-2.5 text-sm font-medium text-white transition hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Deleting..." : "Delete Scenario"}
                    </button>
                </div>
            </div>
        </div>
    );
}
