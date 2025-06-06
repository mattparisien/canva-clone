import { useState, useCallback, useEffect, useRef } from "react";
import { Element as CanvasElement } from "@lib/types/canvas.types";
import useCanvasStore from "@/lib/stores/useCanvasStore";

/**
 * Hook to handle element interactions including dragging and keyboard modifiers
 */
export function useCanvasElementInteraction(elementRef?: React.RefObject<HTMLDivElement | null>) {
  // Track state
  const [isDragActive, setIsDragActive] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAltKeyPressed, setIsAltKeyPressed] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isDragInitiated, setIsDragInitiated] = useState<boolean>(false); // Track if drag has been initiated but not yet started

  // Track positions
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // For debouncing hover events
  const justFinishedResizing = useRef(false);
  const resizeEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Store drag callbacks for use in mouse events
  const dragCallbacksRef = useRef<{
    onDragStart?: (element: CanvasElement) => void;
    element?: CanvasElement;
  }>({});

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

  const clickCount = useRef<number>(0);

  /**
   * Start drag operation - only prepares for dragging, doesn't set isDragging until mouse moves
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

    // Store initial drag position but don't set isDragging yet
    setIsDragInitiated(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });

    // Store callbacks for later use
    dragCallbacksRef.current = {
      onDragStart,
      element
    };
  }, []);

  // Handle mouse move to detect when actual dragging starts
  useEffect(() => {
    if (!isDragInitiated) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = Math.abs(e.clientX - dragStart.x);
      const deltaY = Math.abs(e.clientY - dragStart.y);
      const threshold = 5; // Minimum pixels to move before considering it a drag

      // Only start dragging if we've moved enough distance
      if ((deltaX > threshold || deltaY > threshold) && !isDragging) {
        setIsDragging(true);
        setIsDragInitiated(false);

        // Call the onDragStart callback now that we're actually dragging
        if (dragCallbacksRef.current.onDragStart && dragCallbacksRef.current.element) {
          dragCallbacksRef.current.onDragStart(dragCallbacksRef.current.element);
        }
      }
    };

    const handleMouseUp = () => {
      // Reset everything if mouse is released without dragging
      setIsDragInitiated(false);
      if (!isDragging) {
        // Clean up if we never started dragging
        dragCallbacksRef.current = {};
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragInitiated, dragStart.x, dragStart.y, isDragging]);

  /**
   * End drag operation
   */
  const endDrag = useCallback((onDragEnd: () => void) => {
    if (isDragging) {
      onDragEnd();
    }
    setIsDragging(false);
    setIsDragInitiated(false);
    dragCallbacksRef.current = {};
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
    // Always reset local hover state
    setIsHovering(false);

    // Previously we avoided notifying hover end when just finishing a resize,
    // but we now always invoke onHover(null) so the highlight clears correctly
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
  const handleClick = useCallback((
    e: React.MouseEvent,
    element: CanvasElement,
    onDoubleClick: (id: string) => void,
  ) => {
    // Always stop propagation to prevent canvas click handler from running
    e.stopPropagation();

    clickCount.current++;

    if (clickCount.current === 2) {
      onDoubleClick(element.id);
      clickCount.current = 0; // Reset after double click
    }

  }, [isDragInitiated, isDragging]);

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
    isDragInitiated,
    isAltKeyPressed,
    isHovering,
    leftBorderHover,
    rightBorderHover,
    setLeftBorderHover,
    setRightBorderHover,
    handleHover,
    dragStart,
    isDragActive,
    setIsDragActive,
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