"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useMemo } from "react"
import { Element, Page, CanvasSize, EditorContextType } from "../types/canvas.types"
import { DEFAULT_CANVAS_SIZE } from "../constants/canvas-constants"

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children }: { children: ReactNode }) {
  // Document metadata
  const [documentName, setDocumentName] = useState<string>("Untitled Document")
  const [isDocumentSaved, setIsDocumentSaved] = useState<boolean>(true)
  
  // Page Management States
  const [pages, setPages] = useState<Page[]>(() => {
    // Initialize with a single page
    const initialPage: Page = {
      id: `page-${Date.now()}`,
      elements: [],
      canvasSize: DEFAULT_CANVAS_SIZE
    }
    return [initialPage]
  })
  
  const [currentPageId, setCurrentPageId] = useState<string | null>(pages[0]?.id || null)
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0)

  // Memoize the currentPage to prevent unnecessary recalculations
  const currentPage = useMemo(() => {
    return pages.find(page => page.id === currentPageId) || pages[0];
  }, [pages, currentPageId]);

  // Page Management Functions
  const addPage = useCallback(() => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      elements: [],
      canvasSize: currentPage?.canvasSize || DEFAULT_CANVAS_SIZE // Use the current canvas size for consistency
    }

    setPages(prevPages => {
      const newPages = [...prevPages, newPage]
      return newPages
    })

    // Switch to the new page
    setCurrentPageId(newPage.id)
    setCurrentPageIndex(pages.length)
  }, [currentPage, pages.length])

  const deletePage = useCallback((id: string) => {
    if (pages.length <= 1) {
      // Don't allow deleting the last page
      return
    }

    setPages(prevPages => {
      const newPages = prevPages.filter(page => page.id !== id)
      return newPages
    })

    // If the current page was deleted, switch to the previous page or the first page
    if (currentPageId === id) {
      const index = pages.findIndex(page => page.id === id)
      const newIndex = Math.max(0, index - 1)
      setCurrentPageId(pages[newIndex]?.id || null)
      setCurrentPageIndex(newIndex)
    } else {
      // Update the current page index
      setCurrentPageIndex(pages.findIndex(page => page.id === currentPageId))
    }
  }, [pages, currentPageId])

  const goToPage = useCallback((id: string) => {
    const pageIndex = pages.findIndex(page => page.id === id)
    if (pageIndex !== -1) {
      setCurrentPageId(id)
      setCurrentPageIndex(pageIndex)
    }
  }, [pages])

  const goToNextPage = useCallback(() => {
    if (currentPageIndex < pages.length - 1) {
      const nextPage = pages[currentPageIndex + 1]
      setCurrentPageId(nextPage.id)
      setCurrentPageIndex(currentPageIndex + 1)
    }
  }, [currentPageIndex, pages])

  const goToPreviousPage = useCallback(() => {
    if (currentPageIndex > 0) {
      const prevPage = pages[currentPageIndex - 1]
      setCurrentPageId(prevPage.id)
      setCurrentPageIndex(currentPageIndex - 1)
    }
  }, [currentPageIndex, pages])

  const duplicateCurrentPage = useCallback(() => {
    if (currentPage) {
      // Create deep copy of elements
      const duplicatedElements = JSON.parse(JSON.stringify(currentPage.elements))
      
      const newPage: Page = {
        id: `page-${Date.now()}`,
        elements: duplicatedElements,
        canvasSize: { ...currentPage.canvasSize }
      }

      setPages(prevPages => {
        // Find the current index and insert after it
        const currentIndex = prevPages.findIndex(page => page.id === currentPageId)
        const newPages = [
          ...prevPages.slice(0, currentIndex + 1),
          newPage,
          ...prevPages.slice(currentIndex + 1)
        ]
        
        return newPages
      })

      // Switch to the new page
      setCurrentPageId(newPage.id)
      setCurrentPageIndex(currentPageIndex + 1)
    }
  }, [currentPage, currentPageId, currentPageIndex])

  // Update page content
  const updatePageElements = useCallback((pageId: string, elements: Element[]) => {
    setPages(prevPages => prevPages.map(page => 
      page.id === pageId 
        ? { ...page, elements } 
        : page
    ))
    setIsDocumentSaved(false)
  }, [])

  const updatePageCanvasSize = useCallback((pageId: string, canvasSize: CanvasSize) => {
    setPages(prevPages => prevPages.map(page => 
      page.id === pageId 
        ? { ...page, canvasSize } 
        : page
    ))
    setIsDocumentSaved(false)
  }, [])

  // Document management functions
  const renameDocument = useCallback((name: string) => {
    setDocumentName(name)
    setIsDocumentSaved(false)
  }, [])

  const saveDocument = useCallback(() => {
    // Implement actual saving logic here (e.g., API call)
    console.log('Saving document:', documentName, pages)
    setIsDocumentSaved(true)
  }, [documentName, pages])

  // Handle keyboard shortcuts at document level
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the target is an input or textarea or contentEditable
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return
      }

      // Save: Ctrl/Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        saveDocument()
      }

      // Next page: Alt + Right arrow
      if (e.key === "ArrowRight" && e.altKey) {
        e.preventDefault()
        goToNextPage()
      }

      // Previous page: Alt + Left arrow
      if (e.key === "ArrowLeft" && e.altKey) {
        e.preventDefault()
        goToPreviousPage()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goToNextPage, goToPreviousPage, saveDocument])

  return (
    <EditorContext.Provider
      value={{
        // Document metadata
        documentName,
        isDocumentSaved,
        renameDocument,
        saveDocument,
        
        // Page management
        pages,
        currentPageId,
        currentPage,
        currentPageIndex,
        addPage,
        deletePage,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        duplicateCurrentPage,
        
        // Page content updates
        updatePageElements,
        updatePageCanvasSize,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider")
  }
  return context
}