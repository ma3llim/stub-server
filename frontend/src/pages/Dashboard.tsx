import { useEffect, useState } from "react";

import { getMockApis, type MockApi } from "../api/mock-api.api";

import ApiExplorer from "../components/mock-api/ApiExplorer";
import CreateMockApiModal from "../components/mock-api/CreateMockApiModal";
import DeleteMockApiDialog from "../components/mock-api/DeleteMockApiDialog";
import ImportApisModal from "../components/transfer/ImportApisModal";
import ExportApisModal from "../components/transfer/ExportApisModal";
import { Download, Plus, Upload } from "lucide-react";

export default function Dashboard() {
    const [mockApis, setMockApis] = useState<MockApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);

    const [editingApi, setEditingApi] = useState<MockApi | null>(null);

    const [deletingApi, setDeletingApi] = useState<MockApi | null>(null);

    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    // Bumped after an import so replaced APIs remount and reload their scenarios.
    const [importVersion, setImportVersion] = useState(0);

    function handleImported(): void {
        setImportVersion((current) => current + 1);

        void loadMockApis();
    }

    async function loadMockApis(): Promise<void> {
        setError("");

        try {
            const data = await getMockApis();

            setMockApis(data);
        } catch (error: any) {
            setError(error.response?.data?.message ?? "Failed to load APIs.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadMockApis();
    }, []);

    function handleCreate(): void {
        setEditingApi(null);
        setShowCreateModal(true);
    }

    function handleEdit(mockApi: MockApi): void {
        setEditingApi(mockApi);
        setShowCreateModal(true);
    }

    function handleModalSuccess(): void {
        setShowCreateModal(false);
        setEditingApi(null);

        void loadMockApis();
    }

    function handleModalClose(): void {
        setShowCreateModal(false);
        setEditingApi(null);
    }

    function handleDeleteSuccess(): void {
        setDeletingApi(null);

        void loadMockApis();
    }

    return (
        <>
            <main className="mx-auto w-full max-w-7xl px-6 py-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary-text">Mock API Platform</p>
                        <h2 className="mt-1 text-2xl font-bold text-text-primary">API Explorer</h2>
                        <p className="mt-2 text-sm text-text-secondary">Create, configure, and run mock APIs for development and testing.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowImportModal(true)}
                        title="Import APIs and scenarios from an exported file"
                        className="flex items-center gap-2 rounded-lg border border-border-strong px-4 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
                    >
                        <Upload className="h-4 w-4" />
                        Import
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowExportModal(true)}
                        disabled={loading || mockApis.length === 0}
                        title={mockApis.length === 0 ? "Create an API first" : "Choose APIs and scenarios to download as one file"}
                        className="flex items-center gap-2 rounded-lg border border-border-strong px-4 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-surface-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Download className="h-4 w-4" />
                        Export all
                    </button>
                    <button
                        type="button"
                        onClick={handleCreate}
                        className="flex items-center gap-2 rounded-lg bg-text-primary px-5 py-2.5 text-sm font-medium text-surface shadow-sm transition hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" />
                        Create API
                    </button>
                    </div>
                </div>

                <div className="mb-8 rounded-lg border border-border bg-surface">
                    <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.7)]" />

                                <h3 className="text-sm font-semibold text-text-primary">Mock Server</h3>

                                <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Running</span>
                            </div>

                            <p className="mt-1 text-xs text-text-muted">Your mock APIs are served from this server.</p>
                        </div>

                        <div className="rounded-md border border-border bg-inset px-4 py-2">
                            <span className="font-mono text-sm text-primary-text">{import.meta.env.VITE_MOCK_SERVER_URL}</span>
                        </div>
                    </div>
                </div>

                {error && <div className="mb-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}

                {loading ? (
                    <div className="rounded-lg border border-border bg-surface px-6 py-16 text-center">
                        <p className="text-sm text-text-secondary">Loading mock APIs...</p>
                    </div>
                ) : (
                    <ApiExplorer key={importVersion} mockApis={mockApis} onEdit={handleEdit} onDelete={setDeletingApi} />
                )}
            </main>

            {showCreateModal && <CreateMockApiModal mockApi={editingApi} onSuccess={handleModalSuccess} onClose={handleModalClose} />}

            {showImportModal && <ImportApisModal onImported={handleImported} onClose={() => setShowImportModal(false)} />}

            {showExportModal && <ExportApisModal onClose={() => setShowExportModal(false)} />}

            {deletingApi && <DeleteMockApiDialog mockApi={deletingApi} onSuccess={handleDeleteSuccess} onCancel={() => setDeletingApi(null)} />}
        </>
    );
}
