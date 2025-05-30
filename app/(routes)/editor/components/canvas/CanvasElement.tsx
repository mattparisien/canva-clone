"use client"

import React, { useMemo, useState } from "react";

import useCanvasStore from "@lib/stores/useCanvasStore";
import { Element as EditorCanvasElement } from "@lib/types/canvas.types"; // Change Element import to CanvasElement
import classNames from "classnames";
import { useCallback, useEffect, useRef } from "react";
import { useCanvasElementResize, useSnapping, useTextMeasurement } from "../../hooks";
import { ElementControls } from "./controls/ElementControls";
import ElementRenderer from "./renderers/ElementRenderer";
import { calculateViewportRect } from "@lib/utils/canvas-utils";


interface CanvasElementProps {
  element: EditorCanvasElement // Change Element to CanvasElement
  isSelected: boolean
  scale: number
  canvasRef: React.RefObject<HTMLDivElement>
  allElements: EditorCanvasElement[] // Change Element[] to CanvasElement[]
  canvasWidth: number
  canvasHeight: number
  onDragStart: (element: EditorCanvasElement) => void // Change Element to CanvasElement
  onDrag: (element: EditorCanvasElement, x: number, y: number, alignments: { horizontal: number[]; vertical: number[] }, isMultiSelectionDrag: boolean) => void // Change Element to CanvasElement
  onDragEnd: () => void
  onHover: (id: string | null) => void
  isEditMode: boolean // Add isEditMode prop
}

