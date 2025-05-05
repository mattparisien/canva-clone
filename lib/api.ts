// API service for communicating with the backend

// Base URL for backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function for API requests
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred while fetching data');
  }

  return response.json();
}

// Presentations API
export const presentationsAPI = {
  // Get all presentations
  getAll: () => fetchAPI<any[]>('/presentations'),
  
  // Get presentation by ID
  getById: (id: string) => fetchAPI<any>(`/presentations/${id}`),
  
  // Create new presentation
  create: (data: any) => fetchAPI<any>('/presentations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Update presentation
  update: (id: string, data: any) => fetchAPI<any>(`/presentations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Delete presentation
  delete: (id: string) => fetchAPI<void>(`/presentations/${id}`, {
    method: 'DELETE',
  }),
  
  // Clone presentation
  clone: (id: string, userId: string) => fetchAPI<any>(`/presentations/${id}/clone`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }),
};

// Designs API
export const designsAPI = {
  // Get all designs
  getAll: () => fetchAPI<any[]>('/designs'),
  
  // Get design by ID
  getById: (id: string) => fetchAPI<any>(`/designs/${id}`),
  
  // Create new design
  create: (data: any) => fetchAPI<any>('/designs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Update design
  update: (id: string, data: any) => fetchAPI<any>(`/designs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Delete design
  delete: (id: string) => fetchAPI<void>(`/designs/${id}`, {
    method: 'DELETE',
  }),
};