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

// GET: Fetch a specific template by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const response = await axios.get(`${BACKEND_URL}/api/templates/${id}`, {
      headers: {
        Authorization: await getAuthHeader(),
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching template:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to fetch template' },
      { status: error.response?.status || 500 }
    );
  }
}

// PUT: Update a specific template
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const response = await axios.put(`${BACKEND_URL}/api/templates/${id}`, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: await getAuthHeader(),
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error updating template:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to update template' },
      { status: error.response?.status || 500 }
    );
  }
}

// DELETE: Delete a specific template
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await axios.delete(`${BACKEND_URL}/api/templates/${id}`, {
      headers: {
        Authorization: await getAuthHeader(),
      },
    });

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting template:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to delete template' },
      { status: error.response?.status || 500 }
    );
  }
}
