export type ElementType = "text" | "rectangle" | "circle" | "line" | "arrow"

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
  rect?: { // Viewport-relative position and dimensions
    x: number
    y: number
    width: number
    height: number
  }
  content?: string
  fontSize?: number
  fontFamily?: string
  textAlign?: "left" | "center" | "right" | "justify"
  textColor?: string // Text color for text elements
  isNew?: boolean // Track if element was just created
  isBold?: boolean // Bold formatting
  isItalic?: boolean // Italic formatting
  isUnderlined?: boolean // Underline formatting
  isStrikethrough?: boolean // Strikethrough formatting
  backgroundColor?: string // For shapes with background
  borderWidth?: number // For shapes with borders
  borderColor?: string // For shape borders
  borderStyle?: "solid" | "dashed" | "dotted" // For shape borders
  rotation?: number // For element rotation
  locked?: boolean // Whether the element is locked for editing
  isEditable?: boolean // Whether the element can be edited
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
  | { type: "REORDER_ELEMENT"; pageId: string; elementId: string; fromIndex: number; toIndex: number }; // Added for element reordering

// Editor context handles document-level state and page management
export interface EditorContextType {
  // Document metadata
  designName: string
  isDesignSaved: boolean
  isSaving: boolean
  renameDesign: (name: string) => void
  saveDesign: () => void

  // Editor mode
  isEditMode: boolean
  toggleEditMode: () => void

  // Page management
  pages: Page[]
  currentPageId: string | null
  currentPage: Page | null
  currentPageIndex: number
  addPage: () => void
  deletePage: (id: string) => void
  goToPage: (id: string) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  duplicateCurrentPage: () => void

  // Page content updates (called by CanvasContext)
  updatePageElements: (pageId: string, elements: Element[]) => void
  updatePageCanvasSize: (pageId: string, canvasSize: CanvasSize) => void
}

// Canvas context handles the canvas-specific operations for the current page
export interface CanvasContextType {
  // Canvas elements and properties
  elements: Element[] // Elements of the current page
  selectedElement: Element | null
  selectedElementIds: string[]
  isCanvasSelected: boolean
  canvasSize: CanvasSize
  isLoaded: boolean // Canvas loading state
  elementActionBar: {
    isActive: boolean,
    position: {
      x: number
      y: number
    },
    elementId: string | null
  }


  // Element manipulation
  addElement: (element: Omit<Element, "id">) => void
  updateElement: (id: string, updates: Partial<Element>) => void
  updateMultipleElements: (updates: Partial<Element> | ((element: Element) => Partial<Element>)) => void
  deleteElement: (id: string) => void
  deleteSelectedElements: () => void
  selectElement: (id: string | null, addToSelection?: boolean) => void
  deselectElement: (id: string) => void
  selectMultipleElements: (ids: string[]) => void
  selectCanvas: (select: boolean) => void
  clearSelection: () => void
  changeCanvasSize: (size: CanvasSize) => void
  clearNewElementFlag: (id: string) => void
  scaleElement: (element: Element, scaleFactor: number) => Element
  fitCanvasToView: (container: HTMLDivElement, canvas: HTMLDivElement) => number
  toggleCanvasSelection: () => void

  // History
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void

  // Utility
  isElementSelected: (id: string) => boolean,
  
  // Text styling
  handleTextColorChange: (color: string) => void
  
  // Shape styling
  handleBackgroundColorChange: (color: string) => void

}