export function matchPath(pattern: string, requestPath: string): boolean {
    const patternParts = normalizePath(pattern).split("/");
    const requestParts = normalizePath(requestPath).split("/");

    if (patternParts.length !== requestParts.length) {
        return false;
    }

    return patternParts.every((part, index) => {
        const requestPart = requestParts[index];

        if (part.startsWith("{") && part.endsWith("}")) {
            return true;
        }

        return part === requestPart;
    });
}

function normalizePath(path: string): string {
    let normalized = path.trim();

    if (!normalized.startsWith("/")) {
        normalized = `/${normalized}`;
    }

    if (normalized.length > 1 && normalized.endsWith("/")) {
        normalized = normalized.slice(0, -1);
    }

    return normalized;
}
