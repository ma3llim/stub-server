import { Link, NavLink, Outlet } from "react-router-dom";

import ThemeToggle from "../../theme/ThemeToggle";

const navItems = [
    { to: "/dashboard", label: "API Explorer" },
    { to: `${import.meta.env.VITE_API_BASE_URL}/mappings`, label: "Mappings", external: true },
    { to: "/demo", label: "Demo", newTab: true },
];

const navLinkClass = "rounded-lg px-3 py-2 text-sm font-medium transition";
const inactiveNavLinkClass = "text-text-secondary hover:bg-surface-hover hover:text-text-primary";

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-surface">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="text-lg font-bold text-text-primary">
                            Mock API
                        </Link>

                        <nav className="flex items-center gap-1 overflow-x-auto">
                            {navItems.map((item) =>
                                item.external ? (
                                    <a key={item.to} href={item.to} target="_blank" rel="noopener noreferrer" className={`${navLinkClass} ${inactiveNavLinkClass}`}>
                                        {item.label}
                                    </a>
                                ) : (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        {...(item.newTab && { target: "_blank", rel: "noopener noreferrer" })}
                                        className={({ isActive }) => `${navLinkClass} ${isActive ? "bg-surface-hover text-text-primary" : inactiveNavLinkClass}`}
                                    >
                                        {item.label}
                                    </NavLink>
                                ),
                            )}
                        </nav>
                    </div>

                    <ThemeToggle />
                </div>
            </header>

            <Outlet />
        </div>
    );
}
