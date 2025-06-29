import { useCallback, useEffect, useState } from "react";
import { CustomFont } from "@/lib/api/fonts";
import { fontsAPI } from "@/lib/api";

export function useFonts() {
    const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load custom fonts
    const loadCustomFonts = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const fonts = await fontsAPI.loadAllUserFonts();
            setCustomFonts(fonts);
        } catch (err: any) {
            setError(err.message || "Failed to load custom fonts");
            console.error("Error loading custom fonts:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Upload a new font
    const uploadFont = useCallback(async (file: File, name?: string) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fontsAPI.uploadFont(file, name);
            
            // Load the new font immediately
            await fontsAPI.loadFont(response.font);
            
            // Refresh the font list
            await loadCustomFonts();
            
            return response;
        } catch (err: any) {
            setError(err.message || "Failed to upload font");
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [loadCustomFonts]);

    // Delete a font
    const deleteFont = useCallback(async (fontId: string) => {
        try {
            setIsLoading(true);
            setError(null);
            
            await fontsAPI.deleteFont(fontId);
            
            // Remove from local state
            setCustomFonts(prev => prev.filter(font => font.id !== fontId));
            
            // Note: We don't remove the font from document.fonts as it might be in use
            // The browser will handle cleanup when the page is refreshed
            
        } catch (err: any) {
            setError(err.message || "Failed to delete font");
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // // Delete a font by name (helper function)
    // const deleteFontByName = useCallback(async (fontName: string) => {
    //     try {
    //         const customFont = customFonts.find(font => font.family === fontName);
    //         if (customFont) {
    //             await deleteFont(customFont.id);
    //         } else {
    //             throw new Error("Font not found");
    //         }
    //     } catch (err: any) {
    //         setError(err.message || "Failed to delete font");
    //         throw err;
    //     }
    // }, [customFonts, deleteFont]);

    // Get all available fonts (default + custom)
    const getAllFonts = useCallback(() => {
        const defaultFonts = [
            "Inter",
            "Arial", 
            "Helvetica",
            "Times New Roman",
            "Courier New",
            "Georgia",
            "Verdana",
            "Comic Sans MS",
            "Impact"
        ];
        
        const customFontNames = customFonts.map(font => font.family);
        
        return [...defaultFonts, ...customFontNames];
    }, [customFonts]);

    // Check if a font is custom
    const isCustomFont = useCallback((fontFamily: string) => {
        return customFonts.some(font => font.family === fontFamily);
    }, [customFonts]);

    // Get custom font details
    const getCustomFont = useCallback((fontFamily: string) => {
        return customFonts.find(font => font.family === fontFamily);
    }, [customFonts]);

    // Delete a font by font family name
    const deleteFontByName = useCallback(async (fontFamily: string) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const font = getCustomFont(fontFamily);
            if (!font) {
                throw new Error("Custom font not found");
            }
            
            await fontsAPI.deleteFont(font.id);
            
            // Remove from local state
            setCustomFonts(prev => prev.filter(f => f.id !== font.id));
            
        } catch (err: any) {
            setError(err.message || "Failed to delete font");
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [getCustomFont]);

    // Load fonts on mount
    useEffect(() => {
        loadCustomFonts();
    }, [loadCustomFonts]);

    return {
        customFonts,
        allFonts: getAllFonts(),
        isLoading,
        error,
        uploadFont,
        deleteFont,
        deleteFontByName,
        loadCustomFonts,
        isCustomFont,
        getCustomFont
    };
}
