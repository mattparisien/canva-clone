"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useMemo, useRef } from "react"
import { Element, Page, CanvasSize, EditorContextType } from "../types/canvas.types"
import { DEFAULT_CANVAS_SIZE } from "../constants/canvas"
import { projectsAPI } from "../api"

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children }: { children: ReactNode }) {
  // Document metadata
  const [designName, setDesignName] = useState<string>("Untitled Design")
  const [isDesignSaved, setIsDesignSaved] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [designId, setDesignId] = useState<string | null>(null)
  
  // Editor mode - default to edit mode
  const [isEditMode, setIsEditMode] = useState<boolean>(true)
  
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
        const design = await projectsAPI.getById(id);
        
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

      // Capture canvas screenshot for thumbnail
      const thumbnailImage = await captureCanvasScreenshot();

      // Prepare the data to be saved
      const designData = {
        title: designName,
        pages: pages,
        updatedAt: new Date().toISOString(),
        thumbnail: thumbnailImage // Add the thumbnail data
      };

      console.log('Saving design:', designName, 'with ID:', idToUse);
      
      // Call the API to update the design
      await projectsAPI.update(idToUse, designData);
      
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

  // Function to capture canvas screenshot
  const captureCanvasScreenshot = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      try {
        // Use a longer delay to ensure all rendering and text calculations are complete
        setTimeout(async () => {
          // Find the canvas element in the DOM - targeting the specific canvas element
          const canvasElement = document.querySelector('.canvas-wrapper');
          
          if (!canvasElement) {
            console.error('Canvas element not found for screenshot');
            resolve(null);
            return;
          }

          try {
            // Create a clone of the canvas for screenshot to avoid modifying the visible one
            const canvasClone = canvasElement.cloneNode(true) as HTMLElement;
            document.body.appendChild(canvasClone);
            canvasClone.style.position = 'absolute';
            canvasClone.style.left = '-9999px';
            canvasClone.style.top = '-9999px';
            
            // Make sure all text elements are properly sized with adequate padding
            const textElements = canvasClone.querySelectorAll('.text-element');
            textElements.forEach((textEl) => {
              const el = textEl as HTMLElement;
              el.style.padding = '4px';
              el.style.lineHeight = '1.5';
              el.style.overflow = 'visible'; // Ensure text isn't clipped
            });

            // Use html2canvas to capture the clone
            const { default: html2canvas } = await import('html2canvas');
            const canvas = await html2canvas(canvasClone, {
              scale: 2, // Higher scale for better quality
              backgroundColor: '#ffffff',
              logging: false,
              useCORS: true,
              allowTaint: true,
              windowWidth: canvasClone.offsetWidth * 2,
              windowHeight: canvasClone.offsetHeight * 2
            });
            
            // Clean up the clone
            document.body.removeChild(canvasClone);
            
            // Convert canvas to data URL (PNG format with good quality)
            const thumbnailDataUrl = canvas.toDataURL('image/png', 0.9);
            console.log('Screenshot captured successfully');
            resolve(thumbnailDataUrl);
          } catch (err) {
            console.error('Failed to generate canvas screenshot:', err);
            resolve(null);
          }
        }, 300); // Longer delay to ensure rendering is complete
      } catch (error) {
        console.error('Error in screenshot capture process:', error);
        resolve(null);
      }
    });
  }, []);

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

  // Toggle between edit mode and view mode
  const toggleEditMode = useCallback(() => {
    setIsEditMode(prevMode => !prevMode)
  }, [])

  return (
    <EditorContext.Provider
      value={{
        // Document metadata
        designName,
        isDesignSaved,
        isSaving,
        renameDesign,
        saveDesign,
        
        // Editor mode
        isEditMode,
        toggleEditMode,
        
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