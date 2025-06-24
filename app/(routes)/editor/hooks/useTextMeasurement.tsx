import { useRef, useCallback } from "react";
import { Element as CanvasElement } from "@/lib/types/canvas";

/**
 * Hook to handle text measurement and auto-height adjustment
 * 
 * Provides functionality to measure text height based on width and styling
 * for auto-height adjustment of text elements
 */
export function useTextMeasurement() {
  // Hidden measurer div ref
  const measurerRef = useRef<HTMLDivElement | null>(null);

  /**
   * Measures the height of text content with given styles
   */
  const measureTextHeight = useCallback((
    content: string,
    width: number,
    styles: {
      fontSize?: number;
      fontFamily?: string;
      isBold?: boolean;
      isItalic?: boolean;
      isUnderlined?: boolean;
      isStrikethrough?: boolean;
      textAlign?: string;
    }
  ): number => {
    if (!measurerRef.current) return 0;

    const {
      fontSize = 36,
      fontFamily = 'Inter',
      isBold = false,
      isItalic = false,
      isUnderlined = false,
      isStrikethrough = false,
      textAlign = 'center'
    } = styles;

    // Configure the measurer with all the styles
    measurerRef.current.style.width = width + 'px';
    measurerRef.current.style.fontSize = `${fontSize}px`;
    measurerRef.current.style.fontFamily = fontFamily;
    measurerRef.current.style.fontWeight = isBold ? 'bold' : 'normal';
    measurerRef.current.style.fontStyle = isItalic ? 'italic' : 'normal';
    measurerRef.current.style.textDecoration =
      `${isUnderlined ? 'underline' : ''} ${isStrikethrough ? 'line-through' : ''}`.trim() || 'none';
    measurerRef.current.style.textAlign = textAlign;
    measurerRef.current.style.lineHeight = '1.5'; // Better readability
    measurerRef.current.style.padding = '4px'; // Ensure text has room to breathe

    // Set content and measure
    measurerRef.current.innerText = content;

    // Add padding to ensure text isn't cut off
    return measurerRef.current.scrollHeight + 12;
  }, []);

  /**
   * Measures height for a specific canvas element
   */
  const measureElementHeight = useCallback((element: CanvasElement): number => {
    if (element.kind !== 'text' || !element.content) return element.height;

    return measureTextHeight(
      element.content,
      element.width,
      {
        fontSize: element.fontSize,
        fontFamily: element.fontFamily,
        isBold: element.bold,
        isItalic: element.italic,
        isUnderlined: element.underline,
        isStrikethrough: element.isStrikethrough,
        textAlign: element.textAlign
      }
    );
  }, [measureTextHeight]);

  /**
   * Render the hidden measurer component
   */
  const renderMeasurer = useCallback(() => {
    return <div
      ref={measurerRef}
      style={{
        position: 'absolute',
        visibility: 'hidden',
        zIndex: -1,
        pointerEvents: 'none',
        whiteSpace: 'normal',
        lineHeight: 1.2,
        wordBreak: 'break-word',
        overflow: 'auto',
        padding: 0,
        boxSizing: 'border-box',
        minHeight: '1em',
        left: 0,
        top: 0,
      }
      }
    />
  }, []);

  return {
    measurerRef,
    measureTextHeight,
    measureElementHeight,
    renderMeasurer
  };
}