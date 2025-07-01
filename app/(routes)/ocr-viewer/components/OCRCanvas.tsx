"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Type, RotateCcw } from 'lucide-react';

interface OCRResult {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontPx: number;
}

interface OCRCanvasProps {
  imageUrl: string;
  ocrResults: OCRResult[];
  imageDimensions: {
    width: number;
    height: number;
  };
}

export function OCRCanvas({ imageUrl, ocrResults, imageDimensions }: OCRCanvasProps) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [showText, setShowText] = useState(true);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate scale factor when image loads
  useEffect(() => {
    const updateScale = () => {
      if (imageRef.current && containerRef.current) {
        const img = imageRef.current;
        const container = containerRef.current;
        
        // Get the actual displayed size vs natural size
        const displayedWidth = img.offsetWidth;
        const naturalWidth = imageDimensions.width;
        
        const newScaleFactor = displayedWidth / naturalWidth;
        setScaleFactor(newScaleFactor);
      }
    };

    const img = imageRef.current;
    if (img) {
      if (img.complete) {
        updateScale();
      } else {
        img.onload = updateScale;
      }
    }

    // Update scale on window resize
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [imageDimensions.width]);

  const handleBlockClick = (index: number) => {
    setHighlightedIndex(index === highlightedIndex ? null : index);
  };

  const resetView = () => {
    setShowOverlay(true);
    setShowText(true);
    setHighlightedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={showOverlay ? "default" : "outline"}
          size="sm"
          onClick={() => setShowOverlay(!showOverlay)}
        >
          {showOverlay ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
          {showOverlay ? 'Hide' : 'Show'} Overlay
        </Button>
        
        <Button
          variant={showText ? "default" : "outline"}
          size="sm"
          onClick={() => setShowText(!showText)}
          disabled={!showOverlay}
        >
          <Type className="h-4 w-4 mr-2" />
          {showText ? 'Hide' : 'Show'} Text
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={resetView}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset View
        </Button>

        <div className="text-sm text-gray-500 ml-auto">
          Scale: {(scaleFactor * 100).toFixed(1)}% | {ocrResults.length} blocks
        </div>
      </div>

      {/* Image Container with Overlay */}
      <div 
        ref={containerRef}
        className="relative inline-block border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg"
      >
        {/* Base Image */}
        <img
          ref={imageRef}
          src={imageUrl}
          alt="OCR Analysis"
          className="max-w-full h-auto block"
          style={{ maxHeight: '70vh' }}
        />

        {/* OCR Overlay */}
        {showOverlay && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              width: `${imageDimensions.width * scaleFactor}px`,
              height: `${imageDimensions.height * scaleFactor}px`
            }}
          >
            {ocrResults.map((block, index) => {
              const isHighlighted = highlightedIndex === index;
              const scaledX = block.x * scaleFactor;
              const scaledY = block.y * scaleFactor;
              const scaledWidth = block.w * scaleFactor;
              const scaledHeight = block.h * scaleFactor;
              const scaledFontSize = Math.max(8, Math.min(block.fontPx * scaleFactor * 0.8, 20));

              return (
                <div
                  key={index}
                  id={`ocr-block-${index}`}
                  className={`absolute pointer-events-auto cursor-pointer transition-all duration-200 ${
                    isHighlighted 
                      ? 'border-2 border-green-500 bg-green-100/30 z-20' 
                      : 'border-2 border-red-500 bg-red-100/20 hover:bg-red-100/40 hover:border-red-600'
                  }`}
                  style={{
                    left: `${scaledX}px`,
                    top: `${scaledY}px`,
                    width: `${scaledWidth}px`,
                    height: `${scaledHeight}px`,
                    fontSize: `${scaledFontSize}px`,
                  }}
                  onClick={() => handleBlockClick(index)}
                  title={`"${block.text}" (${block.x}, ${block.y}) ${block.fontPx}px`}
                >
                  {showText && (
                    <div 
                      className={`p-1 font-mono font-bold text-center leading-none overflow-hidden text-ellipsis whitespace-nowrap ${
                        isHighlighted ? 'text-green-800' : 'text-red-800'
                      }`}
                      style={{
                        textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
                        fontSize: `${scaledFontSize}px`,
                        lineHeight: `${scaledHeight - 4}px`,
                      }}
                    >
                      {block.text}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Highlighted Block Info */}
        {highlightedIndex !== null && (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border max-w-xs">
            <div className="text-sm font-medium mb-2">Block #{highlightedIndex + 1}</div>
            <div className="text-xs space-y-1 text-gray-600">
              <div><strong>Text:</strong> "{ocrResults[highlightedIndex].text}"</div>
              <div><strong>Position:</strong> ({ocrResults[highlightedIndex].x}, {ocrResults[highlightedIndex].y})</div>
              <div><strong>Size:</strong> {ocrResults[highlightedIndex].w} × {ocrResults[highlightedIndex].h}</div>
              <div><strong>Font:</strong> {ocrResults[highlightedIndex].fontPx}px</div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
        <strong>Instructions:</strong> Click on any red box to highlight and view details. 
        Use the controls above to toggle overlay visibility and text display.
      </div>
    </div>
  );
}
