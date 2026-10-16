import { Moon, Sun } from "lucide-react";

import { useTheme } from "./ThemeContext";

export default function ThemeToggle({ className = "" }: { className?: string }) {
    const { theme, toggleTheme } = useTheme();

    const isDark = theme === "dark";
    const label = isDark ? "Switch to light theme" : "Switch to dark theme";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={label}
            title={label}
            className={`relative h-9 w-9 overflow-hidden rounded-lg border border-border-strong text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary ${className}`}
        >
            <Sun
                className={`absolute inset-0 m-auto h-4 w-4 transition-all duration-300 ease-out motion-reduce:transition-none ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"}`}
            />
            <Moon
                className={`absolute inset-0 m-auto h-4 w-4 transition-all duration-300 ease-out motion-reduce:transition-none ${isDark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
            />
        </button>
    );
}
