"use client"

import type { Element } from "@context/canvas-context"
import { useEffect, useState } from "react"

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
  const [animationKey, setAnimationKey] = useState(0);
  
  // Change key when alignments change to restart animations
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [alignments.horizontal.length, alignments.vertical.length]);

  return (
    <>
      {/* Horizontal guides with brand color and animation */}
      {alignments.horizontal.map((y, index) => (
        <div
          key={`h-${animationKey}-${index}-${y}`}
          className="absolute left-0 z-50 h-[1.5px] w-full"
          style={{
            top: `${y}px`,
            background: 'linear-gradient(90deg, transparent 0%, #1E88E5 50%, transparent 100%)',
            animation: 'pulseGuide 2s ease-in-out infinite',
            boxShadow: '0 0 3px rgba(30, 136, 229, 0.5)',
          }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-brand-blue animate-ping opacity-70"></div>
          <style jsx>{`
            @keyframes pulseGuide {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 0.9; }
            }
          `}</style>
        </div>
      ))}

      {/* Vertical guides with brand color and animation */}
      {alignments.vertical.map((x, index) => (
        <div
          key={`v-${animationKey}-${index}-${x}`}
          className="absolute top-0 z-50 h-full w-[1.5px]"
          style={{
            left: `${x}px`,
            background: 'linear-gradient(180deg, transparent 0%, #1E88E5 50%, transparent 100%)',
            animation: 'pulseGuide 2s ease-in-out infinite',
            boxShadow: '0 0 3px rgba(30, 136, 229, 0.5)',
          }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-brand-blue animate-ping opacity-70"></div>
          <style jsx>{`
            @keyframes pulseGuide {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 0.9; }
            }
          `}</style>
        </div>
      ))}

      {/* Intersection points for clearer visual guidance where guides cross */}
      {alignments.horizontal.flatMap(y => 
        alignments.vertical.map(x => (
          <div
            key={`intersect-${animationKey}-${x}-${y}`}
            className="absolute z-50 h-2 w-2 rounded-full bg-white border-2 border-brand-blue"
            style={{
              top: `${y - 1}px`,
              left: `${x - 1}px`,
              boxShadow: '0 0 4px rgba(30, 136, 229, 0.6)',
            }}
          />
        ))
      )}
    </>
  )
}
