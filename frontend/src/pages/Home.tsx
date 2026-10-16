import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Braces, PlayCircle, Server, type LucideIcon } from "lucide-react";

import { useAuth } from "../auth/AuthContext";

interface HomeCard {
    to: string;
    title: string;
    description: string;
    icon: LucideIcon;
    // Opens in a new browser tab instead of navigating within the app.
    newTab?: boolean;
}

const cards: HomeCard[] = [
    {
        to: "/dashboard",
        title: "API Explorer",
        description: "Create mock APIs, manage their scenarios, and import or export them.",
        icon: Server,
    },
    {
        to: `${import.meta.env.VITE_API_BASE_URL}/mappings`,
        title: "Mappings",
        description: "Open the mappings API: every user's APIs and scenarios, as JSON.",
        icon: Braces,
        newTab: true,
    },
    {
        to: "/demo",
        title: "Demo",
        description: "Call any mock API and inspect the response it returns.",
        icon: PlayCircle,
        newTab: true,
    },
];

export default function Home() {
    const { user } = useAuth();

    return (
        <main className="mx-auto w-full max-w-7xl px-6 py-12">
            <div className="mb-10">
                <p className="text-sm font-medium text-primary-text">Mock API Platform</p>
                <h2 className="mt-1 text-3xl font-bold text-text-primary">Welcome{user?.username ? `, ${user.username}` : ""}</h2>
                <p className="mt-2 text-sm text-text-secondary">Pick where you want to start.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {cards.map(({ to, title, description, icon: Icon, newTab }) => {
                    const className =
                        "group flex flex-col rounded-xl border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg focus-visible:border-primary focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0";

                    const content = (
                        <>
                            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary-text">
                                <Icon className="h-5 w-5" />
                            </span>

                            <h3 className="mt-5 text-lg font-semibold text-text-primary">{title}</h3>
                            <p className="mt-2 flex-1 text-sm leading-6 text-text-secondary">{description}</p>
                            {/^https?:/.test(to) && <p className="mt-3 truncate font-mono text-xs text-text-muted">{to}</p>}

                            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary-text">
                                {newTab ? "Open in new tab" : "Open"}
                                {newTab ? (
                                    <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
                                ) : (
                                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 motion-reduce:transition-none" />
                                )}
                            </span>
                        </>
                    );

                    return newTab ? (
                        <a key={to} href={to} target="_blank" rel="noopener noreferrer" className={className}>
                            {content}
                        </a>
                    ) : (
                        <Link key={to} to={to} className={className}>
                            {content}
                        </Link>
                    );
                })}
            </div>
        </main>
    );
}
