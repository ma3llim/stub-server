import { useRef, useState, type DragEvent } from "react";
import { FileJson, Loader2, Upload } from "lucide-react";

interface FileDropZoneProps {
    hint: string;
    loading?: boolean;
    onFile: (file: File) => void;
}

export default function FileDropZone({ hint, loading = false, onFile }: FileDropZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    function handleDrop(event: DragEvent<HTMLButtonElement>): void {
        event.preventDefault();
        setDragging(false);

        const file = event.dataTransfer.files[0];

        if (file && !loading) {
            onFile(file);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                disabled={loading}
                className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition disabled:cursor-progress ${
                    dragging ? "border-primary bg-primary/10" : "border-border-strong bg-inset hover:border-primary/60 hover:bg-surface-hover"
                }`}
            >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-hover text-text-secondary">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : dragging ? <FileJson className="h-6 w-6 text-primary-text" /> : <Upload className="h-6 w-6" />}
                </span>

                <span className="mt-4 text-sm font-medium text-text-primary">{loading ? "Checking file..." : dragging ? "Drop to upload" : "Drop an export file here, or click to browse"}</span>
                <span className="mt-1 text-xs text-text-muted">{hint}</span>
            </button>

            <input
                ref={inputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(event) => {
                    const file = event.target.files?.[0];

                    // Reset so choosing the same file again still triggers onChange.
                    event.target.value = "";

                    if (file) {
                        onFile(file);
                    }
                }}
            />
        </>
    );
}
