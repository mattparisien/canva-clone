export type ElementType = "text"

export type CanvasSize = {
  name: string
  width: number
  height: number
  category?: string
}

export interface Element {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  content?: string
  fontSize?: number
  fontFamily?: string
  textAlign?: "left" | "center" | "right" | "justify"
  isNew?: boolean // Track if element was just created
  isBold?: boolean // Bold formatting
  isItalic?: boolean // Italic formatting
  isUnderlined?: boolean // Underline formatting
  isStrikethrough?: boolean // Strikethrough formatting
}

// Define the types of actions that can be performed
export type HistoryAction =
  | { type: "ADD_ELEMENT"; element: Element }
  | { type: "UPDATE_ELEMENT"; id: string; before: Partial<Element>; after: Partial<Element> }
  | { type: "DELETE_ELEMENT"; element: Element }
  | { type: "CHANGE_CANVAS_SIZE"; before: CanvasSize; after: CanvasSize }

export interface CanvasContextType {
  elements: Element[]
  selectedElement: Element | null
  selectedElementIds: string[]
  isCanvasSelected: boolean
  canvasSize: CanvasSize
  availableSizes: CanvasSize[]
  sizeCategories: string[]
  addElement: (element: Omit<Element, "id">) => void
  updateElement: (id: string, updates: Partial<Element>) => void
  updateMultipleElements: (updates: Partial<Element> | ((element: Element) => Partial<Element>)) => void
  deleteElement: (id: string) => void
  deleteSelectedElements: () => void
  selectElement: (id: string | null, addToSelection?: boolean) => void
  selectMultipleElements: (ids: string[]) => void
  selectCanvas: (select: boolean) => void
  clearSelection: () => void
  changeCanvasSize: (size: CanvasSize) => void
  fitCanvasToView: (containerWidth: number, containerHeight: number) => number
  clearNewElementFlag: (id: string) => void
  scaleElement: (element: Element, scaleFactor: number) => Element
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  isElementSelected: (id: string) => boolean
}