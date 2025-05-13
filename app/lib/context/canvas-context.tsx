"use client"

import { createContext, useContext, ReactNode } from "react"
import { CanvasContextType } from "../types/canvas.types"
import useCanvasStore, {
  useCurrentPageElements,
  useCurrentCanvasSize
} from "../stores/useCanvasStore"

// Create a context for backward compatibility
const CanvasContext = createContext<CanvasContextType | undefined>(undefined)

export function CanvasProvider({ children }: { children: ReactNode }) {
  // Get the current state from the store
  const store = useCanvasStore();
  
  // Get the current elements and canvas size
  const elements = useCurrentPageElements();
  const canvasSize = useCurrentCanvasSize();
  
  // Create the context value
  const contextValue: CanvasContextType = {
    // Canvas elements and properties
    elements,
    selectedElement: store.selectedElement,
    selectedElementIds: store.selectedElementIds,
    isCanvasSelected: store.isCanvasSelected,
    canvasSize,
    isLoaded: store.isLoaded,
    
    // Element manipulation
    addElement: store.addElement,
    updateElement: store.updateElement,
    updateMultipleElements: store.updateMultipleElements,
    deleteElement: store.deleteElement,
    deleteSelectedElements: store.deleteSelectedElements,
    selectElement: store.selectElement,
    selectMultipleElements: store.selectMultipleElements,
    selectCanvas: store.selectCanvas,
    clearSelection: store.clearSelection,
    changeCanvasSize: store.changeCanvasSize,
    fitCanvasToView: store.fitCanvasToView,
    clearNewElementFlag: store.clearNewElementFlag,
    scaleElement: store.scaleElement,
    
    // History
    canUndo: store.canUndo,
    canRedo: store.canRedo,
    undo: store.undo,
    redo: store.redo,
    
    // Utility
    isElementSelected: store.isElementSelected,
  };

  return (
    <CanvasContext.Provider value={contextValue}>
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
}
export type { Element }

