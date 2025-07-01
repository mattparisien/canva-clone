/**
 * OCR API functions for frontend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface OCRResult {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontPx: number;
}

interface OCRAnalysisResponse {
  success: boolean;
  ocrResults: OCRResult[];
  imageDimensions?: {
    width: number;
    height: number;
  };
  error?: string;
}

/**
 * Analyze an image URL with OCR
 */
export async function analyzeImageWithOCR(imageUrl: string): Promise<OCRAnalysisResponse> {
  try {
    // Use Next.js API route instead of direct backend call
    const response = await fetch('/api/ocr/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      throw new Error(`OCR analysis failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('OCR analysis error:', error);
    throw error;
  }
}

/**
 * Analyze an uploaded file with OCR
 */
export async function analyzeFileWithOCR(file: File): Promise<OCRAnalysisResponse> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    // Use Next.js API route instead of direct backend call
    const response = await fetch('/api/ocr/analyze-file', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OCR analysis failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('OCR file analysis error:', error);
    throw error;
  }
}

/**
 * Get OCR capabilities and status
 */
export async function getOCRStatus(): Promise<{ available: boolean; version?: string }> {
  try {
    // Use Next.js API route instead of direct backend call
    const response = await fetch('/api/ocr/status');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('OCR status check error:', error);
    return { available: false };
  }
}
