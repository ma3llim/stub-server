import { Server } from "lucide-react";
import type { MockApi } from "../../api/mock-api.api";

import ApiEndpoint from "./ApiEndpoint";

interface ApiExplorerProps {
    mockApis: MockApi[];
    onEdit: (mockApi: MockApi) => void;
    onDelete: (mockApi: MockApi) => void;
}

export default function ApiExplorer({ mockApis, onEdit, onDelete }: ApiExplorerProps) {
    if (mockApis.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-hover">
                    <Server className="h-6 w-6 text-text-secondary" />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-text-primary">No APIs yet</h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">Create your first mock API to start building your API collection.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {mockApis.map((mockApi) => (
                <ApiEndpoint key={mockApi._id} mockApi={mockApi} onEdit={onEdit} onDelete={onDelete} />
            ))}
        </div>
    );
}
