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
    // Debug: Log all incoming headers
    console.log('All incoming headers:');
    req.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    
    const headers = getHeadersWithAuth(req);
    const body = await req.json();
    
    const backendUrl = `${BACKEND_URL}/api/chat/message`;
    
    console.log('Proxying chat message request to:', backendUrl);
    console.log('Headers being sent to backend:', headers);
    console.log('Request body:', body);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('data from backend:', data);
    
    return NextResponse.json(data, { 
      status: response.status 
    });
    
  } catch (error) {
    console.error('Chat message API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
