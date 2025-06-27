import { Axios } from "axios";
import { APIBase } from "./base";

export interface CustomFont {
    id: string;
    name: string;
    url: string;
    family: string;
    format: string;
    createdAt: string;
}

export interface FontUploadResponse {
    message: string;
    font: CustomFont;
    fontFamily: string;
}

export class FontsAPI extends APIBase {
    apiClient: Axios;

    constructor(apiClient: Axios) {
        super();
        this.apiClient = apiClient;
    }
    /**
     * Upload a custom font file
     */
    async uploadFont(file: File, name?: string): Promise<FontUploadResponse> {
        try {
            const formData = new FormData();
            formData.append("file", file);
            
            if (name) {
                formData.append("name", name);
            }

            // Get userId from localStorage
            const token = this.getAuthToken();
            let userId = "";
            if (token) {
                try {
                    const decoded = JSON.parse(atob(token.split(".")[1]));
                    userId = decoded.id || decoded.userId || decoded.sub;
                } catch (e) {
                    console.error("Error decoding token to get userId:", e);
                }
            }

            if (userId) {
                formData.append("userId", userId);
            }

            const response = await this.apiClient.post<FontUploadResponse>(
                "/fonts/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data;
        } catch (error: any) {
            console.error("Error uploading font:", error.response?.data || error.message);
            throw error.response?.data || new Error("Failed to upload font");
        }
    }

    /**
     * Get all custom fonts for the current user
     */
    async getUserFonts(): Promise<CustomFont[]> {
        try {
            // Get userId from localStorage
            const token = this.getAuthToken();
            let userId = "";
            if (token) {
                try {
                    const decoded = JSON.parse(atob(token.split(".")[1]));
                    userId = decoded.id || decoded.userId || decoded.sub;
                } catch (e) {
                    console.error("Error decoding token to get userId:", e);
                }
            }

            const params = userId ? { userId } : {};
            const response = await this.apiClient.get<CustomFont[]>("/fonts", { params });
            return response.data;
        } catch (error: any) {
            console.error("Error fetching fonts:", error.response?.data || error.message);
            throw error.response?.data || new Error("Failed to fetch fonts");
        }
    }

    /**
     * Delete a custom font
     */
    async deleteFont(fontId: string): Promise<void> {
        try {
            await this.apiClient.delete(`/fonts/${fontId}`);
        } catch (error: any) {
            console.error("Error deleting font:", error.response?.data || error.message);
            throw error.response?.data || new Error("Failed to delete font");
        }
    }

    /**
     * Load a font into the document
     */
    async loadFont(font: CustomFont): Promise<boolean> {
        try {
            // Create a new FontFace object
            const fontFace = new FontFace(font.family, `url(${font.url})`, {
                style: 'normal',
                weight: 'normal'
            });

            // Load the font
            await fontFace.load();

            // Add the font to the document
            document.fonts.add(fontFace);

            return true;
        } catch (error) {
            console.error(`Failed to load font ${font.family}:`, error);
            return false;
        }
    }

    /**
     * Load all user fonts into the document
     */
    async loadAllUserFonts(): Promise<CustomFont[]> {
        try {
            const fonts = await this.getUserFonts();
            
            // Load each font
            const loadPromises = fonts.map(font => this.loadFont(font));
            const results = await Promise.allSettled(loadPromises);
            
            // Filter out fonts that failed to load
            const loadedFonts = fonts.filter((_, index) => 
                results[index].status === 'fulfilled' && (results[index] as PromiseFulfilledResult<boolean>).value
            );

            console.log(`Loaded ${loadedFonts.length} of ${fonts.length} custom fonts`);
            return loadedFonts;
        } catch (error) {
            console.error("Error loading user fonts:", error);
            return [];
        }
    }
}
