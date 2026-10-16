import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import ThemeToggle from "../../theme/ThemeToggle";

const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/demo", label: "Demo" },
];

export default function AppLayout() {
    const navigate = useNavigate();

    const { user, logout } = useAuth();

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
                        <h1 className="text-lg font-bold text-text-primary">Mock API</h1>

                        <nav className="flex items-center gap-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? "bg-gray-800 text-text-primary" : "text-gray-400 hover:bg-gray-800 hover:text-text-primary"}`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="hidden text-sm text-gray-400 sm:block">{user?.username}</span>

                        <ThemeToggle />

                        <button type="button" onClick={handleLogout} className="rounded-lg border border-gray-700 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <Outlet />
        </div>
    );
}
