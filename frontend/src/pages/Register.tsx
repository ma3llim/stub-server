import { Link, useNavigate } from "react-router-dom";
import RegisterForm from "../components/auth/RegisterForm";
import ThemeToggle from "../theme/ThemeToggle";

export default function Register() {
    const navigate = useNavigate();

    return (
        <main className="relative flex min-h-screen items-center justify-center bg-inset px-4">
            <ThemeToggle className="absolute top-4 right-4" />
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-text-primary">Create your account</h1>

                        <p className="mt-2 text-sm text-text-secondary">Get started with the Mock API Platform</p>
                    </div>

                    <RegisterForm onSuccess={() => navigate("/dashboard")} />

                    <p className="mt-6 text-center text-sm text-text-secondary">
                        Already have an account?{" "}
                        <Link to="/login" className="font-medium text-text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
