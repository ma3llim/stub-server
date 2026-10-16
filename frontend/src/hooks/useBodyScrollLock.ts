import { useEffect } from "react";

// Counts open dialogs so a nested dialog closing doesn't unlock the page while its parent is still open.
let lockCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";

/**
 * Stops the page behind a modal from scrolling while the calling component is mounted.
 * Pads the body by the scrollbar's width so the layout doesn't shift when the scrollbar disappears.
 */
export function useBodyScrollLock(): void {
    useEffect(() => {
        const { body, documentElement } = document;

        if (lockCount === 0) {
            const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

            previousOverflow = body.style.overflow;
            previousPaddingRight = body.style.paddingRight;

            body.style.overflow = "hidden";

            if (scrollbarWidth > 0) {
                body.style.paddingRight = `${scrollbarWidth}px`;
            }
        }

        lockCount++;

        return () => {
            lockCount--;

            if (lockCount === 0) {
                body.style.overflow = previousOverflow;
                body.style.paddingRight = previousPaddingRight;
            }
        };
    }, []);
}
