import { useCanvasElementInteraction, useCanvasElementResize, useSnapping, useTextMeasurement } from "@/(routes)/editor/hooks";
import useCanvasStore from "@/lib/stores/useCanvasStore";
import useEditorStore from "@/lib/stores/useEditorStore";
import { Element } from "@/lib/types/canvas";
import { calculateViewportRect } from "@/lib/utils/canvas-utils";
import { mergeRefs } from "@/lib/utils/utils";
import classNames from "classnames";
import { forwardRef, memo, useCallback, useEffect, useRef } from "react";


interface ElementControlsProps {
    element: Element;
    scale?: number;
    isEditMode: boolean;
}

const ElementControls = memo(forwardRef<HTMLDivElement, ElementControlsProps>(({
    element,
    scale = 1,
    isEditMode
}, ref) => {
    const elementRef = useRef<HTMLDivElement>(null);

    // Canvas store methods
    const updateElement = useCanvasStore(state => state.updateElement);
    const selectElement = useCanvasStore(state => state.selectElement);
    const clearNewElementFlag = useCanvasStore(state => state.clearNewElementFlag);
    const setAlignmentGuides = useCanvasStore(state => state.setAlignmentGuides);
    const setDragState = useCanvasStore(state => state.setDragState);
    const clearAlignmentGuides = useCanvasStore(state => state.clearAlignmentGuides);

    // Get current page elements for text editing management
    const editor = useEditorStore.getState();
    const currentPageId = editor.currentPageId;
    const currentPage = editor.pages.find(page => page.id === currentPageId);
    const allElements = currentPage ? currentPage.elements : [];

    // Use the interaction hook
    const {
        isDragging,
        isDragInitiated,
        isAltKeyPressed,
        isHovering,
        leftBorderHover,
        rightBorderHover,
        setLeftBorderHover,
        setRightBorderHover,
        dragStart,
        isDragActive,
        setIsDragActive,
        setDragStart,
        startDrag,
        endDrag,
        handleMouseEnter,
        handleMouseLeave,
        handleClick,
        setJustFinishedResizing,
        getHandleBg,
        setHandleHoverState,
    } = useCanvasElementInteraction(elementRef)
    const { isResizing, resizeDirection, startResize, endResize, calculateResize } = useCanvasElementResize();
    const isSelected = useCanvasStore(state => state.isElementSelected(element.id));
    const measurementHook = useTextMeasurement();


    // Helper function to recalculate and update element position
    const updateElementRect = useCallback(() => {
        const canvasRef = { current: document.querySelector('.canvas-container') as HTMLDivElement };
        if (!canvasRef.current || !element || !element.rect) return;

        const newRect = calculateViewportRect(element, canvasRef, scale);

        // Only update if the rect has actually changed
        if (
            !element.rect ||
            Math.abs(element.rect.x - newRect.x) > 1 ||
            Math.abs(element.rect.y - newRect.y) > 1 ||
            Math.abs(element.rect.width - newRect.width) > 1 ||
            Math.abs(element.rect.height - newRect.height) > 1
        ) {
            updateElement(element.id, { rect: newRect });
        }
    }, [element, scale, updateElement]);

    // Update element rect on window resize, scale change, or element position change
    useEffect(() => {
        // Update immediately on mount and when dependencies change
        updateElementRect();

        // Add resize event listener with debounce to avoid excessive updates
        let resizeTimer: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // Just use our current element, no need to fetch from store
                updateElementRect();
            }, 50); // Use a shorter timeout for more responsive updates
        };

        // Directly handle window resize events
        window.addEventListener('resize', handleResize);

        // Using a ResizeObserver for more reliable resize detection
        const resizeObserver = new ResizeObserver(handleResize);
        const canvasContainer = document.querySelector('.canvas-container');
        if (canvasContainer) {
            resizeObserver.observe(canvasContainer);

            // Also listen for scroll events on the parent canvas container 
            // and any containing scrollable elements up to 3 levels up
            canvasContainer.addEventListener('scroll', handleResize);
            canvasContainer.parentElement?.addEventListener('scroll', handleResize);
            canvasContainer.parentElement?.parentElement?.addEventListener('scroll', handleResize);
        }

        // Also listen for zoom changes which might be triggered by controls outside this component
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                handleResize();
            }
        };

        document.addEventListener('wheel', handleWheel);

        // Clean up
        return () => {
            clearTimeout(resizeTimer);
            window.removeEventListener('resize', handleResize);

            if (canvasContainer) {
                resizeObserver.disconnect();
                canvasContainer.removeEventListener('scroll', handleResize);
                canvasContainer.parentElement?.removeEventListener('scroll', handleResize);
                canvasContainer.parentElement?.parentElement?.removeEventListener('scroll', handleResize);
            }

            document.removeEventListener('wheel', handleWheel);
        };
    }, [element?.id, scale, updateElementRect]);

    // Handle mouse down to start drag
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Don't initiate drag if the element is locked, edit mode is off,
        // or if we're already resizing (to prevent drag during resize)
        if (!isEditMode || element.locked || isResizing) return;

        // Check if the click target is a handle - this helps prevent conflict between drag and resize
        // We could also check for specific classes or data attributes on resize handles
        const target = e.target as HTMLElement;
        if (target.classList.contains('resize-handle')) {
            return; // Don't start dragging if we clicked on a resize handle
        }

        // Use the hook's startDrag function
        startDrag(
            e,
            element,
            () => {
                // onDragStart callback - this will be called when actual dragging starts
                // Canvas store drag state is now managed by the useEffect above
            },
            selectElement,
            clearNewElementFlag
        );
    }, [element, isEditMode, startDrag, selectElement, clearNewElementFlag, isResizing]);

    const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
        // Prevent event propagation to stop triggering drag events when starting resize
        e.stopPropagation();
        e.preventDefault();

        // Start resize operation
        startResize(element, direction, e.clientX, e.clientY);
    }, [element, startResize]);

    // Sync isDragging state with canvas store drag state
    useEffect(() => {
        if (isDragging) {
            setDragState(true, element.id);
        } else if (!isDragInitiated) {
            // Only clear drag state if we're not in the initiated state
            setDragState(false);
        }
    }, [isDragging, isDragInitiated, element.id, setDragState]);

    // Use snapping hook at the component level to avoid hook rule violations
    const snapping = useSnapping();

    // Handle drag movement with improved positioning and snapping
    useEffect(() => {
        if (!isDragging || isResizing) return; // Don't run drag logic if resizing is active

        const canvasRef = { current: document.querySelector('.canvas-container') as HTMLDivElement };
        const editor = useEditorStore.getState();
        const currentPageId = editor.currentPageId;
        const currentPage = editor.pages.find(page => page.id === currentPageId);
        const allElements = currentPage ? currentPage.elements : [];
        const canvasWidth = currentPage?.canvasSize?.width || currentPage?.canvas?.width || 800;
        const canvasHeight = currentPage?.canvasSize?.height || currentPage?.canvas?.height || 600;

        let animationFrameId: number | null = null;
        let lastEvent: MouseEvent | null = null;

        const processMove = () => {
            if (!lastEvent) return;

            // Calculate delta movement adjusted for scale
            const deltaX = (lastEvent.clientX - dragStart.x) / scale;
            const deltaY = (lastEvent.clientY - dragStart.y) / scale;

            // Calculate new position relative to canvas
            let newX = element.x + deltaX;
            let newY = element.y + deltaY;

            // Get snapped position with alignment guides
            const { x: snappedX, y: snappedY, alignments } = snapping.getSnappedPosition(
                element,
                newX,
                newY,
                allElements.filter(el => el.id !== element.id),
                canvasWidth,
                canvasHeight,
                true, // isDragging
                true  // isSelected
            );

            // Apply snapped coordinates if available
            newX = snappedX;
            newY = snappedY;

            // Update alignment guides in canvas store
            setAlignmentGuides(alignments);

            // Update element position in canvas store
            updateElement(element.id, { x: newX, y: newY });

            // Update drag start for next movement
            setDragStart({ x: lastEvent.clientX, y: lastEvent.clientY });

            // Reset for next frame
            lastEvent = null;
        };

        const handleMouseMove = (e: MouseEvent) => {
            lastEvent = e;

            if (animationFrameId === null) {
                animationFrameId = requestAnimationFrame(() => {
                    processMove();
                    animationFrameId = null;
                });
            }
        };

        const handleMouseUp = () => {
            // Use the hook's endDrag function
            endDrag(() => { }); // onDragEnd callback

            // Clear alignment guides and drag state in canvas store  
            setDragState(false);
            clearAlignmentGuides();

            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isDragging, dragStart, element, scale, updateElement, setDragStart, endDrag]);

    // Handle resizing
    useEffect(() => {
        if (!isResizing || isDragging) return; // Don't run resize logic if dragging is active

        const editor = useEditorStore.getState();
        const currentPageId = editor.currentPageId;
        const currentPage = editor.pages.find(page => page.id === currentPageId);
        const allElements = currentPage ? currentPage.elements : [];
        const canvasWidth = currentPage?.canvasSize?.width || currentPage?.canvas?.width || 800;
        const canvasHeight = currentPage?.canvasSize?.height || currentPage?.canvas?.height || 600;

        let animationFrameId: number | null = null;
        let lastEvent: MouseEvent | null = null;

        // Helper function to update element with rect calculation
        const updateElementWithRect = (updates: Partial<Element>) => {
            const canvasRef = { current: document.querySelector('.canvas-container') as HTMLDivElement };
            const newRect = calculateViewportRect(
                { ...element, ...updates },
                canvasRef,
                scale
            );

            updateElement(element.id, {
                ...updates,
                rect: newRect
            });
        };

        const processResize = () => {
            if (!lastEvent) return;

            // Calculate new dimensions and position
            const resizeResult = calculateResize(
                element,
                lastEvent.clientX,
                lastEvent.clientY,
                scale,
                isAltKeyPressed, // pass the alt key state
                allElements,
                canvasWidth,
                canvasHeight
            );

            const {
                width: newWidth,
                height: newHeight,
                x: newX,
                y: newY,
                fontSize: newFontSize,
                widthChanged,
            } = resizeResult;

            // Update element with new dimensions, position and font size
            updateElementWithRect({
                width: newWidth,
                height: newHeight,
                x: newX,
                y: newY,
                ...(element.kind === "text" ? { fontSize: newFontSize } : {}),
            });

            // If resizing a text element horizontally, measure and update height immediately
            if (element.kind === "text" && widthChanged) {
                const measuredHeight = measurementHook.measureElementHeight(element);

                if (measuredHeight && measuredHeight !== newHeight) {
                    updateElementWithRect({ height: measuredHeight });
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
                selectElement(element.id, false);
                setJustFinishedResizing(true);

                // Reset the flag after a short delay
                setTimeout(() => {
                    setJustFinishedResizing(false);
                }, 200);
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
    }, [isResizing, element, scale, updateElement, calculateResize, endResize, selectElement, isAltKeyPressed, setJustFinishedResizing]);

    if (!element || !element.rect) {
        return null;
    }

    return (
        <div
            ref={mergeRefs(elementRef, ref)}
            className={classNames("z-editor-canvas-controls", {
                "is-highlighted relative": isSelected || isHovering
            })} style={{
                position: 'fixed',
                top: element.rect.y,
                left: element.rect.x,
                width: element.width * scale,
                height: element.height * scale,
                cursor: isEditMode && !element.locked ? (isDragging ? "grabbing" : "grab") : "default",
                pointerEvents: 'auto',
                transform: 'translate3d(0, 0, 0)',// Force hardware acceleration for smoother rendering
                zIndex: element.kind === "text" ? 1 : 0, // Ensure text elements are always on top
            }}
            onClick={e => handleClick(e, element, (id: string) => {
                if (element.kind === "text") {
                    updateElement(id, { isEditable: true })
                    setIsDragActive(false);
                }
            })
            }
            onMouseEnter={() => handleMouseEnter(element.id, isEditMode)}
            onMouseLeave={() => handleMouseLeave()}
            onMouseDown={handleMouseDown}
        >
            {isSelected && !isDragging && !element.locked &&
                <Handles
                    isResizing={isResizing}
                    element={element}
                    scale={scale}
                    resizeDirection={resizeDirection}
                    handleResizeStart={handleResizeStart}
                    getHandleBg={getHandleBg}
                    setHandleHoverState={setHandleHoverState}
                    leftBorderHover={leftBorderHover}
                    rightBorderHover={rightBorderHover}
                    setLeftBorderHover={setLeftBorderHover}
                    setRightBorderHover={setRightBorderHover}
                    isDragging={isDragging}
                />
            }
        </div >
    );
}));

interface HandlesProps {
    element: Element;
    scale: number;
    isResizing: boolean;
    resizeDirection: string | null;
    handleResizeStart: (e: React.MouseEvent, direction: string) => void;
    getHandleBg?: (direction: string, resizeDirection: string | null, isResizing: boolean) => string;
    setHandleHoverState?: (direction: string, isHovered: boolean) => void;
    leftBorderHover?: boolean;
    rightBorderHover?: boolean;
    setLeftBorderHover?: (isHovered: boolean) => void;
    setRightBorderHover?: (isHovered: boolean) => void;
    isDragging?: boolean;
}

const Handles = memo(({
    element,
    scale,
    isResizing,
    resizeDirection,
    handleResizeStart,
    getHandleBg = () => "#ffffff",
    setHandleHoverState = () => { },
    leftBorderHover = false,
    rightBorderHover = false,
    setLeftBorderHover = () => { },
    setRightBorderHover = () => { },
}: HandlesProps) => {

    const handleSize = 14; // Size of the resize handles
    const showTopBottomHandles = element.kind !== "text"

    const isTooSmallForAllHandles = Math.min(handleSize * 2.2, element.height * 0.6) >= ((element.height * scale) - (handleSize * 0.7 * 2));

    // Helper function to get the background color with null-safety
    const getHandleBackground = (direction: string) => {
        const baseBg = getHandleBg(direction, resizeDirection || "", isResizing);
        return baseBg === "var(--handle-hover)" ? "#1E88E5" : "#ffffff";
    };

    return <>
        {/* Top-left corner handle */}
        {(!isResizing || resizeDirection === "nw") && (
            <div
                className="absolute cursor-nwse-resize resize-handle"
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
                    background: getHandleBackground("nw"),
                }}
                onMouseDown={(e) => handleResizeStart(e, "nw")}
                onMouseEnter={() => setHandleHoverState("nw", true)}
                onMouseLeave={() => setHandleHoverState("nw", false)}
            />
        )}

        {/* Top handle - only for shape elements */}
        {showTopBottomHandles && !isTooSmallForAllHandles && (!isResizing || resizeDirection === "n") && (
            <div
                className="absolute cursor-ns-resize resize-handle"
                style={{
                    width: `${handleSize * 2.2}px`,
                    height: `${handleSize * 0.7}px`,
                    borderRadius: `${handleSize * 0.35}px`,
                    boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
                    border: "1px solid var(--handle-border)",
                    zIndex: 10,
                    top: 0,
                    left: "50%",
                    transform: `translate(-50%, -50%) scale(${1})`,
                    background: getHandleBackground("n"),
                }}
                onMouseDown={(e) => handleResizeStart(e, "n")}
                onMouseEnter={() => setHandleHoverState("n", true)}
                onMouseLeave={() => setHandleHoverState("n", false)}
            />
        )}

        {/* These corner handles only show when element is big enough */}
        {!isTooSmallForAllHandles && (
            <>
                {/* Northeast corner handle */}
                {(!isResizing || resizeDirection === "ne") && (
                    <div
                        className="absolute cursor-nesw-resize resize-handle"
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
                            background: getHandleBackground("ne"),
                        }}
                        onMouseDown={(e) => handleResizeStart(e, "ne")}
                        onMouseEnter={() => setHandleHoverState("ne", true)}
                        onMouseLeave={() => setHandleHoverState("ne", false)}
                    />
                )}

                {/* Southwest corner handle */}
                {(!isResizing || resizeDirection === "sw") && (
                    <div
                        className="absolute cursor-nesw-resize resize-handle"
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
                            background: getHandleBackground("sw"),
                        }}
                        onMouseDown={(e) => handleResizeStart(e, "sw")}
                        onMouseEnter={() => setHandleHoverState("sw", true)}
                        onMouseLeave={() => setHandleHoverState("sw", false)}
                    />
                )}
            </>
        )}

        {/* Southeast corner handle */}
        {(!isResizing || resizeDirection === "se") && !isTooSmallForAllHandles && (
            <div
                className="absolute cursor-nwse-resize resize-handle"
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
                    background: getHandleBackground("se"),
                }}
                onMouseDown={(e) => handleResizeStart(e, "se")}
                onMouseEnter={() => setHandleHoverState("se", true)}
                onMouseLeave={() => setHandleHoverState("se", false)}
            />
        )}

        {/* Bottom handle - only for shape elements */}
        {showTopBottomHandles && !isTooSmallForAllHandles && (!isResizing || resizeDirection === "s") && (
            <div
                className="absolute cursor-ns-resize resize-handle"
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
                    background: getHandleBackground("s"),
                }}
                onMouseDown={(e) => handleResizeStart(e, "s")}
                onMouseEnter={() => setHandleHoverState("s", true)}
                onMouseLeave={() => setHandleHoverState("s", false)}
            />
        )}

        {/* Right handle with enhanced styling */}
        {(!isResizing || resizeDirection === "e") && (
            <div
                className="absolute cursor-ew-resize resize-handle"
                style={{
                    width: `${handleSize * 0.7}px`,
                    height: `${Math.min(handleSize * 2.2, element.height * 0.6)}px`,
                    borderRadius: `${handleSize * 0.35}px`,
                    boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
                    border: "1px solid var(--handle-border)",
                    zIndex: 10,
                    right: 0,
                    top: `calc(50% + ${(element.height < handleSize * 2.2 ? (element.height - handleSize * 2.2) / 2 : 0)}px)`,
                    transform: `translate(50%, -50%) scale(${1})`,
                    background: (rightBorderHover || getHandleBackground("e") === "#1E88E5") ? "#1E88E5" : "#ffffff",
                }}
                onMouseDown={(e) => handleResizeStart(e, "e")}
                onMouseEnter={() => setHandleHoverState("e", true)}
                onMouseLeave={() => setHandleHoverState("e", false)}
            />
        )}

        {/* Left handle with enhanced styling */}
        {!isTooSmallForAllHandles && (!isResizing || resizeDirection === "w") && (
            <div
                className="absolute cursor-ew-resize resize-handle"
                style={{
                    width: `${handleSize * 0.7}px`,
                    height: `${Math.min(handleSize * 2.2, element.height * 0.6)}px`,
                    borderRadius: `${handleSize * 0.35}px`,
                    boxShadow: "0 2px 8px 2px rgba(0,0,0,0.15)",
                    border: "1px solid var(--handle-border)",
                    zIndex: 10,
                    left: 0,
                    top: `calc(50% + ${(element.height < handleSize * 2.2 ? (element.height - handleSize * 2.2) / 2 : 0)}px)`,
                    transform: `translate(-50%, -50%) scale(${1})`,
                    background: (leftBorderHover || getHandleBackground("w") === "#1E88E5") ? "#1E88E5" : "#ffffff",
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
});

ElementControls.displayName = 'ElementControls';

export default ElementControls;