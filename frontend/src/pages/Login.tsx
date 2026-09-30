import { Link, useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";

export default function Login() {
    const navigate = useNavigate();

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                        <p className="mt-2 text-sm text-gray-500">Sign in to your account</p>
                    </div>

                    <LoginForm onSuccess={() => navigate("/dashboard")} />

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link to="/register" className="font-medium text-gray-900 hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
