import { Element } from "@/lib/types/canvas";

/**
 * Calculates the width of text based on font size and family
 * @param text - The text to measure
 * @param fontSize - Font size in pixels
 * @param fontFamily - Font family name
 * @returns Width of the text in pixels
 */
export const measureTextWidth = (text: string, fontSize: number, fontFamily: string = "Inter"): number => {
  // Return a reasonable approximation for server-side rendering or if window is unavailable
  if (typeof window === "undefined") {
    // Fallback calculation based on character count and font size
    return Math.max(text.length * fontSize * 0.6, fontSize * 2);
  }

  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      // Fallback if canvas context is not available
      return Math.max(text.length * fontSize * 0.6, fontSize * 2);
    }

    // Set the font correctly
    context.font = `${fontSize}px ${fontFamily}`;
    const metrics = context.measureText(text);

    // Add a small padding buffer for cursor/caret
    return Math.ceil(metrics.width) + 8;
  } catch (error) {
    // Handle any errors and provide a reasonable fallback
    console.error("Error measuring text width:", error);
    return Math.max(text.length * fontSize * 0.6, fontSize * 2);
  }
}

/**
 * Scales a text element's font size based on a scale factor
 * @param element - The element to scale
 * @param scaleFactor - The factor to scale by
 * @returns A new element with updated font size
 */
export const scaleElement = (element: Element, scaleFactor: number): Element => {
  if (element.type === "text" && element.fontSize) {
    const newFontSize = Math.max(8, Math.round((element.fontSize || 36) * scaleFactor))
    return {
      ...element,
      fontSize: newFontSize,
    }
  }
  return element
}

/**
 * Calculates the appropriate scale to fit the canvas in the available view
 * @param containerWidth - Width of the container
 * @param containerHeight - Height of the container
 * @param canvasWidth - Width of the canvas
 * @param canvasHeight - Height of the canvas
 * @returns Scale percentage (0-100)
 */
export const fitCanvasToView = (
  containerWidth: number,
  containerHeight: number,
  canvasWidth: number,
  canvasHeight: number
): number => {
  // Account for padding and UI elements
  const availableWidth = containerWidth - 100 // 50px padding on each side
  const availableHeight = containerHeight - 160 // Account for top and bottom controls + padding

  const widthRatio = availableWidth / canvasWidth
  const heightRatio = availableHeight / canvasHeight

  // Use the smaller ratio to ensure the canvas fits entirely
  const fitScale = Math.min(widthRatio, heightRatio, 1) // Cap at 100%
  return Math.round(fitScale * 100) // Round to integer
}

// Helper function to calculate the scale to fit content within a container
/**
 * Calculates the scale factor needed to fit content into a container while maintaining aspect ratio.
 * 
 * @param contentWidth - Width of the content to be scaled
 * @param contentHeight - Height of the content to be scaled
 * @param containerClientWidth - Width of the container that will hold the content
 * @param containerClientHeight - Height of the container that will hold the content
 * @returns The scale factor to apply to the content to fit it within the container
 */
export const calculateFitScale = (
  contentWidth: number,
  contentHeight: number,
  containerClientWidth: number,
  containerClientHeight: number
): number => {
  if (contentWidth <= 0 || contentHeight <= 0 || containerClientWidth <= 0 || containerClientHeight <= 0) {
      return 1; // Default scale if dimensions are invalid
  }
  const scaleX = containerClientWidth / contentWidth;
  const scaleY = containerClientHeight / contentHeight;
  return Math.min(scaleX, scaleY); // Use the smaller scale to fit and maintain aspect ratio
}

/**
 * Calculates viewport-relative rect coordinates for an element
 * @param element - The canvas element
 * @param canvasRef - Reference to the canvas DOM element
 * @param scale - Current canvas scale factor
 * @returns Viewport-relative position and dimensions
 */
export const calculateViewportRect = (
  element: Element,
  canvasRef: React.RefObject<HTMLDivElement>,
  scale: number
): { x: number; y: number; width: number; height: number } => {
  if (!canvasRef.current) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const canvasRect = canvasRef.current.getBoundingClientRect();
  
  // Calculate element position relative to viewport
  // Consider any scroll offset as well
  const viewportX = canvasRect.left + (element.x * scale);
  const viewportY = canvasRect.top + (element.y * scale);
  const viewportWidth = element.width * scale;
  const viewportHeight = element.height * scale;

  return {
    x: viewportX,
    y: viewportY,
    width: viewportWidth,
    height: viewportHeight
  };
};

/**
 * Reorders an array item by moving it from one index to another.
 * @param items - The array of items to modify
 * @param from - The original index of the item
 * @param to - The target index for the item
 * @returns A new array with the item moved
 */
export const reorderByIndex = <T>(items: T[], from: number, to: number): T[] => {
  const updated = [...items];
  const [moved] = updated.splice(from, 1);
  updated.splice(to, 0, moved);
  return updated;
};
