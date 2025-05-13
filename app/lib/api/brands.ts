import { Brand, CreateBrandRequest, GenerateBrandFromAssetsRequest } from "@/lib/types/brands";
import apiClient from './apiClient';
import axios from 'axios';

const API_URL = '/brands';

/**
 * Get all brands for the current user
 */
export async function getAllBrands(): Promise<Brand[]> {
  try {
    const response = await apiClient.get(API_URL);
    return response.data.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch brands');
  }
}

/**
 * Get a brand by ID
 */
export async function getBrandById(brandId: string): Promise<Brand> {
  try {
    const response = await apiClient.get(`${API_URL}/${brandId}`);
    return response.data.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch brand');
  }
}

/**
 * Create a new brand
 */
export async function createBrand(brandData: CreateBrandRequest): Promise<Brand> {
  try {
    const response = await apiClient.post(API_URL, brandData);
    return response.data.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to create brand');
  }
}

/**
 * Update an existing brand
 */
export async function updateBrand(brandId: string, brandData: Partial<CreateBrandRequest>): Promise<Brand> {
  try {
    const response = await apiClient.put(`${API_URL}/${brandId}`, brandData);
    return response.data.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to update brand');
  }
}

/**
 * Delete a brand
 */
export async function deleteBrand(brandId: string): Promise<void> {
  try {
    await apiClient.delete(`${API_URL}/${brandId}`);
  } catch (error) {
    throw handleApiError(error, 'Failed to delete brand');
  }
}

/**
 * Generate a brand from assets
 */
export async function generateBrandFromAssets(request: GenerateBrandFromAssetsRequest): Promise<Brand> {
  try {
    const response = await apiClient.post(`${API_URL}/generate`, request);
    return response.data.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to generate brand');
  }
}

/**
 * Update a brand with a new asset
 */
export async function updateBrandWithAsset(brandId: string, assetId: string): Promise<Brand> {
  try {
    const response = await apiClient.post(`${API_URL}/${brandId}/add-asset`, { assetId });
    return response.data.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to update brand with asset');
  }
}

/**
 * Share a brand with other users
 */
export async function shareBrand(brandId: string, userEmails: string[]): Promise<Brand> {
  try {
    const response = await apiClient.post(`${API_URL}/${brandId}/share`, { userEmails });
    return response.data.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to share brand');
  }
}

/**
 * Upload documents and generate a brand automatically using OpenAI analysis
 * 
 * @param files - Array of files to upload
 * @param brandName - Name for the new brand
 * @returns The created brand with AI-generated brand identity elements
 */
export async function uploadDocumentsAndGenerateBrand(
  files: File[],
  brandName: string
): Promise<Brand> {
  try {
    // First, upload all the documents as assets
    const assetIds = await uploadFilesAsAssets(files);
    
    if (!assetIds.length) {
      throw new Error('No assets were created from the uploaded files');
    }
    
    // Then generate a brand from these assets
    return generateBrandFromAssets({
      assetIds,
      brandName
    });
  } catch (error) {
    throw handleApiError(error, 'Failed to upload documents and generate brand');
  }
}

/**
 * Helper function to upload multiple files as assets
 * @param files - Array of files to upload
 * @returns Array of created asset IDs
 */
async function uploadFilesAsAssets(files: File[]): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadFileAsAsset(file));
    const results = await Promise.all(uploadPromises);
    return results.filter(id => id !== null) as string[];
  } catch (error) {
    console.error('Error uploading files as assets:', error);
    throw new Error('Failed to upload files as assets');
  }
}

/**
 * Helper function to upload a single file as an asset
 * @param file - File to upload
 * @returns Created asset ID or null if upload failed
 */
async function uploadFileAsAsset(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    
    // Include optional metadata
    const tags = ['brand-generation', 'auto-upload'];
    formData.append('tags', JSON.stringify(tags));
    
    const response = await apiClient.post('/assets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.data._id;
  } catch (error) {
    console.error('Error uploading file:', file.name, error);
    return null;
  }
}

/**
 * Helper function to handle API errors
 */
function handleApiError(error: unknown, defaultMessage: string): Error {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message || defaultMessage;
    return new Error(errorMessage);
  }
  return new Error(defaultMessage);
}