import { Element } from "@/lib/types/canvas.types";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import useCanvasStore from "@/lib/stores/useCanvasStore";
import { useCanvasElementInteraction } from "@/(routes)/editor/hooks";

interface ElementControlsProps {
    element: Element;
    scale?: number; // Optional scale prop for future use
    isEditMode: boolean; // Optional prop to indicate if in edit mode
    // Add other props as needed
}

const ElementControlsRefactored = memo(({
    element,
    scale = 1,
    isEditMode
}: ElementControlsProps) => {

    const ref = useRef<HTMLDivElement>(null);

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
    } = useCanvasElementInteraction(ref)

    if (!element || !element.rect || !element.width || !element.height) {
        return null; // Return null if element is not valid
    }


    return <div
        ref={ref}
        className={classNames("", {
            "is-highlighted relative": isSelected || isHovering
        })} style={{
            position: 'fixed',
            top: element.rect.y,
            left: element.rect.x,
            width: element.width * scale,
            height: element.height * scale,
            zIndex: 99999
        }}
        onClick={(e) => handleClick(e, element)}
        onMouseEnter={() => handleMouseEnter(element.id, isEditMode)}
        onMouseLeave={() => handleMouseLeave()}

    ></div>
});

ElementControlsRefactored.displayName = 'ElementControlsRefactored';

export default ElementControlsRefactored;