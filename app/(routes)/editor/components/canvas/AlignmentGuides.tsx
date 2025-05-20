"use client"

import { Element as CanvasElement } from "@lib/types/canvas.types"

interface AlignmentGuidesProps {
  activeElement: CanvasElement
  elements: CanvasElement[]
  canvasWidth: number
  canvasHeight: number
  alignments: {
    horizontal: number[] // y-coordinates for horizontal guides
    vertical: number[] // x-coordinates for vertical guides
  }
}

export function AlignmentGuides({
  activeElement,
  elements,
  canvasWidth,
  canvasHeight,
  alignments,
}: AlignmentGuidesProps) {
  // Brand blue but with opacity
  const guideColor = 'rgba(59, 130, 246, 0.7)'; // Faded brand-blue color

  return (
    <>
      {/* Horizontal guides with faded brand blue */}
      {alignments.horizontal.map((y, index) => (
        <div
          key={`h-${index}-${y}`}
          className="absolute left-0 z-50 w-full"
          style={{
            top: `${y}px`,
            height: '1.5px',
            backgroundColor: guideColor,
            transform: 'translateY(-50%)', // Center the line on the alignment point
          }}
        />
      ))}

      {/* Vertical guides with faded brand blue */}
      {alignments.vertical.map((x, index) => (
        <div
          key={`v-${index}-${x}`}
          className="absolute top-0 z-50 h-full"
          style={{
            left: `${x}px`,
            width: '1.5px',
            backgroundColor: guideColor,
            transform: 'translateX(-50%)', // Center the line on the alignment point
          }}
        />
      ))}

      {/* Intersection points */}
      {alignments.horizontal.flatMap(y =>
        alignments.vertical.map(x => (
          <div
            key={`intersect-${x}-${y}`}
            className="absolute z-50 rounded-full bg-white border-2"
            style={{
              top: y,
              left: x,
              height: '6px',
              width: '6px',
              borderColor: guideColor,
              transform: 'translate(-50%, -50%)', // Center the dot on the intersection
            }}
          />
        ))
      )}
    </>
  )
}
