import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { Readable } from "stream";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001/api';

// Helper function to convert ReadableStream to Buffer
async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

// POST handler for file uploads
export async function POST(req: NextRequest) {
  try {
    // Get auth header
    const authHeader = req.headers.get('authorization');
    const headers: Record<string, string> = {};
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Get the form data
    const formData = await req.formData();
    
    // Create a new FormData to send to the backend
    const backendFormData = new FormData();
    
    // Debug logging
    console.log('Received form data keys:', [...formData.keys()]);
    
    // Copy all entries from the incoming form data
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        // Handle file entries
        console.log(`Processing file: ${key}, name: ${value.name}, type: ${value.type}, size: ${value.size}`);
        backendFormData.append(key, new Blob([await value.arrayBuffer()]), value.name);
      } else {
        // Handle non-file entries
        console.log(`Processing field: ${key}, value: ${value}`);
        backendFormData.append(key, value);
      }
    }

    // Forward the request to the backend - fix URL path
    const response = await axios.post(`${BACKEND_URL}/api/assets/upload`, backendFormData, {
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data',
      },
      maxBodyLength: Infinity, // Needed for large file uploads
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error uploading asset:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to upload asset' },
      { status: error.response?.status || 500 }
    );
  }
}