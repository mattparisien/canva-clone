"use client"

import React, { useState } from "react";

import useCanvasStore from "@lib/stores/useCanvasStore";
import { Element as EditorCanvasElement } from "@lib/types/canvas.types"; // Change Element import to CanvasElement
import classNames from "classnames";
import { useCallback, useEffect, useRef } from "react";
import { useCanvasElementInteraction, useCanvasElementResize, useSnapping, useTextMeasurement } from "../../hooks";
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
  const { getSnappedPosition } = useSnapping()
  const { isResizing, resizeDirection, startResize, endResize, calculateResize } = useCanvasElementResize()
  const { measureElementHeight, renderMeasurer } = useTextMeasurement()
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
    handleMouseEnter,
    handleMouseLeave,
    setJustFinishedResizing,
    getHandleBg,
    setHandleHoverState,
  } = useCanvasElementInteraction()

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

  // Modified mouse down handler
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return

    // Show popover on mouse down
    setShowPopover(true)

    startDrag(
      e,
      element,
      onDragStart,
      selectElement,
      clearNewElementFlag
    )
  }, [element, onDragStart, selectElement, clearNewElementFlag, isEditMode, startDrag])

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
    if (!isEditMode) return

    e.stopPropagation()

    startResize(
      element,
      direction,
      e.clientX,
      e.clientY,
      (elementId: string) => clearNewElementFlag(elementId)
    )
  }, [element, clearNewElementFlag, isEditMode, startResize])

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    // Performance optimization: Use requestAnimationFrame for smoother rendering
    let animationFrameId: number | null = null;
    let lastEvent: MouseEvent | null = null;

    const processDragOrResize = () => {
      if (!lastEvent || !canvasRef.current) return;

      const e = lastEvent;

      if (isDragging) {
        // Calculate the delta movement adjusted for scale
        const deltaX = (e.clientX - dragStart.x) / scale;
        const deltaY = (e.clientY - dragStart.y) / scale;

        // Calculate new position
        const newX = element.x + deltaX;
        const newY = element.y + deltaY;

        // Get snapped position and alignment guides
        const {
          x: snappedX,
          y: snappedY,
          alignments: newAlignments,
        } = getSnappedPosition(
          element,
          newX,
          newY,
          allElements.filter((el) => el.id !== element.id),
          canvasWidth,
          canvasHeight,
          isDragging,
          isSelected
        );

        // Update element position with viewport rect
        updateElementWithRect({
          x: snappedX,
          y: snappedY,
        });

        // Check if this is a multi-selection drag
        const isMultiSelectionDrag = selectedElementIds.length > 1 && selectedElementIds.includes(element.id);

        // Notify parent component
        onDrag(element, snappedX, snappedY, newAlignments, isMultiSelectionDrag);

        // Update drag start position for next move
        setDragStart({
          x: e.clientX,
          y: e.clientY,
        });
      } else if (isResizing) {
        // Calculate new dimensions and position
        const resizeResult = calculateResize(
          element,
          e.clientX,
          e.clientY,
          scale,
          isAltKeyPressed,
          allElements, // Pass all elements for snapping
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

        // Update element with new dimensions, position and font size, including viewport rect
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

        // Pass alignment guides for visualization, similar to drag operation
        if (resizeAlignments) {
          onDrag(
            element,
            newX,
            newY,
            resizeAlignments,
            false
          );
        }

        // Update drag start position for next move
        setDragStart({
          x: e.clientX,
          y: e.clientY,
        });
      }

      lastEvent = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Store only the most recent event and process in the next animation frame
      lastEvent = e;

      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(() => {
          processDragOrResize();
          animationFrameId = null;
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        endDrag(onDragEnd);
      }

      if (isResizing) {
        endResize();
        // Only call when ending a resize operation, with false to not toggle selection
        selectElement(element.id, false);
        // Set the flag to prevent immediate deselect
        setJustFinishedResizing(true);
      }

      // Cancel any pending animation frame
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

      // Ensure we clean up any pending animation frame
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    isDragging,
    isResizing,
    dragStart,
    element,
    updateElementWithRect,
    scale,
    canvasRef,
    allElements,
    canvasWidth,
    canvasHeight,
    onDrag,
    onDragEnd,
    selectedElementIds,
    isSelected,
    getSnappedPosition,
    calculateResize,
    isAltKeyPressed,
    endDrag,
    endResize,
    selectElement,
    setDragStart,
    setJustFinishedResizing,
    measureElementHeight,
  ])

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
    if (isSelected && isEditMode && !isDragging && !isResizing) {
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
  }, [element.id, element.x, element.y, element.width, isSelected, isEditMode, isDragging, isResizing, showElementActionBar, hideElementActionBar]);

  return (
    <>
      {/* Hidden measurer for text height calculation */}
      {element.type === 'text' && renderMeasurer()}

      {/* Main element container */}
      <div
        ref={elementRef}
        className={classNames("absolute", {
          "is-highlighted": (isSelected && isEditMode) || (isHovering && isEditMode),
        })}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          cursor: isEditMode ? (isDragging ? "grabbing" : "grab") : "default",
          transform: "none",
          borderRadius: "2px",
          // Fixed stacking order based only on element type
          zIndex: element.type === "text" ? 1 : 0,
        }}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => handleMouseEnter(element.id, onHover, isEditMode)}
        onMouseLeave={() => handleMouseLeave(onHover)}
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
        )}
      </div>
    </>
  )
}
