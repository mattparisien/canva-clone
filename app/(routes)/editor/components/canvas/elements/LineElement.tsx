import React from 'react';
import { Element as CanvasElement } from "@/lib/types/canvas";
import { getLineStyles } from './utils/elementStyles';

interface LineElementProps {
  element: CanvasElement;
}

export const LineElement = ({ element }: LineElementProps) => {
  return (
    <div className="w-full h-full flex items-center">
      <div
        className="w-full"
        style={getLineStyles(element)}
      />
    </div>
  );
};