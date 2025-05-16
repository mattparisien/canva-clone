import { Axios } from "axios";
import { APIService, Asset } from "../types/api";
import { APIBase } from "./base";

export class AssetsAPI extends APIBase implements APIService<Asset> {
    API_URL: string = "/assets";
    apiClient: Axios;

    constructor(apiClient: Axios) {
        super();
        this.apiClient = apiClient;
    }

    /**
     * Get all assets
     */
    async getAll(): Promise<Asset[]> {
        try {
            const response = await this.apiClient.get<{ data: Asset[] }>("/assets");
            return response.data.data;
        } catch (error: any) {
            console.error(
                "Error fetching assets:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to fetch assets");
        }
    }

    /**
     * Get an asset by ID
     */
    async getById(assetId: string): Promise<Asset> {
        try {
            const response = await this.apiClient.get<{ data: Asset }>(
                `/assets/${assetId}`
            );
            return response.data.data;
        } catch (error: any) {
            console.error(
                `Error fetching asset ${assetId}:`,
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to fetch asset");
        }
    }
    /**
     * Create a new asset
     */
    async create(data: Partial<Asset>): Promise<Asset> {
        try {
            const response = await this.apiClient.post<{ data: Asset }>(
                "/assets",
                data
            );
            return response.data.data;
        } catch (error: any) {
            console.error(
                "Error creating asset:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to create asset");
        }
    }

    /**
     * Update an asset
     */
    async update(
        assetId: string,
        updateData: { name?: string; tags?: string[] }
    ): Promise<Asset> {
        try {
            const response = await this.apiClient.put<{ data: Asset }>(
                `/assets/${assetId}`,
                updateData
            );
            return response.data.data;
        } catch (error: any) {
            console.error(
                `Error updating asset ${assetId}:`,
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to update asset");
        }
    }

    /**
     * Delete an asset
     */
    async delete(assetId: string): Promise<void> {
        try {
            await this.apiClient.delete(`/assets/${assetId}`);
        } catch (error: any) {
            console.error(
                `Error deleting asset ${assetId}:`,
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to delete asset");
        }
    }

    /**
     * Upload a file as an asset
     * 
     */

    async upload(file: File, tags: string[] = []): Promise<Asset> {
        try {
            const formData = new FormData();
            formData.append("asset", file);

            // Add tags if provided
            if (tags.length > 0) {
                formData.append("tags", JSON.stringify(tags));
            }

            const response = await this.apiClient.post<{ data: Asset }>(
                "/assets",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data.data;
        } catch (error: any) {
            console.error(
                "Error uploading asset:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to upload asset");
        }
    }

    /**
     * Upload multiple assets at once
     */
    async uploadMultiple(files: File[], tags: string[] = []): Promise<Asset[]> {
        try {
            const uploadPromises = files.map((file) => this.upload(file, tags));
            return await Promise.all(uploadPromises);
        } catch (error: any) {
            console.error("Error uploading multiple assets:", error);
            throw new Error("Failed to upload multiple assets");
        }
    }

    /**
     * Get assets by tags
     */
    async getByTags(tags: string[]): Promise<Asset[]> {
        try {
            const queryString = tags.join(",");
            const response = await this.apiClient.get<{ data: Asset[] }>(
                `/assets/tags?tags=${queryString}`
            );
            return response.data.data;
        } catch (error: any) {
            console.error(
                "Error fetching assets by tags:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to fetch assets by tags");
        }
    }
}