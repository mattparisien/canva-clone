"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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
  isNew?: boolean // Track if element was just created
}

interface CanvasContextType {
  elements: Element[]
  selectedElement: Element | null
  canvasSize: CanvasSize
  availableSizes: CanvasSize[]
  sizeCategories: string[]
  addElement: (element: Omit<Element, "id">) => void
  updateElement: (id: string, updates: Partial<Element>) => void
  selectElement: (id: string | null) => void
  changeCanvasSize: (size: CanvasSize) => void
  fitCanvasToView: (containerWidth: number, containerHeight: number) => number
  clearNewElementFlag: (id: string) => void
  scaleElement: (element: Element, scaleFactor: number) => Element
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined)

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [elements, setElements] = useState<Element[]>([])
  const [selectedElement, setSelectedElement] = useState<Element | null>(null)

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

  const addElement = (element: Omit<Element, "id">) => {
    // Ensure width and height are defined
    const width = element.width || 200
    const height = element.height || 50

    // Calculate center position
    const centeredX = (canvasSize.width - width) / 2
    const centeredY = (canvasSize.height - height) / 2

    const newElement = {
      ...element,
      // Ensure we use the calculated width/height
      width,
      height,
      // Set centered position
      x: centeredX,
      y: centeredY,
      id: `element-${Date.now()}`,
      isNew: true, // Mark as new element
    }

    setElements((prev) => [...prev, newElement])
    setSelectedElement(newElement)
  }

  const updateElement = (id: string, updates: Partial<Element>) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)))

    if (selectedElement?.id === id) {
      setSelectedElement((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  const selectElement = (id: string | null) => {
    if (!id) {
      setSelectedElement(null)
      return
    }

    const element = elements.find((el) => el.id === id)
    setSelectedElement(element || null)
  }

  const changeCanvasSize = (size: CanvasSize) => {
    console.log("Changing canvas size to:", size)
    setCanvasSize(size)
  }

  const fitCanvasToView = (containerWidth: number, containerHeight: number) => {
    // Account for padding and UI elements
    const availableWidth = containerWidth - 100 // 50px padding on each side
    const availableHeight = containerHeight - 160 // Account for top and bottom controls + padding

    const widthRatio = availableWidth / canvasSize.width
    const heightRatio = availableHeight / canvasSize.height

    // Use the smaller ratio to ensure the canvas fits entirely
    const fitScale = Math.min(widthRatio, heightRatio, 1) // Cap at 100%
    return Math.round(fitScale * 100) // Round to integer
  }

  const clearNewElementFlag = (id: string) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, isNew: false } : el)))

    if (selectedElement?.id === id) {
      setSelectedElement((prev) => (prev ? { ...prev, isNew: false } : null))
    }
  }

  const scaleElement = (element: Element, scaleFactor: number) => {
    if (element.type === "text" && element.fontSize) {
      const newFontSize = Math.max(8, Math.round((element.fontSize || 24) * scaleFactor))
      return {
        ...element,
        fontSize: newFontSize,
      }
    }
    return element
  }

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
        selectElement,
        changeCanvasSize,
        fitCanvasToView,
        clearNewElementFlag,
        scaleElement,
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
