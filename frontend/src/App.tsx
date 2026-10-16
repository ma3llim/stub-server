import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { routes } from "./routes/routes";
import { ThemeProvider } from "./theme/ThemeContext";

const router = createBrowserRouter(routes);

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </ThemeProvider>
    );
}
