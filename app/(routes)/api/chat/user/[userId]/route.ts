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

// GET: Get user's chat conversations
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit');
    
    const headers = getHeadersWithAuth(req);
    
    let backendUrl = `${BACKEND_URL}/api/chat/user/${userId}`;
    if (limit) {
      backendUrl += `?limit=${limit}`;
    }
    
    console.log('Proxying get user chats request to:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
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
    console.error('Get user chats API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
