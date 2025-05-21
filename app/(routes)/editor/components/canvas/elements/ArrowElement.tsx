import React from 'react';
import { Element as CanvasElement } from "@/lib/types/canvas.types";
import { getLineStyles, getArrowHeadStyles } from './utils/elementStyles';

interface ArrowElementProps {
  element: CanvasElement;
}

export const ArrowElement = ({ element }: ArrowElementProps) => {
  return (
    <div className="w-full h-full flex items-center relative">
      <div
        className="w-full"
        style={getLineStyles(element)}
      />
      <div style={getArrowHeadStyles(element)} />
    </div>
  );
};