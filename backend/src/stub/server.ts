import app from "./app.js";
import { env } from "../config/env.js";
import { connectDatabase, disconnectDatabase } from "../config/database.js";

let server: ReturnType<typeof app.listen> | undefined;

export async function startStubServer(): Promise<void> {
    if (server) {
        console.log("Stub Server is already running");
        return;
    }

    await connectDatabase();

    server = app.listen(env.STUB_PORT, () => {
        console.log(`Stub Server running on http://localhost:${env.STUB_PORT}`);
    });
}

export async function stopStubServer(): Promise<void> {
    if (!server) {
        console.log("Stub Server is already stopped");
        return;
    }

    server.close(async () => {
        server = undefined;

        await disconnectDatabase();

        console.log("Stub Server stopped");
    });
}

startStubServer().catch((error) => {
    console.error("Failed to start Stub Server", error);
    process.exit(1);
});
