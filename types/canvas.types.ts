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

export interface Page {
  id: string
  elements: Element[]
  canvasSize: CanvasSize
  thumbnail?: string // Optional thumbnail for page preview
}

// Define the types of actions that can be performed
export type HistoryAction =
  | { type: "ADD_ELEMENT"; element: Element; pageId: string }
  | { type: "UPDATE_ELEMENT"; id: string; before: Partial<Element>; after: Partial<Element>; pageId: string }
  | { type: "DELETE_ELEMENT"; element: Element; pageId: string }
  | { type: "CHANGE_CANVAS_SIZE"; before: CanvasSize; after: CanvasSize; pageId: string }
  | { type: "ADD_PAGE"; page: Page }
  | { type: "DELETE_PAGE"; page: Page }
  | { type: "REORDER_PAGES"; before: string[]; after: string[] }

export interface CanvasContextType {
  pages: Page[]
  currentPageId: string | null
  currentPageIndex: number
  elements: Element[] // Elements of the current page
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
  
  // Page management
  addPage: () => void
  deletePage: (id: string) => void
  goToPage: (id: string) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  duplicateCurrentPage: () => void
}