"use client"

import { useEffect, useState } from "react";
import useCanvasStore, { useCurrentPageElements } from "@lib/stores/useCanvasStore";
import useEditorStore from "@lib/stores/useEditorStore";

interface MarqueeSelectionProps {
  canvasRef: React.RefObject<HTMLDivElement>;
}

export default function MarqueeSelection({ canvasRef }: MarqueeSelectionProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [end, setEnd] = useState<{ x: number; y: number } | null>(null);

  const elements = useCurrentPageElements();
  const selectMultipleElements = useCanvasStore(state => state.selectMultipleElements);
  const selectedElementIds = useCanvasStore(state => state.selectedElementIds);
  const isDragging = useCanvasStore(state => state.isDragging);
  const isEditMode = useEditorStore(state => state.isEditMode);

  // Helper function to check if click is in an excluded area (sidebar, navbar, etc.)
  const isInExcludedArea = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof Element)) return false;
    
    // Check if click is on sidebar, navbar, or other UI elements
    const excludedSelectors = [
      '[data-sidebar]',
      '[data-navbar]', 
      '[data-bottom-bar]',
      '[data-page-navigation]',
      '.sidebar',
      '.navbar',
      '.bottom-bar',
      '.page-navigation',
      'nav',
      'button',
      'input',
      'textarea',
      '[role="button"]',
      '.element-action-bar',
      '.element-property-bar',
      '.page-thumbnails-container'
    ];
    
    return excludedSelectors.some(selector => 
      target.closest(selector) !== null
    );
  };

  // Helper function to convert global coordinates to canvas-relative coordinates
  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const canvasRect = canvas.getBoundingClientRect();
    const scale = parseFloat(getComputedStyle(canvas).getPropertyValue('--canvas-scale') || '1');
    
    // Convert global coordinates to canvas-relative coordinates
    const canvasRelativeX = (clientX - canvasRect.left) / scale;
    const canvasRelativeY = (clientY - canvasRect.top) / scale;
    
    return { x: canvasRelativeX, y: canvasRelativeY };
  };

  // Helper function to get viewport coordinates for display
  const getViewportCoordinates = (clientX: number, clientY: number) => {
    return { x: clientX, y: clientY };
  };

  useEffect(() => {
    if (!isSelecting) return;

    const handleMouseMove = (e: MouseEvent) => {
      const viewportCoords = getViewportCoordinates(e.clientX, e.clientY);
      setEnd(viewportCoords);
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsSelecting(false);

      if (!start) return;

      const endViewport = getViewportCoordinates(e.clientX, e.clientY);
      
      // Convert viewport coordinates to canvas coordinates for element intersection
      const startCanvas = getCanvasCoordinates(start.x, start.y);
      const endCanvas = getCanvasCoordinates(endViewport.x, endViewport.y);
      
      // Create selection rectangle in canvas coordinates
      const rect = {
        left: Math.min(startCanvas.x, endCanvas.x),
        top: Math.min(startCanvas.y, endCanvas.y),
        right: Math.max(startCanvas.x, endCanvas.x),
        bottom: Math.max(startCanvas.y, endCanvas.y)
      };

      const ids: string[] = [];
      elements.forEach(el => {
        // Check intersection using canvas coordinates (element x, y, width, height)
        const elRect = {
          left: el.x,
          top: el.y,
          right: el.x + el.width,
          bottom: el.y + el.height
        };
        const intersects =
          rect.left < elRect.right &&
          rect.right > elRect.left &&
          rect.top < elRect.bottom &&
          rect.bottom > elRect.top;
        if (intersects) ids.push(el.id);
      });

      if (e.shiftKey) {
        const set = new Set(selectedElementIds);
        ids.forEach(id => {
          if (set.has(id)) set.delete(id); else set.add(id);
        });
        selectMultipleElements(Array.from(set));
      } else {
        selectMultipleElements(ids);
      }

      setStart(null);
      setEnd(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isSelecting, start, elements, selectMultipleElements, selectedElementIds, canvasRef]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!isEditMode) return;
      if (e.button !== 0) return; // Only left mouse button
      if (isDragging) return; // Don't start marquee selection if an element is being dragged
      
      // Check if click is in an excluded area
      if (isInExcludedArea(e.target)) return;
      
      // Start marquee selection from anywhere in the editor area
      setIsSelecting(true);
      const viewportCoords = getViewportCoordinates(e.clientX, e.clientY);
      setStart(viewportCoords);
      setEnd(viewportCoords);
      
      // Prevent default to avoid any unwanted behaviors
      e.preventDefault();
    };

    // Listen on document to capture clicks anywhere in the editor
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isEditMode, isDragging]);

  // Get viewport style for displaying the marquee selection rectangle
  const getViewportStyle = () => {
    if (!start || !end) return undefined;

    return {
      left: Math.min(start.x, end.x),
      top: Math.min(start.y, end.y),
      width: Math.abs(start.x - end.x),
      height: Math.abs(start.y - end.y)
    };
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {isSelecting && start && end && (
        <div
          className="absolute border-2 border-brand-blue/50 bg-brand-blue/10 pointer-events-none"
          style={getViewportStyle()}
        />
      )}
    </div>
  );
}
