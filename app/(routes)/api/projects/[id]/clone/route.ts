import axios from 'axios';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Get the backend URL from environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Helper function to forward the authorization header
async function getAuthHeader() {
  const headersList = await headers();
  return headersList.get('authorization') || '';
}

// POST: Clone a project
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json(); // Should contain userId

    const response = await axios.post(`${BACKEND_URL}/api/projects/${id}/clone`, body, {
      headers: {
        Authorization: await getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error cloning project ${params.id}:`, error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to clone project' },
      { status: error.response?.status || 500 }
    );
  }
}