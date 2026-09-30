import { Link, useNavigate } from "react-router-dom";
import RegisterForm from "../components/auth/RegisterForm";

export default function Register() {
    const navigate = useNavigate();

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-sm">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-white">Create your account</h1>

                        <p className="mt-2 text-sm text-gray-400">Get started with the Mock API Platform</p>
                    </div>

                    <RegisterForm onSuccess={() => navigate("/dashboard")} />

                    <p className="mt-6 text-center text-sm text-gray-400">
                        Already have an account?{" "}
                        <Link to="/login" className="font-medium text-white hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
