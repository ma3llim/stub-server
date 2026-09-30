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

            <main className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">API Documentation</p>

                        <h2 className="mt-1 text-2xl font-bold text-white">API Explorer</h2>

                        <p className="mt-2 text-sm text-gray-400">Explore and manage your mock API endpoints.</p>
                    </div>

                    <button type="button" onClick={handleCreate} className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-200">
                        <Plus className="h-4 w-4" />
                        Create API
                    </button>
                </div>

                {error && <div className="mb-6 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-400">{error}</div>}

                {loading ? (
                    <div className="rounded-lg border border-gray-800 bg-gray-900 px-6 py-16 text-center">
                        <p className="text-sm text-gray-400">Loading APIs...</p>
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
