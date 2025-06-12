import { Axios } from "axios";
import { Brand } from "./brands";
import { ChatConversation, ChatWithHistory } from "@shared/types/types/chat";

/**
 * Represents a digital asset in the system.
 * Assets can be images, videos, audio files, or other media used in projects.
 */
export interface Asset {
  _id: string;                 // Unique identifier for the asset
  name: string;                // Display name of the asset
  originalFilename?: string;   // Original filename when uploaded
  type: string;                // Type of asset (e.g., 'image', 'video', 'audio')
  url: string;                 // URL to access the asset
  cloudinaryUrl?: string;      // Cloudinary-specific URL if using Cloudinary for storage
  cloudinaryId?: string;       // Cloudinary resource identifier
  mimeType: string;            // MIME type of the asset (e.g., 'image/jpeg')
  fileSize: number;            // Size of the asset in bytes
  size?: number;               // Legacy size property for backward compatibility
  thumbnail?: string;          // URL to thumbnail for images/videos
  tags?: string[];             // Keywords/tags associated with the asset for organization and search
  userId: string;              // ID of the user who owns this asset
  folderId?: string;           // ID of the folder containing this asset
  createdAt: string;           // ISO timestamp of asset creation
  updatedAt: string;           // ISO timestamp of last update
}

/**
 * User interface representing a registered user in the system.
 */
export interface User {
  _id: string;                 // Unique identifier for the user
  name: string;                // User's full name
  email: string;               // User's email address (unique)
  company?: string;            // Optional company affiliation
  location?: string;           // Optional location information
  bio?: string;                // Optional user biography
  joinedAt: string;            // ISO timestamp of when the user registered
  profilePictureUrl?: string;  // Optional profile picture URL
}

/**
 * Authentication response object returned after successful login or registration.
 */
export interface AuthResponse {
  user: User;                  // User object with profile information
  token: string;               // JWT authentication token for subsequent API calls
}

/**
 * Payload for updating a user's profile information.
 */
export interface UpdateProfilePayload {
  name?: string;               // Updated name (optional)
  company?: string;            // Updated company (optional)
  location?: string;           // Updated location (optional)
  bio?: string;                // Updated biography (optional)
  currentPassword?: string;    // Current password (required for password changes)
  newPassword?: string;        // New password (for password changes)
}

/**
 * Response after successfully uploading a profile picture.
 */
export interface ProfilePictureUploadResponse {
  message: string;             // Success message
  profilePictureUrl: string;   // URL of the uploaded profile picture
  fileInfo?: any;              // Additional file information
}

/**
 * Represents a presentation containing multiple slides.
 */
export interface Presentation {
  _id: string;                 // Unique identifier
  title: string;               // Presentation title
  slides: any[];               // Array of slide objects
  userId: string;              // Owner of the presentation
  createdAt: string;           // Creation timestamp
  updatedAt: string;           // Last updated timestamp
}

/**
 * Represents a design project created by a user.
 * Projects can be presentations, social media graphics, print designs, etc.
 */
export interface Project {
  _id: string;                 // Unique identifier
  title: string;               // Project title
  type: string;                // Project type (e.g., 'presentation', 'social', 'print')
  userId: string;              // Owner of the project
  thumbnail?: string;          // Preview thumbnail URL
  category?: string;           // Project category for organization
  starred: boolean;            // Whether the project is starred by the user
  shared: boolean;             // Whether the project is shared with other users
  isTemplate: boolean;         // Whether this project serves as a template
  description?: string;        // Optional project description
  dimensions?: { width: number; height: number; aspectRatio: string }; // Canvas dimensions using new structure
  canvasSize?: { name?: string; width: number; height: number; aspectRatio?: string }; // Legacy canvas size format
  pages?: any[];               // Array of design pages/slides
  createdAt: string;           // Creation timestamp
  updatedAt: string;           // Last updated timestamp
}

/**
 * Represents a design template that users can use as a starting point.
 */
export interface Template {
  _id: string;                 // Unique identifier
  title: string;               // Template title
  description?: string;        // Optional description
  type: string;                // Template type ('presentation', 'social', 'print', 'custom')
  category: string;            // Category for organization
  thumbnail?: string;          // Preview thumbnail URL
  previewImages?: string[];    // Additional preview images
  tags?: string[];             // Keywords for search and filtering
  author: string;              // Creator of the template
  featured: boolean;           // Whether this is a featured template
  popular: boolean;            // Whether this is a popular template
  canvasSize: {                // Canvas dimensions
    name?: string;             // Named size (e.g., 'Instagram Post', 'Letter')
    width: number;             // Width in pixels
    height: number;            // Height in pixels
  };
  pages: any[];                // Template pages/slides
  createdAt: string;           // Creation timestamp
  updatedAt: string;           // Last updated timestamp
}

/**
 * Base interface for all API services with common authentication functionality.
 */
