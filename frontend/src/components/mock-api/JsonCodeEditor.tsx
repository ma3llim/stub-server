import { useEffect, useRef } from "react";
import { EditorView, minimalSetup } from "codemirror";
import { json } from "@codemirror/lang-json";
import { bracketMatching, indentOnInput, indentUnit } from "@codemirror/language";
import { oneDark } from "@codemirror/theme-one-dark";
import { Compartment } from "@codemirror/state";

interface JsonCodeEditorProps {
    id?: string;
    "aria-label"?: string;
    value: string;
    onChange: (value: string) => void;
    className: string;
    readOnly?: boolean;
    showFormatButton?: boolean;
    onFormatError?: () => void;
}

export default function JsonCodeEditor({
    value,
    onChange,
    className,
    id,
    "aria-label": ariaLabel,
    readOnly = false,
    showFormatButton = true,
    onFormatError,
}: JsonCodeEditorProps) {
    const hostRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const editableCompartmentRef = useRef(new Compartment());
    const valueRef = useRef(value);
    const onChangeRef = useRef(onChange);
    const readOnlyRef = useRef(readOnly);

    useEffect(() => {
        valueRef.current = value;
        onChangeRef.current = onChange;
        readOnlyRef.current = readOnly;
    }, [onChange, readOnly, value]);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) {
            return;
        }

        const editableCompartment = new EditorView({
            parent: host,
            doc: valueRef.current,
            extensions: [
                minimalSetup,
                json(),
                oneDark,
                bracketMatching(),
                indentOnInput(),
                indentUnit.of("  "),
                EditorView.lineWrapping,
                editableCompartmentRef.current.of(EditorView.editable.of(!readOnlyRef.current)),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        onChangeRef.current(update.state.doc.toString());
                    }
                }),
            ],
        });

        viewRef.current = editableCompartment;

        return () => {
            editableCompartment.destroy();
            viewRef.current = null;
        };
    }, []);

    useEffect(() => {
        const view = viewRef.current;
        if (!view || view.state.doc.toString() === value) {
            return;
        }

        view.dispatch({
            changes: {
                from: 0,
                to: view.state.doc.length,
                insert: value,
            },
        });
    }, [value]);

    useEffect(() => {
        const view = viewRef.current;
        if (view) {
            view.dispatch({
                effects: editableCompartmentRef.current.reconfigure(EditorView.editable.of(!readOnly)),
            });
        }
    }, [readOnly]);

    function formatJson() {
        try {
            const formatted = JSON.stringify(JSON.parse(value), null, 2);
            const view = viewRef.current;

            if (view && view.state.doc.toString() !== formatted) {
                view.dispatch({
                    changes: {
                        from: 0,
                        to: view.state.doc.length,
                        insert: formatted,
                    },
                });
            }
        } catch {
            onFormatError?.();
        }
    }

    return (
        <div className={`json-code-editor flex flex-col overflow-hidden ${className}`}>
            {showFormatButton && (
                <div className="flex shrink-0 justify-end border-b border-gray-700 px-2 py-1.5">
                    <button
                        type="button"
                        onClick={formatJson}
                        disabled={readOnly}
                        className="rounded-md border border-gray-700 px-2.5 py-1 text-xs font-medium text-gray-300 transition hover:bg-gray-800"
                    >
                        Format JSON
                    </button>
                </div>
            )}
            <div id={id} ref={hostRef} aria-label={ariaLabel} className="min-h-0 flex-1 overflow-hidden" />
        </div>
    );
}
