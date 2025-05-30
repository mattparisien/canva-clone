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

// Add an asset to a brand
export async function POST(
  req: NextRequest,
  { params }: { params: { brandId: string } }
) {
  try {
    const { brandId } = params;
    const body = await req.json();
    const headers = getHeadersWithAuth(req);
    
    const response = await axios.post(`${BACKEND_URL}/brands/${brandId}/add-asset`, body, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error adding asset to brand ${params.brandId}:`, error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to add asset to brand' },
      { status: error.response?.status || 500 }
    );
  }
}