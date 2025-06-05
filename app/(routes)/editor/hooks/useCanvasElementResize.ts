import { useCallback, useRef, useState } from "react";
import { Element as CanvasElement } from "@lib/types/canvas.types";
import { useSnapping } from "./useSnapping";

type ResizeState = {
  isResizing: boolean;
  resizeDirection: string | null;
  initialMousePos: { x: number; y: number };
  originalState: {
    width: number;
    height: number;
    x: number;
    y: number;
    aspectRatio: number;
    fontSize?: number;
  };
};

type ResizeResult = {
  width: number;
  height: number;
  x: number;
  y: number;
  fontSize?: number;
  widthChanged: boolean;
  alignments?: {
    horizontal: number[];
    vertical: number[];
  };
};

/**
 * Hook to handle element resizing functionality
 */
export function useCanvasElementResize() {
  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const initialMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Original element state for resize calculations
  const originalState = useRef<{
    width: number;
    height: number;
    x: number;
    y: number;
    aspectRatio: number;
    fontSize?: number;
  }>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    aspectRatio: 1,
    fontSize: undefined,
  });

  // Get the snapping function from our useSnapping hook
  const { getSnappedResize } = useSnapping();

  /**
   * Start the resize operation
   */
  const startResize = useCallback(
    (
      element: CanvasElement,
      direction: string,
      mouseX: number,
      mouseY: number,
      onNewElementInteraction?: (elementId: string) => void
    ) => {
      setIsResizing(true);
      setResizeDirection(direction);

      // Store initial mouse position for the entire resize operation
      initialMousePos.current = {
        x: mouseX,
        y: mouseY,
      };

      // Store the current dimensions and position when starting resize
      originalState.current = {
        width: element.width,
        height: element.height,
        x: element.x,
        y: element.y,
        aspectRatio: element.width / element.height,
        fontSize: element.fontSize,
      };

      // If this is a new element and callback is provided, call it
      if (element.isNew && onNewElementInteraction) {
        onNewElementInteraction(element.id);
      }

      return {
        isResizing: true,
        resizeDirection: direction,
        initialMousePos: initialMousePos.current,
        originalState: originalState.current,
      };
    },
    []
  );

  /**
   * End the resize operation
   */
  const endResize = useCallback(() => {
    setIsResizing(false);
    setResizeDirection(null);
    return { isResizing: false, resizeDirection: null };
  }, []);

  /**
   * Calculate new dimensions and position based on mouse movement during resize
   */
  const calculateResize = useCallback(
    (
      element: CanvasElement,
      mouseX: number,
      mouseY: number,
      scale: number,
      isAltKeyPressed: boolean,
      otherElements: CanvasElement[] = [],
      canvasWidth: number = 0,
      canvasHeight: number = 0
    ): ResizeResult => {
      const {
        width: origWidth,
        height: origHeight,
        x: origX,
        y: origY,
        aspectRatio,
        fontSize: origFontSize = element.fontSize || 36,
      } = originalState.current;

      // Determine resize behavior based on element type
      // Text elements should always maintain aspect ratio (constrained)
      // Shape elements (rectangle, circle, line, arrow) can resize freely
      const shouldMaintainAspectRatio = element.type === "text";

      // Calculate the total delta from the initial mouse position
      // This approach provides smoother resizing by avoiding accumulated errors
      const totalDeltaX = (mouseX - initialMousePos.current.x) / scale;
      const totalDeltaY = (mouseY - initialMousePos.current.y) / scale;

      // When resizing from the center (Alt/Option key pressed) we double the
      // delta applied to dimensions while shifting the element by the original
      // delta to keep the center stationary.
      const deltaX = isAltKeyPressed ? totalDeltaX * 2 : totalDeltaX;
      const deltaY = isAltKeyPressed ? totalDeltaY * 2 : totalDeltaY;

      let newWidth = origWidth;
      let newHeight = origHeight;
      let newX = origX;
      let newY = origY;
      let newFontSize = origFontSize;
      let widthChanged = false;

      // Check if we're resizing from a corner
      const isCornerResize = resizeDirection && resizeDirection.length > 1;

      if (isCornerResize && resizeDirection) {
        switch (resizeDirection) {
          case "se": // Southeast
            if (shouldMaintainAspectRatio) {
              // Constrained mode: maintain aspect ratio
              const potentialWidthSE = Math.max(50, origWidth + deltaX);
              const potentialHeightSE = Math.max(20, origHeight + deltaY);

              // Choose the dimension that would result in the larger area
              if (potentialWidthSE / origWidth > potentialHeightSE / origHeight) {
                newWidth = potentialWidthSE;
                newHeight = newWidth / aspectRatio;
              } else {
                newHeight = potentialHeightSE;
                newWidth = newHeight * aspectRatio;
              }
            } else {
              // Free mode: resize width and height independently
              newWidth = Math.max(50, origWidth + deltaX);
              newHeight = Math.max(20, origHeight + deltaY);
            }
            
            widthChanged = true;

            // If Alt/Option key is pressed, shift position to keep center fixed
            if (isAltKeyPressed) {
              newX = origX - totalDeltaX;
              newY = origY - totalDeltaY;
            }
            break;

          case "sw": // Southwest
            if (shouldMaintainAspectRatio) {
              // Constrained mode: maintain aspect ratio
              const potentialWidthSW = Math.max(50, origWidth - deltaX);
              const potentialHeightSW = Math.max(20, origHeight + deltaY);

              if (potentialWidthSW / origWidth > potentialHeightSW / origHeight) {
                newWidth = potentialWidthSW;
                newHeight = newWidth / aspectRatio;
              } else {
                newHeight = potentialHeightSW;
                newWidth = newHeight * aspectRatio;
              }
            } else {
              // Free mode: resize width and height independently
              newWidth = Math.max(50, origWidth - deltaX);
              newHeight = Math.max(20, origHeight + deltaY);
            }
            
            widthChanged = true;

            if (isAltKeyPressed) {
              newX = origX + totalDeltaX;
              newY = origY - totalDeltaY;
            } else {
              newX = origX + (origWidth - newWidth);
            }
            break;

          case "ne": // Northeast
            if (shouldMaintainAspectRatio) {
              // Constrained mode: maintain aspect ratio
              const potentialWidthNE = Math.max(50, origWidth + deltaX);
              const potentialHeightNE = Math.max(20, origHeight - deltaY);

              if (potentialWidthNE / origWidth > potentialHeightNE / origHeight) {
                newWidth = potentialWidthNE;
                newHeight = newWidth / aspectRatio;
              } else {
                newHeight = potentialHeightNE;
                newWidth = newHeight * aspectRatio;
              }
            } else {
              // Free mode: resize width and height independently
              newWidth = Math.max(50, origWidth + deltaX);
              newHeight = Math.max(20, origHeight - deltaY);
            }
            
            widthChanged = true;

            if (isAltKeyPressed) {
              newX = origX - totalDeltaX;
              newY = origY + totalDeltaY;
            } else {
              newY = origY + (origHeight - newHeight);
            }
            break;

          case "nw": // Northwest
            if (shouldMaintainAspectRatio) {
              // Constrained mode: maintain aspect ratio
              const potentialWidthNW = Math.max(50, origWidth - deltaX);
              const potentialHeightNW = Math.max(20, origHeight - deltaY);

              if (potentialWidthNW / origWidth > potentialHeightNW / origHeight) {
                newWidth = potentialWidthNW;
                newHeight = newWidth / aspectRatio;
              } else {
                newHeight = potentialHeightNW;
                newWidth = newHeight * aspectRatio;
              }
            } else {
              // Free mode: resize width and height independently
              newWidth = Math.max(50, origWidth - deltaX);
              newHeight = Math.max(20, origHeight - deltaY);
            }
            
            widthChanged = true;

            if (isAltKeyPressed) {
              newX = origX + totalDeltaX;
              newY = origY + totalDeltaY;
            } else {
              newX = origX + (origWidth - newWidth);
              newY = origY + (origHeight - newHeight);
            }
            break;
        }

        // Scale the font size proportionally for text elements when using corner handles
        if (element.type === "text" && element.fontSize) {
          // Always use width scaling for text elements to keep font size consistent with width changes
          const scaleFactor = newWidth / origWidth;
          newFontSize = Math.max(8, Math.round(origFontSize * scaleFactor));
        }
      } else if (resizeDirection) {
        // Handle edge resizing (non-uniform scaling)
        if (resizeDirection.includes("e")) {
          if (isAltKeyPressed) {
            newWidth = Math.max(50, origWidth + deltaX);
            newX = origX - totalDeltaX;
          } else {
            newWidth = Math.max(50, origWidth + deltaX);
          }
          widthChanged = true;
        }

        if (resizeDirection.includes("w")) {
          if (isAltKeyPressed) {
            newWidth = Math.max(50, origWidth - deltaX);
            newX = origX + totalDeltaX;
          } else {
            newWidth = Math.max(50, origWidth - deltaX);
            newX = origX + (origWidth - newWidth);
          }
          widthChanged = true;
        }

        if (resizeDirection.includes("s")) {
          if (isAltKeyPressed) {
            newHeight = Math.max(20, origHeight + deltaY);
            newY = origY - totalDeltaY;
          } else {
            newHeight = Math.max(20, origHeight + deltaY);
          }
        }

        if (resizeDirection.includes("n")) {
          if (isAltKeyPressed) {
            newHeight = Math.max(20, origHeight - deltaY);
            newY = origY + totalDeltaY;
          } else {
            newHeight = Math.max(20, origHeight - deltaY);
            newY = origY + (origHeight - newHeight);
          }
        }
      }

      // Apply snapping if canvasWidth and height are provided along with other elements
      if (canvasWidth > 0 && canvasHeight > 0 && resizeDirection) {
        const filteredElements = otherElements.filter(el => el.id !== element.id);
        const snappedResult = getSnappedResize(
          element,
          newWidth,
          newHeight,
          newX,
          newY,
          resizeDirection,
          filteredElements,
          canvasWidth,
          canvasHeight,
          isResizing,
          true
        );
        
        newWidth = snappedResult.width;
        newHeight = snappedResult.height;
        newX = snappedResult.x;
        newY = snappedResult.y;
        
        // Return alignment guides for visualization
        return {
          width: newWidth,
          height: newHeight,
          x: newX,
          y: newY,
          fontSize: newFontSize,
          widthChanged,
          alignments: snappedResult.alignments
        };
      }

      return {
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY,
        fontSize: newFontSize,
        widthChanged,
        alignments: {
          horizontal: [],
          vertical: []
        }
      };
    },
    [resizeDirection, isResizing, getSnappedResize]
  );

  return {
    isResizing,
    resizeDirection,
    startResize,
    endResize,
    calculateResize,
  };
}