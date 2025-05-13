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

// GET: Fetch paginated projects with filters
export async function GET(req: NextRequest) {
  try {
    // Get all query parameters from the URL
    const { searchParams } = new URL(req.url);

    // Forward all query parameters to the backend
    // This ensures any filtering parameters are passed along
    const endpoint = `/api/projects/paginated?${searchParams.toString()}`;

    // Make request to backend
    const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
      headers: {
        Authorization: await getAuthHeader(),
      },
    });

    console.log(response);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching paginated projects:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to fetch paginated projects' },
      { status: error.response?.status || 500 }
    );
  }
}