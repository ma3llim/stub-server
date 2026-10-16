import type { HttpMethod } from "../../api/mock-api.api";

export const methodStyles: Record<HttpMethod, string> = {
    GET: "bg-green-700 text-white",
    POST: "bg-blue-600 text-white",
    PUT: "bg-orange-700 text-white",
    PATCH: "bg-purple-600 text-white",
    DELETE: "bg-red-600 text-white",
};

export const methodStylesText: Record<HttpMethod, string> = {
    GET: "text-green-700 dark:text-green-400",
    POST: "text-blue-700 dark:text-blue-400",
    PUT: "text-orange-700 dark:text-orange-400",
    PATCH: "text-purple-700 dark:text-purple-400",
    DELETE: "text-red-700 dark:text-red-400",
};
