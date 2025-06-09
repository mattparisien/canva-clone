import { Element as CanvasElement } from "@/lib/types/canvas";

export const getShapeStyles = (element: CanvasElement) => ({
  backgroundColor: element.backgroundColor || "transparent",
  borderColor: element.borderColor || "transparent",
  borderWidth: element.borderWidth || 0,
  borderStyle: element.borderStyle || "solid",
  transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
});

export const getLineStyles = (element: CanvasElement) => ({
  height: "0px",
  borderTopColor: element.borderColor || "#000000", 
  borderTopWidth: element.borderWidth || 2,
  borderTopStyle: element.borderStyle || "solid",
  transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
});

export const getArrowHeadStyles = (element: CanvasElement) => ({
  position: "absolute" as const,
  right: "0",
  width: "10px",
  height: "10px",
  borderRight: `${element.borderWidth || 2}px solid ${element.borderColor || "#000000"}`,
  borderTop: `${element.borderWidth || 2}px solid ${element.borderColor || "#000000"}`,
  transform: "rotate(45deg) translateY(-50%)",
});