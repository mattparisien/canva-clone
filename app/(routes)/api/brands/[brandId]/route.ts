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

// Get a specific brand by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { brandId: string } }
) {
  try {
    const { brandId } = params;
    const headers = getHeadersWithAuth(req);
    
    const response = await axios.get(`${BACKEND_URL}/brands/${brandId}`, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error fetching brand ${params.brandId}:`, error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to fetch brand' },
      { status: error.response?.status || 500 }
    );
  }
}

// Update a specific brand
export async function PUT(
  req: NextRequest,
  { params }: { params: { brandId: string } }
) {
  try {
    const { brandId } = params;
    const body = await req.json();
    const headers = getHeadersWithAuth(req);
    
    const response = await axios.put(`${BACKEND_URL}/brands/${brandId}`, body, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error updating brand ${params.brandId}:`, error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to update brand' },
      { status: error.response?.status || 500 }
    );
  }
}

// Delete a specific brand
export async function DELETE(
  req: NextRequest,
  { params }: { params: { brandId: string } }
) {
  try {
    const { brandId } = params;
    const headers = getHeadersWithAuth(req);
    
    const response = await axios.delete(`${BACKEND_URL}/brands/${brandId}`, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error deleting brand ${params.brandId}:`, error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to delete brand' },
      { status: error.response?.status || 500 }
    );
  }
}