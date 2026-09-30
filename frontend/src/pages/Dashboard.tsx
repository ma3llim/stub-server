import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

import { getMockApis, type MockApi } from "../api/mock-api.api";

import ApiExplorer from "../components/mock-api/ApiExplorer";
import CreateMockApiModal from "../components/mock-api/CreateMockApiModal";
import DeleteMockApiDialog from "../components/mock-api/DeleteMockApiDialog";
import { Plus } from "lucide-react";

export default function Dashboard() {
    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const [mockApis, setMockApis] = useState<MockApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);

    const [editingApi, setEditingApi] = useState<MockApi | null>(null);

    const [deletingApi, setDeletingApi] = useState<MockApi | null>(null);

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

    async function handleLogout(): Promise<void> {
        await logout();

        navigate("/login", {
            replace: true,
        });
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <header className="border-b border-gray-800 bg-gray-900">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-8">
                        <h1 className="text-lg font-bold text-white">Mock API</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="hidden text-sm text-gray-400 sm:block">{user?.username}</span>

                        <button type="button" onClick={handleLogout} className="rounded-lg border border-gray-700 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl px-6 py-8">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <p className="text-sm font-medium text-indigo-400">Mock API Platform</p>
                        <h2 className="mt-1 text-2xl font-bold text-white">API Explorer</h2>
                        <p className="mt-2 text-sm text-gray-400">Create, configure, and run mock APIs for development and testing.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCreate}
                        className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-200"
                    >
                        <Plus className="h-4 w-4" />
                        Create API
                    </button>
                </div>

                <div className="mb-8 rounded-lg border border-gray-800 bg-gray-900">
                    <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]" />

                                <h3 className="text-sm font-semibold text-white">Mock Server</h3>

                                <span className="rounded-full border border-green-900 bg-green-950/50 px-2 py-0.5 text-xs font-medium text-green-400">Running</span>
                            </div>

                            <p className="mt-1 text-xs text-gray-500">Your mock APIs are served from this server.</p>
                        </div>

                        <div className="rounded-md border border-gray-800 bg-gray-950 px-4 py-2">
                            <span className="font-mono text-sm text-indigo-400">{import.meta.env.VITE_MOCK_SERVER_URL}</span>
                        </div>
                    </div>
                </div>

                {error && <div className="mb-6 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-400">{error}</div>}

                {loading ? (
                    <div className="rounded-lg border border-gray-800 bg-gray-900 px-6 py-16 text-center">
                        <p className="text-sm text-gray-400">Loading mock APIs...</p>
                    </div>
                ) : (
                    <ApiExplorer mockApis={mockApis} onEdit={handleEdit} onDelete={setDeletingApi} />
                )}
            </main>

            {showCreateModal && <CreateMockApiModal mockApi={editingApi} onSuccess={handleModalSuccess} onClose={handleModalClose} />}

            {deletingApi && <DeleteMockApiDialog mockApi={deletingApi} onSuccess={handleDeleteSuccess} onCancel={() => setDeletingApi(null)} />}
        </div>
    );
}
