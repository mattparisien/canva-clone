import axios from 'axios';

export interface Asset {
  _id: string;
  name: string;
  originalFilename: string;
  userId: string;
  folderId: string | null;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  mimeType: string;
  fileSize: number;
  url: string;
  gridFsId?: string;
  thumbnail?: string;
  isShared: boolean;
  sharedWith: string[];
  metadata?: Record<string, any>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UploadAssetParams {
  file: File;
  userId: string;
  folderId?: string | null;
  name?: string;
  tags?: string[];
}

class AssetsAPI {
  async getAll(userId: string, folderId?: string | null, type?: string) {
    let url = `/api/assets?userId=${userId}`;
    
    if (folderId !== undefined) {
      url += `&folderId=${folderId === null ? 'null' : folderId}`;
    }
    
    if (type) {
      url += `&type=${type}`;
    }
    
    const response = await axios.get<Asset[]>(url);
    return response.data;
  }

  async getById(id: string) {
    const response = await axios.get<Asset>(`/api/assets/${id}`);
    return response.data;
  }

  async upload({ file, userId, folderId = null, name, tags = [] }: UploadAssetParams) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    if (folderId !== undefined) {
      formData.append('folderId', folderId === null ? 'null' : folderId);
    }
    
    if (name) {
      formData.append('name', name);
    }
    
    if (tags.length > 0) {
      formData.append('tags', JSON.stringify(tags));
    }
    
    const response = await axios.post<Asset>(`/api/assets`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }

  async update(id: string, updateData: Partial<Asset>) {
    const response = await axios.put<Asset>(`/api/assets/${id}`, updateData);
    return response.data;
  }

  async delete(id: string) {
    const response = await axios.delete(`/api/assets/${id}`);
    return response.data;
  }

  async move(id: string, folderId: string | null) {
    const response = await axios.patch<Asset>(`/api/assets/${id}/move`, { folderId });
    return response.data;
  }
}

export const assetsAPI = new AssetsAPI();