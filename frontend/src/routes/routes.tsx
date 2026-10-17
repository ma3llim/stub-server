import { Navigate, type RouteObject } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Demo from "../pages/Demo";
import Home from "../pages/Home";
import AppLayout from "../components/layout/AppLayout";

export const routes: RouteObject[] = [
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

    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
];
