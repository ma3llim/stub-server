import { Link, useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";

export default function Login() {
    const navigate = useNavigate();

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-sm">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-white">Welcome back</h1>

                        <p className="mt-2 text-sm text-gray-400">Sign in to your account</p>
                    </div>

                    <LoginForm onSuccess={() => navigate("/dashboard")} />

                    <p className="mt-6 text-center text-sm text-gray-400">
                        Don't have an account?{" "}
                        <Link to="/register" className="font-medium text-white hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
