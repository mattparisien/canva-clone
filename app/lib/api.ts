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

// Auth API
export const authAPI = {
  // Verify user token
  verifyToken: (token: string) => fetchAPI<{user: any}>('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),
  
  // Login user
  login: (email: string, password: string) => fetchAPI<{user: any; token: string}>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  
  // Register new user
  register: (name: string, email: string, password: string) => fetchAPI<{user: any; token: string}>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  }),
  
  // Logout user
  logout: (token: string) => fetchAPI<void>('/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),
  
  // Forgot password
  forgotPassword: (email: string) => fetchAPI<{message: string}>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  
  // Reset password
  resetPassword: (token: string, password: string) => fetchAPI<{user: any; token: string}>(`/auth/reset-password/${token}`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  }),
  
  // Update user profile
  updateProfile: (token: string, data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) => 
    fetchAPI<{user: any}>('/auth/update-profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data),
    }),
};

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