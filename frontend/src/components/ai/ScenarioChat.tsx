import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
        <div className="fixed bottom-6 right-6 z-50 flex h-[min(600px,calc(100vh-3rem))] w-[min(450px,calc(100vw-3rem))] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
                <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-text-primary">AI Scenario Assistant</h3>

                    <p className="mt-0.5 truncate text-xs text-text-muted">Manage scenarios using natural language</p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="ml-3 shrink-0 rounded-md px-2 py-1 text-text-muted transition hover:bg-surface-hover hover:text-text-primary"
                    aria-label="Close assistant"
                >
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                    {messages.map((message, index) => {
                        const isUser = message.role === "user";

                        return (
                            <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                <div className={`min-w-0 max-w-[90%] overflow-hidden rounded-lg px-3 py-2 text-sm ${isUser ? "bg-primary text-white" : "bg-surface-hover text-text-primary"}`}>
                                    {isUser ? (
                                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                    ) : (
                                        <div className="markdown-content break-words">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-6">{children}</p>,

                                                    h1: ({ children }) => <h1 className="mb-2 mt-3 text-lg font-semibold first:mt-0">{children}</h1>,

                                                    h2: ({ children }) => <h2 className="mb-2 mt-3 text-base font-semibold first:mt-0">{children}</h2>,

                                                    h3: ({ children }) => <h3 className="mb-1.5 mt-3 text-sm font-semibold first:mt-0">{children}</h3>,

                                                    ul: ({ children }) => <ul className="mb-2 ml-5 list-disc space-y-1 last:mb-0">{children}</ul>,

                                                    ol: ({ children }) => <ol className="mb-2 ml-5 list-decimal space-y-1 last:mb-0">{children}</ol>,

                                                    li: ({ children }) => <li className="leading-5">{children}</li>,

                                                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,

                                                    blockquote: ({ children }) => <blockquote className="my-2 border-l-2 border-primary/50 pl-3 italic text-text-muted">{children}</blockquote>,

                                                    a: ({ children, href }) => (
                                                        <a href={href} target="_blank" rel="noopener noreferrer" className="break-all text-primary underline underline-offset-2 hover:opacity-80">
                                                            {children}
                                                        </a>
                                                    ),

                                                    code: ({ className, children, ...props }) => {
                                                        const isBlock = className?.includes("language-");

                                                        if (isBlock) {
                                                            return (
                                                                <code className="block whitespace-pre" {...props}>
                                                                    {children}
                                                                </code>
                                                            );
                                                        }

                                                        return (
                                                            <code className="rounded bg-background/70 px-1.5 py-0.5 font-mono text-[0.85em]" {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    },

                                                    pre: ({ children }) => (
                                                        <pre className="my-2 max-w-full overflow-x-auto rounded-lg border border-border bg-background p-3 text-xs leading-5">{children}</pre>
                                                    ),

                                                    table: ({ children }) => (
                                                        <div className="my-2 max-w-full overflow-x-auto rounded-lg border border-border">
                                                            <table className="w-full min-w-max border-collapse text-xs">{children}</table>
                                                        </div>
                                                    ),

                                                    thead: ({ children }) => <thead className="bg-background">{children}</thead>,

                                                    th: ({ children }) => <th className="border-b border-border px-3 py-2 text-left font-semibold">{children}</th>,

                                                    td: ({ children }) => <td className="border-b border-border px-3 py-2">{children}</td>,

                                                    hr: () => <hr className="my-3 border-border" />,
                                                }}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}
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
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-border p-3">
                <div className="flex items-end gap-2">
                    <textarea
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me to create or update a scenario..."
                        rows={1}
                        disabled={loading}
                        className="min-h-[44px] max-h-32 min-w-0 flex-1 resize-none overflow-y-auto rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
                    />

                    <button
                        type="button"
                        onClick={() => void handleSend()}
                        disabled={!input.trim() || loading}
                        className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
