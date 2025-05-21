import { Element as CanvasElement } from "@/lib/types/canvas.types";

interface ShapeElementProps {
  element: CanvasElement;
}

export const RectangleElement = ({ element }: ShapeElementProps) => (
  <div
    className="w-full h-full"
    style={{
      backgroundColor: element.backgroundColor || "transparent",
      borderColor: element.borderColor || "transparent",
      borderWidth: element.borderWidth || 0,
      borderStyle: element.borderStyle || "solid",
      transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
    }}
  />
);