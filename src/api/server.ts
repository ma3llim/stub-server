import app from "./app.js";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { env } from "../config/env.js";

async function startServer(): Promise<void> {
    await connectDatabase();

    const server = app.listen(env.API_PORT, () => {
        console.log(`API Server running on http://localhost:${env.API_PORT}`);
    });

    const shutdown = async (signal: string): Promise<void> => {
        console.log(`${signal} received. Shutting down...`);

        server.close(async () => {
            await disconnectDatabase();
            process.exit(0);
        });
    };

    process.on("SIGTERM", () => {
        void shutdown("SIGTERM");
    });

    process.on("SIGINT", () => {
        void shutdown("SIGINT");
    });
}

startServer().catch((error) => {
    console.error("Failed to start API Server:", error);
    process.exit(1);
});
