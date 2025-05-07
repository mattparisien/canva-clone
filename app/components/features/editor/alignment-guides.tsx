"use client"

import type { Element } from "@context/canvas-context"

interface AlignmentGuidesProps {
  activeElement: Element
  elements: Element[]
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


  return (
    <>
      {/* Horizontal guides */}
      {alignments.horizontal.map((y, index) => (
        <div
          key={`h-${index}-${y}`}
          className="absolute left-0 z-50 h-[2px] w-full bg-purple-500"
          style={{
            top: `${y}px`,
            opacity: 0.8,
            boxShadow: "0 0 2px rgba(0, 0, 0, 0.2)",
          }}
        />
      ))}

      {/* Vertical guides */}
      {alignments.vertical.map((x, index) => (
        <div
          key={`v-${index}-${x}`}
          className="absolute top-0 z-50 h-full w-[2px] bg-purple-500"
          style={{
            left: `${x}px`,
            opacity: 0.8,
            boxShadow: "0 0 2px rgba(0, 0, 0, 0.2)",
          }}
        />
      ))}
    </>
  )
}
