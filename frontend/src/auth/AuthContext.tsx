import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentUser, login as loginApi, logout as logoutApi, register as registerApi, type LoginRequest, type RegisterRequest, type User } from "../api/auth.api";

interface AuthContextValue {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;

    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function initializeAuth(): Promise<void> {
            try {
                const currentUser = await getCurrentUser();

                setUser(currentUser);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        void initializeAuth();
    }, []);

    async function login(data: LoginRequest): Promise<void> {
        await loginApi(data);

        const currentUser = await getCurrentUser();

        setUser(currentUser);
    }

    async function register(data: RegisterRequest): Promise<void> {
        await registerApi(data);

        await login({
            email: data.email,
            password: data.password,
        });
    }

    async function logout(): Promise<void> {
        try {
            await logoutApi();
        } finally {
            setUser(null);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: user !== null,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
