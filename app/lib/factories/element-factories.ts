import { Element, ElementType } from "../types/canvas.types"
import { DEFAULT_TEXT_FONT_SIZE_RATIO } from "../constants/canvas"
import { measureTextWidth } from "@utils/canvas-utils"
import { DEFAULT_TEXT_ALIGN } from "@constants/editor"

/**
 * Creates a new text element with appropriate default values
 * @param options - Element creation options
 * @param canvasWidth - The current canvas width for calculating defaults
 * @param canvasHeight - The current canvas height for calculating defaults
 * @returns A new element object without ID (to be added by context)
 */
export function createTextElement(
  options: {
    content?: string
    x?: number
    y?: number
    width?: number
    height?: number
    fontSize?: number
    fontFamily?: string
    textAlign?: "left" | "center" | "right" | "justify"
    isBold?: boolean
    isItalic?: boolean
    isUnderlined?: boolean
    isStrikethrough?: boolean
  } = {},
  canvasWidth: number,
  canvasHeight: number
): Omit<Element, "id"> {
  const fontSize = options.fontSize || Math.round(canvasWidth * DEFAULT_TEXT_FONT_SIZE_RATIO)
  const content = options.content || "Add your text here"
  const fontFamily = options.fontFamily || "Inter"
  
  // Calculate width and height based on content and fontSize
  const width = options.width || measureTextWidth(content, fontSize, fontFamily)
  const height = options.height || fontSize * 1.2

  // Calculate centered position if not specified
  const x = options.x !== undefined ? options.x : (canvasWidth - width) / 2
  const y = options.y !== undefined ? options.y : (canvasHeight - height) / 2

  return {
    type: "text" as ElementType,
    x,
    y,
    width,
    height,
    content,
    fontSize,
    fontFamily,
    textAlign: options.textAlign || DEFAULT_TEXT_ALIGN,
    isNew: true,
    isBold: options.isBold || false,
    isItalic: options.isItalic || false,
    isUnderlined: options.isUnderlined || false,
    isStrikethrough: options.isStrikethrough || false,
  }
}

/**
 * Creates a new rectangle element
 * @param options - Element creation options
 * @param canvasWidth - The current canvas width for calculating defaults
 * @param canvasHeight - The current canvas height for calculating defaults
 * @returns A new rectangle element object without ID
 */
export function createRectangleElement(
  options: {
    x?: number
    y?: number
    width?: number
    height?: number
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    borderStyle?: "solid" | "dashed" | "dotted"
    rotation?: number
  } = {},
  canvasWidth: number,
  canvasHeight: number
): Omit<Element, "id"> {
  // Default size - use the same value for both width and height to create a square
  const size = options.width || Math.round(Math.min(canvasWidth, canvasHeight) * 0.2);
  
  // Position in center by default
  const x = options.x !== undefined ? options.x : (canvasWidth - size) / 2;
  const y = options.y !== undefined ? options.y : (canvasHeight - size) / 2;

  return {
    type: "rectangle",
    x,
    y,
    width: size,
    height: size, // Use the same value as width to ensure a perfect square
    isNew: true,
    backgroundColor: options.backgroundColor || "#000000",
    borderColor: options.borderColor,
    borderWidth: options.borderWidth,
    borderStyle: options.borderStyle,
    rotation: options.rotation || 0,
  }
}

/**
 * Creates a new circle element
 * @param options - Element creation options
 * @param canvasWidth - The current canvas width for calculating defaults
 * @param canvasHeight - The current canvas height for calculating defaults
 * @returns A new circle element object without ID
 */
export function createCircleElement(
  options: {
    x?: number
    y?: number
    width?: number
    height?: number
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    borderStyle?: "solid" | "dashed" | "dotted"
    rotation?: number
  } = {},
  canvasWidth: number,
  canvasHeight: number
): Omit<Element, "id"> {
  // Default size - make it square for a perfect circle
  const size = options.width || Math.min(canvasWidth, canvasHeight) * 0.15
  
  // Position in center by default
  const x = options.x !== undefined ? options.x : (canvasWidth - size) / 2
  const y = options.y !== undefined ? options.y : (canvasHeight - size) / 2

  return {
    type: "circle",
    x,
    y,
    width: size,
    height: size, // Same as width for perfect circle
    isNew: true,
    backgroundColor: options.backgroundColor || "#000000",
    borderColor: options.borderColor,
    borderWidth: options.borderWidth,
    borderStyle: options.borderStyle,
    rotation: options.rotation || 0,
  }
}

/**
 * Creates a new line element
 * @param options - Element creation options
 * @param canvasWidth - The current canvas width for calculating defaults
 * @param canvasHeight - The current canvas height for calculating defaults
 * @returns A new line element object without ID
 */
export function createLineElement(
  options: {
    x?: number
    y?: number
    width?: number
    height?: number
    borderColor?: string
    borderWidth?: number
    borderStyle?: "solid" | "dashed" | "dotted"
    rotation?: number
  } = {},
  canvasWidth: number,
  canvasHeight: number
): Omit<Element, "id"> {
  // Default size
  const width = options.width || Math.round(canvasWidth * 0.3)
  const height = options.height || 2 // Very thin height for a line
  
  // Position in center by default
  const x = options.x !== undefined ? options.x : (canvasWidth - width) / 2
  const y = options.y !== undefined ? options.y : (canvasHeight - height) / 2

  return {
    type: "line",
    x,
    y,
    width,
    height,
    isNew: true,
    borderColor: options.borderColor || "#000000",
    borderWidth: options.borderWidth || 2,
    borderStyle: options.borderStyle || "solid",
    rotation: options.rotation || 0,
  }
}

/**
 * Creates a new arrow element
 * @param options - Element creation options
 * @param canvasWidth - The current canvas width for calculating defaults
 * @param canvasHeight - The current canvas height for calculating defaults
 * @returns A new arrow element object without ID
 */
export function createArrowElement(
  options: {
    x?: number
    y?: number
    width?: number
    height?: number
    borderColor?: string
    borderWidth?: number
    borderStyle?: "solid" | "dashed" | "dotted"
    rotation?: number
  } = {},
  canvasWidth: number,
  canvasHeight: number
): Omit<Element, "id"> {
  // Default size
  const width = options.width || Math.round(canvasWidth * 0.3)
  const height = options.height || Math.round(width * 0.1) // Proportional to width
  
  // Position in center by default
  const x = options.x !== undefined ? options.x : (canvasWidth - width) / 2
  const y = options.y !== undefined ? options.y : (canvasHeight - height) / 2

  return {
    type: "arrow",
    x,
    y,
    width,
    height,
    isNew: true,
    borderColor: options.borderColor || "#000000",
    borderWidth: options.borderWidth || 2,
    borderStyle: options.borderStyle || "solid",
    rotation: options.rotation || 0,
  }
}