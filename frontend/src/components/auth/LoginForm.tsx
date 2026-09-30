import { useState, type FormEvent } from "react";
import { useAuth } from "../../auth/AuthContext";

interface LoginFormProps {
    onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await login({ email, password });

            onSuccess();
        } catch (error: any) {
            setError(error.response?.data?.message ?? "Unable to login. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-text-secondary">
                    Email
                </label>

                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
            </div>

            <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-text-secondary">
                    Password
                </label>

                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
            </div>

            {error && <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? "Signing in..." : "Sign in"}
            </button>
        </form>
    );
}
