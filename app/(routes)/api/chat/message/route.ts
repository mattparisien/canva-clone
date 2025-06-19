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

// Send message to chat
export async function POST(req: NextRequest) {
  try {
    const headers = getHeadersWithAuth(req);
    const body = await req.json();
    
    const backendUrl = `${BACKEND_URL}/api/chat/message`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = 'Server error';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, use the response text
        errorMessage = await response.text() || errorMessage;
      }
      
      return NextResponse.json(
        { message: errorMessage }, 
        { status: response.status }
      );
    }

    // Check if the response is a stream (SSE)
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('text/event-stream')) {
      // Forward the stream response
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control'
        }
      });
    } else {
      // Handle non-stream response (fallback)
      try {
        const data = await response.json();
        return NextResponse.json(data, { 
          status: response.status 
        });
      } catch (parseError) {
        // If JSON parsing fails, return the response as text
        const textData = await response.text();
        return NextResponse.json(
          { message: textData || 'Invalid response format' }, 
          { status: 500 }
        );
      }
    }
    
  } catch (error) {
    console.error('Chat message API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
