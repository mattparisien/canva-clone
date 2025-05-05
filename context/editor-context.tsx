"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useMemo, useRef } from "react"
import { Element, Page, CanvasSize, EditorContextType } from "../types/canvas.types"
import { DEFAULT_CANVAS_SIZE } from "../constants/canvas-constants"
import { designsAPI } from "../lib/api"

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children }: { children: ReactNode }) {
  // Document metadata
  const [designName, setDesignName] = useState<string>("Untitled Design")
  const [isDesignSaved, setIsDesignSaved] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [designId, setDesignId] = useState<string | null>(null)
  
  // Auto-save timer reference
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  
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

  // Load design data on mount
  useEffect(() => {
    const loadDesignData = async () => {
      try {
        // Get design ID from URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        
        if (!id) {
          console.log('No design ID found in URL, creating new design');
          return;
        }

        setDesignId(id);
        
        // Load the design data
        const design = await designsAPI.getById(id);
        
        if (design) {
          console.log('Design loaded:', design.title);
          setDesignName(design.title || "Untitled Design");
          
          if (design.pages && design.pages.length > 0) {
            setPages(design.pages);
            setCurrentPageId(design.pages[0].id);
            setCurrentPageIndex(0);
          }
          
          setIsDesignSaved(true);
        }
      } catch (error) {
        console.error('Error loading design:', error);
      }
    };

    loadDesignData();
  }, []);

  // Schedule auto-save when changes are made
  useEffect(() => {
    if (!isDesignSaved && designId) {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      // Set a new timer for auto-save
      autoSaveTimerRef.current = setTimeout(() => {
        console.log('Auto-saving design...');
        saveDesign();
      }, 3000); // 3 seconds delay
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [pages, isDesignSaved, designId]);

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
    setIsDesignSaved(false)
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
    
    setIsDesignSaved(false)
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
      setIsDesignSaved(false)
    }
  }, [currentPage, currentPageId, currentPageIndex])

  // Update page content
  const updatePageElements = useCallback((pageId: string, elements: Element[]) => {
    setPages(prevPages => prevPages.map(page => 
      page.id === pageId 
        ? { ...page, elements } 
        : page
    ))
    setIsDesignSaved(false)
  }, [])

  const updatePageCanvasSize = useCallback((pageId: string, canvasSize: CanvasSize) => {
    setPages(prevPages => prevPages.map(page => 
      page.id === pageId 
        ? { ...page, canvasSize } 
        : page
    ))
    setIsDesignSaved(false)
  }, [])

  // Document management functions
  const renameDesign = useCallback((name: string) => {
    setDesignName(name)
    setIsDesignSaved(false)
  }, [])

  const saveDesign = useCallback(async () => {
    try {
      // Set saving indicator to true
      setIsSaving(true);
      
      // Use the saved design ID or get it from URL
      let idToUse = designId;
      
      if (!idToUse) {
        const urlParams = new URLSearchParams(window.location.search);
        idToUse = urlParams.get('id');
      }
      
      if (!idToUse) {
        console.error('No design ID found to save');
        setIsSaving(false);
        return;
      }

      // Prepare the data to be saved
      const designData = {
        title: designName,
        pages: pages,
        // Add other fields that might need updating
        updatedAt: new Date().toISOString()
      };

      // Call the API to update the design
      await designsAPI.update(idToUse, designData);
      
      console.log('Design saved successfully:', designName);
      setIsDesignSaved(true);
    } catch (error) {
      console.error('Error saving design:', error);
      // You might want to show a toast notification here
    } finally {
      // Set saving indicator back to false
      setIsSaving(false);
    }
  }, [designName, pages, designId]);

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
        saveDesign()
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
  }, [goToNextPage, goToPreviousPage, saveDesign])

  return (
    <EditorContext.Provider
      value={{
        // Document metadata
        designName,
        isDesignSaved,
        isSaving,
        renameDesign,
        saveDesign,
        
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