export function CanvasElement({
  element,
  isSelected,
  scale,
  canvasRef,
  allElements,
  canvasWidth,
  canvasHeight,
  onDragStart,
  onDrag,
  onDragEnd,
  onHover,
  isEditMode, // Accept the new prop
}: CanvasElementProps) {
  // Get Zustand store methods
  const updateElement = useCanvasStore(state => state.updateElement)
  const selectElement = useCanvasStore(state => state.selectElement)
  const clearNewElementFlag = useCanvasStore(state => state.clearNewElementFlag)
  const deleteElement = useCanvasStore(state => state.deleteElement)
  const duplicateElement = useCanvasStore(state => state.duplicateElement)
  const selectedElementIds = useCanvasStore(state => state.selectedElementIds)
  const showElementActionBar = useCanvasStore(state => state.showElementActionBar)
  const hideElementActionBar = useCanvasStore(state => state.hideElementActionBar)
  
  // Element ref and text editor key for rerendering
  const elementRef = useRef<HTMLDivElement>(null)
  const [textEditorKey, setTextEditorKey] = useState(0)
  const [showPopover, setShowPopover] = useState(false)

  // Initialize our custom hooks
  const { isResizing, resizeDirection, startResize, endResize, calculateResize } = useCanvasElementResize()
  const { measureElementHeight, renderMeasurer } = useTextMeasurement()

  // Helper function to update element with viewport rect
  const updateElementWithRect = useCallback((updates: Partial<EditorCanvasElement>) => {
    const newRect = calculateViewportRect(
      { ...element, ...updates },
      canvasRef,
      scale
    );
    
    updateElement(element.id, {
      ...updates,
      rect: newRect
    });
  }, [element, canvasRef, scale, updateElement]);

  // Simple click handler for selection only
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;
    
    e.stopPropagation();
    selectElement(element.id, e.shiftKey);
  }, [element.id, isEditMode, selectElement]);

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

  // Handle text height change
  const handleHeightChange = useCallback((newHeight: number) => {
    if (element.type === "text") {
      updateElementWithRect({ height: newHeight })
    }
  }, [element, updateElementWithRect])

  // Handle text alignment change
  const handleTextAlignChange = useCallback((align: "left" | "center" | "right" | "justify") => {
    if (element.type !== "text") return
    updateElement(element.id, { textAlign: align })
  }, [element, updateElement])

  // Handle element resizing
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    if (!isEditMode || element.locked) return

    e.stopPropagation()

    startResize(
      element,
      direction,
      e.clientX,
      e.clientY,
      (elementId: string) => clearNewElementFlag(elementId)
    )
  }, [element, clearNewElementFlag, isEditMode, startResize])

  // Handle mouse move for resizing only
  useEffect(() => {
    if (!isResizing) return;

    let animationFrameId: number | null = null;
    let lastEvent: MouseEvent | null = null;

    const processResize = () => {
      if (!lastEvent || !canvasRef.current) return;

      const e = lastEvent;

      // Calculate new dimensions and position
      const resizeResult = calculateResize(
        element,
        e.clientX,
        e.clientY,
        scale,
        false, // isAltKeyPressed is false by default
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
        alignments: resizeAlignments = { horizontal: [], vertical: [] }
      } = resizeResult;

      // Update element with new dimensions, position and font size
      updateElementWithRect({
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY,
        ...(element.type === "text" ? { fontSize: newFontSize } : {}),
      });

      // If resizing a text element horizontally, measure and update height immediately
      if (element.type === "text" && widthChanged) {
        const measuredHeight = measureElementHeight(element);

        if (measuredHeight && measuredHeight !== newHeight) {
          updateElementWithRect({ height: measuredHeight });
        }

        // Force TextEditor re-render to recalculate height
        setTextEditorKey((k) => k + 1);
      }

      // Pass alignment guides for visualization
      if (resizeAlignments) {
        onDrag(element, newX, newY, resizeAlignments, false);
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
    allElements,
    canvasWidth,
    canvasHeight,
    onDrag,
    calculateResize,
    endResize,
    selectElement,
    measureElementHeight,
    setTextEditorKey
  ]);

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

  // Update viewport rect when canvas position/scale changes
  useEffect(() => {
    const newRect = calculateViewportRect(element, canvasRef, scale);
    
    // Only update if rect has actually changed to avoid unnecessary re-renders
    if (!element.rect || 
        element.rect.x !== newRect.x || 
        element.rect.y !== newRect.y || 
        element.rect.width !== newRect.width || 
        element.rect.height !== newRect.height) {
      updateElement(element.id, { rect: newRect });
    }
  }, [element.x, element.y, element.width, element.height, scale, canvasRef, updateElement]);

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

  return (
    <>
      {/* Hidden measurer for text height calculation */}
      {element.type === 'text' && renderMeasurer()}

      {/* Main element container */}
      <div
        ref={elementRef}
        className={classNames("absolute", {
          // "is-highlighted": (isSelected && isEditMode) || (isHovering && isEditMode),
        })}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          cursor: isEditMode ? (element.locked ? "default" : "grab") : "default",
          transform: "none",
          borderRadius: "2px",
          // Fixed stacking order based only on element type
          zIndex: element.type === "text" ? 1 : 0,
        }}
        onClick={handleClick}
        onMouseEnter={() => onHover?.(element.id)}
        onMouseLeave={() => onHover?.(null)}
      >
        <ElementRenderer
          element={element}
          isSelected={isSelected}
          textEditorKey={textEditorKey}
          updateElement={updateElement}
          clearNewElementFlag={clearNewElementFlag}
          handleHeightChange={handleHeightChange}
          handleTextAlignChange={handleTextAlignChange}
          isEditMode={isEditMode}
        />
{/* 
        {isSelected && isEditMode && (
          <ElementControls
            element={element}
            scale={scale}
            isResizing={isResizing}
            resizeDirection={resizeDirection as string}
            handleResizeStart={handleResizeStart}
            getHandleBg={getHandleBg}
            setHandleHoverState={setHandleHoverState}
            leftBorderHover={leftBorderHover}
            rightBorderHover={rightBorderHover}
            setLeftBorderHover={setLeftBorderHover}
            setRightBorderHover={setRightBorderHover}
            isDragging={isDragging}
          />
        )} */}
      </div>
    </>
  )
}
