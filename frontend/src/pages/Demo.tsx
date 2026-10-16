import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AlertTriangle, Mail, MapPin, RefreshCw, Search, Users } from "lucide-react";

const TIMEOUT_MS = 15000;

interface TeamMember {
    id: string | number;
    name: string;
    role: string;
    email: string;
    location: string;
    status: string;
    avatar: string;
}

interface DemoError {
    title: string;
    message: string;
    body?: unknown;
}

type DemoState =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; members: TeamMember[] }
    | { status: "empty" }
    | { status: "error"; error: DemoError };

class HttpError extends Error {
    status: number;
    body: unknown;

    constructor(status: number, message: string, body: unknown) {
        super(message);
        this.status = status;
        this.body = body;
    }
}

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

class DataError extends Error {}

function memberName(item: JsonObject): string {
    if (typeof item.name === "string") {
        return item.name.trim();
    }

    return [item.firstName, item.lastName]
        .filter((part) => typeof part === "string")
        .join(" ")
        .trim();
}

// Accepts [...], { data: [...] }, { members: [...] }, { team: [...] }, or a single member object.
function normalizeMembers(body: unknown): TeamMember[] {
    let list: unknown = Array.isArray(body) ? body : isObject(body) ? (body.data ?? body.members ?? body.team) : undefined;

    if (isObject(list)) {
        list = [list];
    }

    if (!Array.isArray(list)) {
        throw new DataError('Expected a list of team members, such as { "data": [ ... ] }.');
    }

    const valid = list.filter((item): item is JsonObject => isObject(item) && memberName(item) !== "");

    if (list.length > 0 && valid.length === 0) {
        throw new DataError('None of the returned items have a "name" (or "firstName"/"lastName") field.');
    }

    return valid.map((item, index) => ({
        id: typeof item.id === "string" || typeof item.id === "number" ? item.id : typeof item._id === "string" ? item._id : index,
        name: memberName(item),
        role: String(item.role ?? item.title ?? ""),
        email: String(item.email ?? ""),
        location: String(item.location ?? ""),
        status: String(item.status ?? "").toLowerCase(),
        avatar: String(item.avatar ?? item.avatarUrl ?? ""),
    }));
}

async function readBody(response: Response): Promise<unknown> {
    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        if (response.ok) {
            throw new DataError("The response is not valid JSON.");
        }

        return text;
    }
}

function errorMessageFrom(body: unknown, response: Response): string {
    if (isObject(body)) {
        const message = body.message ?? body.error;

        return typeof message === "string" ? message : response.statusText;
    }

    return response.statusText || "Request failed";
}

function toDemoError(error: unknown, timedOut: boolean): DemoError {
    if (timedOut) {
        return { title: "Request timed out", message: `No response within ${TIMEOUT_MS / 1000} seconds. Check the scenario's delay.` };
    }

    if (error instanceof HttpError) {
        if (error.status === 404) {
            return { title: "Endpoint not found", message: `${error.message}. Make sure the Mock API exists and has an active scenario.`, body: error.body };
        }

        if (error.status === 401 || error.status === 403) {
            return { title: "Not authorized", message: error.message, body: error.body };
        }

        if (error.status >= 500) {
            return { title: "Server error", message: error.message, body: error.body };
        }

        return { title: `Request failed (${error.status})`, message: error.message, body: error.body };
    }

    if (error instanceof DataError) {
        return { title: "Unexpected response format", message: error.message };
    }

    if (error instanceof TypeError) {
        return { title: "Can't reach the server", message: "The request failed before a response arrived. Is the mock server running?" };
    }

    return { title: "Something went wrong", message: error instanceof Error ? error.message : "Unknown error" };
}

function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");
}

function avatarColor(name: string): string {
    let hash = 0;

    for (const ch of name) {
        hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    }

    return `hsl(${hash % 360} 55% 45%)`;
}

const statusDotClass: Record<string, string> = {
    active: "bg-success",
    away: "bg-warning",
};

