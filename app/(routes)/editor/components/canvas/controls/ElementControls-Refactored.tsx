import { Element } from "@/lib/types/canvas.types";
import { memo, useCallback, useEffect, useRef } from "react";
import classNames from "classnames";
import useCanvasStore from "@/lib/stores/useCanvasStore";
import { useCanvasElementInteraction, useCanvasElementResize } from "@/(routes)/editor/hooks";

interface ElementControlsProps {
    element: Element;
    scale?: number;
    isEditMode: boolean;
}

const ElementControlsRefactored = memo(({
    element,
    scale = 1,
    isEditMode
}: ElementControlsProps) => {
    const elementRef = useRef<HTMLDivElement>(null);

    // Canvas store methods
    const updateElement = useCanvasStore(state => state.updateElement);
    const selectElement = useCanvasStore(state => state.selectElement);
    const clearNewElementFlag = useCanvasStore(state => state.clearNewElementFlag);

    // Use the interaction hook
    const {
        isDragging,
        isAltKeyPressed,
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
    } = useCanvasElementInteraction(elementRef)
    const { isResizing, resizeDirection, startResize, endResize, calculateResize } = useCanvasElementResize()


    // Handle mouse down to start drag
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!isEditMode || element.locked) return;

        // Use the hook's startDrag function
        startDrag(
            e,
            element,
            () => { }, // onDragStart callback
            selectElement,
            clearNewElementFlag
        );
    }, [element, isEditMode, startDrag, selectElement, clearNewElementFlag]);

    // Handle drag movement
    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            // Calculate delta movement adjusted for scale
            const deltaX = (e.clientX - dragStart.x) / scale;
            const deltaY = (e.clientY - dragStart.y) / scale;

            // Calculate new position relative to canvas
            const newX = element.x + deltaX;
            const newY = element.y + deltaY;

            // Update element position in canvas store
            updateElement(element.id, { x: newX, y: newY });

            // Update drag start for next movement
            setDragStart({ x: e.clientX, y: e.clientY });
        };

        const handleMouseUp = () => {
            // Use the hook's endDrag function
            endDrag(() => { }); // onDragEnd callback
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart, element, scale, updateElement, setDragStart, endDrag]);

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
            <Handles
                isResizing={isResizing}
                element={element}
                resizeDirection={resizeDirection}
                handleResizeStart={(e: React.MouseEvent, direction: string) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    startResize(element, direction, e.clientX, e.clientY);
                }}
                getHandleBg={getHandleBg}
                setHandleHoverState={setHandleHoverState}
                leftBorderHover={leftBorderHover}
                rightBorderHover={rightBorderHover}
                setLeftBorderHover={setLeftBorderHover}
                setRightBorderHover={setRightBorderHover}
                isDragging={isDragging}
            /></div>
    );
});

interface HandlesProps {
    element: Element;
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
    isResizing,
    resizeDirection,
    handleResizeStart,
    getHandleBg = () => "#ffffff",
    setHandleHoverState = () => {},
    leftBorderHover = false,
    rightBorderHover = false,
    setLeftBorderHover = () => {},
    setRightBorderHover = () => {},
    isDragging,
}: HandlesProps) => {

    const handleSize = 18; // Size of the resize handles
    const showTopBottomHandles = element.type !== "text"
    const isTooSmallForAllHandles = false;
    
    // Helper function to get the background color with null-safety
    const getHandleBackground = (direction: string) => {
        const baseBg = getHandleBg(direction, resizeDirection || "", isResizing);
        return baseBg === "var(--handle-hover)" ? "#1E88E5" : "#ffffff";
    };

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
                className="absolute cursor-ns-resize"
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
        {(!isResizing || resizeDirection === "se") && (
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
                className="absolute cursor-ew-resize"
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
                className="absolute cursor-ew-resize"
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

ElementControlsRefactored.displayName = 'ElementControlsRefactored';

export default ElementControlsRefactored;