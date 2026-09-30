import { Bot, Send, X } from "lucide-react";

import { sendAiMessage } from "../../api/ai.api";
import { useState, type FormEvent } from "react";

interface ScenarioChatProps {
    mockApiId: string;
    onClose: () => void;
}

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export default function ScenarioChat({ mockApiId, onClose }: ScenarioChatProps) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Hi! I can create, update, delete, activate, or list scenarios for this API.",
        },
    ]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        const trimmedMessage = message.trim();

        if (!trimmedMessage || loading) {
            return;
        }

        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: trimmedMessage,
        };

        setMessages((current) => [...current, userMessage]);

        setMessage("");
        setLoading(true);

        try {
            const response = await sendAiMessage({
                mockApiId,
                message: trimmedMessage,
            });

            setMessages((current) => [
                ...current,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: response,
                },
            ]);
        } catch (error: any) {
            setMessages((current) => [
                ...current,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: error.response?.data?.message ?? "Something went wrong while processing your request.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/60 p-4 sm:items-center">
            <div className="flex h-[650px] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-950 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
                            <Bot className="h-5 w-5 text-white" />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-white">Scenario Assistant</h2>

                            <p className="text-xs text-gray-500">Manage scenarios using natural language</p>
                        </div>
                    </div>

                    <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                    {messages.map((item) => (
                        <div key={item.id} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-6 ${
                                    item.role === "user" ? "bg-indigo-600 text-white" : "border border-gray-800 bg-gray-900 text-gray-300"
                                }`}
                            >
                                {item.content}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-gray-500">Thinking...</div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="border-t border-gray-800 p-4">
                    <div className="flex items-end gap-3">
                        <textarea
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                    event.preventDefault();

                                    event.currentTarget.form?.requestSubmit();
                                }
                            }}
                            disabled={loading}
                            rows={2}
                            placeholder="Ask me to create or manage a scenario..."
                            className="min-h-[48px] flex-1 resize-none rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:border-indigo-500"
                        />

                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
