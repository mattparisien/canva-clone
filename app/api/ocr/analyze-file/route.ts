import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    
    // Forward the form data to the backend Express server
    const response = await fetch(`${BACKEND_URL}/api/ocr/analyze-file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Backend OCR analysis failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('OCR analyze-file proxy error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
