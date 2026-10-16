import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { useEffect, type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";

import type { TransferErrorInfo } from "./transfer-utils";

interface TransferModalProps {
    title: string;
    description?: ReactNode;
    busy?: boolean;
    onClose: () => void;
    footer?: ReactNode;
    children: ReactNode;
}

export default function TransferModal({ title, description, busy = false, onClose, footer, children }: TransferModalProps) {
    useBodyScrollLock();

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent): void {
            if (event.key === "Escape" && !busy) {
                onClose();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [busy, onClose]);

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && !busy && onClose()}>
            <div role="dialog" aria-modal="true" aria-labelledby="transfer-modal-title" className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-surface shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
                    <div className="min-w-0">
                        <h2 id="transfer-modal-title" className="text-lg font-semibold text-text-primary">
                            {title}
                        </h2>
                        {description && <div className="mt-1 text-sm text-text-secondary">{description}</div>}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                        aria-label="Close"
                        className="rounded-md p-1.5 text-text-muted transition hover:bg-surface-hover hover:text-text-primary disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">{children}</div>

                {footer && <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-6 py-4">{footer}</div>}
            </div>
        </div>
    );
}

export function TransferErrorAlert({ error }: { error: TransferErrorInfo }) {
    return (
        <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
                <div className="min-w-0">
                    <p className="font-medium">{error.message}</p>
                    {error.issues.length > 0 && (
                        <ul className="mt-2 list-disc space-y-1 pl-4 font-mono text-xs wrap-break-word">
                            {error.issues.map((issue) => (
                                <li key={issue}>{issue}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
