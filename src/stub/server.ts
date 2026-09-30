import app from "./app.js";
import { env } from "../config/env.js";

let server: ReturnType<typeof app.listen> | undefined;

export function startStubServer(): void {
    if (server) {
        console.log("Stub Server is already running");
        return;
    }

    server = app.listen(env.STUB_PORT, () => {
        console.log(`Stub Server running on http://localhost:${env.STUB_PORT}`);
    });
}

export function stopStubServer(): void {
    if (!server) {
        console.log("Stub Server is already stopped");
        return;
    }

    server.close(() => {
        server = undefined;
        console.log("Stub Server stopped");
    });
}
