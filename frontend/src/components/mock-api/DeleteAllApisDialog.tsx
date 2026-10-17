import { useState, type FormEvent } from "react";
import { AlertTriangle, Download, Loader2, Trash2 } from "lucide-react";

import { deleteAllMockApis } from "../../api/mock-api.api";
import TransferModal, { TransferErrorAlert } from "../transfer/TransferModal";
import { secondaryButtonClass, toTransferError, type TransferErrorInfo } from "../transfer/transfer-utils";

interface DeleteAllApisDialogProps {
    apiCount: number;
    scenarioCount: number;
    onDeleted: () => void;
    onExportFirst: () => void;
    onClose: () => void;
}

export default function DeleteAllApisDialog({ apiCount, scenarioCount, onDeleted, onExportFirst, onClose }: DeleteAllApisDialogProps) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<TransferErrorInfo | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        setDeleting(true);
        setError(null);

        try {
            await deleteAllMockApis();

            onDeleted();
        } catch (deleteError) {
            setError(toTransferError(deleteError, "Failed to delete your APIs."));
            setDeleting(false);
        }
    }

    return (
        <TransferModal
            title="Delete all APIs"
            description="This removes every API and scenario in the workspace."
            busy={deleting}
            onClose={onClose}
            footer={
                <>
                    <button type="button" onClick={onClose} disabled={deleting} className={secondaryButtonClass}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="delete-all-form"
                        disabled={deleting}
                        className="inline-flex items-center gap-2 rounded-lg bg-danger-solid px-4 py-2.5 text-sm font-medium text-white transition hover:bg-danger-solid-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        {deleting ? "Deleting..." : `Delete ${apiCount} API${apiCount === 1 ? "" : "s"}`}
                    </button>
                </>
            }
        >
            <form id="delete-all-form" onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
                <div className="flex gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-danger" />
                    <div className="text-sm">
                        <p className="font-medium text-danger">This can't be undone.</p>
                        <p className="mt-1 text-text-secondary">
                            {apiCount} API{apiCount === 1 ? "" : "s"} and {scenarioCount} scenario{scenarioCount === 1 ? "" : "s"} will be permanently deleted, along with their success and error
                            mocks. The mock server will stop serving them right away.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onExportFirst}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-text hover:underline disabled:opacity-50"
                >
                    <Download className="h-4 w-4" />
                    Export a backup first
                </button>

                {error && <TransferErrorAlert error={error} />}
            </form>
        </TransferModal>
    );
}
