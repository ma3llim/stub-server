import { env } from "./env.js";

const CLOUDFLARE_URL = `https://api.cloudflare.com/client/v4/accounts/` + `${env.CLOUDFLARE_ACCOUNT_ID}/ai/v1/chat/completions`;

export async function createChatCompletion(body: unknown) {
    const response = await fetch(CLOUDFLARE_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Cloudflare response:", JSON.stringify(data, null, 2));
        throw new Error(`Cloudflare AI request failed: ${response.status}`);
    }

    return data;
}
