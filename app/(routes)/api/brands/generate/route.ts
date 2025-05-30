import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001/api';

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

// Generate a brand from assets
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const headers = getHeadersWithAuth(req);
    
    // Call the backend API endpoint for brand generation
    const response = await axios.post(`${BACKEND_URL}/api/brands/generate`, body, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error generating brand from assets:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to generate brand from assets' },
      { status: error.response?.status || 500 }
    );
  }
}