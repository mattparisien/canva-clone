import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// DELETE handler for deleting fonts
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth header
    const authHeader = req.headers.get('authorization');
    const headers: Record<string, string> = {};
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward the request to the backend
    const response = await axios.delete(`${BACKEND_URL}/api/fonts/${params.id}`, {
      headers
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error deleting font:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to delete font' },
      { status: error.response?.status || 500 }
    );
  }
}
