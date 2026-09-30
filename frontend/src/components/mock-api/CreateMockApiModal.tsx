import { FormEvent, useEffect, useState } from "react";
import { createMockApi, updateMockApi, type HttpMethod, type MockApi } from "../../api/mock-api.api";
import { X } from "lucide-react";

interface CreateMockApiModalProps {
    mockApi?: MockApi | null;
    onSuccess: () => void;
    onClose: () => void;
}

export default function CreateMockApiModal({ mockApi, onSuccess, onClose }: CreateMockApiModalProps) {
    const isEditMode = Boolean(mockApi);

    const [name, setName] = useState("");
    const [method, setMethod] = useState<HttpMethod>("GET");
    const [path, setPath] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!mockApi) {
            setName("");
            setMethod("GET");
            setPath("");
            setDescription("");
            return;
        }

        setName(mockApi.name);
        setMethod(mockApi.method);
        setPath(mockApi.path);
        setDescription(mockApi.description ?? "");
    }, [mockApi]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            if (mockApi) {
                await updateMockApi(mockApi._id, {
                    name,
                    method,
                    path,
                    description,
                });
            } else {
                await createMockApi({
                    name,
                    method,
                    path,
                    description,
                    scenarios: [],
                });
            }

            onSuccess();
        } catch (error: any) {
            setError(error.response?.data?.message ?? "Unable to save API.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-xl rounded-xl border border-gray-800 bg-gray-900 shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-white">{isEditMode ? "Edit API" : "Create Mock API"}</h2>

                        <p className="mt-1 text-xs text-gray-400">Define the endpoint for your mock server.</p>
                    </div>

                    <button type="button" onClick={onClose} className="rounded-md p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-300" aria-label="Close modal">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">API Name</label>

                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Get Users"
                            required
                            className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">Endpoint</label>

                        <div className="flex">
                            <select
                                value={method}
                                onChange={(event) => setMethod(event.target.value as HttpMethod)}
                                className="rounded-l-lg border border-r-0 border-gray-700 bg-gray-800 px-3 text-sm font-semibold text-gray-200 outline-none focus:border-gray-500"
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="PATCH">PATCH</option>
                                <option value="DELETE">DELETE</option>
                            </select>

                            <input
                                value={path}
                                onChange={(event) => setPath(event.target.value)}
                                placeholder="/api/users"
                                required
                                className="min-w-0 flex-1 rounded-r-lg border border-gray-700 bg-gray-950 px-3 py-2.5 font-mono text-sm text-white placeholder:text-gray-600 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">Description</label>

                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Returns a list of users."
                            rows={3}
                            className="w-full resize-none rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
                        />
                    </div>

                    {error && <div className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-400">{error}</div>}

                    <div className="flex justify-end gap-3 border-t border-gray-800 pt-5">
                        <button type="button" onClick={onClose} className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800">
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Saving..." : isEditMode ? "Save Changes" : "Create API"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
