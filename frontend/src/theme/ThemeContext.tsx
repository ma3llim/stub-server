import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// index.html applies the saved theme before React renders, so read it back from <html>.
function getInitialTheme(): Theme {
    return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function applyTheme(theme: Theme): void {
    const root = document.documentElement;

    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");

    try {
        localStorage.setItem(STORAGE_KEY, theme);
    } catch {
        // Storage can be unavailable (private mode); the theme still applies for this session.
    }
}

const TRANSITION_MS = 280;

// Cross-fades the whole page when the browser supports View Transitions;
// otherwise briefly animates colors via the .theme-transition class in index.css.
function switchThemeSmoothly(theme: Theme): void {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
        applyTheme(theme);
        return;
    }

    if (typeof document.startViewTransition === "function") {
        document.startViewTransition(() => applyTheme(theme));
        return;
    }

    root.classList.add("theme-transition");
    applyTheme(theme);
    window.setTimeout(() => root.classList.remove("theme-transition"), TRANSITION_MS);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    const toggleTheme = useCallback(() => {
        const next: Theme = document.documentElement.classList.contains("light") ? "dark" : "light";

        switchThemeSmoothly(next);
        setTheme(next);
    }, []);

    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }

    return context;
}
