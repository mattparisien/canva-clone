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
  const isEditMode = useEditorStore(state => state.isEditMode);

  useEffect(() => {
    if (!isSelecting) return;

    const handleMouseMove = (e: MouseEvent) => {
      setEnd({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsSelecting(false);

      if (!start) return;

      const rect = {
        left: Math.min(start.x, e.clientX),
        top: Math.min(start.y, e.clientY),
        right: Math.max(start.x, e.clientX),
        bottom: Math.max(start.y, e.clientY)
      };

      const ids: string[] = [];
      elements.forEach(el => {
        if (!el.rect) return;
        const elRect = {
          left: el.rect.x,
          top: el.rect.y,
          right: el.rect.x + el.rect.width,
          bottom: el.rect.y + el.rect.height
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
  }, [isSelecting, start, elements, selectMultipleElements, selectedElementIds]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    if (!canvasRef.current || e.target !== canvasRef.current) return;
    if (e.button !== 0) return;
    setIsSelecting(true);
    setStart({ x: e.clientX, y: e.clientY });
    setEnd({ x: e.clientX, y: e.clientY });
  };

  const style = start && end ? {
    left: Math.min(start.x, end.x),
    top: Math.min(start.y, end.y),
    width: Math.abs(start.x - end.x),
    height: Math.abs(start.y - end.y)
  } : undefined;

  return (
    <div className="absolute inset-0 pointer-events-none" onMouseDown={handleMouseDown}>
      {isSelecting && start && end && (
        <div
          className="absolute border-2 border-brand-blue/50 bg-brand-blue/10"
          style={style}
        />
      )}
    </div>
  );
}
