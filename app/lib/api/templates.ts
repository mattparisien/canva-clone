import { apiClient } from './apiClient';

export interface Template {
  _id: string;
  title: string;
  description?: string;
  type: string; // 'presentation', 'social', 'print', 'custom'
  category: string;
  thumbnail?: string;
  previewImages?: string[];
  tags?: string[];
  author: string;
  featured: boolean;
  popular: boolean;
  canvasSize: {
    name?: string;
    width: number;
    height: number;
  };
  pages: any[];
  createdAt: string;
  updatedAt: string;
}

class TemplatesAPI {
  // Get all templates
  async getAll(params?: { category?: string; type?: string; featured?: boolean; popular?: boolean; tags?: string[] }): Promise<Template[]> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString());
      if (params?.popular !== undefined) queryParams.append('popular', params.popular.toString());
      if (params?.tags && params.tags.length > 0) queryParams.append('tags', params.tags.join(','));
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await apiClient.get<Template[]>(`/templates${query}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching templates:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch templates');
    }
  }
  
  // Get template by ID
  async getById(id: string): Promise<Template> {
    try {
      const response = await apiClient.get<Template>(`/templates/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching template ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch template');
    }
  }
  
  // Get featured templates
  async getFeatured(): Promise<Template[]> {
    try {
      const response = await apiClient.get<Template[]>('/templates/featured/all');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching featured templates:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch featured templates');
    }
  }
  
  // Get popular templates
  async getPopular(): Promise<Template[]> {
    try {
      const response = await apiClient.get<Template[]>('/templates/popular/all');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching popular templates:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch popular templates');
    }
  }
  
  // Get templates by category
  async getByCategory(category: string): Promise<Template[]> {
    try {
      const response = await apiClient.get<Template[]>(`/templates/category/${category}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching templates for category ${category}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch templates by category');
    }
  }
  
  // Create new template
  async create(data: Partial<Template>): Promise<Template> {
    try {
      const response = await apiClient.post<Template>('/templates', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating template:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to create template');
    }
  }
  
  // Create template from existing project
  async createFromProject(projectId: string, category: string, author: string): Promise<Template> {
    try {
      const response = await apiClient.post<Template>(`/templates/from-project/${projectId}`, { category, author });
      return response.data;
    } catch (error: any) {
      console.error('Error creating template from project:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to create template from project');
    }
  }
  
  // Use a template to create a project
  async use(templateId: string, userId: string): Promise<any> {
    try {
      const response = await apiClient.post(`/templates/${templateId}/use`, { userId });
      return response.data;
    } catch (error: any) {
      console.error(`Error using template ${templateId}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to use template');
    }
  }
  
  // Update template
  async update(id: string, data: Partial<Template>): Promise<Template> {
    try {
      const response = await apiClient.put<Template>(`/templates/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating template ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to update template');
    }
  }
  
  // Delete template
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/templates/${id}`);
    } catch (error: any) {
      console.error(`Error deleting template ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to delete template');
    }
  }
}

export const templatesAPI = new TemplatesAPI();