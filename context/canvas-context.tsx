"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"

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
}

// Define the types of actions that can be performed
export type HistoryAction =
  | { type: "ADD_ELEMENT"; element: Element }
  | { type: "UPDATE_ELEMENT"; id: string; before: Partial<Element>; after: Partial<Element> }
  | { type: "DELETE_ELEMENT"; element: Element }
  | { type: "CHANGE_CANVAS_SIZE"; before: CanvasSize; after: CanvasSize }

interface CanvasContextType {
  elements: Element[]
  selectedElement: Element | null
  canvasSize: CanvasSize
  availableSizes: CanvasSize[]
  sizeCategories: string[]
  addElement: (element: Omit<Element, "id">) => void
  updateElement: (id: string, updates: Partial<Element>) => void
  deleteElement: (id: string) => void
  selectElement: (id: string | null) => void
  changeCanvasSize: (size: CanvasSize) => void
  fitCanvasToView: (containerWidth: number, containerHeight: number) => number
  clearNewElementFlag: (id: string) => void
  scaleElement: (element: Element, scaleFactor: number) => Element
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined)

// Default font size as a percentage of canvas width
const DEFAULT_TEXT_FONT_SIZE_RATIO = 0.09 // 4% of canvas width

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [elements, setElements] = useState<Element[]>([])
  const [selectedElement, setSelectedElement] = useState<Element | null>(null)

  // History stacks for undo/redo
  const [history, setHistory] = useState<HistoryAction[]>([])
  const [redoStack, setRedoStack] = useState<HistoryAction[]>([])

  // Define available canvas sizes with categories
  const availableSizes: CanvasSize[] = [
    // Social Media - Instagram
    { name: "Instagram Post", width: 1080, height: 1080, category: "Instagram" },
    { name: "Instagram Story", width: 1080, height: 1920, category: "Instagram" },
    { name: "Instagram Reels", width: 1080, height: 1920, category: "Instagram" },
    { name: "Instagram Profile", width: 320, height: 320, category: "Instagram" },

    // Social Media - Facebook
    { name: "Facebook Post", width: 1200, height: 630, category: "Facebook" },
    { name: "Facebook Cover", width: 851, height: 315, category: "Facebook" },
    { name: "Facebook Story", width: 1080, height: 1920, category: "Facebook" },
    { name: "Facebook Ad", width: 1200, height: 628, category: "Facebook" },

    // Social Media - Twitter/X
    { name: "Twitter Post", width: 1200, height: 675, category: "Twitter" },
    { name: "Twitter Header", width: 1500, height: 500, category: "Twitter" },
    { name: "Twitter Profile", width: 400, height: 400, category: "Twitter" },

    // Social Media - LinkedIn
    { name: "LinkedIn Post", width: 1200, height: 627, category: "LinkedIn" },
    { name: "LinkedIn Cover", width: 1584, height: 396, category: "LinkedIn" },
    { name: "LinkedIn Profile", width: 400, height: 400, category: "LinkedIn" },

    // Social Media - YouTube
    { name: "YouTube Thumbnail", width: 1280, height: 720, category: "YouTube" },
    { name: "YouTube Channel Art", width: 2560, height: 1440, category: "YouTube" },

    // Social Media - TikTok
    { name: "TikTok Video", width: 1080, height: 1920, category: "TikTok" },
    { name: "TikTok Profile", width: 200, height: 200, category: "TikTok" },

    // Print
    { name: "A4", width: 794, height: 1123, category: "Print" },
    { name: "A5", width: 559, height: 794, category: "Print" },
    { name: "US Letter", width: 816, height: 1056, category: "Print" },
    { name: "US Legal", width: 816, height: 1344, category: "Print" },

    // Presentation
    { name: "Presentation 16:9", width: 1280, height: 720, category: "Presentation" },
    { name: "Presentation 4:3", width: 1024, height: 768, category: "Presentation" },

    // Custom
    { name: "Square", width: 1000, height: 1000, category: "Custom" },
    { name: "Landscape", width: 1280, height: 720, category: "Custom" },
    { name: "Portrait", width: 720, height: 1280, category: "Custom" },
  ]

  // Extract unique categories
  const sizeCategories = Array.from(new Set(availableSizes.map((size) => size.category || "Other")))

  const [canvasSize, setCanvasSize] = useState<CanvasSize>(availableSizes[0])

  // Debug log when canvas size changes
  useEffect(() => {
    console.log("Canvas size set to:", canvasSize)
  }, [canvasSize])

  // Helper function to add an action to history
  const addToHistory = useCallback((action: HistoryAction) => {
    setHistory((prev) => [...prev, action])
    // Clear redo stack when a new action is performed
    setRedoStack([])
  }, [])

  // Update the addElement function to better handle text element sizing and track history
  const addElement = useCallback(
    (element: Omit<Element, "id">) => {
      // For text elements, calculate a more precise width
      let width = element.width || 200
      let height = element.height || 50
      let fontSize = element.fontSize

      if (element.type === "text") {
        // Use default font size as a percentage of canvas width if not provided
        fontSize = fontSize || Math.round(canvasSize.width * DEFAULT_TEXT_FONT_SIZE_RATIO)
      }

      if (element.type === "text" && element.content) {
        // More precise calculation for text elements
        const contentLength = element.content.length
        // Adjust width based on content length and font size
        width = Math.max(contentLength * (fontSize || 36) * 0.5, (fontSize || 36) * 2)
        // Adjust height based on font size
        height = (fontSize || 36) * 1.2
      }

      // Calculate center position
      const centeredX = (canvasSize.width - width) / 2
      const centeredY = (canvasSize.height - height) / 2

      const newElement = {
        ...element,
        width,
        height,
        fontSize,
        x: centeredX,
        y: centeredY,
        id: `element-${Date.now()}`,
        isNew: true, // Mark as new element
      }

      setElements((prev) => {
        const newElements = [...prev, newElement]
        // Add to history
        addToHistory({
          type: "ADD_ELEMENT",
          element: newElement,
        })
        return newElements
      })

      setSelectedElement(newElement)
    },
    [canvasSize, addToHistory],
  )

  const updateElement = useCallback(
    (id: string, updates: Partial<Element>) => {
      setElements((prev) => {
        const element = prev.find((el) => el.id === id)
        if (!element) return prev

        // Store the previous state for history
        const before: Partial<Element> = {}
        Object.keys(updates).forEach((key) => {
          before[key as keyof Element] = element[key as keyof Element]
        })

        // Add to history
        addToHistory({
          type: "UPDATE_ELEMENT",
          id,
          before,
          after: updates,
        })

        return prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
      })

      if (selectedElement?.id === id) {
        setSelectedElement((prev) => (prev ? { ...prev, ...updates } : null))
      }
    },
    [selectedElement, addToHistory],
  )

  const deleteElement = useCallback(
    (id: string) => {
      setElements((prev) => {
        const element = prev.find((el) => el.id === id)
        if (!element) return prev

        // Add to history
        addToHistory({
          type: "DELETE_ELEMENT",
          element,
        })

        return prev.filter((el) => el.id !== id)
      })

      if (selectedElement?.id === id) {
        setSelectedElement(null)
      }
    },
    [selectedElement, addToHistory],
  )

  const selectElement = useCallback(
    (id: string | null) => {
      if (!id) {
        setSelectedElement(null)
        return
      }

      const element = elements.find((el) => el.id === id)
      setSelectedElement(element || null)
    },
    [elements],
  )

  const changeCanvasSize = useCallback(
    (size: CanvasSize) => {
      console.log("Changing canvas size to:", size)

      // Add to history
      addToHistory({
        type: "CHANGE_CANVAS_SIZE",
        before: canvasSize,
        after: size,
      })

      setCanvasSize(size)
    },
    [canvasSize, addToHistory],
  )

  const fitCanvasToView = useCallback(
    (containerWidth: number, containerHeight: number) => {
      // Account for padding and UI elements
      const availableWidth = containerWidth - 100 // 50px padding on each side
      const availableHeight = containerHeight - 160 // Account for top and bottom controls + padding

      const widthRatio = availableWidth / canvasSize.width
      const heightRatio = availableHeight / canvasSize.height

      // Use the smaller ratio to ensure the canvas fits entirely
      const fitScale = Math.min(widthRatio, heightRatio, 1) // Cap at 100%
      return Math.round(fitScale * 100) // Round to integer
    },
    [canvasSize.width, canvasSize.height],
  )

  const clearNewElementFlag = useCallback(
    (id: string) => {
      setElements((prev) => prev.map((el) => (el.id === id ? { ...el, isNew: false } : el)))

      if (selectedElement?.id === id) {
        setSelectedElement((prev) => (prev ? { ...prev, isNew: false } : null))
      }
    },
    [selectedElement],
  )

  const scaleElement = useCallback((element: Element, scaleFactor: number) => {
    if (element.type === "text" && element.fontSize) {
      const newFontSize = Math.max(8, Math.round((element.fontSize || 36) * scaleFactor))
      return {
        ...element,
        fontSize: newFontSize,
      }
    }
    return element
  }, [])

  // Undo functionality
  const undo = useCallback(() => {
    if (history.length === 0) return

    // Get the last action from history
    const lastAction = history[history.length - 1]

    // Remove the last action from history
    setHistory((prev) => prev.slice(0, -1))

    // Add to redo stack
    setRedoStack((prev) => [...prev, lastAction])

    // Apply the reverse of the action
    switch (lastAction.type) {
      case "ADD_ELEMENT":
        setElements((prev) => prev.filter((el) => el.id !== lastAction.element.id))
        if (selectedElement?.id === lastAction.element.id) {
          setSelectedElement(null)
        }
        break

      case "UPDATE_ELEMENT":
        setElements((prev) => prev.map((el) => (el.id === lastAction.id ? { ...el, ...lastAction.before } : el)))
        if (selectedElement?.id === lastAction.id) {
          setSelectedElement((prev) => (prev ? { ...prev, ...lastAction.before } : null))
        }
        break

      case "DELETE_ELEMENT":
        setElements((prev) => [...prev, lastAction.element])
        break

      case "CHANGE_CANVAS_SIZE":
        setCanvasSize(lastAction.before)
        break
    }
  }, [history, selectedElement])

  // Redo functionality
  const redo = useCallback(() => {
    if (redoStack.length === 0) return

    // Get the last action from redo stack
    const nextAction = redoStack[redoStack.length - 1]

    // Remove the action from redo stack
    setRedoStack((prev) => prev.slice(0, -1))

    // Add back to history
    setHistory((prev) => [...prev, nextAction])

    // Apply the action
    switch (nextAction.type) {
      case "ADD_ELEMENT":
        setElements((prev) => [...prev, nextAction.element])
        break

      case "UPDATE_ELEMENT":
        setElements((prev) => prev.map((el) => (el.id === nextAction.id ? { ...el, ...nextAction.after } : el)))
        if (selectedElement?.id === nextAction.id) {
          setSelectedElement((prev) => (prev ? { ...prev, ...nextAction.after } : null))
        }
        break

      case "DELETE_ELEMENT":
        setElements((prev) => prev.filter((el) => el.id !== nextAction.element.id))
        if (selectedElement?.id === nextAction.element.id) {
          setSelectedElement(null)
        }
        break

      case "CHANGE_CANVAS_SIZE":
        setCanvasSize(nextAction.after)
        break
    }
  }, [redoStack, selectedElement])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the target is an input or textarea or contentEditable
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return
      }

      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((e.ctrlKey || e.metaKey) && ((e.key === "z" && e.shiftKey) || e.key === "y")) {
        e.preventDefault()
        redo()
      }

      // Add text element: T key (no modifiers)
      if (
        (e.key === "t" || e.key === "T") &&
        !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey
      ) {
        e.preventDefault()
        addElement({
          type: "text",
          x: 0,
          y: 0,
          width: 200,
          height: 44,
          content: "Add your text here",
          fontSize: Math.round(canvasSize.width * DEFAULT_TEXT_FONT_SIZE_RATIO),
          fontFamily: "Inter",
        })
      }

      // Delete selected element: Delete or Backspace key
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedElement &&
        !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey
      ) {
        e.preventDefault()
        deleteElement(selectedElement.id)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo, addElement, deleteElement, selectedElement])

  return (
    <CanvasContext.Provider
      value={{
        elements,
        selectedElement,
        canvasSize,
        availableSizes,
        sizeCategories,
        addElement,
        updateElement,
        deleteElement,
        selectElement,
        changeCanvasSize,
        fitCanvasToView,
        clearNewElementFlag,
        scaleElement,
        canUndo: history.length > 0,
        canRedo: redoStack.length > 0,
        undo,
        redo,
      }}
    >
      {children}
    </CanvasContext.Provider>
  )
}

export function useCanvas() {
  const context = useContext(CanvasContext)
  if (context === undefined) {
    throw new Error("useCanvas must be used within a CanvasProvider")
  }
  return context
}
