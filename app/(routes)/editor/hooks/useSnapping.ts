import { Element as CanvasElement } from "@lib/types/canvas.types";
import { SNAP_THRESHOLD } from "@lib/constants/editor";

type SnappedPosition = {
  x: number;
  y: number;
  alignments: {
    horizontal: number[];
    vertical: number[];
  };
};

/**
 * Hook to handle element snapping functionality
 * 
 * This handles snapping an element to:
 * - Canvas center
 * - Canvas edges
 * - Other elements' edges and centers
 */
export function useSnapping() {
  /**
   * Calculates the snapped position for an element based on canvas and other elements
   */
  const getSnappedPosition = (
    element: CanvasElement,
    currentX: number,
    currentY: number, 
    otherElements: CanvasElement[],
    canvasWidth: number,
    canvasHeight: number,
    isDragging: boolean,
    isSelected: boolean
  ): SnappedPosition => {
    // If not selected or not dragging, return the current position without snapping
    if (!isSelected || !isDragging) {
      return { 
        x: currentX, 
        y: currentY, 
        alignments: { 
          horizontal: [], 
          vertical: [] 
        } 
      };
    }

    // Element bounds
    const elementRight = currentX + element.width;
    const elementBottom = currentY + element.height;
    const elementCenterX = currentX + element.width / 2;
    const elementCenterY = currentY + element.height / 2;

    // Initialize snapped position and guides
    let snappedX = currentX;
    let snappedY = currentY;
    const horizontalGuides: number[] = [];
    const verticalGuides: number[] = [];

    // -----------------------------
    // Canvas center snapping
    // -----------------------------
    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;

    // Check alignment with canvas center (horizontal)
    if (Math.abs(elementCenterX - canvasCenterX) < SNAP_THRESHOLD) {
      snappedX = canvasCenterX - element.width / 2;
      verticalGuides.push(canvasCenterX);
    }

    // Check alignment with canvas center (vertical)
    if (Math.abs(elementCenterY - canvasCenterY) < SNAP_THRESHOLD) {
      snappedY = canvasCenterY - element.height / 2;
      horizontalGuides.push(canvasCenterY);
    }

    // -----------------------------
    // Canvas edge snapping
    // -----------------------------
    // Left edge
    if (Math.abs(currentX) < SNAP_THRESHOLD) {
      snappedX = 0;
      verticalGuides.push(0);
    }

    // Right edge
    if (Math.abs(elementRight - canvasWidth) < SNAP_THRESHOLD) {
      snappedX = canvasWidth - element.width;
      verticalGuides.push(canvasWidth);
    }

    // Top edge
    if (Math.abs(currentY) < SNAP_THRESHOLD) {
      snappedY = 0;
      horizontalGuides.push(0);
    }

    // Bottom edge
    if (Math.abs(elementBottom - canvasHeight) < SNAP_THRESHOLD) {
      snappedY = canvasHeight - element.height;
      horizontalGuides.push(canvasHeight);
    }

    // -----------------------------
    // Other elements snapping
    // -----------------------------
    otherElements.forEach((otherElement) => {
      // Skip self-comparison
      if (otherElement.id === element.id) return;

      // Calculate other element's bounds
      const otherRight = otherElement.x + otherElement.width;
      const otherBottom = otherElement.y + otherElement.height;
      const otherCenterX = otherElement.x + otherElement.width / 2;
      const otherCenterY = otherElement.y + otherElement.height / 2;

      // ------------------------
      // Horizontal alignments (top, center, bottom)
      // ------------------------
      
      // Top edges alignment
      if (Math.abs(currentY - otherElement.y) < SNAP_THRESHOLD) {
        snappedY = otherElement.y;
        horizontalGuides.push(otherElement.y);
      }

      // Center alignment (vertical)
      if (Math.abs(elementCenterY - otherCenterY) < SNAP_THRESHOLD) {
        snappedY = otherCenterY - element.height / 2;
        horizontalGuides.push(otherCenterY);
      }

      // Bottom edges alignment
      if (Math.abs(elementBottom - otherBottom) < SNAP_THRESHOLD) {
        snappedY = otherBottom - element.height;
        horizontalGuides.push(otherBottom);
      }

      // ------------------------
      // Vertical alignments (left, center, right)
      // ------------------------
      
      // Left edges alignment
      if (Math.abs(currentX - otherElement.x) < SNAP_THRESHOLD) {
        snappedX = otherElement.x;
        verticalGuides.push(otherElement.x);
      }

      // Center alignment (horizontal)
      if (Math.abs(elementCenterX - otherCenterX) < SNAP_THRESHOLD) {
        snappedX = otherCenterX - element.width / 2;
        verticalGuides.push(otherCenterX);
      }

      // Right edges alignment
      if (Math.abs(elementRight - otherRight) < SNAP_THRESHOLD) {
        snappedX = otherRight - element.width;
        verticalGuides.push(otherRight);
      }
    });

    // Ensure we have unique values
    const uniqueHorizontal = [...new Set(horizontalGuides)];
    const uniqueVertical = [...new Set(verticalGuides)];

    return {
      x: snappedX,
      y: snappedY,
      alignments: {
        horizontal: uniqueHorizontal,
        vertical: uniqueVertical,
      },
    };
  };

  return {
    getSnappedPosition,
  };
}