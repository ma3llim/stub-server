import { Navigate, type RouteObject } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "../auth/ProtectedRoute";
import Dashboard from "../pages/Dashboard";
import Demo from "../pages/Demo";
import AppLayout from "../components/layout/AppLayout";

export const routes: RouteObject[] = [
    {
        path: "/",
        element: <Navigate to="/login" replace />,
    },

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

    {
        path: "*",
        element: <Navigate to="/login" replace />,
    },
];
