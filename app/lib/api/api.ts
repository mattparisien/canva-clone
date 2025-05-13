// API service for communicating with the backend
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Brand as BrandType, CreateBrandRequest, GenerateBrandFromAssetsRequest } from "@/lib/types/brands";

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

// Define interface for Asset
export interface Asset {
  _id: string;
  name: string;
  type: string;
  url: string;
  cloudinaryUrl?: string;
  cloudinaryId?: string;
  mimeType: string;
  size?: number;
  tags?: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
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

// Assets API (converted from class-based to object structure)
export const assetsAPI = {
  API_URL: '/assets',
  
  /**
   * Upload a file as an asset
   */
  upload: async (file: File, tags: string[] = []): Promise<Asset> => {
    try {
      const formData = new FormData();
      formData.append('asset', file);
      
      // Add tags if provided
      if (tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      }
    
      const response = await apiClient.post<{data: Asset}>('/assets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    
      return response.data.data;
    } catch (error: any) {
      console.error('Error uploading asset:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to upload asset');
    }
  },
  
  /**
   * Get all assets
   */
  getAll: async (): Promise<Asset[]> => {
    try {
      const response = await apiClient.get<{data: Asset[]}>('/assets');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching assets:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch assets');
    }
  },
  
  /**
   * Get an asset by ID
   */
  getById: async (assetId: string): Promise<Asset> => {
    try {
      const response = await apiClient.get<{data: Asset}>(`/assets/${assetId}`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Error fetching asset ${assetId}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch asset');
    }
  },
  
  /**
   * Update an asset
   */
  update: async (
    assetId: string,
    updateData: { name?: string; tags?: string[] }
  ): Promise<Asset> => {
    try {
      const response = await apiClient.put<{data: Asset}>(`/assets/${assetId}`, updateData);
      return response.data.data;
    } catch (error: any) {
      console.error(`Error updating asset ${assetId}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to update asset');
    }
  },
  
  /**
   * Delete an asset
   */
  delete: async (assetId: string): Promise<void> => {
    try {
      await apiClient.delete(`/assets/${assetId}`);
    } catch (error: any) {
      console.error(`Error deleting asset ${assetId}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to delete asset');
    }
  },

  /**
   * Upload multiple assets at once
   */
  uploadMultiple: async (files: File[], tags: string[] = []): Promise<Asset[]> => {
    try {
      const uploadPromises = files.map(file => assetsAPI.upload(file, tags));
      return await Promise.all(uploadPromises);
    } catch (error: any) {
      console.error('Error uploading multiple assets:', error);
      throw new Error('Failed to upload multiple assets');
    }
  },

  /**
   * Get assets by tags
   */
  getByTags: async (tags: string[]): Promise<Asset[]> => {
    try {
      const queryString = tags.join(',');
      const response = await apiClient.get<{data: Asset[]}>(`/assets/tags?tags=${queryString}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching assets by tags:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch assets by tags');
    }
  }
};

// BrandsAPI object structure (converted from class)
export const brandsAPI = {
  API_URL: '/brands',
  
  /**
   * Get all brands for the current user
   */
  getAll: async (): Promise<BrandType[]> => {
    try {
      const response = await apiClient.get('/brands');
      // Fix: Handle both possible response formats
      return Array.isArray(response.data) ? response.data : 
             response.data.data ? response.data.data : [];
    } catch (error: any) {
      console.error('Error fetching brands:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch brands');
    }
  },
  
  /**
   * Get a brand by ID
   */
  getById: async (brandId: string): Promise<BrandType> => {
    try {
      const response = await apiClient.get(`/brands/${brandId}`);
      // Fix: Handle both possible response formats
      return response.data.data ? response.data.data : response.data;
    } catch (error: any) {
      console.error(`Error fetching brand ${brandId}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch brand');
    }
  },
  
  /**
   * Create a new brand
   */
  create: async (brandData: CreateBrandRequest): Promise<BrandType> => {
    try {
      const response = await apiClient.post('/brands', brandData);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating brand:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to create brand');
    }
  },
  
  /**
   * Update an existing brand
   */
  update: async (brandId: string, brandData: Partial<CreateBrandRequest>): Promise<BrandType> => {
    try {
      const response = await apiClient.put(`/brands/${brandId}`, brandData);
      return response.data.data;
    } catch (error: any) {
      console.error(`Error updating brand ${brandId}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to update brand');
    }
  },
  
  /**
   * Delete a brand
   */
  delete: async (brandId: string): Promise<void> => {
    try {
      await apiClient.delete(`/brands/${brandId}`);
    } catch (error: any) {
      console.error(`Error deleting brand ${brandId}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to delete brand');
    }
  },
  
  /**
   * Generate a brand from assets
   */
  generateFromAssets: async (request: GenerateBrandFromAssetsRequest): Promise<BrandType> => {
    try {
      const response = await apiClient.post(`/brands/generate`, request);
      return response.data.data;
    } catch (error: any) {
      console.error('Error generating brand from assets:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to generate brand');
    }
  },
  
  /**
   * Update a brand with a new asset
   */
  updateWithAsset: async (brandId: string, assetId: string): Promise<BrandType> => {
    try {
      const response = await apiClient.post(`/brands/${brandId}/add-asset`, { assetId });
      return response.data.data;
    } catch (error: any) {
      console.error(`Error updating brand ${brandId} with asset:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to update brand with asset');
    }
  },
  
  /**
   * Share a brand with other users
   */
  share: async (brandId: string, userEmails: string[]): Promise<BrandType> => {
    try {
      const response = await apiClient.post(`/brands/${brandId}/share`, { userEmails });
      return response.data.data;
    } catch (error: any) {
      console.error(`Error sharing brand ${brandId}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to share brand');
    }
  },

  /**
   * Upload documents and generate a brand automatically using OpenAI analysis
   * 
   * @param files - Array of files to upload
   * @param brandName - Name for the new brand
   * @returns The created brand with AI-generated brand identity elements
   */
  uploadDocumentsAndGenerate: async (
    files: File[],
    brandName: string
  ): Promise<BrandType> => {
    try {
      // First, upload all the documents as assets
      const assetIds = await uploadFilesAsAssets(files);
      
      if (!assetIds.length) {
        throw new Error('No assets were created from the uploaded files');
      }
      
      // Then generate a brand from these assets
      return brandsAPI.generateFromAssets({
        assetIds,
        brandName
      });
    } catch (error: any) {
      console.error('Error uploading documents and generating brand:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to upload documents and generate brand');
    }
  }
};

/**
 * Helper function to upload multiple files as assets
 * @param files - Array of files to upload
 * @returns Array of created asset IDs
 */
async function uploadFilesAsAssets(files: File[]): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadFileAsAsset(file));
    const results = await Promise.all(uploadPromises);
    return results.filter(id => id !== null) as string[];
  } catch (error) {
    console.error('Error uploading files as assets:', error);
    throw new Error('Failed to upload files as assets');
  }
}

/**
 * Helper function to upload a single file as an asset
 * @param file - File to upload
 * @returns Created asset ID or null if upload failed
 */
async function uploadFileAsAsset(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    
    // Include optional metadata
    const tags = ['brand-generation', 'auto-upload'];
    formData.append('tags', JSON.stringify(tags));
    
    const response = await apiClient.post('/assets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.data._id;
  } catch (error) {
    console.error('Error uploading file:', file.name, error);
    return null;
  }
}

// For backward compatibility with existing code
export const designsAPI = projectsAPI;

// Re-export all API modules and types from the new modular structure
export * from './index';

// This file is maintained for backward compatibility
// New code should import directly from the modular API files in /lib/api/

