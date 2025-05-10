import axios from 'axios';

export interface Presentation {
  _id: string;
  title: string;
  slides: any[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

class PresentationsAPI {
  // Get all presentations
  async getAll() {
    try {
      const response = await axios.get<Presentation[]>('/api/presentations');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching presentations:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch presentations');
    }
  }
  
  // Get presentation by ID
  async getById(id: string) {
    try {
      const response = await axios.get<Presentation>(`/api/presentations/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching presentation ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch presentation');
    }
  }
  
  // Create new presentation
  async create(data: Partial<Presentation>) {
    try {
      const response = await axios.post<Presentation>('/api/presentations', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating presentation:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to create presentation');
    }
  }
  
  // Update presentation
  async update(id: string, data: Partial<Presentation>) {
    try {
      const response = await axios.put<Presentation>(`/api/presentations/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating presentation ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to update presentation');
    }
  }
  
  // Delete presentation
  async delete(id: string) {
    try {
      await axios.delete(`/api/presentations/${id}`);
    } catch (error: any) {
      console.error(`Error deleting presentation ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to delete presentation');
    }
  }
  
  // Clone presentation
  async clone(id: string, userId: string) {
    try {
      const response = await axios.post<Presentation>(`/api/presentations/${id}/clone`, { userId });
      return response.data;
    } catch (error: any) {
      console.error(`Error cloning presentation ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to clone presentation');
    }
  }
}

export const presentationsAPI = new PresentationsAPI();