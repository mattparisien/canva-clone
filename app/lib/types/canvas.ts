export type ElementType = "text" | "image" | "shape"

export type CanvasSize = {
  name: string
  width: number
  height: number
  category?: string
}

export interface Element {
  id: string
  kind: ElementType // Changed from 'type' to match backend discriminator
  x: number
  y: number
  width: number
  height: number
  rotation?: number // For element rotation
  opacity?: number // Element opacity
  zIndex?: number // Element z-index for layering
  rect?: { // Viewport-relative position and dimensions (frontend-only)
    x: number
    y: number
    width: number
    height: number
  }
  // Text-specific properties
  content?: string
  fontSize?: number
  fontFamily?: string
  textAlign?: "left" | "center" | "right"
  bold?: boolean // Bold formatting (renamed from isBold)
  italic?: boolean // Italic formatting (renamed from isItalic)
  underline?: boolean // Underline formatting (renamed from isUnderlined)
  color?: string // Text color (renamed from textColor)
  // Image-specific properties
  src?: string // Image source URL
  alt?: string // Image alt text
  // Shape-specific properties
  shapeType?: "rect" | "circle" | "triangle" // Shape type (updated values)
  backgroundColor?: string // For shapes with background
  borderWidth?: number // For shapes with borders
  borderColor?: string // For shape borders
  borderStyle?: "solid" | "dashed" | "dotted" // For shape borders (frontend-only)
  // Frontend-only properties
  isNew?: boolean // Track if element was just created
  locked?: boolean // Whether the element is locked for editing
  isEditable?: boolean // Whether the element can be edited
  isStrikethrough?: boolean // Strikethrough formatting (frontend-only)
}

export interface Page {
  id?: string // Optional for compatibility (frontend-generated)
  name?: string // Page name
  canvas: { // Canvas size (matches backend structure)
    width: number
    height: number
  }
  background?: { // Page background
    type: 'color' | 'image' | 'gradient'
    value?: string
  }
  elements: Element[]
  thumbnail?: string // Optional thumbnail for page preview (frontend-only)
  canvasSize?: CanvasSize // For backward compatibility (frontend-only)
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