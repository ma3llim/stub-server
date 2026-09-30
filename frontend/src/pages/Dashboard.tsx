import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    async function handleLogout(): Promise<void> {
        await logout();

        navigate("/login", {
            replace: true,
        });
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <h1 className="text-xl font-bold text-gray-900">Mock API Platform</h1>

                    <button onClick={handleLogout} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                        Logout
                    </button>
                </div>
            </header>

            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                    <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>

                    <div className="mt-6 space-y-3 text-sm">
                        <p>
                            <span className="font-medium">Username:</span> {user?.username}
                        </p>

                        <p>
                            <span className="font-medium">Email:</span> {user?.email}
                        </p>

                        <p>
                            <span className="font-medium">Role:</span> {user?.role}
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
