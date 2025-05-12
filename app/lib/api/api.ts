// API service for communicating with the backend
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';


// Helper to get the auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Create an Axios instance with default headers
// Now using relative URLs to hit Next.js API routes
const apiClient = axios.create({
  baseURL: '/api', // Changed from BACKEND_API_URL to use Next.js API routes
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
  const response = await fetch(`/api${endpoint}`, { // Changed to use Next.js API routes
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
      const response = await apiClient.get<{ user: User }>('/auth/me', {
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
      const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
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
      const response = await apiClient.put<{ user: User }>('/auth/update-profile', data);
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

// Define interfaces for presentation and project
interface Presentation {
  _id: string;
  title: string;
  slides: any[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  title: string;
  type: string;
  userId: string;
  thumbnail?: string;
  category?: string;
  starred: boolean;
  shared: boolean;
  isTemplate: boolean;
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

// Projects API (renamed from Designs API)
export const projectsAPI = {
  // Get all projects
  getAll: async () => {
    try {
      const response = await apiClient.get<Project[]>('/projects');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching projects:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch projects');
    }
  },

  // Get projects with pagination
  getProjects: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      // Add any filters to the query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const queryParams = params.toString() ? `?${params.toString()}` : '';
      const response = await apiClient.get<{
        projects: Project[],
        totalProjects: number,
        totalPages: number,
        currentPage: number
      }>(`/projects/paginated${queryParams}`);

      return response.data;
    } catch (error: any) {
      console.error('Error fetching paginated projects:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch paginated projects');
    }
  },

  // Get all templates
  getTemplates: async (category?: string, type?: string) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (type) params.append('type', type);

      const queryParams = params.toString() ? `?${params.toString()}` : '';
      const response = await apiClient.get<Project[]>(`/projects/templates${queryParams}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching templates:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch templates');
    }
  },

  // Get project by ID
  getById: async (id: string) => {
    try {
      const response = await apiClient.get<Project>(`/projects/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching project ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch project');
    }
  },

  // Create new project
  create: async (data: Partial<Project>) => {
    try {
      const response = await apiClient.post<Project>('/projects', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating project:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to create project');
    }
  },

  // Update project
  update: async (id: string, data: Partial<Project>) => {
    try {
      const response = await apiClient.put<Project>(`/projects/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating project ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to update project');
    }
  },

  // Delete project
  delete: async (id: string) => {
    try {
      await apiClient.delete(`/projects/${id}`);
    } catch (error: any) {
      console.error(`Error deleting project ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to delete project');
    }
  },

  // Clone project
  clone: async (id: string, userId: string) => {
    try {
      const response = await apiClient.post<Project>(`/projects/${id}/clone`, { userId });
      return response.data;
    } catch (error: any) {
      console.error(`Error cloning project ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to clone project');
    }
  },

  // Toggle template status
  toggleTemplate: async (id: string, isTemplate: boolean) => {
    try {
      const response = await apiClient.put<Project>(`/projects/${id}/toggle-template`, { isTemplate });
      return response.data;
    } catch (error: any) {
      console.error(`Error updating template status for project ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to update template status');
    }
  },
};

// For backward compatibility with existing code
export const designsAPI = projectsAPI;

// Re-export all API modules and types from the new modular structure
export * from './index';

// This file is maintained for backward compatibility
// New code should import directly from the modular API files in /lib/api/