const badgeClass: Record<DemoState["status"], string> = {
    idle: "text-text-secondary",
    loading: "text-warning",
    success: "text-success",
    empty: "text-text-secondary",
    error: "text-danger",
};

export default function Demo() {
    const [endpoint, setEndpoint] = useState("");
    const [state, setState] = useState<DemoState>({ status: "idle" });
    const [meta, setMeta] = useState("");
    const [query, setQuery] = useState("");

    const controllerRef = useRef<AbortController | null>(null);

    useEffect(() => () => controllerRef.current?.abort(), []);

    async function loadTeam(): Promise<void> {
        const url = endpoint.trim();

        if (!url) {
            return;
        }

        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        let timedOut = false;
        const timer = setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, TIMEOUT_MS);

        setState({ status: "loading" });
        setMeta(`GET ${url}`);
        setQuery("");
        const startedAt = performance.now();

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: { Accept: "application/json" },
            });
            const body = await readBody(response);

            if (controller !== controllerRef.current) {
                return;
            }

            setMeta(`HTTP ${response.status} · ${Math.round(performance.now() - startedAt)} ms`);

            if (!response.ok) {
                throw new HttpError(response.status, errorMessageFrom(body, response), body);
            }

            const members = normalizeMembers(body);

            setState(members.length === 0 ? { status: "empty" } : { status: "success", members });
        } catch (error) {
            if (controller !== controllerRef.current) {
                return;
            }

            if (timedOut) {
                setMeta("Timed out");
            } else if (error instanceof TypeError) {
                setMeta("Network error");
            }

            setState({ status: "error", error: toDemoError(error, timedOut) });
        } finally {
            clearTimeout(timer);
        }
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        void loadTeam();
    }

    const visibleMembers = useMemo(() => {
        if (state.status !== "success") {
            return [];
        }

        const term = query.trim().toLowerCase();

        return state.members.filter((member) => [member.name, member.role, member.location].some((field) => field.toLowerCase().includes(term)));
    }, [state, query]);

    return (
        <main className="mx-auto w-full max-w-7xl px-6 py-8">
            <div className="mb-8">
                <p className="text-sm font-medium text-primary-text">Demo</p>
                <h2 className="mt-1 text-2xl font-bold text-text-primary">Our Team</h2>
                <p className="mt-2 text-sm text-text-secondary">Load team members from a mock API and see how the page handles loading, empty, and error responses.</p>
            </div>

            <form onSubmit={handleSubmit} className="mb-3 flex flex-col gap-2 sm:flex-row">
                <input
                    type="url"
                    required
                    value={endpoint}
                    onChange={(event) => setEndpoint(event.target.value)}
                    placeholder="Enter mock API URL"
                    aria-label="Endpoint URL"
                    className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary focus:border-primary"
                />

                <button
                    type="submit"
                    disabled={state.status === "loading"}
                    className="flex items-center justify-center gap-2 rounded-lg bg-text-primary px-5 py-2.5 text-sm font-medium text-surface shadow-sm transition hover:opacity-90 disabled:opacity-60"
                >
                    <RefreshCw className={`h-4 w-4 ${state.status === "loading" ? "animate-spin" : ""}`} />
                    Load team
                </button>
            </form>

            <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-text-muted" aria-live="polite">
                <span className={`rounded-full border border-border px-2.5 py-0.5 font-semibold ${badgeClass[state.status]}`}>{state.status}</span>
                {meta && <span className="font-mono">{meta}</span>}
            </div>

            {state.status === "idle" && (
                <Panel icon={<Users className="h-6 w-6 text-text-secondary" />} title="No data loaded" message={`Enter a mock API URL, for example ${import.meta.env.VITE_MOCK_SERVER_URL ?? ""}/api/v1/team, and click Load team.`} />
            )}

            {state.status === "loading" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }, (_, index) => (
                        <div key={index} aria-hidden="true" className="flex animate-pulse gap-4 rounded-lg border border-border bg-surface p-4">
                            <div className="h-12 w-12 flex-none rounded-full bg-surface-hover" />
                            <div className="flex-1 space-y-2 py-1">
                                <div className="h-3 w-3/4 rounded bg-surface-hover" />
                                <div className="h-3 w-1/2 rounded bg-surface-hover" />
                                <div className="h-3 w-5/6 rounded bg-surface-hover" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {state.status === "empty" && (
                <Panel
                    icon={<Users className="h-6 w-6 text-text-secondary" />}
                    title="No team members yet"
                    message="The request succeeded, but the endpoint returned an empty list."
                    action={<RetryButton onClick={loadTeam} label="Reload" />}
                />
            )}

            {state.status === "error" && (
                <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/15">
                        <AlertTriangle className="h-6 w-6 text-danger" />
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-danger">{state.error.title}</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">{state.error.message}</p>

                    {state.error.body != null && (
                        <pre className="mx-auto mt-4 max-w-xl overflow-auto rounded-md border border-border bg-inset p-3 text-left text-xs text-text-secondary">
                            {typeof state.error.body === "string" ? state.error.body : JSON.stringify(state.error.body, null, 2)}
                        </pre>
                    )}

                    <div className="mt-6">
                        <RetryButton onClick={loadTeam} label="Try again" />
                    </div>
                </div>
            )}

            {state.status === "success" && (
                <>
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
                            <input
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search by name, role or location"
                                aria-label="Search team"
                                className="w-full rounded-lg border border-border bg-surface py-2.5 pr-4 pl-9 text-sm text-text-primary focus:border-primary"
                            />
                        </div>

                        <span className="text-sm text-text-secondary">
                            {query.trim()
                                ? `${visibleMembers.length} of ${state.members.length} members`
                                : `${state.members.length} member${state.members.length === 1 ? "" : "s"}`}
                        </span>
                    </div>

                    {visibleMembers.length === 0 ? (
                        <Panel icon={<Search className="h-6 w-6 text-text-secondary" />} title="No matches" message="No team member matches your search." />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {visibleMembers.map((member) => (
                                <MemberCard key={member.id} member={member} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </main>
    );
}

function MemberCard({ member }: { member: TeamMember }) {
    const [imageFailed, setImageFailed] = useState(false);

    return (
        <article className="flex min-w-0 gap-4 rounded-lg border border-border bg-surface p-4">
            <div className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-full font-bold text-white" style={{ background: avatarColor(member.name) }}>
                {member.avatar && !imageFailed ? (
                    <img src={member.avatar} alt="" onError={() => setImageFailed(true)} className="h-full w-full object-cover" />
                ) : (
                    initials(member.name)
                )}
            </div>

            <div className="min-w-0">
                <p className="font-semibold text-text-primary">{member.name}</p>
                {member.role && <p className="text-sm text-text-secondary">{member.role}</p>}

                <div className="mt-2 space-y-1 text-xs text-text-muted">
                    {member.email && (
                        <a href={`mailto:${member.email}`} className="flex items-center gap-1.5 break-all text-primary-text hover:underline">
                            <Mail className="h-3.5 w-3.5 flex-none" />
                            {member.email}
                        </a>
                    )}

                    {member.location && (
                        <p className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 flex-none" />
                            {member.location}
                        </p>
                    )}
                </div>

                {member.status && (
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-text-secondary capitalize">
                        <span className={`h-2 w-2 rounded-full ${statusDotClass[member.status] ?? "bg-text-muted"}`} />
                        {member.status}
                    </span>
                )}
            </div>
        </article>
    );
}

function Panel({ icon, title, message, action }: { icon: ReactNode; title: string; message: string; action?: ReactNode }) {
    return (
        <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-hover">{icon}</div>
            <h3 className="mt-4 text-lg font-semibold text-text-primary">{title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">{message}</p>
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

function RetryButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover"
        >
            <RefreshCw className="h-4 w-4" />
            {label}
        </button>
    );
}
