import { useCallback, useRef, useState } from "react";
import { Element as CanvasElement } from "@lib/types/canvas.types";
import { useSnapping } from "./useSnapping";

interface Alignments {
  horizontal: number[];
  vertical: number[];
}

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
  alignments?: Alignments;
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
  const calculateResize = useCallback((
    element: CanvasElement,
    mouseX: number,
    mouseY: number,
    scale: number,
    otherElements: CanvasElement[] = [],
    canvasWidth: number = 0,
    canvasHeight: number = 0,
    isAltKeyPressed: boolean = false,
    shouldScaleFromCenter: boolean = false // New parameter
  ): ResizeResult | null => {
    if (!isResizing || !resizeDirection) {
      return null;
    }

    // Calculate the resize result
    try {
      // Get original dimensions and position
      const {
        width: origWidth = 100,
        height: origHeight = 100,
        x: origX = 0,
        y: origY = 0,
        aspectRatio = origWidth / origHeight,
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

      let newWidth = origWidth;
      let newHeight = origHeight;
      let newX = origX;
      let newY = origY;
      let newFontSize = origFontSize;
      let widthChanged = false;

      // Scale from center handling for Option+Shift functionality
      if (shouldScaleFromCenter) {
        // Save the original center point
        const centerX = origX + origWidth / 2;
        const centerY = origY + origHeight / 2;
        
        // Calculate a single scaling factor from the primary resize direction
        let scaleFactor = 1.0;
        
        // Determine which direction provides the dominant scaling
        switch (resizeDirection) {
          case "e":
          case "w":
            // Horizontal scaling
            scaleFactor = (origWidth + (resizeDirection === "e" ? totalDeltaX : -totalDeltaX)) / origWidth;
            break;
          case "n":
          case "s":
            // Vertical scaling
            scaleFactor = (origHeight + (resizeDirection === "s" ? totalDeltaY : -totalDeltaY)) / origHeight;
            break;
          case "ne":
          case "nw":
          case "se":
          case "sw":
            // For corners, use the larger of the two scaling factors
            const scaleX = (origWidth + (resizeDirection.includes("e") ? totalDeltaX : -totalDeltaX)) / origWidth;
            const scaleY = (origHeight + (resizeDirection.includes("s") ? totalDeltaY : -totalDeltaY)) / origHeight;
            scaleFactor = Math.max(scaleX, scaleY);
            break;
        }
        
        // Apply the scale factor uniformly
        newWidth = Math.max(50, origWidth * scaleFactor);
        newHeight = Math.max(20, origHeight * scaleFactor);
        
        // Adjust font size proportionally for text elements
        if (element.type === "text" && origFontSize) {
          newFontSize = origFontSize * scaleFactor;
        }
        
        // Recalculate position to maintain center point
        newX = centerX - newWidth / 2;
        newY = centerY - newHeight / 2;
        
        widthChanged = true;
        
        // Early return since we've handled the resize
        return {
          width: newWidth,
          height: newHeight,
          x: newX,
          y: newY,
          fontSize: newFontSize,
          widthChanged
        };
      }

      // Regular resize (non-center) continues with existing logic
      // Check if we're resizing from a corner
      const isCornerResize = resizeDirection && resizeDirection.length > 1;

      if (isCornerResize && resizeDirection) {
        switch (resizeDirection) {
          case "se": // Southeast
            if (shouldMaintainAspectRatio) {
              // Constrained mode: maintain aspect ratio
              const potentialWidthSE = Math.max(50, origWidth + totalDeltaX);
              const potentialHeightSE = Math.max(20, origHeight + totalDeltaY);

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
              newWidth = Math.max(50, origWidth + totalDeltaX);
              newHeight = Math.max(20, origHeight + totalDeltaY);
            }
            
            widthChanged = true;

            // If Alt/Option key is pressed, resize from center
            if (isAltKeyPressed) {
              newX = origX - (newWidth - origWidth) / 2;
              newY = origY - (newHeight - origHeight) / 2;
            }
            break;

          case "sw": // Southwest
            if (shouldMaintainAspectRatio) {
              // Constrained mode: maintain aspect ratio
              const potentialWidthSW = Math.max(50, origWidth - totalDeltaX);
              const potentialHeightSW = Math.max(20, origHeight + totalDeltaY);

              if (potentialWidthSW / origWidth > potentialHeightSW / origHeight) {
                newWidth = potentialWidthSW;
                newHeight = newWidth / aspectRatio;
              } else {
                newHeight = potentialHeightSW;
                newWidth = newHeight * aspectRatio;
              }
            } else {
              // Free mode: resize width and height independently
              newWidth = Math.max(50, origWidth - totalDeltaX);
              newHeight = Math.max(20, origHeight + totalDeltaY);
            }
            
            widthChanged = true;

            if (isAltKeyPressed) {
              // When alt is pressed, resize from center
              const widthDelta = origWidth - newWidth;
              newX = origX + widthDelta / 2;
              newY = origY - (newHeight - origHeight) / 2;
            } else {
              newX = origX + (origWidth - newWidth);
            }
            break;

          case "ne": // Northeast
            if (shouldMaintainAspectRatio) {
              // Constrained mode: maintain aspect ratio
              const potentialWidthNE = Math.max(50, origWidth + totalDeltaX);
              const potentialHeightNE = Math.max(20, origHeight - totalDeltaY);

              if (potentialWidthNE / origWidth > potentialHeightNE / origHeight) {
                newWidth = potentialWidthNE;
                newHeight = newWidth / aspectRatio;
              } else {
                newHeight = potentialHeightNE;
                newWidth = newHeight * aspectRatio;
              }
            } else {
              // Free mode: resize width and height independently
              newWidth = Math.max(50, origWidth + totalDeltaX);
              newHeight = Math.max(20, origHeight - totalDeltaY);
            }
            
            widthChanged = true;

            if (isAltKeyPressed) {
              newX = origX - (newWidth - origWidth) / 2;
              const heightDelta = origHeight - newHeight;
              newY = origY + heightDelta / 2;
            } else {
              newY = origY + (origHeight - newHeight);
            }
            break;

          case "nw": // Northwest
            if (shouldMaintainAspectRatio) {
              // Constrained mode: maintain aspect ratio
              const potentialWidthNW = Math.max(50, origWidth - totalDeltaX);
              const potentialHeightNW = Math.max(20, origHeight - totalDeltaY);

              if (potentialWidthNW / origWidth > potentialHeightNW / origHeight) {
                newWidth = potentialWidthNW;
                newHeight = newWidth / aspectRatio;
              } else {
                newHeight = potentialHeightNW;
                newWidth = newHeight * aspectRatio;
              }
            } else {
              // Free mode: resize width and height independently
              newWidth = Math.max(50, origWidth - totalDeltaX);
              newHeight = Math.max(20, origHeight - totalDeltaY);
            }
            
            widthChanged = true;

            if (isAltKeyPressed) {
              const widthDelta = origWidth - newWidth;
              const heightDelta = origHeight - newHeight;
              newX = origX + widthDelta / 2;
              newY = origY + heightDelta / 2;
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
          newWidth = Math.max(50, origWidth + totalDeltaX);
          widthChanged = true;

          // If Alt/Option key is pressed, make the opposite side resize equally
          if (isAltKeyPressed) {
            newX = origX - totalDeltaX / 2;
            newWidth = Math.max(50, origWidth + totalDeltaX);
          }
        }
        
        if (resizeDirection.includes("w")) {
          newWidth = Math.max(50, origWidth - totalDeltaX);
          widthChanged = true;

          // If Alt/Option key is pressed, make the opposite side resize equally
          if (isAltKeyPressed) {
            const widthDelta = origWidth - newWidth;
            newX = origX + widthDelta / 2;
            newWidth = Math.max(50, origWidth + widthDelta);
          } else {
            newX = origX + (origWidth - newWidth);
          }
        }
        
        if (resizeDirection.includes("s")) {
          newHeight = Math.max(20, origHeight + totalDeltaY);

          // If Alt/Option key is pressed, make the opposite side resize equally
          if (isAltKeyPressed) {
            newY = origY - totalDeltaY / 2;
            newHeight = Math.max(20, origHeight + totalDeltaY);
          }
        }
        
        if (resizeDirection.includes("n")) {
          newHeight = Math.max(20, origHeight - totalDeltaY);

          // If Alt/Option key is pressed, make the opposite side resize equally
          if (isAltKeyPressed) {
            const heightDelta = origHeight - newHeight;
            newY = origY + heightDelta / 2;
            newHeight = Math.max(20, origHeight + heightDelta);
          } else {
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
    } catch (error) {
      console.error("Error in resize calculation:", error);
      return null;
    }
  }, [resizeDirection, isResizing, getSnappedResize]);

  return {
    isResizing,
    resizeDirection,
    startResize,
    endResize,
    calculateResize,
  };
}