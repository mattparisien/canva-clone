import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET() {
  try {
    // Forward the request to the backend Express server
    const response = await fetch(`${BACKEND_URL}/api/ocr/status`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Backend OCR status failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('OCR status proxy error:', error);
    return NextResponse.json(
      { 
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
