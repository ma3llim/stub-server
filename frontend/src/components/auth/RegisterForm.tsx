import { FormEvent, useState } from "react";
import { useAuth } from "../../auth/AuthContext";

interface RegisterFormProps {
    onSuccess: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
    const { register } = useAuth();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await register({ username, email, password });

            onSuccess();
        } catch (error: any) {
            setError(error.response?.data?.message ?? "Unable to create account. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium text-text-secondary">
                    Username
                </label>

                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="john_doe"
                    required
                    minLength={3}
                    maxLength={50}
                    autoComplete="username"
                    className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
            </div>

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
                    placeholder="Minimum 8 characters"
                    required
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
            </div>

            {error && <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? "Creating account..." : "Create account"}
            </button>
        </form>
    );
}
