import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Helper function to forward headers from the incoming request
const getHeadersWithAuth = (req: NextRequest) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Forward the authorization header if present
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  return headers;
};

// PATCH: Update chat title
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const { chatId } = await params;
    const body = await req.json();
    
    const headers = getHeadersWithAuth(req);
    const backendUrl = `${BACKEND_URL}/api/chat/${chatId}/title`;
    
    console.log('Proxying update chat title request to:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorMessage = 'Server error';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = await response.text() || errorMessage;
      }
      
      return NextResponse.json(
        { message: errorMessage }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { 
      status: response.status 
    });
    
  } catch (error) {
    console.error('Update chat title API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
