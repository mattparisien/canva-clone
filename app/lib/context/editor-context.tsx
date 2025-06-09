"use client"

import { createContext, useContext, type ReactNode, useEffect } from "react"
import { EditorContextType } from "../types/canvas"
import useEditorStore, { 
  useCurrentPage,
  setupAutoSave, 
  setupKeyboardShortcuts,
  initializeDesign 
} from "../stores/useEditorStore"

// Create a context for backward compatibility
const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children }: { children: ReactNode }) {
  // Initialize the design data on mount
  useEffect(() => {
    initializeDesign();
  }, []);
  
  // Setup auto-save functionality
  useEffect(() => {
    const cleanupAutoSave = setupAutoSave();
    return cleanupAutoSave;
  }, []);
  
  // Setup keyboard shortcuts
  useEffect(() => {
    const cleanupKeyboardShortcuts = setupKeyboardShortcuts();
    return cleanupKeyboardShortcuts;
  }, []);

  // Get the current state from the store
  const store = useEditorStore();
  
  // Get the current page
  const currentPage = useCurrentPage();
  
  // Create the context value
  const contextValue: EditorContextType = {
    // Document metadata
    designName: store.designName,
    isDesignSaved: store.isDesignSaved,
    isSaving: store.isSaving,
    renameDesign: store.renameDesign,
    saveDesign: store.saveDesign,
    
    // Editor mode
    isEditMode: store.isEditMode,
    toggleEditMode: store.toggleEditMode,
    
    // Page management
    pages: store.pages,
    currentPageId: store.currentPageId,
    currentPage: currentPage,
    currentPageIndex: store.currentPageIndex,
    addPage: store.addPage,
    deletePage: store.deletePage,
    goToPage: store.goToPage,
    goToNextPage: store.goToNextPage,
    goToPreviousPage: store.goToPreviousPage,
    duplicateCurrentPage: store.duplicateCurrentPage,
    
    // Page content updates
    updatePageElements: store.updatePageElements,
    updatePageCanvasSize: store.updatePageCanvasSize,
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}