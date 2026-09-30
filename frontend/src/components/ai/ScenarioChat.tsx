import { useState } from "react";
import { sendAiMessage } from "../../api/ai.api";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface ScenarioChatProps {
    mockApiId: string;
    onClose: () => void;
    onScenarioChanged?: () => void;
}

export default function ScenarioChat({ mockApiId, onClose, onScenarioChanged }: ScenarioChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hi! I can create, update, delete, activate, or list scenarios for this API.",
        },
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSend() {
        const message = input.trim();

        if (!message || loading) {
            return;
        }

        setMessages((current) => [
            ...current,
            {
                role: "user",
                content: message,
            },
        ]);

        setInput("");
        setLoading(true);

        try {
            const response = await sendAiMessage({
                mockApiId,
                message,
            });

            setMessages((current) => [
                ...current,
                {
                    role: "assistant",
                    content: response,
                },
            ]);

            /*
             * AI may have created, updated, deleted,
             * or activated a scenario.
             *
             * Tell the parent to refresh the data.
             */
            onScenarioChanged?.();
        } catch (error: any) {
            setMessages((current) => [
                ...current,
                {
                    role: "assistant",
                    content: error?.response?.data?.message ?? "Something went wrong while processing your request.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void handleSend();
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[450px] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                    <h3 className="text-sm font-semibold text-text-primary">AI Scenario Assistant</h3>

                    <p className="mt-0.5 text-xs text-text-muted">Manage scenarios using natural language</p>
                </div>

                <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-text-muted transition hover:bg-surface-hover hover:text-text-primary">
                    ✕
                </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((message, index) => {
                    const isUser = message.role === "user";

                    return (
                        <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${isUser ? "bg-primary text-white" : "bg-surface-hover text-text-primary"}`}>
                                <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                        </div>
                    );
                })}

                {loading && (
                    <div className="flex justify-start">
                        <div className="rounded-lg bg-surface-hover px-3 py-2 text-sm font-medium">
                            <div className="flex items-center gap-1">
                                <span className="animate-shimmer bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-[length:200%_100%] bg-clip-text text-transparent">
                                    AI is thinking
                                </span>

                                <span className="flex items-center gap-0.5">
                                    <span className="thinking-dot dot-1" />
                                    <span className="thinking-dot dot-2" />
                                    <span className="thinking-dot dot-3" />
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-border p-3">
                <div className="flex items-end gap-2">
                    <textarea
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me to create or update a scenario..."
                        rows={1}
                        disabled={loading}
                        className="min-h-[44px] flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
                    />

                    <button
                        type="button"
                        onClick={() => void handleSend()}
                        disabled={!input.trim() || loading}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
