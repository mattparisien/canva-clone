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

type SnappedResize = {
  width: number;
  height: number;
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
  
  /**
   * Calculates the snapped dimensions and position for an element during resize operations
   */
  const getSnappedResize = (
    element: CanvasElement,
    newWidth: number,
    newHeight: number,
    newX: number,
    newY: number,
    resizeDirection: string,
    otherElements: CanvasElement[],
    canvasWidth: number,
    canvasHeight: number,
    isResizing: boolean,
    isSelected: boolean
  ): SnappedResize => {
    // If not selected or not resizing, return the current dimensions without snapping
    if (!isSelected || !isResizing) {
      return {
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY,
        alignments: {
          horizontal: [],
          vertical: []
        }
      };
    }
    
    // Calculate new element bounds
    const newRight = newX + newWidth;
    const newBottom = newY + newHeight;
    const newCenterX = newX + newWidth / 2;
    const newCenterY = newY + newHeight / 2;
    
    // Initialize snapped dimensions and guides
    let snappedWidth = newWidth;
    let snappedHeight = newHeight;
    let snappedX = newX;
    let snappedY = newY;
    const horizontalGuides: number[] = [];
    const verticalGuides: number[] = [];

    // -----------------------------
    // Canvas edge snapping
    // -----------------------------
    
    // Handle right edge snapping
    if (resizeDirection.includes('e') && Math.abs(newRight - canvasWidth) < SNAP_THRESHOLD) {
      snappedWidth = canvasWidth - newX;
      verticalGuides.push(canvasWidth);
    }
    
    // Handle left edge snapping
    if (resizeDirection.includes('w') && Math.abs(newX) < SNAP_THRESHOLD) {
      const adjustedWidth = snappedWidth + snappedX;
      snappedX = 0;
      snappedWidth = adjustedWidth;
      verticalGuides.push(0);
    }
    
    // Handle bottom edge snapping
    if (resizeDirection.includes('s') && Math.abs(newBottom - canvasHeight) < SNAP_THRESHOLD) {
      snappedHeight = canvasHeight - newY;
      horizontalGuides.push(canvasHeight);
    }
    
    // Handle top edge snapping
    if (resizeDirection.includes('n') && Math.abs(newY) < SNAP_THRESHOLD) {
      const adjustedHeight = snappedHeight + snappedY;
      snappedY = 0;
      snappedHeight = adjustedHeight;
      horizontalGuides.push(0);
    }
    
    // Canvas center snapping
    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;

    // Check alignment with canvas center (horizontal)
    if (Math.abs(newCenterX - canvasCenterX) < SNAP_THRESHOLD) {
      if (resizeDirection.includes('w')) {
        const newWidthToCenter = (newX + newWidth - canvasCenterX) * 2;
        snappedX = canvasCenterX - newWidthToCenter / 2;
        snappedWidth = newWidthToCenter;
      } else if (resizeDirection.includes('e')) {
        snappedWidth = (canvasCenterX - newX) * 2;
      }
      verticalGuides.push(canvasCenterX);
    }

    // Check alignment with canvas center (vertical)
    if (Math.abs(newCenterY - canvasCenterY) < SNAP_THRESHOLD) {
      if (resizeDirection.includes('n')) {
        const newHeightToCenter = (newY + newHeight - canvasCenterY) * 2;
        snappedY = canvasCenterY - newHeightToCenter / 2;
        snappedHeight = newHeightToCenter;
      } else if (resizeDirection.includes('s')) {
        snappedHeight = (canvasCenterY - newY) * 2;
      }
      horizontalGuides.push(canvasCenterY);
    }
    
    // -----------------------------
    // Other elements snapping
    // -----------------------------
    otherElements.forEach((otherElement) => {
      // Skip self-comparison
      if (otherElement.id === element.id) return;

      // Calculate other element's bounds
      const otherLeft = otherElement.x;
      const otherRight = otherElement.x + otherElement.width;
      const otherTop = otherElement.y;
      const otherBottom = otherElement.y + otherElement.height;
      const otherCenterX = otherElement.x + otherElement.width / 2;
      const otherCenterY = otherElement.y + otherElement.height / 2;

      // Right edge snapping
      if (resizeDirection.includes('e') && Math.abs(newRight - otherLeft) < SNAP_THRESHOLD) {
        snappedWidth = otherLeft - newX;
        verticalGuides.push(otherLeft);
      }
      
      // Left edge snapping
      if (resizeDirection.includes('w') && Math.abs(newX - otherRight) < SNAP_THRESHOLD) {
        const adjustedWidth = snappedWidth + snappedX - otherRight;
        snappedX = otherRight;
        snappedWidth = adjustedWidth;
        verticalGuides.push(otherRight);
      }
      
      // Bottom edge snapping
      if (resizeDirection.includes('s') && Math.abs(newBottom - otherTop) < SNAP_THRESHOLD) {
        snappedHeight = otherTop - newY;
        horizontalGuides.push(otherTop);
      }
      
      // Top edge snapping
      if (resizeDirection.includes('n') && Math.abs(newY - otherBottom) < SNAP_THRESHOLD) {
        const adjustedHeight = snappedHeight + snappedY - otherBottom;
        snappedY = otherBottom;
        snappedHeight = adjustedHeight;
        horizontalGuides.push(otherBottom);
      }
      
      // Center alignment (horizontal)
      if (Math.abs(newCenterX - otherCenterX) < SNAP_THRESHOLD) {
        if (resizeDirection === 'e' || resizeDirection === 'w') {
          if (resizeDirection === 'e') {
            snappedWidth = (otherCenterX - newX) * 2;
          } else { // 'w'
            const newWidthToCenter = (newX + newWidth - otherCenterX) * 2;
            snappedX = otherCenterX - newWidthToCenter / 2;
            snappedWidth = newWidthToCenter;
          }
          verticalGuides.push(otherCenterX);
        }
      }
      
      // Center alignment (vertical)
      if (Math.abs(newCenterY - otherCenterY) < SNAP_THRESHOLD) {
        if (resizeDirection === 's' || resizeDirection === 'n') {
          if (resizeDirection === 's') {
            snappedHeight = (otherCenterY - newY) * 2;
          } else { // 'n'
            const newHeightToCenter = (newY + newHeight - otherCenterY) * 2;
            snappedY = otherCenterY - newHeightToCenter / 2;
            snappedHeight = newHeightToCenter;
          }
          horizontalGuides.push(otherCenterY);
        }
      }
      
      // Edge-matching snapping for corners
      if (resizeDirection.includes('e') && Math.abs(newRight - otherRight) < SNAP_THRESHOLD) {
        snappedWidth = otherRight - newX;
        verticalGuides.push(otherRight);
      }
      
      if (resizeDirection.includes('w') && Math.abs(newX - otherLeft) < SNAP_THRESHOLD) {
        const adjustedWidth = snappedWidth + snappedX - otherLeft;
        snappedX = otherLeft;
        snappedWidth = adjustedWidth;
        verticalGuides.push(otherLeft);
      }
      
      if (resizeDirection.includes('s') && Math.abs(newBottom - otherBottom) < SNAP_THRESHOLD) {
        snappedHeight = otherBottom - newY;
        horizontalGuides.push(otherBottom);
      }
      
      if (resizeDirection.includes('n') && Math.abs(newY - otherTop) < SNAP_THRESHOLD) {
        const adjustedHeight = snappedHeight + snappedY - otherTop;
        snappedY = otherTop;
        snappedHeight = adjustedHeight;
        horizontalGuides.push(otherTop);
      }
    });

    // Ensure minimum sizes
    snappedWidth = Math.max(20, snappedWidth);
    snappedHeight = Math.max(20, snappedHeight);
    
    // Ensure we have unique values
    const uniqueHorizontal = [...new Set(horizontalGuides)];
    const uniqueVertical = [...new Set(verticalGuides)];

    return {
      width: snappedWidth,
      height: snappedHeight,
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
    getSnappedResize
  };
}