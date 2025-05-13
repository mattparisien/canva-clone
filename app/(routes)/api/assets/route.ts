import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';

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
    
    const response = await axios.get(`${BACKEND_URL}/api/assets`, { headers });
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
    
    const response = await axios.post(`${BACKEND_URL}/assets`, body, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating asset:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to create asset' },
      { status: error.response?.status || 500 }
    );
  }
}