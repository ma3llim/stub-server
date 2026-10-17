import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes/routes";
import { ThemeProvider } from "./theme/ThemeContext";

const router = createBrowserRouter(routes);

export default function App() {
    return (
        <ThemeProvider>
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}
