import { Navigate, type RouteObject } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "../auth/ProtectedRoute";
import Dashboard from "../pages/Dashboard";

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
                path: "/dashboard",
                element: <Dashboard />,
            },
        ],
    },

    {
        path: "*",
        element: <Navigate to="/login" replace />,
    },
];
