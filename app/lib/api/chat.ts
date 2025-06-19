import { Axios } from "axios";
import { 
  ChatAPIService, 
  ChatResponse, 
  SendMessageRequest, 
  ChatHealthResponse,
  GetUserChatsResponse,
  GetChatResponse,
  CreateChatRequest,
  CreateChatResponse,
  UpdateChatTitleRequest
} from "../types/api";
import { APIBase } from "./base";

export class ChatAPI extends APIBase implements ChatAPIService {
  API_URL: string = "/chat";
  apiClient: Axios;

  constructor(apiClient: Axios) {
    super();
    this.apiClient = apiClient;
  }

  async sendMessage(request: SendMessageRequest, onChunk?: (content: string) => void): Promise<ChatResponse> {
    try {
      const token = this.getAuthToken();
      
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          message: request.message.trim(),
          useOwnData: request.useOwnData || false,
          chatId: request.chatId,
          userId: request.userId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Check if response is streaming
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/event-stream')) {
        return this.handleStreamingResponse(response, onChunk);
      } else {
        // Handle regular JSON response
        return await response.json();
      }

    } catch (error: any) {
      console.error('Error sending chat message:', error);
      throw new Error('Failed to send message');
    }
  }

  private async handleStreamingResponse(response: Response, onChunk?: (content: string) => void): Promise<ChatResponse> {
    return new Promise((resolve, reject) => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let finalData: ChatResponse | null = null;

      if (!reader) {
        reject(new Error('No response body reader available'));
        return;
      }

      const readStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'chunk') {
                    fullResponse += data.content;
                    onChunk?.(data.content);
                  } else if (data.type === 'complete') {
                    // Handle both JSON mode and legacy streaming mode
                    finalData = {
                      ...data,
                      // Ensure we have the response text in the expected format
                      response: data.assistant_text || data.response || fullResponse,
                      assistant_text: data.assistant_text,
                      suggestions: data.suggestions || [],
                      action: data.action
                    };
                  }
                } catch (parseError) {
                  console.warn('Failed to parse SSE data:', parseError);
                }
              }
            }
          }

          if (finalData) {
            resolve(finalData);
          } else {
            // Legacy fallback for streaming mode
            resolve({
              response: fullResponse,
              timestamp: new Date().toISOString(),
              useOwnData: false,
              suggestions: []
            });
          }
        } catch (streamError) {
          reject(streamError);
        }
      };

      readStream();
    });
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

  async getUserChats(userId: string, limit?: number): Promise<GetUserChatsResponse> {
    try {
      const token = this.getAuthToken();
      const queryParams = new URLSearchParams();
      if (limit) queryParams.append('limit', limit.toString());
      
      const response = await fetch(`/api/chat/user/${userId}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error getting user chats:', error);
      throw new Error('Failed to get user chats');
    }
  }

  async getChatById(chatId: string, userId?: string): Promise<GetChatResponse> {
    try {
      const token = this.getAuthToken();
      const queryParams = new URLSearchParams();
      if (userId) queryParams.append('userId', userId);
      
      const response = await fetch(`/api/chat/${chatId}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error getting chat by ID:', error);
      throw new Error('Failed to get chat');
    }
  }

  async createNewChat(request: CreateChatRequest): Promise<CreateChatResponse> {
    try {
      const token = this.getAuthToken();
      
      const response = await fetch('/api/chat/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error creating new chat:', error);
      throw new Error('Failed to create new chat');
    }
  }

  async updateChatTitle(chatId: string, request: UpdateChatTitleRequest): Promise<{ success: boolean; chat: any }> {
    try {
      const token = this.getAuthToken();
      
      const response = await fetch(`/api/chat/${chatId}/title`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error updating chat title:', error);
      throw new Error('Failed to update chat title');
    }
  }

  async deleteChat(chatId: string, userId?: string): Promise<{ success: boolean; message: string }> {
    try {
      const token = this.getAuthToken();
      
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error deleting chat:', error);
      throw new Error('Failed to delete chat');
    }
  }
}