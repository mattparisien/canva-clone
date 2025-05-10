import axios from 'axios';

export interface Design {
  _id: string;
  title: string; 
  type: string; 
  userId: string;
  thumbnail?: string; 
  category?: string; 
  starred: boolean; 
  shared: boolean; 
  description?: string; 
  canvasSize?: any;    
  pages?: any[];       
  createdAt: string;
  updatedAt: string;
}

class DesignsAPI {
  // Get all designs
  async getAll() {
    try {
      const response = await axios.get<Design[]>('/api/designs');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching designs:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch designs');
    }
  }
  
  // Get design by ID
  async getById(id: string) {
    try {
      const response = await axios.get<Design>(`/api/designs/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching design ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch design');
    }
  }
  
  // Create new design
  async create(data: Partial<Design>) {
    try {
      const response = await axios.post<Design>('/api/designs', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating design:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to create design');
    }
  }
  
  // Update design
  async update(id: string, data: Partial<Design>) {
    try {
      const response = await axios.put<Design>(`/api/designs/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating design ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to update design');
    }
  }
  
  // Delete design
  async delete(id: string) {
    try {
      await axios.delete(`/api/designs/${id}`);
    } catch (error: any) {
      console.error(`Error deleting design ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to delete design');
    }
  }
}

export const designsAPI = new DesignsAPI();