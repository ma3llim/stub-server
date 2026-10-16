import { Link, useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import ThemeToggle from "../theme/ThemeToggle";

export default function Login() {
    const navigate = useNavigate();

    return (
        <main className="relative flex min-h-screen items-center justify-center bg-gray-950 px-4">
            <ThemeToggle className="absolute top-4 right-4" />
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-sm">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>

                        <p className="mt-2 text-sm text-gray-400">Sign in to your account</p>
                    </div>

                    <LoginForm onSuccess={() => navigate("/dashboard")} />

                    <p className="mt-6 text-center text-sm text-gray-400">
                        Don't have an account?{" "}
                        <Link to="/register" className="font-medium text-text-primary hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
