import axios from 'axios';
import { User, UpdateProfilePayload } from './auth';

interface ProfilePictureUploadResponse {
  message: string;
  profilePictureUrl: string;
  fileInfo?: any;
}

class UserAPI {
  async getProfile() {
    try {
      const response = await axios.get<User>('/api/users/profile');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching profile:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch profile');
    }
  }

  async updateProfile(profileData: UpdateProfilePayload) {
    try {
      const response = await axios.put<{ user: User; message: string }>('/api/users/profile', profileData);
      return response.data.user;
    } catch (error: any) {
      console.error('Error updating profile:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to update profile');
    }
  }

  async uploadProfilePicture(formData: FormData) {
    try {
      const response = await axios.post<ProfilePictureUploadResponse>('/api/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error uploading profile picture:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to upload profile picture');
    }
  }
}

export const userAPI = new UserAPI();