import axios, { Axios, AxiosError, InternalAxiosRequestConfig } from "axios";
import { APIService } from "../types/api";
import { AssetsAPI } from "./assets";
import { BrandsAPI } from "./brands";
import { ProjectsAPI } from "./projects";
import { UsersAPI } from "./user";
import { TemplatesAPI } from "./templates";
import { AuthAPI } from "./auth";

function createAPIService<T, S extends APIService<T>>(
  ctor: new (client: Axios) => S,
  client: Axios
): S {
  return new ctor(client);
}

// Helper to get the auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Create an Axios instance with default headers
export const apiClient = axios.create({
  baseURL: "/api",
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

const assetsAPI = createAPIService(AssetsAPI, apiClient);
const brandsAPI = createAPIService(BrandsAPI, apiClient);
const projectsAPI = createAPIService(ProjectsAPI, apiClient);
const usersAPI = createAPIService(UsersAPI, apiClient);
const templatesAPI = createAPIService(TemplatesAPI, apiClient);
const authAPI = new AuthAPI(apiClient);

export { assetsAPI, brandsAPI, projectsAPI, templatesAPI, usersAPI, authAPI };