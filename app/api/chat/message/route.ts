import { NextRequest, NextResponse } from 'next/server';

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

// POST: Send a chat message to the design assistant
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const headers = getHeadersWithAuth(req);
    
    // Forward the request to the backend chat endpoint
    const response = await fetch(`${BACKEND_URL}/api/chat/message`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend chat error:', errorData);
      return NextResponse.json(
        { error: 'Failed to process chat message' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}