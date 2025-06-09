import { useState, useCallback } from "react"
import { HistoryAction, Element, CanvasSize, Page } from "../types/canvas"

/**
 * Custom hook for managing canvas action history for undo/redo functionality
 */
export function useCanvasHistory() {
  const [history, setHistory] = useState<HistoryAction[]>([])
  const [redoStack, setRedoStack] = useState<HistoryAction[]>([])

  const addToHistory = useCallback((action: HistoryAction) => {
    setHistory((prev) => [...prev, action])
    // Clear redo stack when a new action is performed
    setRedoStack([])
  }, [])

  // Undo functionality
  const undo = useCallback(
    (
      elements: Element[],
      setElements: (elements: Element[]) => void,
      selectedElement: Element | null,
      setSelectedElement: (element: Element | null) => void,
      setCanvasSize: (size: CanvasSize) => void,
      pages?: Page[],
      setPages?: (pages: Page[]) => void,
      currentPageId?: string | null,
      setCurrentPageId?: (id: string | null) => void
    ) => {
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
          setElements(elements.filter((el) => el.id !== lastAction.element.id))
          if (selectedElement?.id === lastAction.element.id) {
            setSelectedElement(null)
          }
          break

        case "UPDATE_ELEMENT":
          setElements(
            elements.map((el) => (el.id === lastAction.id ? { ...el, ...lastAction.before } : el))
          )
          if (selectedElement?.id === lastAction.id) {
            setSelectedElement(
              selectedElement ? { ...selectedElement, ...lastAction.before } : null
            )
          }
          break

        case "DELETE_ELEMENT":
          setElements([...elements, lastAction.element])
          break

        case "CHANGE_CANVAS_SIZE":
          setCanvasSize(lastAction.before)
          break
          
        case "ADD_PAGE":
          // Remove the page if pages state is available
          if (pages && setPages) {
            setPages(pages.filter(page => page.id !== lastAction.page.id))
            
            // If the current page was the one we're removing, go back to the previous page
            if (currentPageId === lastAction.page.id && setCurrentPageId) {
              const index = pages.findIndex(page => page.id === lastAction.page.id)
              if (index > 0) {
                setCurrentPageId(pages[index - 1].id)
              } else if (pages.length > 1) {
                setCurrentPageId(pages[1].id)
              } else {
                setCurrentPageId(null)
              }
            }
          }
          break
          
        case "DELETE_PAGE":
          // Add the page back if pages state is available
          if (pages && setPages) {
            setPages([...pages, lastAction.page])
          }
          break
          
        case "REORDER_PAGES":
          // Revert to the previous order if pages state is available
          if (pages && setPages) {
            const reorderedPages = [...pages]
            // Create a new array with the previous order
            const previousOrder = lastAction.before.map(id => 
              pages.find(page => page.id === id)
            ).filter(Boolean) as Page[]
            setPages(previousOrder)
          }
          break
      }
    },
    [history]
  )

  // Redo functionality
  const redo = useCallback(
    (
      elements: Element[],
      setElements: (elements: Element[]) => void,
      selectedElement: Element | null,
      setSelectedElement: (element: Element | null) => void,
      setCanvasSize: (size: CanvasSize) => void,
      pages?: Page[],
      setPages?: (pages: Page[]) => void,
      currentPageId?: string | null,
      setCurrentPageId?: (id: string | null) => void
    ) => {
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
          setElements([...elements, nextAction.element])
          break

        case "UPDATE_ELEMENT":
          setElements(
            elements.map((el) => (el.id === nextAction.id ? { ...el, ...nextAction.after } : el))
          )
          if (selectedElement?.id === nextAction.id) {
            setSelectedElement(
              selectedElement ? { ...selectedElement, ...nextAction.after } : null
            )
          }
          break

        case "DELETE_ELEMENT":
          setElements(elements.filter((el) => el.id !== nextAction.element.id))
          if (selectedElement?.id === nextAction.element.id) {
            setSelectedElement(null)
          }
          break

        case "CHANGE_CANVAS_SIZE":
          setCanvasSize(nextAction.after)
          break
          
        case "ADD_PAGE":
          // Add the page back if pages state is available
          if (pages && setPages) {
            setPages([...pages, nextAction.page])
            
            // Optionally switch to the newly added page
            if (setCurrentPageId) {
              setCurrentPageId(nextAction.page.id)
            }
          }
          break
          
        case "DELETE_PAGE":
          // Remove the page if pages state is available
          if (pages && setPages) {
            setPages(pages.filter(page => page.id !== nextAction.page.id))
            
            // If the current page was the one we're removing, go back to the first page
            if (currentPageId === nextAction.page.id && setCurrentPageId && pages.length > 0) {
              setCurrentPageId(pages[0].id)
            }
          }
          break
          
        case "REORDER_PAGES":
          // Apply the new order if pages state is available
          if (pages && setPages) {
            // Create a new array with the new order
            const newOrder = nextAction.after.map(id => 
              pages.find(page => page.id === id)
            ).filter(Boolean) as Page[]
            setPages(newOrder)
          }
          break
      }
    },
    [redoStack]
  )

  return {
    history,
    redoStack,
    canUndo: history.length > 0,
    canRedo: redoStack.length > 0,
    addToHistory,
    undo,
    redo,
  }
}