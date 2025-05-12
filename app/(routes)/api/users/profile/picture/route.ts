import axios from 'axios';
import FormData from 'form-data';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Get the backend URL from environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Helper function to forward the authorization header
async function getAuthHeader() {
  const headersList = await headers();
  return headersList.get('authorization') || '';
}

// Helper to convert ReadableStream to Buffer
async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

// POST: Upload profile picture
export async function POST(req: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = getAuthHeader();

    // Clone the request to avoid consuming it multiple times
    const clonedRequest = req.clone();

    // Get the form data
    const formData = await clonedRequest.formData();

    // Create a new form data for axios
    const axiosFormData = new FormData();

    // Copy each field and file from the original form data
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const buffer = Buffer.from(await value.arrayBuffer());

        // Add the file to the new form data
        axiosFormData.append(key, buffer, {
          filename: value.name,
          contentType: value.type,
        });
      } else {
        // Add other fields to the new form data
        axiosFormData.append(key, value);
      }
    }

    // Send the request to the backend
    const response = await axios.post(
      `${BACKEND_URL}/api/users/profile/picture`,
      axiosFormData,
      {
        headers: {
          Authorization: await authHeader,
          ...axiosFormData.getHeaders(), // Add form data headers
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error uploading profile picture:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to upload profile picture' },
      { status: error.response?.status || 500 }
    );
  }
}