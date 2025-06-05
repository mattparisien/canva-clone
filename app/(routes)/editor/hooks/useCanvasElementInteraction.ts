import { useState, useCallback, useEffect, useRef } from "react";
import { Element as CanvasElement } from "@lib/types/canvas.types";

/**
 * Hook to handle element interactions including dragging and keyboard modifiers
 */
export function useCanvasElementInteraction(elementRef?: React.RefObject<HTMLDivElement | null>) {
  // Track state
  const [isDragging, setIsDragging] = useState(false);
  const [isAltKeyPressed, setIsAltKeyPressed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // Track positions
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // For debouncing hover events
  const justFinishedResizing = useRef(false);
  const resizeEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Edge hover states for resize handles
  const [leftBorderHover, setLeftBorderHover] = useState(false);
  const [rightBorderHover, setRightBorderHover] = useState(false);
  
  // Handle states for resize corners/edges
  const [handleHover, setHandleHover] = useState({
    nw: false,
    ne: false,
    se: false,
    sw: false,
    e: false,
    w: false,
  });

  /**
   * Start drag operation
   */
  const startDrag = useCallback((e: React.MouseEvent, element: CanvasElement, onDragStart: (element: CanvasElement) => void, onElementSelect: (id: string, addToSelection: boolean) => void, clearNewFlag?: (id: string) => void) => {
    e.stopPropagation();
    
    // Clear isNew flag if needed
    if (element.isNew && clearNewFlag) {
      clearNewFlag(element.id);
    }
    
    // Check if shift key is pressed for multi-selection
    const isShiftPressed = e.shiftKey;
    
    // Select element and notify parent
    onElementSelect(element.id, isShiftPressed);
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
    onDragStart(element);
  }, []);
  
  /**
   * End drag operation
   */
  const endDrag = useCallback((onDragEnd: () => void) => {
    if (isDragging) {
      onDragEnd();
    }
    setIsDragging(false);
  }, [isDragging]);

  /**
   * Handle mouse enter/leave
   */
  const handleMouseEnter = useCallback((id: string, isEditMode: boolean, onHover?: (id: string | null) => void) => {
    if (isEditMode) {
      setIsHovering(true);
      onHover?.(id);
    }
  }, []);

  const handleMouseLeave = useCallback((onHover?: (id: string | null) => void) => {
    if (justFinishedResizing.current) {
      // If we just finished resizing, prevent immediate deselect
      setIsHovering(false);
      return;
    }
    setIsHovering(false);
    onHover?.(null);
  }, []);

  /**
   * Set just finished resizing flag
   */
  const setJustFinishedResizing = useCallback((value: boolean, duration = 200) => {
    justFinishedResizing.current = value;
    
    // Clear existing timeout
    if (resizeEndTimeoutRef.current) {
      clearTimeout(resizeEndTimeoutRef.current);
    }
    
    // Set new timeout if turning on the flag
    if (value) {
      resizeEndTimeoutRef.current = setTimeout(() => {
        justFinishedResizing.current = false;
      }, duration);
    }
  }, []);

  /**
   * Helper to get handle background
   */
  const getHandleBg = useCallback((dir: string, resizeDirection: string | null, isResizing: boolean) => {
    return (handleHover[dir as keyof typeof handleHover] || 
            (resizeDirection === dir && isResizing)) ? "var(--handle-hover)" : "#fff";
  }, [handleHover]);

  /**
   * Set handle hover state
   */
  const setHandleHoverState = useCallback((handle: string, isHovering: boolean) => {
    setHandleHover(prev => ({ ...prev, [handle]: isHovering }));
  }, []);

  /**
   * Handle selection on click
   */
  const handleClick = useCallback((e: React.MouseEvent, element: CanvasElement, onElementSelect?: (id: string, addToSelection: boolean) => void) => {
    // Always stop propagation to prevent canvas click handler from running
    e.stopPropagation();
    
    // Check if shift key is pressed for multi-selection
    const isShiftPressed = e.shiftKey;
    
    // Select element
    onElementSelect?.(element.id, isShiftPressed);
  }, []);

  // We've removed the outside click handler from here
  // as it's now handled at the Editor component level

  // Track Alt/Option key state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt' || e.key === 'Option') {
        setIsAltKeyPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt' || e.key === 'Option') {
        setIsAltKeyPressed(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    }
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (resizeEndTimeoutRef.current) {
        clearTimeout(resizeEndTimeoutRef.current);
      }
    }
  }, []);

  return {
    isDragging,
    isAltKeyPressed,
    isHovering,
    leftBorderHover,
    rightBorderHover,
    setLeftBorderHover,
    setRightBorderHover,
    handleHover,
    dragStart,
    setDragStart,
    startDrag,
    endDrag,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    setJustFinishedResizing,
    getHandleBg,
    setHandleHoverState,
  };
}