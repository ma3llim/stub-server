import { Moon, Sun } from "lucide-react";

import { useTheme } from "./ThemeContext";

export default function ThemeToggle({ className = "" }: { className?: string }) {
    const { theme, toggleTheme } = useTheme();

    const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={label}
            title={label}
            className={`rounded-lg border border-gray-700 p-2 text-gray-300 transition hover:bg-gray-800 ${className}`}
        >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
    );
}
