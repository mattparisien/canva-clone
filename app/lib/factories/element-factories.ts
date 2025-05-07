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