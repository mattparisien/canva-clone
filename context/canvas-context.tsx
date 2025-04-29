"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type ElementType = "text"
export type CanvasSize = {
  name: string
  width: number
  height: number
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

  const availableSizes = [
    { name: "Instagram Post", width: 1080, height: 1080 },
    { name: "Facebook Post", width: 1200, height: 630 },
    { name: "Twitter Post", width: 1200, height: 675 },
    { name: "A4", width: 794, height: 1123 },
  ]

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
    const widthRatio = containerWidth / canvasSize.width
    const heightRatio = containerHeight / canvasSize.height

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
