/**
 * API client for asset operations
 */

export interface Asset {
  _id: string;
  name: string;
  type: string;
  url: string;
  cloudinaryUrl?: string;
  cloudinaryId?: string;
  mimeType: string;
  size?: number;
  tags?: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = '/api/assets';

/**
 * Upload a file as an asset
 */
export async function uploadAsset(file: File, tags: string[] = []): Promise<Asset> {
  const formData = new FormData();
  formData.append('asset', file);
  
  // Add tags if provided
  if (tags.length > 0) {
    formData.append('tags', JSON.stringify(tags));
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload asset: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get all assets
 */
export async function getAllAssets(): Promise<Asset[]> {
  const response = await fetch(API_URL, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch assets: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get an asset by ID
 */
export async function getAssetById(assetId: string): Promise<Asset> {
  const response = await fetch(`${API_URL}/${assetId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch asset: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

/**
 * Update an asset
 */
export async function updateAsset(
  assetId: string,
  updateData: { name?: string; tags?: string[] }
): Promise<Asset> {
  const response = await fetch(`${API_URL}/${assetId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update asset: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

/**
 * Delete an asset
 */
export async function deleteAsset(assetId: string): Promise<void> {
  const response = await fetch(`${API_URL}/${assetId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete asset: ${response.status}`);
  }
}