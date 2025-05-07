import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios'; // Import InternalAxiosRequestConfig and AxiosError

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to get the auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Create an Axios instance with default headers
const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => { // Use InternalAxiosRequestConfig
    const token = getAuthToken();
    if (token) {
      // InternalAxiosRequestConfig ensures config.headers is defined
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => { // Use AxiosError for better error typing
    return Promise.reject(error);
  }
);

// Define interfaces for API responses (mirroring backend structures)
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  company?: string;
  location?: string;
  bio?: string;
  joinedAt: string;
  profilePictureUrl?: string;
}

interface UpdateProfilePayload {
  name?: string;
  company?: string;
  location?: string;
  bio?: string;
  // Email and password updates are typically handled by separate auth endpoints
}

interface ProfilePictureUploadResponse {
  message: string;
  profilePictureUrl: string;
  fileInfo?: any; // Contains details about the uploaded file from multer
}

// User API functions
export const userAPI = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await apiClient.get<UserProfile>('/users/profile');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching profile:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch profile');
    }
  },

  updateProfile: async (profileData: UpdateProfilePayload): Promise<UserProfile> => {
    try {
      const response = await apiClient.put<{ user: UserProfile; message: string }>('/users/profile', profileData);
      return response.data.user;
    } catch (error: any) {
      console.error('Error updating profile:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to update profile');
    }
  },

  uploadProfilePicture: async (formData: FormData): Promise<ProfilePictureUploadResponse> => {
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
  
  // If you need to logout or other auth actions, they might be here or in a separate authAPI
  // For example:
  // logout: async () => { ... }
};

// You might have other API groups like authAPI, designAPI, etc.
// Example authAPI (can be expanded)
export const authAPI = {
  login: async (credentials: any) => {
    // ... implementation
  },
  register: async (userData: any) => {
    // ... implementation
  },
  // ... other auth functions
};

// Example designAPI (can be expanded)
export const designAPI = {
  getDesigns: async () => {
    // ... implementation
  },
  createDesign: async (designData: any) => {
    // ... implementation
  },
  // ... other design functions
};

// Note: Ensure NEXT_PUBLIC_API_URL is set in your .env.local file for the frontend
// e.g., NEXT_PUBLIC_API_URL=http://localhost:5000/api