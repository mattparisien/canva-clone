import { Axios } from "axios";
import {
  ProfilePictureUploadResponse,
  UpdateProfilePayload,
  User,
  UsersAPIService,
} from "../types/api";
import { APIBase } from "./base";

export class UsersAPI extends APIBase implements UsersAPIService {
  API_URL: string = "/users";
  apiClient: Axios;

  constructor(apiClient: Axios) {
    super();
    this.apiClient = apiClient;
  }

  async getAll(): Promise<User[]> {
    try {
      const response = await this.apiClient.get<{ data: User[] }>("/users");
      return response.data.data;
    } catch (error: any) {
      console.error(
        "Error fetching users:",
        error.response?.data || error.message
      );
      throw error.response?.data || new Error("Failed to fetch users");
    }
  }

  async getById(userId: string): Promise<User> {
    try {
      const response = await this.apiClient.get<{ data: User }>(
        `/users/${userId}`
      );
      return response.data.data;
    } catch (error: any) {
      console.error(
        `Error fetching user ${userId}:`,
        error.response?.data || error.message
      );
      throw error.response?.data || new Error("Failed to fetch user");
    }
  }

  async create(data: Partial<User>): Promise<User> {
    try {
      const response = await this.apiClient.post<{ data: User }>(
        "/users",
        data
      );
      return response.data.data;
    } catch (error: any) {
      console.error(
        "Error creating user:",
        error.response?.data || error.message
      );
      throw error.response?.data || new Error("Failed to create user");
    }
  }

  async update(userId: string, data: Partial<User>): Promise<User> {
    try {
      const response = await this.apiClient.put<{ data: User }>(
        `/users/${userId}`,
        data
      );
      return response.data.data;
    } catch (error: any) {
      console.error(
        `Error updating user ${userId}:`,
        error.response?.data || error.message
      );
      throw error.response?.data || new Error("Failed to update user");
    }
  }

  async delete(userId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/users/${userId}`);
    } catch (error: any) {
      console.error(
        `Error deleting user ${userId}:`,
        error.response?.data || error.message
      );
      throw error.response?.data || new Error("Failed to delete user");
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await this.apiClient.get<{ user: User }>(
        "/users/profile"
      );
      return response.data.user;
    } catch (error: any) {
      console.error(
        "Error fetching profile:",
        error.response?.data || error.message
      );
      throw error.response?.data || new Error("Failed to fetch profile");
    }
  }

  async updateProfile(profileData: UpdateProfilePayload): Promise<User> {
    try {
      const response = await this.apiClient.put<{
        user: User;
        message: string;
      }>("/users/profile", profileData);
      return response.data.user;
    } catch (error: any) {
      console.error(
        "Error updating profile:",
        error.response?.data || error.message
      );
      throw error.response?.data || new Error("Failed to update profile");
    }
  }

  async uploadProfilePicture(
    formData: FormData
  ): Promise<ProfilePictureUploadResponse> {
    try {
      const response = await this.apiClient.post<ProfilePictureUploadResponse>(
        "/users/profile/picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Error uploading profile picture:",
        error.response?.data || error.message
      );
      throw (
        error.response?.data || new Error("Failed to upload profile picture")
      );
    }
  }
}