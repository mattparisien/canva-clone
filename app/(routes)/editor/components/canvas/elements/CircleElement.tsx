import React from 'react';
import { Element as CanvasElement } from "@/lib/types/canvas.types";
import { getShapeStyles } from './utils/elementStyles';

interface CircleElementProps {
  element: CanvasElement;
}

export const CircleElement = ({ element }: CircleElementProps) => {
  return (
    <div
      className="w-full h-full rounded-full"
      style={getShapeStyles(element)}
    />
  );
};