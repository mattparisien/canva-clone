import { useState, useCallback } from "react"
import { HistoryAction, Element, CanvasSize } from "../types/canvas.types"

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
      setCanvasSize: (size: CanvasSize) => void
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
      setCanvasSize: (size: CanvasSize) => void
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