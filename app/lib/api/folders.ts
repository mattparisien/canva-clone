import axios from 'axios';

export interface Folder {
  _id: string;
  name: string;
  slug: string; // Add slug field
  userId: string;
  parentId: string | null;
  path: string;
  isShared: boolean;
  sharedWith: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  itemCount?: number; // Optional since it's added dynamically
}

export interface CreateFolderDTO {
  name: string;
  userId: string;
  parentId?: string | null;
}

class FoldersAPI {
  async getAll(userId: string, parentId?: string | null) {
    let url = `/api/folders?userId=${userId}`;
    
    if (parentId !== undefined) {
      url += `&parentId=${parentId === null ? 'null' : parentId}`;
    }
    
    const response = await axios.get<Folder[]>(url);
    return response.data;
  }

  async getById(id: string) {
    const response = await axios.get<Folder>(`/api/folders/${id}`);
    return response.data;
  }
  
  async getBySlug(slug: string, userId: string) {
    const response = await axios.get<Folder>(`/api/folders/slug/${slug}?userId=${userId}`);
    return response.data;
  }

  async create(folderData: CreateFolderDTO) {
    const response = await axios.post<Folder>(`/api/folders`, folderData);
    console.log(response);
    return response.data;
  }

  async update(id: string, updateData: Partial<Folder>) {
    const response = await axios.put<Folder>(`/api/folders/${id}`, updateData);
    return response.data;
  }

  async delete(id: string) {
    const response = await axios.delete(`/api/folders/${id}`);
    return response.data;
  }

  async move(id: string, newParentId: string | null) {
    const response = await axios.patch<Folder>(`/api/folders/${id}/move`, { newParentId });
    return response.data;
  }
}

export const foldersAPI = new FoldersAPI();