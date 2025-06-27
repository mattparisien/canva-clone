import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { useFonts } from '@/hooks/use-fonts';

interface FontUploadProps {
    onFontUploaded?: (fontFamily: string) => void;
    onClose?: () => void;
    className?: string;
}

export function FontUpload({ onFontUploaded, onClose, className = "" }: FontUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [fontName, setFontName] = useState('');
    const { uploadFont, isLoading, error } = useFonts();

    const handleUpload = async (file: File) => {
        try {
            const name = fontName.trim() || undefined;
            const response = await uploadFont(file, name);
            
            if (onFontUploaded) {
                onFontUploaded(response.fontFamily);
            }
            
            // Reset form
            setFontName('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Font upload failed:', error);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await handleUpload(file);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        
        const file = e.dataTransfer.files?.[0];
        if (file) {
            await handleUpload(file);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const isValidFontFile = (file: File) => {
        const validTypes = ['font/ttf', 'font/otf', 'font/woff', 'font/woff2', 'application/font-woff', 'application/font-woff2', 'application/x-font-ttf', 'application/x-font-otf'];
        const validExtensions = /\.(ttf|otf|woff|woff2)$/i;
        
        return validTypes.includes(file.type) || validExtensions.test(file.name);
    };

    return (
        <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 w-80 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Upload Font</h3>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-4 w-4 text-gray-500" />
                    </button>
                )}
            </div>

            {/* Font Name Input */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Name (optional)
                </label>
                <input
                    type="text"
                    value={fontName}
                    onChange={(e) => setFontName(e.target.value)}
                    placeholder="Leave empty to use filename"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
            </div>

            {/* Upload Area */}
            <div
                className={`
                    relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                    ${dragActive 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                    }
                    ${isLoading ? 'pointer-events-none opacity-50' : ''}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !isLoading && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".ttf,.otf,.woff,.woff2"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isLoading}
                />
                
                <div className="flex flex-col items-center gap-3">
                    {isLoading ? (
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    ) : (
                        <Upload className="h-8 w-8 text-gray-400" />
                    )}
                    
                    <div className="text-sm text-gray-600">
                        {isLoading ? (
                            <span>Uploading font...</span>
                        ) : (
                            <>
                                <span className="font-medium text-blue-600">Click to upload</span>
                                <span> or drag and drop</span>
                            </>
                        )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                        Supports TTF, OTF, WOFF, WOFF2
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Instructions */}
            <div className="mt-4 text-xs text-gray-500">
                <p>• Uploaded fonts will be available in the font dropdown</p>
                <p>• Max file size: 5MB</p>
                <p>• Font name must be unique</p>
            </div>
        </div>
    );
}
