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

// Get a specific asset by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { assetId: string } }
) {
  try {
    const { assetId } = params;
    const headers = getHeadersWithAuth(req);
    
    const response = await axios.get(`${BACKEND_URL}/api/assets/${assetId}`, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error fetching asset ${params.assetId}:`, error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to fetch asset' },
      { status: error.response?.status || 500 }
    );
  }
}

// Update a specific asset
export async function PUT(
  req: NextRequest,
  { params }: { params: { assetId: string } }
) {
  try {
    const { assetId } = params;
    const body = await req.json();
    const headers = getHeadersWithAuth(req);
    
    const response = await axios.put(`${BACKEND_URL}/api/assets/${assetId}`, body, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error updating asset ${params.assetId}:`, error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to update asset' },
      { status: error.response?.status || 500 }
    );
  }
}

// Delete a specific asset
export async function DELETE(
  req: NextRequest,
  { params }: { params: { assetId: string } }
) {
  try {
    const { assetId } = params;
    const headers = getHeadersWithAuth(req);
    
    const response = await axios.delete(`${BACKEND_URL}/api/assets/${assetId}`, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error deleting asset ${params.assetId}:`, error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to delete asset' },
      { status: error.response?.status || 500 }
    );
  }
}