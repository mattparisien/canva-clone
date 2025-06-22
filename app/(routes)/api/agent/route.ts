import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

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

// POST: Generate agent response
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const headers = getHeadersWithAuth(req);
    
    const response = await axios.post(`${BACKEND_URL}/api/agent/ask`, body, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error calling agent:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to generate response' },
      { status: error.response?.status || 500 }
    );
  }
}
