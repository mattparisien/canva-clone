"use client"

import React, { useState } from "react";
import useCanvasStore from "@lib/stores/useCanvasStore";
import { Element as EditorCanvasElement } from "@lib/types/canvas.types";
import { calculateViewportRect } from "@lib/utils/canvas-utils";
import classNames from "classnames";
import { useCallback, useEffect, useRef } from "react";
import { useTextMeasurement } from "../../hooks";
import ElementRenderer from "./renderers/ElementRenderer";

interface CanvasElementProps {
  element: EditorCanvasElement
  isSelected: boolean
  scale: number
  canvasRef: React.RefObject<HTMLDivElement>
  onHover: (id: string | null) => void
  isEditMode: boolean
  // Props expected by Canvas for alignment guides
  allElements?: EditorCanvasElement[]
  canvasWidth?: number
  canvasHeight?: number
  onDragStart?: (element: EditorCanvasElement) => void
  onDrag?: (element: EditorCanvasElement, x: number, y: number, alignments: { horizontal: number[], vertical: number[] }, isDragSelection?: boolean) => void
  onDragEnd?: () => void
}

export function CanvasElement({
  element,
  isSelected,
  scale,
  canvasRef,
  onHover,
  isEditMode,
  allElements = [],
  canvasWidth = 800,
  canvasHeight = 600,
  onDragStart,
  onDrag,
  onDragEnd,
}: CanvasElementProps) {
  // Get Zustand store methods
  const updateElement = useCanvasStore(state => state.updateElement);
  const clearNewElementFlag = useCanvasStore(state => state.clearNewElementFlag);
  const showElementActionBar = useCanvasStore(state => state.showElementActionBar);
  const hideElementActionBar = useCanvasStore(state => state.hideElementActionBar);

  // Element ref and text editor key for rerendering
  const elementRef = useRef<HTMLDivElement>(null);
  const [textEditorKey, setTextEditorKey] = useState(0);
  
  // Initialize text measurement hook
  const { measureElementHeight, renderMeasurer } = useTextMeasurement();

  // Create custom drag handlers that communicate with Canvas alignment guides
  const handleDragStart = useCallback(() => {
    if (onDragStart) {
      onDragStart(element);
    }
  }, [element, onDragStart]);

  const handleDrag = useCallback((alignments: { horizontal: number[], vertical: number[] }) => {
    if (onDrag) {
      onDrag(element, element.x, element.y, alignments);
    }
  }, [element, onDrag]);

  const handleDragEnd = useCallback(() => {
    if (onDragEnd) {
      onDragEnd();
    }
  }, [onDragEnd]);

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

  // Handle text height change
  const handleHeightChange = useCallback((newHeight: number) => {
    if (element.type === "text") {
      updateElementWithRect({ height: newHeight });
    }
  }, [element, updateElementWithRect]);

  // Handle text alignment change
  const handleTextAlignChange = useCallback((align: "left" | "center" | "right" | "justify") => {
    if (element.type !== "text") return;
    updateElement(element.id, { textAlign: align });
  }, [element, updateElement]);

  // Track width and fontSize for text elements to trigger height recalculation
  useEffect(() => {
    if (element.type === "text") {
      setTextEditorKey((k) => k + 1);
    }
  }, [element.width, element.fontSize, element.type]);

  // Update height when fontSize changes
  useEffect(() => {
    if (element.type === "text" && element.content && element.fontSize) {
      const measuredHeight = measureElementHeight(element);

      if (measuredHeight && measuredHeight !== element.height) {
        updateElementWithRect({ height: measuredHeight });
      }
    }
  }, [element, updateElementWithRect, measureElementHeight]);

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
    if (isSelected && isEditMode) {
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
  }, [element.id, element.x, element.y, element.width, isSelected, isEditMode, showElementActionBar, hideElementActionBar]);

  return (
    <>
      {/* Hidden measurer for text height calculation */}
      {element.type === 'text' && renderMeasurer()}

      {/* Main element container */}
      <div
        ref={elementRef}
        className={classNames("absolute", {
          // This component no longer handles its own highlighting, that's done in ElementControls
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
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          allElements={allElements}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />
      </div>
    </>
  );
}
