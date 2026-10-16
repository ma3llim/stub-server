import { Navigate, type RouteObject } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "../auth/ProtectedRoute";
import Dashboard from "../pages/Dashboard";
import Demo from "../pages/Demo";
import Home from "../pages/Home";
import AppLayout from "../components/layout/AppLayout";

export const routes: RouteObject[] = [
    {
        path: "/login",
        element: <Login />,
    },

    {
        path: "/register",
        element: <Register />,
    },

    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    {
                        path: "/",
                        element: <Home />,
                    },
                    {
                        path: "/dashboard",
                        element: <Dashboard />,
                    },
                    {
                        path: "/demo",
                        element: <Demo />,
                    },
                ],
            },
        ],
    },

    // Unknown URLs go home; ProtectedRoute sends signed-out users to /login from there.
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
];
