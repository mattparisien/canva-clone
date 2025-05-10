// API service for communicating with the backend
import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';

// Base URL for backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper to get the auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Create an Axios instance with default headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to automatically add auth headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Helper function for API requests using fetch (kept for compatibility)
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

// Helper to construct image URLs with size parameters
export const getImageUrlWithSize = (url: string | undefined, width?: number, height?: number): string => {
  if (!url) return '';
  
  // If the URL already has query parameters, add size parameters with &
  // Otherwise, add size parameters with ?
  const separator = url.includes('?') ? '&' : '?';
  
  // Add width and/or height parameters if provided
  const params = [];
  if (width) params.push(`width=${width}`);
  if (height) params.push(`height=${height}`);
  
  // Return original URL if no size parameters
  if (params.length === 0) return url;
  
  return `${url}${separator}${params.join('&')}`;
};

// Define interfaces for API responses
interface User {
  _id: string;
  name: string;
  email: string;
  company?: string;
  location?: string;
  bio?: string;
  joinedAt: string;
  profilePictureUrl?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface UpdateProfilePayload {
  name?: string;
  company?: string;
  location?: string;
  bio?: string;
  currentPassword?: string;
  newPassword?: string;
}

interface ProfilePictureUploadResponse {
  message: string;
  profilePictureUrl: string;
  fileInfo?: any;
}

// Auth API
export const authAPI = {
  // Verify user token
  verifyToken: async (token?: string) => {
    try {
      const response = await apiClient.get<{user: User}>('/auth/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      return response.data;
    } catch (error: any) {
      console.error('Error verifying token:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to verify token');
    }
  },
  
  // Login user
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      console.error('Error logging in:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to login');
    }
  },
  
  // Register new user
  register: async (name: string, email: string, password: string) => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', { name, email, password });
      return response.data;
    } catch (error: any) {
      console.error('Error registering:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to register');
    }
  },
  
  // Logout user
  logout: async (token?: string) => {
    try {
      await apiClient.post<void>('/auth/logout', {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
    } catch (error: any) {
      console.error('Error logging out:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to logout');
    }
  },
  
  // Forgot password
  forgotPassword: async (email: string) => {
    try {
      const response = await apiClient.post<{message: string}>('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      console.error('Error with forgot password:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to process forgot password request');
    }
  },
  
  // Reset password
  resetPassword: async (token: string, password: string) => {
    try {
      const response = await apiClient.post<AuthResponse>(`/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (error: any) {
      console.error('Error resetting password:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to reset password');
    }
  },
  
  // Update user profile
  updateProfile: async (data: UpdateProfilePayload) => {
    try {
      const response = await apiClient.put<{user: User}>('/auth/update-profile', data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating profile:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to update profile');
    }
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    try {
      const response = await apiClient.get<User>('/users/profile');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching profile:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch profile');
    }
  },

  updateProfile: async (profileData: UpdateProfilePayload) => {
    try {
      const response = await apiClient.put<{ user: User; message: string }>('/users/profile', profileData);
      return response.data.user;
    } catch (error: any) {
      console.error('Error updating profile:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to update profile');
    }
  },

  uploadProfilePicture: async (formData: FormData) => {
    try {
      const response = await apiClient.post<ProfilePictureUploadResponse>('/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error uploading profile picture:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to upload profile picture');
    }
  },
};

// Define interfaces for presentation and design
interface Presentation {
  _id: string;
  title: string;
  slides: any[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Design { // Added export
  _id: string;
  title: string; 
  type: string; 
  userId: string;
  thumbnail?: string; 
  category?: string; 
  starred: boolean; 
  shared: boolean; 
  description?: string; 
  canvasSize?: any;    
  pages?: any[];       
  createdAt: string;
  updatedAt: string;
}

// Presentations API
export const presentationsAPI = {
  // Get all presentations
  getAll: async () => {
    try {
      const response = await apiClient.get<Presentation[]>('/presentations');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching presentations:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch presentations');
    }
  },
  
  // Get presentation by ID
  getById: async (id: string) => {
    try {
      const response = await apiClient.get<Presentation>(`/presentations/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching presentation ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch presentation');
    }
  },
  
  // Create new presentation
  create: async (data: Partial<Presentation>) => {
    try {
      const response = await apiClient.post<Presentation>('/presentations', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating presentation:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to create presentation');
    }
  },
  
  // Update presentation
  update: async (id: string, data: Partial<Presentation>) => {
    try {
      const response = await apiClient.put<Presentation>(`/presentations/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating presentation ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to update presentation');
    }
  },
  
  // Delete presentation
  delete: async (id: string) => {
    try {
      await apiClient.delete(`/presentations/${id}`);
    } catch (error: any) {
      console.error(`Error deleting presentation ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to delete presentation');
    }
  },
  
  // Clone presentation
  clone: async (id: string, userId: string) => {
    try {
      const response = await apiClient.post<Presentation>(`/presentations/${id}/clone`, { userId });
      return response.data;
    } catch (error: any) {
      console.error(`Error cloning presentation ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to clone presentation');
    }
  },
};

// Designs API
export const designsAPI = {
  // Get all designs
  getAll: async () => {
    try {
      const response = await apiClient.get<Design[]>('/designs');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching designs:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch designs');
    }
  },
  
  // Get design by ID
  getById: async (id: string) => {
    try {
      const response = await apiClient.get<Design>(`/designs/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching design ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch design');
    }
  },
  
  // Create new design
  create: async (data: Partial<Design>) => {
    try {
      const response = await apiClient.post<Design>('/designs', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating design:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to create design');
    }
  },
  
  // Update design
  update: async (id: string, data: Partial<Design>) => {
    try {
      const response = await apiClient.put<Design>(`/designs/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating design ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to update design');
    }
  },
  
  // Delete design
  delete: async (id: string) => {
    try {
      await apiClient.delete(`/designs/${id}`);
    } catch (error: any) {
      console.error(`Error deleting design ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to delete design');
    }
  },
};

