import { Axios } from "axios";
import { Project, ProjectsAPIService } from "../types/api";
import { APIBase } from "./base";

export class ProjectsAPI extends APIBase implements ProjectsAPIService {
    API_URL: string = "/projects";
    apiClient: Axios;

    constructor(apiClient: Axios) {
        super();
        this.apiClient = apiClient;
    }

    async getAll(): Promise<Project[]> {
        try {
            const response = await this.apiClient.get<{ data: Project[] }>(
                "/projects"
            );
            return response.data.data;
        } catch (error: any) {
            console.error(
                "Error fetching projects:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to fetch projects");
        }
    }

    async getById(projectId: string): Promise<Project> {
        try {
            const response = await this.apiClient.get<{ data: Project }>(
                `/projects/${projectId}`
            );
            return response.data.data;
        } catch (error: any) {
            console.error(
                `Error fetching project ${projectId}:`,
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to fetch project");
        }
    }

    async create(data: Partial<Project>): Promise<Project> {
        try {
            const response = await this.apiClient.post<{ data: Project }>(
                "/projects",
                data
            );
            return response.data.data;
        } catch (error: any) {
            console.error(
                "Error creating project:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to create project");
        }
    }

    async update(projectId: string, data: Partial<Project>): Promise<Project> {
        try {
            const response = await this.apiClient.put<{ data: Project }>(
                `/projects/${projectId}`,
                data
            );
            return response.data.data;
        } catch (error: any) {
            console.error(
                `Error updating project ${projectId}:`,
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to update project");
        }
    }

    async delete(projectId: string): Promise<void> {
        try {
            await this.apiClient.delete(`/projects/${projectId}`);
        } catch (error: any) {
            console.error(
                `Error deleting project ${projectId}:`,
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to delete project");
        }
    }

    async clone(projectId: string, ownerId: string): Promise<Project> {
        try {
            const response = await this.apiClient.post<{ data: Project }>(
                `/projects/${projectId}/clone`,
                { ownerId }
            );
            return response.data.data;
        } catch (error: any) {
            console.error(
                `Error cloning project ${projectId}:`,
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to clone project");
        }
    }

    async toggleTemplate(
        projectId: string,
        isTemplate: boolean
    ): Promise<Project> {
        try {
            const response = await this.apiClient.put<{ data: Project }>(
                `/projects/${projectId}/toggle-template`,
                { isTemplate }
            );
            return response.data.data;
        } catch (error: any) {
            console.error(
                `Error updating template status for project ${projectId}:`,
                error.response?.data || error.message
            );
            throw (
                error.response?.data || new Error("Failed to update template status")
            );
        }
    }

    async getTemplates(category?: string, type?: string): Promise<Project[]> {
        try {
            const params = new URLSearchParams();
            if (category) params.append("category", category);
            if (type) params.append("type", type);

            const response = await this.apiClient.get<{ data: Project[] }>(
                `/projects/templates?${params.toString()}`
            );
            return response.data.data;
        } catch (error: any) {
            console.error(
                "Error fetching templates:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to fetch templates");
        }
    }

    async getPaginated(
        page: number = 1,
        limit: number = 10,
        filters: Record<string, any> = {},
    ): Promise<{
        projects: Project[];
        totalProjects: number;
        totalPages: number;
        currentPage: number;
    }> {
        try {
            
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("limit", limit.toString());

            // Add any filters to the query params
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });

            const response = await this.apiClient.get<{
                data: Project[];
                totalProjects: number;
                totalPages: number;
                currentPage: number;
            }>(`/projects/paginated?${params.toString()}`);
            
            return {
                projects: response.data.projects,
                totalProjects: response.data.totalProjects,
                totalPages: response.data.totalPages,
                currentPage: response.data.currentPage,
            };
        } catch (error: any) {
            console.error(
                "Error fetching paginated projects:",
                error.response?.data || error.message
            );
            throw (
                error.response?.data || new Error("Failed to fetch paginated projects")
            );
        }
    }
}