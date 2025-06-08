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
     * Get all assets with optional filtering
     */
    async getAll(userId?: string, folderId?: string): Promise<Asset[]> {
        try {
            let url = "/assets";
            const params = new URLSearchParams();
            
            if (userId) {
                params.append("userId", userId);
            }
            if (folderId !== undefined) {
                params.append("folderId", folderId);
            }
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            const response = await this.apiClient.get<{ data: Asset[] }>(url);
            return response.data;
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
     */
    async upload(params: { file: File; userId?: string; folderId?: string; name?: string; tags?: string[] } | File, tags: string[] = []): Promise<Asset> {
        try {
            const formData = new FormData();
            
            // Handle both old (file, tags) and new ({file, userId, folderId, name, tags}) parameter formats
            let file: File;
            let userId: string | undefined;
            let folderId: string | undefined;
            let name: string | undefined;
            let finalTags: string[];

            if (params instanceof File) {
                // Legacy format: upload(file, tags)
                file = params;
                finalTags = tags;
            } else {
                // New format: upload({file, userId, folderId, name, tags})
                file = params.file;
                userId = params.userId;
                folderId = params.folderId;
                name = params.name;
                finalTags = params.tags || tags;
            }

            // Append the file with correct field name expected by backend
            formData.append("file", file);

            // Add optional parameters
            if (userId) {
                formData.append("userId", userId);
            }
            if (folderId) {
                formData.append("folderId", folderId);
            }
            if (name) {
                formData.append("name", name);
            }
            if (finalTags.length > 0) {
                formData.append("tags", JSON.stringify(finalTags));
            }

            const response = await this.apiClient.post<Asset | {data: Asset}>(
                "/assets/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            // Handle both formats: direct asset response or {data: asset} wrapper
            return (response.data as any).data ? (response.data as any).data : (response.data as Asset);
        } catch (error: any) {
            console.error(
                "Error uploading asset:",
                error.response?.data || error.message
            );
            
            // Handle 409 Conflict responses (duplicate files)
            if (error.response?.status === 409) {
                const conflictError = new Error(error.response.data.message || "Duplicate file detected");
                (conflictError as any).conflict = error.response.data.conflict;
                (conflictError as any).existingAsset = error.response.data.existingAsset;
                throw conflictError;
            }
            
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
            const response = await this.apiClient.get<Asset[]>(
                `/assets/tags?tags=${queryString}`
            );
            return response.data;
        } catch (error: any) {
            console.error(
                "Error fetching assets by tags:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to fetch assets by tags");
        }
    }

    /**
     * Search assets using vector similarity
     */
    async searchByVector(query: string, options?: { 
        userId?: string; 
        limit?: number; 
        threshold?: number; 
    }): Promise<{ 
        query: string; 
        results: (Asset & { similarity: number })[]; 
        total: number; 
    }> {
        try {
            const params = new URLSearchParams({
                query,
                ...(options?.userId && { userId: options.userId }),
                ...(options?.limit && { limit: options.limit.toString() }),
                ...(options?.threshold && { threshold: options.threshold.toString() })
            });

            const response = await this.apiClient.get<{
                query: string;
                results: (Asset & { similarity: number })[];
                total: number;
            }>(`/assets/search/vector?${params}`);
            
            return response.data;
        } catch (error: any) {
            console.error(
                "Error in vector search:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Vector search failed");
        }
    }

    /**
     * Find similar assets to a given asset
     */
    async findSimilar(assetId: string, options?: { 
        limit?: number; 
        threshold?: number; 
    }): Promise<{
        originalAsset: Asset;
        similarAssets: (Asset & { similarity: number })[];
        total: number;
    }> {
        try {
            const params = new URLSearchParams({
                ...(options?.limit && { limit: options.limit.toString() }),
                ...(options?.threshold && { threshold: options.threshold.toString() })
            });

            const response = await this.apiClient.get<{
                originalAsset: Asset;
                similarAssets: (Asset & { similarity: number })[];
                total: number;
            }>(`/assets/${assetId}/similar?${params}`);
            
            return response.data;
        } catch (error: any) {
            console.error(
                `Error finding similar assets for ${assetId}:`,
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to find similar assets");
        }
    }

    /**
     * Get vector store statistics
     */
    async getVectorStats(userId?: string): Promise<{
        user: string;
        assets: {
            total: number;
            vectorized: number;
            pending: number;
            vectorizationRate: string;
        };
        vectorStore: any;
        queueStats: any;
    }> {
        try {
            const params = userId ? `?userId=${userId}` : '';
            const response = await this.apiClient.get(`/assets/vector/stats${params}`);
            return response.data;
        } catch (error: any) {
            console.error(
                "Error getting vector stats:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to get vector statistics");
        }
    }

    /**
     * Process pending vectorization jobs
     */
    async processVectorJobs(userId?: string): Promise<any> {
        try {
            const response = await this.apiClient.post('/assets/vector/process', {
                ...(userId && { userId })
            });
            return response.data;
        } catch (error: any) {
            console.error(
                "Error processing vector jobs:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to process vector jobs");
        }
    }

    /**
     * Force re-vectorization of all assets
     */
    async reVectorizeAssets(userId?: string): Promise<any> {
        try {
            const response = await this.apiClient.post('/assets/vector/revectorize', {
                ...(userId && { userId })
            });
            return response.data;
        } catch (error: any) {
            console.error(
                "Error re-vectorizing assets:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to re-vectorize assets");
        }
    }

    /**
     * Analyze a single asset with AI (for images)
     */
    async analyzeAsset(assetId: string): Promise<any> {
        try {
            const response = await this.apiClient.post(`/assets/${assetId}/analyze`);
            return response.data;
        } catch (error: any) {
            console.error(
                "Error analyzing asset:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to analyze asset");
        }
    }

    /**
     * Batch analyze multiple assets with AI
     */
    async batchAnalyzeAssets(options?: {
        userId?: string;
        limit?: number;
        forceReanalyze?: boolean;
    }): Promise<any> {
        try {
            const response = await this.apiClient.post('/assets/analyze/batch', options || {});
            return response.data;
        } catch (error: any) {
            console.error(
                "Error in batch analysis:",
                error.response?.data || error.message
            );
            throw error.response?.data || new Error("Failed to batch analyze assets");
        }
    }
}