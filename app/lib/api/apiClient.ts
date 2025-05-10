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
export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

export default apiClient;