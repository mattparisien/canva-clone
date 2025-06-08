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

// Get all assets
export async function GET(req: NextRequest) {
  try {
    const headers = getHeadersWithAuth(req);
    
    // Extract query parameters and forward them to the backend
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/assets${queryString ? `?${queryString}` : ''}`;
    
    console.log('Proxying assets request to:', backendUrl);
    
    const response = await axios.get(backendUrl, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching assets:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to fetch assets' },
      { status: error.response?.status || 500 }
    );
  }
}

// Create a new asset (without file upload)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const headers = getHeadersWithAuth(req);
    
    const response = await axios.post(`${BACKEND_URL}/api/assets`, body, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating asset:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to create asset' },
      { status: error.response?.status || 500 }
    );
  }
}