export interface APIServiceBase {
  /**
   * Retrieves the authentication token from storage.
   * @returns The stored JWT token or null if not authenticated
   */
  getAuthToken: () => string | null;
}

/**
 * Generic API service interface providing standard CRUD operations.
 * @template T - The data type managed by this API service
 */
export interface APIService<T> extends APIServiceBase {
  API_URL: string;             // Base URL for the API endpoint
  apiClient: Axios;            // Axios client instance for making HTTP requests

  /**
   * Retrieves all records of type T.
   * @param args - Optional arguments for filtering (implementation-specific)
   * @returns Promise resolving to an array of T objects
   */
  getAll: (...args: any[]) => Promise<T[]>;

  /**
   * Retrieves a specific record by its ID.
   * @param id - The unique identifier of the record
   * @returns Promise resolving to the requested T object
   */
  getById: (id: string) => Promise<T>;

  /**
   * Creates a new record.
   * @param data - The data for creating the new record
   * @returns Promise resolving to the created T object
   */
  create: (data: Partial<T>) => Promise<T>;

  /**
   * Updates an existing record.
   * @param id - The unique identifier of the record to update
   * @param data - The data to update
   * @returns Promise resolving to the updated T object
   */
  update: (id: string, data: Partial<T>) => Promise<T>;

  /**
   * Deletes a record by ID.
   * @param id - The unique identifier of the record to delete
   * @returns Promise resolving when deletion is complete
   */
  delete: (id: string) => Promise<void>;
}

/**
 * Constructor interface for API services.
 * @template T - The data type managed by this API service
 */
export interface APIServiceConstructor<T> {
  new(apiClient: Axios): APIService<T>;
}

/**
 * Request for creating a new brand.
 */
export type CreateBrandRequest = Partial<Brand>

/**
 * Request for generating a brand from uploaded assets.
 */
export interface GenerateBrandFromAssetsRequest {
  assetIds: string[];          // IDs of assets to use for brand generation
  brandName: string;           // Name of the brand to be created
}

/**
 * Extended API service for brand-related operations.
 * Includes specialized methods beyond the standard CRUD operations.
 */
export interface BrandsAPIService extends APIService<Brand> {
  /**
   * Generates a new brand using AI based on uploaded assets.
   * @param request - Contains brand name and IDs of assets to analyze
   * @returns Promise resolving to the generated Brand object
   */
  generateFromAssets(request: GenerateBrandFromAssetsRequest): Promise<Brand>;
}

/**
 * Extended API service for project-related operations.
 * Includes specialized methods beyond the standard CRUD operations.
 */
export interface ProjectsAPIService extends APIService<Project> {
  /**
   * Creates a copy of an existing project.
   * @param id - ID of the project to clone
   * @param userId - ID of the user who will own the cloned project
   * @returns Promise resolving to the cloned Project object
   */
  clone: (id: string, userId: string) => Promise<Project>;

  /**
   * Toggles whether a project is a template.
   * @param id - ID of the project to update
   * @param isTemplate - Whether the project should be a template
   * @returns Promise resolving to the updated Project object
   */
  toggleTemplate: (id: string, isTemplate: boolean) => Promise<Project>;

  /**
   * Retrieves all templates, optionally filtered by category and type.
   * @param category - Optional category to filter templates by
   * @param type - Optional type to filter templates by
   * @returns Promise resolving to an array of matching templates
   */
  getTemplates: (category?: string, type?: string) => Promise<Project[]>;

  /**
   * Retrieves a paginated list of projects with filtering capabilities.
   * @param page - The page number to retrieve
   * @param limit - Number of projects per page
   * @param filters - Object containing filter criteria
   * @returns Promise resolving to paginated results with metadata
   */
  getPaginated: (
    page: number,
    limit: number,
    filters: Record<string, any>
  ) => Promise<{
    projects: Project[];       // Array of projects for current page
    totalProjects: number;     // Total number of projects matching filters
    totalPages: number;        // Total number of pages available
    currentPage: number;       // Current page number
  }>;
}

/**
 * Extended API service for user-related operations.
 * Includes specialized methods beyond the standard CRUD operations.
 */
export interface UsersAPIService extends APIService<User> {
  /**
   * Retrieves the current user's profile information.
   * @returns Promise resolving to the User object representing the profile
   */
  getProfile: () => Promise<User>;

  /**
   * Updates the current user's profile information.
   * @param data - Object containing updated profile data
   * @returns Promise resolving to the updated User object
   */
  updateProfile: (data: UpdateProfilePayload) => Promise<User>;

  /**
   * Uploads a new profile picture for the user.
   * @param formData - FormData object containing the image file
   * @returns Promise resolving to the upload response
   */
  uploadProfilePicture: (formData: FormData) => Promise<ProfilePictureUploadResponse>;
}

