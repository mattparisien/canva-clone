import { Axios } from "axios";
import { AuthAPIService, AuthResponse, User } from "../types/api";
import { APIBase } from "./base";

export class AuthAPI extends APIBase implements AuthAPIService {
  API_URL: string = "/custom-auth";
  apiClient: Axios;

  constructor(apiClient: Axios) {
    super();
    this.apiClient = apiClient;
  }

  async verifyToken(token?: string): Promise<User> {
    try {
      const response = await this.apiClient.get<{ user: User }>('/auth/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      return response.data.user;
    } catch (error: any) {
      console.error('Error verifying token:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to verify token');
    }
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post<AuthResponse>('/auth/register', { name, email, password });
      return response.data;
    } catch (error: any) {
      console.error('Error registering:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to register');
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Logging in with:', { email, password });
      const response = await this.apiClient.post<AuthResponse>('/custom-auth/login', { email, password });

      return response.data;
    } catch (error: any) {
      console.error('Error logging in:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to login');
    }
  }

  async logout(token?: string): Promise<void> {
    try {
      await this.apiClient.post<void>('/auth/logout', {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
    } catch (error: any) {
      console.error('Error logging out:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to logout');
    }
  }
}