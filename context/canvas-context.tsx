"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useMemo } from "react"
import { Element, Page, CanvasContextType, CanvasSize } from "../types/canvas.types"
import { 
  DEFAULT_TEXT_FONT_SIZE_RATIO, 
  AVAILABLE_CANVAS_SIZES, 
  DEFAULT_CANVAS_SIZE 
} from "../constants/canvas-constants"
import { 
  measureTextWidth, 
  scaleElement as scaleElementUtil, 
  fitCanvasToView as fitCanvasToViewUtil 
} from "../utils/canvas-utils"
import { useCanvasHistory } from "../hooks/use-canvas-history"
import { createTextElement } from "../factories/element-factories"

const CanvasContext = createContext<CanvasContextType | undefined>(undefined)

export function CanvasProvider({ children }: { children: ReactNode }) {
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

  // Memoize the currentPage to prevent unnecessary recalculations and re-renders
  const currentPage = useMemo(() => {
    return pages.find(page => page.id === currentPageId) || pages[0];
  }, [pages, currentPageId]);

  // Elements and canvas size are derived from the current page
  // This approach prevents circular updates by removing state that depends on other state
  const [elements, setElements] = useState<Element[]>([])
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(DEFAULT_CANVAS_SIZE)
  
  // Initialize elements and canvas size from current page on mount and page change
  useEffect(() => {
    if (currentPage) {
      setElements(currentPage.elements);
      setCanvasSize(currentPage.canvasSize);
    }
  }, [currentPage?.id]); // Only depend on the ID, not the entire object

  // Selection states
  const [selectedElement, setSelectedElement] = useState<Element | null>(null)
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([])
  const [isCanvasSelected, setIsCanvasSelected] = useState<boolean>(false)

  // Extract unique categories
  const sizeCategories = Array.from(
    new Set(AVAILABLE_CANVAS_SIZES.map((size) => size.category || "Other"))
  )
  
  const {
    addToHistory,
    undo: historyUndo,
    redo: historyRedo,
    canUndo,
    canRedo
  } = useCanvasHistory()

  // Synchronize elements with the current page
  useEffect(() => {
    if (currentPageId) {
      setPages(prevPages => prevPages.map(page => 
        page.id === currentPageId 
          ? { ...page, elements: elements } 
          : page
      ))
    }
  }, [elements, currentPageId])

  // Page Management Functions
  const addPage = useCallback(() => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      elements: [],
      canvasSize: canvasSize // Use the current canvas size for consistency
    }

    setPages(prevPages => {
      const newPages = [...prevPages, newPage]
      
      // Add to history
      addToHistory({
        type: "ADD_PAGE",
        page: newPage
      })
      
      return newPages
    })

    // Switch to the new page
    setCurrentPageId(newPage.id)
    setCurrentPageIndex(pages.length)
    
    // Clear selection when switching pages
    setSelectedElement(null)
    setSelectedElementIds([])
    setIsCanvasSelected(false)
  }, [canvasSize, pages.length, addToHistory])

  const deletePage = useCallback((id: string) => {
    if (pages.length <= 1) {
      // Don't allow deleting the last page
      return
    }

    setPages(prevPages => {
      const pageToDelete = prevPages.find(page => page.id === id)
      if (!pageToDelete) return prevPages

      // Add to history
      addToHistory({
        type: "DELETE_PAGE",
        page: pageToDelete
      })

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
  }, [pages, currentPageId, addToHistory])

  const goToPage = useCallback((id: string) => {
    const pageIndex = pages.findIndex(page => page.id === id)
    if (pageIndex !== -1) {
      setCurrentPageId(id)
      setCurrentPageIndex(pageIndex)
      
      // Clear selection when switching pages
      setSelectedElement(null)
      setSelectedElementIds([])
      setIsCanvasSelected(false)
    }
  }, [pages])

  const goToNextPage = useCallback(() => {
    if (currentPageIndex < pages.length - 1) {
      const nextPage = pages[currentPageIndex + 1]
      setCurrentPageId(nextPage.id)
      setCurrentPageIndex(currentPageIndex + 1)
      
      // Clear selection when switching pages
      setSelectedElement(null)
      setSelectedElementIds([])
      setIsCanvasSelected(false)
    }
  }, [currentPageIndex, pages])

  const goToPreviousPage = useCallback(() => {
    if (currentPageIndex > 0) {
      const prevPage = pages[currentPageIndex - 1]
      setCurrentPageId(prevPage.id)
      setCurrentPageIndex(currentPageIndex - 1)
      
      // Clear selection when switching pages
      setSelectedElement(null)
      setSelectedElementIds([])
      setIsCanvasSelected(false)
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
        
        // Add to history
        addToHistory({
          type: "ADD_PAGE",
          page: newPage
        })
        
        return newPages
      })

      // Switch to the new page
      setCurrentPageId(newPage.id)
      setCurrentPageIndex(currentPageIndex + 1)
      
      // Clear selection when switching pages
      setSelectedElement(null)
      setSelectedElementIds([])
      setIsCanvasSelected(false)
    }
  }, [currentPage, currentPageId, currentPageIndex, addToHistory])

  const addElement = useCallback(
    (elementData: Omit<Element, "id">) => {
      if (!currentPageId) return;

      let newElement: Element;
      
      // Create element with the appropriate factory based on type
      if (elementData.type === "text") {
        const textElement = createTextElement(
          elementData,
          canvasSize.width,
          canvasSize.height
        )
        
        newElement = {
          ...textElement,
          id: `element-${Date.now()}`
        }
      } else {
        // Future element types would be handled here
        newElement = {
          ...elementData,
          id: `element-${Date.now()}`,
          isNew: true
        }
      }

      setElements((prev) => {
        const newElements = [...prev, newElement]
        addToHistory({
          type: "ADD_ELEMENT",
          element: newElement,
          pageId: currentPageId
        })
        return newElements
      })

      // Deselect canvas when a new element is created
      setIsCanvasSelected(false)
      
      // Set the new element as selected
      setSelectedElement(newElement)
      setSelectedElementIds([newElement.id])
    },
    [canvasSize, addToHistory, currentPageId]
  )

  const updateElement = useCallback(
    (id: string, updates: Partial<Element>) => {
      if (!currentPageId) return;

      setElements((prev) => {
        const element = prev.find((el) => el.id === id)
        if (!element) return prev

        // Store the previous state for history
        const before: Partial<Element> = {}
        Object.keys(updates).forEach((key) => {
          const value = element[key as keyof Element]
          // Only assign if value is defined
          if (value !== undefined) {
            (before as any)[key] = value
          }
        })

        // Add to history
        addToHistory({
          type: "UPDATE_ELEMENT",
          id,
          before,
          after: updates,
          pageId: currentPageId
        })

        return prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
      })

      if (selectedElement?.id === id) {
        setSelectedElement((prev) => (prev ? { ...prev, ...updates } : null))
      }
    },
    [selectedElement, addToHistory, currentPageId]
  )

  const updateMultipleElements = useCallback(
    (updates: Partial<Element> | ((element: Element) => Partial<Element>)) => {
      if (!currentPageId) return;

      setElements((prev) => {
        const updatedElements = prev.map((el) => {
          if (selectedElementIds.includes(el.id)) {
            // Process updates based on whether it's a function or an object
            const updatesToApply = typeof updates === 'function' 
              ? updates(el) 
              : updates;
            
            // Store the previous state for history
            const before: Partial<Element> = {};
            Object.keys(updatesToApply).forEach((key) => {
              const value = el[key as keyof Element];
              // Only assign if value is defined
              if (value !== undefined) {
                (before as any)[key] = value;
              }
            });

            // Add to history
            addToHistory({
              type: "UPDATE_ELEMENT",
              id: el.id,
              before,
              after: updatesToApply,
              pageId: currentPageId
            });

            return { ...el, ...updatesToApply };
          }
          return el;
        });
        return updatedElements;
      });
    },
    [selectedElementIds, addToHistory, currentPageId]
  )

  const deleteElement = useCallback(
    (id: string) => {
      if (!currentPageId) return;

      setElements((prev) => {
        const element = prev.find((el) => el.id === id)
        if (!element) return prev

        // Add to history
        addToHistory({
          type: "DELETE_ELEMENT",
          element,
          pageId: currentPageId
        })

        return prev.filter((el) => el.id !== id)
      })

      if (selectedElement?.id === id) {
        setSelectedElement(null)
      }
    },
    [selectedElement, addToHistory, currentPageId]
  )

  const deleteSelectedElements = useCallback(() => {
    if (!currentPageId) return;

    setElements((prev) => {
      const elementsToDelete = prev.filter((el) => selectedElementIds.includes(el.id))
      elementsToDelete.forEach((element) => {
        // Add to history
        addToHistory({
          type: "DELETE_ELEMENT",
          element,
          pageId: currentPageId
        })
      })
      return prev.filter((el) => !selectedElementIds.includes(el.id))
    })
    setSelectedElement(null)
    setSelectedElementIds([])
  }, [selectedElementIds, addToHistory, currentPageId])

  const selectElement = useCallback(
    (id: string | null, addToSelection = false) => {
      if (!id) {
        setSelectedElement(null)
        setSelectedElementIds([])
        return
      }

      // Unselect the canvas when an element is selected
      setIsCanvasSelected(false)

      const element = elements.find((el) => el.id === id)
      if (addToSelection) {
        setSelectedElementIds((prev) => [...prev, id])
      } else {
        setSelectedElement(element || null)
        setSelectedElementIds([id])
      }
    },
    [elements]
  )

  const selectMultipleElements = useCallback((ids: string[]) => {
    setSelectedElementIds(ids)
  }, [])

  const selectCanvas = useCallback((select: boolean) => {
    setIsCanvasSelected(select)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedElement(null)
    setSelectedElementIds([])
    setIsCanvasSelected(false)
  }, [])

  const changeCanvasSize = useCallback(
    (size: CanvasSize) => {
      if (!currentPageId) return;

      // Add to history
      addToHistory({
        type: "CHANGE_CANVAS_SIZE",
        before: canvasSize,
        after: size,
        pageId: currentPageId
      })

      setCanvasSize(size)
      
      // Update the size in the current page
      setPages(prevPages => prevPages.map(page => 
        page.id === currentPageId 
          ? { ...page, canvasSize: size } 
          : page
      ))
    },
    [canvasSize, addToHistory, currentPageId]
  )

  const fitCanvasToView = useCallback(
    (containerWidth: number, containerHeight: number) => {
      return fitCanvasToViewUtil(
        containerWidth, 
        containerHeight, 
        canvasSize.width, 
        canvasSize.height
      )
    },
    [canvasSize.width, canvasSize.height]
  )

  const clearNewElementFlag = useCallback(
    (id: string) => {
      setElements((prev) => prev.map((el) => (el.id === id ? { ...el, isNew: false } : el)))

      if (selectedElement?.id === id) {
        setSelectedElement((prev) => (prev ? { ...prev, isNew: false } : null))
      }
    },
    [selectedElement]
  )

  const scaleElement = useCallback((element: Element, scaleFactor: number) => {
    return scaleElementUtil(element, scaleFactor)
  }, [])

  // Undo/redo wrapper methods that use the history hook
  const undo = useCallback(() => {
    historyUndo(
      elements,
      setElements,
      selectedElement,
      setSelectedElement,
      setCanvasSize,
      pages,
      setPages,
      currentPageId,
      setCurrentPageId
    )
  }, [elements, historyUndo, selectedElement, pages, currentPageId])

  const redo = useCallback(() => {
    historyRedo(
      elements,
      setElements,
      selectedElement,
      setSelectedElement,
      setCanvasSize,
      pages,
      setPages,
      currentPageId,
      setCurrentPageId
    )
  }, [elements, historyRedo, selectedElement, pages, currentPageId])

  const isElementSelected = useCallback(
    (id: string) => selectedElementIds.includes(id),
    [selectedElementIds]
  )

  // Keyboard shortcuts
  useEffect(() => {
    // Debounce flag to prevent multiple rapid keypresses
    let isProcessingTKey = false;
    
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
        
        // Prevent rapid fire or re-entrancy
        if (isProcessingTKey) return;
        isProcessingTKey = true;
        
        // Create with explicit type to avoid any ambiguity
        const textElementData = {
          type: "text" as const, // Explicitly set as const to avoid type issues
          content: "Add your text here",
          fontSize: Math.round(canvasSize.width * DEFAULT_TEXT_FONT_SIZE_RATIO),
          fontFamily: "Inter"
        };
        
        // Use setTimeout to break the render cycle
        setTimeout(() => {
          const newTextElement = createTextElement(
            textElementData,
            canvasSize.width, 
            canvasSize.height
          );
          
          addElement({
            ...newTextElement,
            type: "text" // Ensure type is set correctly
          });
          
          // Reset the processing flag after a delay
          setTimeout(() => {
            isProcessingTKey = false;
          }, 100);
        }, 0);
      }

      // Delete selected elements: Delete or Backspace key
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        (selectedElement || selectedElementIds.length > 0) &&
        !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey
      ) {
        e.preventDefault()
        if (selectedElementIds.length > 1) {
          deleteSelectedElements()
        } else if (selectedElement) {
          deleteElement(selectedElement.id)
        }
      }

      // Next page: Right arrow
      if (e.key === "ArrowRight" && e.altKey) {
        e.preventDefault()
        goToNextPage()
      }

      // Previous page: Left arrow
      if (e.key === "ArrowLeft" && e.altKey) {
        e.preventDefault()
        goToPreviousPage()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo,  deleteElement, deleteSelectedElements, selectedElement, selectedElementIds, canvasSize.width, goToNextPage, goToPreviousPage])

  return (
    <CanvasContext.Provider
      value={{
        // Page management
        pages,
        currentPageId,
        currentPageIndex,
        addPage,
        deletePage,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        duplicateCurrentPage,
        
        // Canvas elements and properties
        elements,
        selectedElement,
        selectedElementIds,
        isCanvasSelected,
        canvasSize,
        availableSizes: AVAILABLE_CANVAS_SIZES,
        sizeCategories,
        
        // Element manipulation
        addElement,
        updateElement,
        updateMultipleElements,
        deleteElement,
        deleteSelectedElements,
        selectElement,
        selectMultipleElements,
        selectCanvas,
        clearSelection,
        changeCanvasSize,
        fitCanvasToView,
        clearNewElementFlag,
        scaleElement,
        
        // History
        canUndo,
        canRedo,
        undo,
        redo,
        
        // Utility
        isElementSelected,
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