export interface AuthAPIService {
  /**
   * Authenticates a user and retrieves a JWT token.
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to an AuthResponse object containing user info and token
   */
  login: (email: string, password: string) => Promise<AuthResponse>;


  /**
   * Registers a new user and retrieves a JWT token.
   * @param name - User's full name
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to an AuthResponse object containing user info and token
   */
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;

  /**
   * Verifies the user's token and retrieves user information.
   * @param token - JWT token to verify
   * @returns Promise resolving to a User object
   */
  verifyToken: (token?: string) => Promise<User>;

  /**
   * Logs out the user by clearing the authentication token.
   * @returns Promise resolving when logout is complete
   */

  logout: () => Promise<void>;
}

/**
 * Represents a chat message in the design assistant conversation.
 */
export interface ChatMessage {
  id: string;                  // Unique identifier for the message
  type: 'user' | 'bot';        // Type of message (user input or bot response)
  content: string;             // The message content
  timestamp: Date;             // When the message was created
}

/**
 * Response from the chat API when sending a message.
 */
export interface ChatResponse {
  response?: string;           // The bot's response message (legacy streaming mode)
  assistant_text?: string;     // The bot's response message (JSON mode)
  timestamp: string;           // ISO timestamp of the response
  useOwnData: boolean;         // Whether user's personal data was used
  suggestions?: string[];      // Optional suggested follow-up actions
  action?: string;             // Optional action type (JSON mode)
  type?: string;               // SSE event type (chunk/complete)
  chatId?: string;            // Chat conversation ID (from backend)
  messageCount?: number;       // Total messages in conversation (from backend)
  userId?: string;            // User ID (from backend)
  success?: boolean;          // Success status (from backend)
  toolOutputs?: any;          // Tool call results (from backend)
}

/**
 * Request payload for sending a message to the chat API.
 */
export interface SendMessageRequest {
  message: string;             // The user's message
  useOwnData?: boolean;        // Whether to use user's personal assets/data
  chatId?: string;            // Optional existing chat ID
  userId?: string;            // User ID for the conversation
}

/**
 * Request payload for creating a new chat conversation.
 */
export interface CreateChatRequest {
  userId: string;
  title?: string;
}

/**
 * Request payload for updating chat title.
 */
export interface UpdateChatTitleRequest {
  title: string;
  userId?: string;
}

/**
 * Response from getUserChats API
 */
export interface GetUserChatsResponse {
  success: boolean;
  chats: ChatConversation[];
  count: number;
}

/**
 * Response from getChatById API
 */
export interface GetChatResponse {
  success: boolean;
  chat: ChatWithHistory;
}

/**
 * Response from createNewChat API
 */
export interface CreateChatResponse {
  success: boolean;
  chat: {
    id: string;
    title: string;
    userId: string;
    metadata: any;
    createdAt: Date;
  };
}

/**
 * Health check response from the chat API.
 */
export interface ChatHealthResponse {
  status: string;              // Service status
  service: string;             // Service name
  timestamp: string;           // ISO timestamp
  version: string;             // API version
}

/**
 * Chat API service interface for design assistant functionality.
 */
export interface ChatAPIService extends APIServiceBase {
  /**
   * Sends a message to the design assistant with optional streaming support.
   * @param request - The message request containing user input
   * @param onChunk - Optional callback for streaming response chunks
   * @returns Promise resolving to the chat response
   */
  sendMessage(request: SendMessageRequest, onChunk?: (content: string) => void): Promise<ChatResponse>;

  /**
   * Get user's chat conversations
   * @param userId - User ID
   * @param limit - Maximum number of chats to return
   * @returns Promise resolving to user's chat conversations
   */
  getUserChats(userId: string, limit?: number): Promise<GetUserChatsResponse>;

  /**
   * Get specific chat conversation with full message history
   * @param chatId - Chat conversation ID
   * @param userId - User ID for access control
   * @returns Promise resolving to chat with full history
   */
  getChatById(chatId: string, userId?: string): Promise<GetChatResponse>;

  /**
   * Create a new chat conversation
   * @param request - Request payload with user ID and optional title
   * @returns Promise resolving to new chat info
   */
  createNewChat(request: CreateChatRequest): Promise<CreateChatResponse>;

  /**
   * Update chat conversation title
   * @param chatId - Chat conversation ID
   * @param request - Request payload with new title
   * @returns Promise resolving to updated chat info
   */
  updateChatTitle(chatId: string, request: UpdateChatTitleRequest): Promise<{ success: boolean; chat: any }>;

  /**
   * Delete a chat conversation
   * @param chatId - Chat conversation ID
   * @param userId - User ID for access control
   * @returns Promise resolving to delete confirmation
   */
  deleteChat(chatId: string, userId?: string): Promise<{ success: boolean; message: string }>;

  /**
   * Checks the health status of the chat service.
   * @returns Promise resolving to health status information
   */
  healthCheck(): Promise<ChatHealthResponse>;
}