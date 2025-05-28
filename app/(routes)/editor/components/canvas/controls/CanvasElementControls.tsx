import { Element } from "@/lib/types/canvas.types";
import { memo, RefObject, useCallback, useEffect, useRef } from "react";
import classNames from "classnames";
import useCanvasStore from "@/lib/stores/useCanvasStore";
import { useCanvasElementInteraction, useCanvasElementResize } from "@/(routes)/editor/hooks";
import { useTextMeasurement } from "@/(routes)/editor/hooks";
import { calculateViewportRect } from "@/lib/utils/canvas-utils";
import { useState } from "react";

// Define alignments type for clarity
interface Alignments {
    horizontal: number[];
    vertical: number[];
}

interface CanvasElementControlsProps {
    element: Element;
    elements?: Element[];
    scale?: number;
    canvasRef: React.RefObject<HTMLDivElement | null>;
    canvasWidth?: number;
    canvasHeight?: number;
    isEditMode: boolean;
}

const CanvasElementControls = memo(({
    element,
    elements = [],
    scale = 1,
    isEditMode,
    canvasRef,
    canvasWidth = 0,
    canvasHeight = 0,
}: CanvasElementControlsProps) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const dragAnimationFrameRef = useRef<number | null>(null);
    const lastDragUpdateRef = useRef<number>(0);

    const [showPopover, setShowPopover] = useState(false);
    // Add missing alignments state
    const [alignments, setAlignments] = useState<Alignments>({ horizontal: [], vertical: [] });

    // Canvas store methods
    const updateElement = useCanvasStore(state => state.updateElement);
    const selectElement = useCanvasStore(state => state.selectElement);
    const clearNewElementFlag = useCanvasStore(state => state.clearNewElementFlag);
    const showElementActionBar = useCanvasStore(state => state.showElementActionBar);
    const hideElementActionBar = useCanvasStore(state => state.hideElementActionBar);
    const setElementActive = useCanvasStore(state => state.setElementActive);
    const { measureElementHeight, renderMeasurer } = useTextMeasurement();

    const [textEditorKey, setTextEditorKey] = useState(0);

    // Use the resize hook
    const { isResizing, resizeDirection, startResize, endResize, calculateResize } = useCanvasElementResize();

    // Use the interaction hook
    const {
        isDragging,
        isAltKeyPressed,
        isShiftKeyPressed,
        isHovering,
        leftBorderHover,
        rightBorderHover,
        setLeftBorderHover,
        setRightBorderHover,
        dragStart,
        setDragStart,
        startDrag,
        endDrag,
        isSelected,
        handleMouseEnter,
        handleMouseLeave,
        handleClick,
        setJustFinishedResizing,
        getHandleBg,
        setHandleHoverState,
    } = useCanvasElementInteraction(elementRef);

    // Handle mouse down to start drag
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!isEditMode || element.locked) return;

        // Use the hook's startDrag function
        startDrag(
            e,
            element,
            () => {
                setElementActive(true); // Set canvas store dragging state to true
            },
            selectElement,
            clearNewElementFlag
        );
    }, [element, isEditMode, startDrag, selectElement, clearNewElementFlag, setElementActive]);

    // Handle element resizing
    const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
        if (!isEditMode || element.locked) return;

        e.stopPropagation();

        setElementActive(true); // Set canvas store active state to true when resizing starts

        startResize(
            element,
            direction,
            e.clientX,
            e.clientY,
            (elementId: string) => clearNewElementFlag(elementId)
        );
    }, [element, clearNewElementFlag, isEditMode, startResize, setElementActive]);

    // Helper function to update element with viewport rect - optimized
    const updateElementWithRect = useCallback((updates: Partial<Element>) => {
        if (!canvasRef.current) return;

        const newRect = calculateViewportRect(
            { ...element, ...updates },
            canvasRef as React.RefObject<HTMLDivElement>,
            scale
        );

        updateElement(element.id, {
            ...updates,
            rect: newRect
        });
    }, [element, canvasRef, scale, updateElement]);

    // Handle mouse move for resizing only - optimized with RAF
    useEffect(() => {
        if (!isResizing) return;

        let animationFrameId: number | null = null;
        let lastEvent: MouseEvent | null = null;

        const processResize = () => {
            if (!lastEvent || !canvasRef.current) return;

            const e = lastEvent;

            // Calculate with support for Alt+Shift (scale from center)
            const shouldScaleFromCenter = isAltKeyPressed && isShiftKeyPressed;

            // Calculate new dimensions and position
            const result = calculateResize(
                element,
                e.clientX,
                e.clientY,
                scale,
                elements.filter(el => el.id !== element.id),
                canvasWidth,
                canvasHeight,
                isAltKeyPressed,
                shouldScaleFromCenter
            );

            if (result) {
                // Update element with new dimensions using batched update
                updateElementWithRect({
                    width: result.width,
                    height: result.height,
                    x: result.x,
                    y: result.y,
                    fontSize: result.fontSize
                });

                setAlignments(result.alignments || { horizontal: [], vertical: [] });

                // For text elements, measure height after resize and set text editor key
                if (element.type === "text" && result.widthChanged) {
                    const measuredHeight = measureElementHeight(element);
                    if (measuredHeight && measuredHeight !== result.height) {
                        updateElementWithRect({ height: measuredHeight });
                    }

                    // Force TextEditor re-render to recalculate height
                    setTextEditorKey((k) => k + 1);
                }
            }

            lastEvent = null;
        };

        const handleMouseMove = (e: MouseEvent) => {
            lastEvent = e;

            if (animationFrameId === null) {
                animationFrameId = requestAnimationFrame(() => {
                    processResize();
                    animationFrameId = null;
                });
            }
        };

        const handleMouseUp = () => {
            if (isResizing) {
                endResize();
                setElementActive(false); // Set canvas store active state to false when resizing ends
                selectElement(element.id, false);
            }

            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);

            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [
        isResizing,
        element,
        updateElementWithRect,
        scale,
        canvasRef,
        elements,
        canvasWidth,
        canvasHeight,
        calculateResize,
        endResize,
        selectElement,
        measureElementHeight,
        setTextEditorKey,
        setElementActive,
        isAltKeyPressed,
        isShiftKeyPressed
    ]);

    // Optimized viewport rect update - only when necessary
    useEffect(() => {
        if (!element || !canvasRef.current) return;

        // Throttle viewport rect calculations
        const now = performance.now();
        if (now - lastDragUpdateRef.current < 16) return; // ~60fps throttling

        const newRect = calculateViewportRect(element, canvasRef as RefObject<HTMLDivElement>, scale);

        // Only update if rect has actually changed significantly (avoid micro-updates)
        const threshold = 0.5;
        if (!element.rect ||
            Math.abs(element.rect.x - newRect.x) > threshold ||
            Math.abs(element.rect.y - newRect.y) > threshold ||
            Math.abs(element.rect.width - newRect.width) > threshold ||
            Math.abs(element.rect.height - newRect.height) > threshold) {
            updateElement(element.id, { rect: newRect });
            lastDragUpdateRef.current = now;
        }
    }, [element.x, element.y, element.width, element.height, scale]);

    // Show element action bar when this element is selected
    useEffect(() => {
        if (isSelected && isEditMode && !isResizing) {
            // Position the action bar at the top center of the element
            const centerX = element.x + element.width / 2;
            const topY = element.y;

            showElementActionBar(element.id, { x: centerX, y: topY });
        } else {
            // Only hide the action bar if this element is the one that triggered it
            const elementActionBarState = useCanvasStore.getState().elementActionBar;
            if (elementActionBarState.elementId === element.id) {
                hideElementActionBar();
            }
        }
    }, [element.id, element.x, element.y, element.width, isSelected, isEditMode, isResizing, showElementActionBar, hideElementActionBar]);

    // Add a mouse up handler to hide popover only when clicking outside this element
    useEffect(() => {
        const popoverRef = elementRef;

        const handleClickOutside = (e: MouseEvent) => {
            // Only hide the popover if the click is outside the current element
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setShowPopover(false);
            }
        };

        document.addEventListener('mouseup', handleClickOutside);
        return () => {
            document.removeEventListener('mouseup', handleClickOutside);
        };
    }, [])

    // Optimized drag movement with requestAnimationFrame
    useEffect(() => {
        if (!isDragging) return;

        let lastEvent: MouseEvent | null = null;

        const processDrag = () => {
            if (!lastEvent) return;

            const e = lastEvent;

            // Calculate delta movement adjusted for scale
            const deltaX = (e.clientX - dragStart.x) / scale;
            const deltaY = (e.clientY - dragStart.y) / scale;

            // Calculate new position relative to canvas
            const newX = element.x + deltaX;
            const newY = element.y + deltaY;

            // Batch update: only update position, not viewport rect yet
            updateElement(element.id, { x: newX, y: newY });

            // Update drag start for next movement
            setDragStart({ x: e.clientX, y: e.clientY });

            lastEvent = null;
        };

        const handleMouseMove = (e: MouseEvent) => {
            lastEvent = e;

            if (dragAnimationFrameRef.current === null) {
                dragAnimationFrameRef.current = requestAnimationFrame(() => {
                    processDrag();
                    dragAnimationFrameRef.current = null;
                });
            }
        };

        const handleMouseUp = () => {
            // Cancel any pending animation frame
            if (dragAnimationFrameRef.current !== null) {
                cancelAnimationFrame(dragAnimationFrameRef.current);
                dragAnimationFrameRef.current = null;
            }

            // Use the hook's endDrag function
            endDrag(() => { 
                setElementActive(false); // Set canvas store active state to false when dragging ends
            });
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            // Clean up animation frame
            if (dragAnimationFrameRef.current !== null) {
                cancelAnimationFrame(dragAnimationFrameRef.current);
                dragAnimationFrameRef.current = null;
            }
        };
    }, [isDragging, dragStart, element.x, element.y, scale, updateElement, setDragStart, endDrag, setElementActive]);

    // Track width and fontSize for text elements to trigger height recalculation
    useEffect(() => {
        if (element.type === "text") {
            setTextEditorKey((k) => k + 1)
        }
    }, [element.width, element.fontSize, element.type])

    // Update height when fontSize changes
    useEffect(() => {
        if (element.type === "text" && element.content && element.fontSize) {
            const measuredHeight = measureElementHeight(element)

            if (measuredHeight && measuredHeight !== element.height) {
                updateElementWithRect({ height: measuredHeight })
            }
        }
    }, [element, updateElementWithRect, measureElementHeight])


    if (!element || !element.rect) {
        return null;
    }

    return (
        <div
            ref={elementRef}
            className={classNames("", {
                "is-highlighted relative": isSelected || isHovering
            })} style={{
                position: 'fixed',
                top: element.rect.y,
                left: element.rect.x,
                width: element.width * scale,
                height: element.height * scale,
                cursor: isEditMode && !element.locked ? (isDragging ? "grabbing" : "grab") : "default",
                zIndex: 99999,
                pointerEvents: 'auto'
            }}
            onClick={(e) => handleClick(e, element)}
            onMouseEnter={() => handleMouseEnter(element.id, isEditMode)}
            onMouseLeave={() => handleMouseLeave()}
            onMouseDown={handleMouseDown}
        >

            {isSelected && <Handles
                element={element}
                isResizing={isResizing}
                resizeDirection={resizeDirection}
                handleResizeStart={handleResizeStart}
                getHandleBg={getHandleBg}
                setHandleHoverState={setHandleHoverState}
                leftBorderHover={leftBorderHover}
                rightBorderHover={rightBorderHover}
                setLeftBorderHover={setLeftBorderHover}
                setRightBorderHover={setRightBorderHover}
                scale={scale}
            />}
        </div>
    );
});


