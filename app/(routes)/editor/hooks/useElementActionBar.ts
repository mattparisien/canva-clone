import { Element as CanvasElement } from "@/lib/types/canvas.types";
import { useCallback, useEffect, useRef, useState } from 'react';

type ActionBarPosition = 'top' | 'bottom' | 'left' | 'right';

interface ActionBarState {
    position: { top: number; left: number };
    placement: ActionBarPosition;
}

const MARGIN = 8;

const useElementActionBar = (
    element: CanvasElement | null,
    actionBarRef: React.RefObject<HTMLElement | null>,
    propertyBarRef: React.RefObject<HTMLElement | null>
) => {
    const [state, setState] = useState<ActionBarState>({
        position: { top: 0, left: 0 },
        placement: 'top'
    });
    const lastScaleRef = useRef<number>(1);
    const lastElementPosRef = useRef({ x: element?.x || 0, y: element?.y || 0 });

    const checkCollision = useCallback((rect1: DOMRect, rect2: DOMRect): boolean => {
        return !(rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom);
    }, []);

    const getActionBarSize = useCallback(() => {
        if (actionBarRef?.current) {
            const rect = actionBarRef.current.getBoundingClientRect();
            return { width: rect.width, height: rect.height };
        }
        // Fallback dimensions if ref not available yet
        return { width: 120, height: 40 };
    }, [actionBarRef]);

    const calculateBestPosition = useCallback((
        elementRect: DOMRect,
        propertyBarRect?: DOMRect
    ): ActionBarState => {
        if (!element) return { position: { top: 0, left: 0 }, placement: 'top' };

        const actionBarSize = getActionBarSize();

        // Define possible positions in order of preference
        const positions: Array<{ placement: ActionBarPosition; rect: DOMRect }> = [
            // Top (preferred) - Let component handle horizontal centering with transform
            {
                placement: 'top',
                rect: new DOMRect(
                    elementRect.left + (elementRect.width / 2), // Center point of element
                    elementRect.top - actionBarSize.height - MARGIN,
                    actionBarSize.width,
                    actionBarSize.height
                )
            },
            // Bottom - Let component handle horizontal centering with transform
            {
                placement: 'bottom',
                rect: new DOMRect(
                    elementRect.left + (elementRect.width / 2), // Center point of element
                    elementRect.bottom + MARGIN,
                    actionBarSize.width,
                    actionBarSize.height
                )
            },
            // Right - No transform needed, position exactly
            {
                placement: 'right',
                rect: new DOMRect(
                    elementRect.right + MARGIN,
                    elementRect.top + (elementRect.height / 2) - (actionBarSize.height / 2),
                    actionBarSize.width,
                    actionBarSize.height
                )
            },
            // Left - No transform needed, position exactly
            {
                placement: 'left',
                rect: new DOMRect(
                    elementRect.left - actionBarSize.width - MARGIN,
                    elementRect.top + (elementRect.height / 2) - (actionBarSize.height / 2),
                    actionBarSize.width,
                    actionBarSize.height
                )
            }
        ];

        // Check viewport bounds
        const viewport = {
            left: 0,
            top: 0,
            right: window.innerWidth,
            bottom: window.innerHeight
        };

        for (const { placement, rect } of positions) {
            // Check if position is within viewport
            const inViewport = rect.left >= viewport.left &&
                rect.right <= viewport.right &&
                rect.top >= viewport.top &&
                rect.bottom <= viewport.bottom;

            if (!inViewport) continue;

            // Check for collision with property bar
            if (propertyBarRect && checkCollision(rect, propertyBarRect)) {
                continue;
            }

            return {
                position: { left: rect.left, top: rect.top },
                placement
            };
        }

        // Fallback to top position if no good position found
        const fallbackRect = positions[0].rect;
        return {
            position: { left: fallbackRect.left, top: fallbackRect.top },
            placement: 'top'
        };
    }, [element, checkCollision, getActionBarSize]);

    const updatePosition = useCallback(() => {
        if (!element) return;

        const canvasElement = document.querySelector('[style*="--canvas-scale"]') as HTMLElement;

        if (canvasElement) {
            const canvasRect = canvasElement.getBoundingClientRect();
            const scaleStr = getComputedStyle(canvasElement).getPropertyValue('--canvas-scale');
            const scale = parseFloat(scaleStr) || 1;

            lastScaleRef.current = scale;

            // Calculate element's position on screen
            const elementRect = new DOMRect(
                canvasRect.left + (element.x * scale),
                canvasRect.top + (element.y * scale),
                element.width * scale,
                element.height * scale
            );

            // Get property bar position if it exists
            let propertyBarRect: DOMRect | undefined;
            if (propertyBarRef?.current) {
                propertyBarRect = propertyBarRef.current.getBoundingClientRect();
            }

            const newState = calculateBestPosition(elementRect, propertyBarRect);
            setState(newState);

            lastElementPosRef.current = { x: element.x, y: element.y };
        }
    }, [element, calculateBestPosition, propertyBarRef]);

    useEffect(() => {
        if (!element) return;

        if (
            (lastElementPosRef.current.x !== element.x || lastElementPosRef.current.y !== element.y)
        ) {
            updatePosition();
        }
    }, [element?.x, element?.y, updatePosition]);

    useEffect(() => {
        if (!element) return;

        updatePosition();

        const resizeObserver = new ResizeObserver(() => {
            updatePosition();
        });

        resizeObserver.observe(document.body);

        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const canvas = mutation.target as HTMLElement;
                    const scaleStr = getComputedStyle(canvas).getPropertyValue('--canvas-scale');
                    const scale = parseFloat(scaleStr) || 1;

                    if (scale !== lastScaleRef.current) {
                        updatePosition();
                    }
                }
            });
        });

        const canvasElement = document.querySelector('[style*="--canvas-scale"]') as HTMLElement;
        if (canvasElement) {
            mutationObserver.observe(canvasElement, { attributes: true, attributeFilter: ['style'] });
        }

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [updatePosition]);

    // Update when action bar dimensions change
    useEffect(() => {
        updatePosition();
    }, [actionBarRef?.current, updatePosition]);

    return { position: state.position, placement: state.placement };
};

export default useElementActionBar;