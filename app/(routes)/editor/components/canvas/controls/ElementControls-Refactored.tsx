import { Element } from "@/lib/types/canvas.types";
import { memo, useCallback, useEffect, useRef } from "react";
import classNames from "classnames";
import useCanvasStore from "@/lib/stores/useCanvasStore";
import { useCanvasElementInteraction } from "@/(routes)/editor/hooks";

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

    // Handle mouse down to start drag
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!isEditMode || element.locked) return;

        // Use the hook's startDrag function
        startDrag(
            e,
            element,
            () => {}, // onDragStart callback
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
            endDrag(() => {}); // onDragEnd callback
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
        />
    );
});

ElementControlsRefactored.displayName = 'ElementControlsRefactored';

export default ElementControlsRefactored;