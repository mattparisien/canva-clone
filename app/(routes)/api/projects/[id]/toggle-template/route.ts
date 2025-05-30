import axios from 'axios';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Get the backend URL from environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Helper function to forward the authorization header
async function getAuthHeader() {
  const headersList = await headers();
  return headersList.get('authorization') || '';
}

// PUT: Toggle a project's template status
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Properly await the params object before accessing its properties
    const id = params?.id;
    const body = await req.json(); // Should contain isTemplate boolean

    const response = await axios.put(`${BACKEND_URL}/api/projects/${id}/toggle-template`, body, {
      headers: {
        Authorization: await getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error toggling template status for project ${params?.id}:`, error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to toggle template status' },
      { status: error.response?.status || 500 }
    );
  }
}