interface HandlesProps {
    element: Element;
    isResizing: boolean;
    resizeDirection: string | null;
    handleResizeStart: (e: React.MouseEvent, direction: string) => void;
    getHandleBg: (direction: string, resizeDirection: string | null, isResizing: boolean) => string;
    setHandleHoverState: (direction: string, isHovering: boolean) => void;
    leftBorderHover: boolean;
    rightBorderHover: boolean;
    setLeftBorderHover: (isHovering: boolean) => void;
    setRightBorderHover: (isHovering: boolean) => void;
    scale: number;
}

const Handles = memo(({ element, isResizing, resizeDirection, handleResizeStart, getHandleBg, setHandleHoverState, leftBorderHover, rightBorderHover, setLeftBorderHover, setRightBorderHover, scale }: HandlesProps) => {
    // Calculate handle sizes
    const handleSize = 18; // Using constant HANDLE_BASE_SIZE = 18
    const handleSizeSide = Math.min(handleSize * 2.2, element.height * 0.6)


    // const isTooSmallForAllHandles = element.width < handleSize * 3.5 || element.height < handleSize * 3.5;
    const isReducedHandles = ((handleSizeSide) + (handleSize * 2)) >= element.height * scale;

    /**
     * Determine if an element should show top/bottom handles 
     * (shapes should, text elements shouldn't)
     */
    const shouldShowTopBottomHandles = (element: Element): boolean => {
        return element.type !== "text"; // Only show for non-text elements
    };
    // Check if this element type should have top/bottom handles
    const showTopBottomHandles = shouldShowTopBottomHandles(element);
    return <>
        {/* Top-left corner handle */}
        {(!isResizing || resizeDirection === "nw") && (
            <div
                className="absolute cursor-nwse-resize"
                style={{
                    width: `${handleSize}px`,
                    height: `${handleSize}px`,
                    borderRadius: "50%",
                    boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
                    border: "1px solid var(--handle-border)",
                    zIndex: 10,
                    top: 0,
                    left: 0,
                    transform: `translate(-50%, -50%) scale(${1})`,
                    background: getHandleBg("nw", resizeDirection, isResizing) === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
                }}
                onMouseDown={(e) => handleResizeStart(e, "nw")}
                onMouseEnter={() => setHandleHoverState("nw", true)}
                onMouseLeave={() => setHandleHoverState("nw", false)}
            />
        )}

        {/* Top handle - only for shape elements */}
        {showTopBottomHandles && (!isResizing || resizeDirection === "n") && (
            <div
                className="absolute cursor-ns-resize"
                style={{
                    width: `${handleSizeSide}px`,
                    height: `${handleSize}px`,
                    borderRadius: `${handleSize * 0.35}px`,
                    boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
                    border: "1px solid var(--handle-border)",
                    zIndex: 10,
                    top: 0,
                    left: "50%",
                    transform: `translate(-50%, -50%) scale(${1})`,
                    background: getHandleBg("n", resizeDirection, isResizing) === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
                }}
                onMouseDown={(e) => handleResizeStart(e, "n")}
                onMouseEnter={() => setHandleHoverState("n", true)}
                onMouseLeave={() => setHandleHoverState("n", false)}
            />
        )}

        {/* These corner handles only show when element is big enough */}

        <>
            {/* Northeast corner handle */}
            {(!isReducedHandles && (!isResizing || resizeDirection === "ne")) && (
                <div
                    className="absolute cursor-nesw-resize"
                    style={{
                        width: `${handleSize}px`,
                        height: `${handleSize}px`,
                        borderRadius: "50%",
                        boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
                        border: "1px solid var(--handle-border)",
                        zIndex: 10,
                        top: 0,
                        right: 0,
                        transform: `translate(50%, -50%) scale(${1})`,
                        background: getHandleBg("ne", resizeDirection, isResizing) === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
                    }}
                    onMouseDown={(e) => handleResizeStart(e, "ne")}
                    onMouseEnter={() => setHandleHoverState("ne", true)}
                    onMouseLeave={() => setHandleHoverState("ne", false)}
                />
            )}

            {/* Southwest corner handle */}
            {!isReducedHandles && (!isResizing || resizeDirection === "sw") && (
                <div
                    className="absolute cursor-nesw-resize"
                    style={{
                        width: `${handleSize}px`,
                        height: `${handleSize}px`,
                        borderRadius: "50%",
                        boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
                        border: "1px solid var(--handle-border)",
                        zIndex: 10,
                        bottom: 0,
                        left: 0,
                        transform: `translate(-50%, 50%) scale(${1})`,
                        background: getHandleBg("sw", resizeDirection, isResizing) === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
                    }}
                    onMouseDown={(e) => handleResizeStart(e, "sw")}
                    onMouseEnter={() => setHandleHoverState("sw", true)}
                    onMouseLeave={() => setHandleHoverState("sw", false)}
                />
            )}
        </>

        {/* Southeast corner handle */}
        {(!isReducedHandles && !isResizing || resizeDirection === "se") && (
            <div
                className="absolute cursor-nwse-resize"
                style={{
                    width: `${handleSize}px`,
                    height: `${handleSize}px`,
                    borderRadius: "50%",
                    boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
                    border: "1px solid var(--handle-border)",
                    zIndex: 10,
                    bottom: 0,
                    right: 0,
                    transform: `translate(50%, 50%) scale(${1})`,
                    background: getHandleBg("se", resizeDirection, isResizing) === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
                }}
                onMouseDown={(e) => handleResizeStart(e, "se")}
                onMouseEnter={() => setHandleHoverState("se", true)}
                onMouseLeave={() => setHandleHoverState("se", false)}
            />
        )}

        {/* Bottom handle - only for shape elements */}
        {showTopBottomHandles && (!isResizing || resizeDirection === "s") && (
            <div
                className="absolute cursor-ns-resize"
                style={{
                    width: `${handleSize * 2.2}px`,
                    height: `${handleSize * 0.7}px`,
                    borderRadius: `${handleSize * 0.35}px`,
                    boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
                    border: "1px solid var(--handle-border)",
                    zIndex: 10,
                    bottom: 0,
                    left: "50%",
                    transform: `translate(-50%, 50%) scale(${1})`,
                    background: getHandleBg("s", resizeDirection, isResizing) === "var(--handle-hover)" ? "#1E88E5" : "#ffffff",
                }}
                onMouseDown={(e) => handleResizeStart(e, "s")}
                onMouseEnter={() => setHandleHoverState("s", true)}
                onMouseLeave={() => setHandleHoverState("s", false)}
            />
        )}

        {/* Right handle with enhanced styling */}
        {(!isResizing || resizeDirection === "e") && (
            <div
                className="absolute cursor-ew-resize"
                style={{
                    width: `${handleSize * 0.7}px`,
                    height: `${handleSizeSide}px`,
                    borderRadius: `${handleSize * 0.35}px`,
                    boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
                    border: "1px solid var(--handle-border)",
                    zIndex: 10,
                    right: 0,
                    top: `calc(50% + ${(element.height < handleSize * 2.2 ? (element.height - handleSize * 2.2) / 2 : 0)}px)`,
                    transform: `translate(50%, -50%) scale(${1})`,
                    background: (rightBorderHover || getHandleBg("e", resizeDirection, isResizing) === "var(--handle-hover)") ? "#1E88E5" : "#ffffff",
                }}
                onMouseDown={(e) => handleResizeStart(e, "e")}
                onMouseEnter={() => setHandleHoverState("e", true)}
                onMouseLeave={() => setHandleHoverState("e", false)}
            />
        )}

        {/* Left handle with enhanced styling */}
        {!isReducedHandles && (!isResizing || resizeDirection === "w") && (
            <div
                className="absolute cursor-ew-resize"
                style={{
                    width: `${handleSize * 0.7}px`,
                    height: `${handleSizeSide}px`,
                    borderRadius: `${handleSize * 0.35}px`,
                    boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
                    border: "1px solid var(--handle-border)",
                    zIndex: 10,
                    left: 0,
                    top: `calc(50% + ${(element.height < handleSize * 2.2 ? (element.height - handleSize * 2.2) / 2 : 0)}px)`,
                    transform: `translate(-50%, -50%) scale(${1})`,
                    background: (leftBorderHover || getHandleBg("w", resizeDirection, isResizing) === "var(--handle-hover)") ? "#1E88E5" : "#ffffff",
                }}
                onMouseDown={(e) => handleResizeStart(e, "w")}
                onMouseEnter={() => setHandleHoverState("w", true)}
                onMouseLeave={() => setHandleHoverState("w", false)}
            />
        )}

        {/* Selection indicator that shows which element is selected with a subtle gradient border */}
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                border: '2px solid rgba(30, 136, 229, 0.8)',
                borderRadius: '2px',
                background: 'transparent'
            }}
        />

        {/* Wide invisible resize zones */}
        <div
            className="absolute top-0 left-0 -translate-x-1/2 h-full"
            style={{
                width: 40,
                cursor: "ew-resize",
                zIndex: 5,
                background: "transparent"
            }}
            onMouseDown={(e) => handleResizeStart(e, "w")}
            onMouseEnter={() => {
                if (!isResizing && !leftBorderHover) {
                    setLeftBorderHover(true)
                }
            }}
            onMouseLeave={() => {
                if (!isResizing && leftBorderHover) {
                    setLeftBorderHover(false)
                }
            }}
        />
        <div
            className="absolute top-0 right-0 translate-x-1/2 h-full"
            style={{
                width: 40,
                cursor: "ew-resize",
                zIndex: 5,
                background: "transparent"
            }}
            onMouseDown={(e) => handleResizeStart(e, "e")}
            onMouseEnter={() => {
                if (!isResizing && !rightBorderHover) {
                    setRightBorderHover(true)
                }
            }}
            onMouseLeave={() => {
                if (!isResizing && rightBorderHover) {
                    setRightBorderHover(false)
                }
            }}
        />
    </>
})


CanvasElementControls.displayName = 'CanvasElementControls';

export default CanvasElementControls;