import axios from 'axios';

// Interface definitions
export interface User {
  _id: string;
  name: string;
  email: string;
  company?: string;
  location?: string;
  bio?: string;
  joinedAt: string;
  profilePictureUrl?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UpdateProfilePayload {
  name?: string;
  company?: string;
  location?: string;
  bio?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Auth API class
class AuthAPI {
  // Verify user token
  async verifyToken(token?: string) {
    try {
      const response = await axios.get<{user: User}>('/api/auth/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      return response.data;
    } catch (error: any) {
      console.error('Error verifying token:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to verify token');
    }
  }
  
  // Login user
  async login(email: string, password: string) {
    try {
      const response = await axios.post<AuthResponse>('/api/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      console.error('Error logging in:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to login');
    }
  }
  
  // Register new user
  async register(name: string, email: string, password: string) {
    try {
      const response = await axios.post<AuthResponse>('/api/auth/register', { name, email, password });
      return response.data;
    } catch (error: any) {
      console.error('Error registering:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to register');
    }
  }
  
  // Logout user
  async logout(token?: string) {
    try {
      await axios.post<void>('/api/auth/logout', {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
    } catch (error: any) {
      console.error('Error logging out:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to logout');
    }
  }
  
  // Forgot password
  async forgotPassword(email: string) {
    try {
      const response = await axios.post<{message: string}>('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      console.error('Error with forgot password:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to process forgot password request');
    }
  }
  
  // Reset password
  async resetPassword(token: string, password: string) {
    try {
      const response = await axios.post<AuthResponse>(`/api/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (error: any) {
      console.error('Error resetting password:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to reset password');
    }
  }
  
  // Update user profile
  async updateProfile(data: UpdateProfilePayload) {
    try {
      const response = await axios.put<{user: User}>('/api/auth/update-profile', data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating profile:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to update profile');
    }
  }
}

export const authAPI = new AuthAPI();