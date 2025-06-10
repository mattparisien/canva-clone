import { Axios } from "axios";
import { ChatAPIService, ChatResponse, SendMessageRequest, ChatHealthResponse } from "../types/api";
import { APIBase } from "./base";

export class ChatAPI extends APIBase implements ChatAPIService {
  API_URL: string = "/chat";
  apiClient: Axios;

  constructor(apiClient: Axios) {
    super();
    this.apiClient = apiClient;
  }

  async sendMessage(request: SendMessageRequest): Promise<ChatResponse> {
    try {
      const response = await this.apiClient.post<ChatResponse>('/chat/message', {
        message: request.message.trim(),
        useOwnData: request.useOwnData || false
      });
      return response.data;
    } catch (error: any) {
      console.error('Error sending chat message:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to send message');
    }
  }

  async healthCheck(): Promise<ChatHealthResponse> {
    try {
      const response = await this.apiClient.get<ChatHealthResponse>('/chat/health');
      return response.data;
    } catch (error: any) {
      console.error('Error checking chat health:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to check chat health');
    }
  }
}
