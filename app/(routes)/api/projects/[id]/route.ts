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

// GET: Fetch a project by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Properly await the params object before accessing its properties
    const id = params?.id;

    const response = await axios.get(`${BACKEND_URL}/api/projects/${id}`, {
      headers: {
        Authorization: await getAuthHeader(),
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error fetching project ${params?.id}:`, error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to fetch project' },
      { status: error.response?.status || 500 }
    );
  }
}

// PUT: Update a project
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Properly await the params object before accessing its properties
    const id = params?.id;
    const body = await req.json();

    const response = await axios.put(`${BACKEND_URL}/api/projects/${id}`, body, {
      headers: {
        Authorization: await getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error updating project ${params?.id}:`, error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to update project' },
      { status: error.response?.status || 500 }
    );
  }
}

// DELETE: Delete a project
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Properly await the params object before accessing its properties
    const id = params?.id;

    await axios.delete(`${BACKEND_URL}/api/projects/${id}`, {
      headers: {
        Authorization: await getAuthHeader(),
      },
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error(`Error deleting project ${params?.id}:`, error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to delete project' },
      { status: error.response?.status || 500 }
    );
  }
}