"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Eye, Download, RefreshCw } from 'lucide-react';
// import { OCRCanvas } from './components/OCRCanvas';
// import { OCRStats } from './components/OCRStats';
// import { analyzeFileWithOCR } from '@/lib/api/ocr';

// Temporary direct implementation
async function analyzeFileWithOCR(file: File) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/ocr/analyze-file', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`OCR analysis failed: ${response.statusText}`);
  }

  return response.json();
}

// Temporary OCR Canvas Component
function OCRCanvas({ imageUrl, ocrResults, imageDimensions, colorAnalysis, onTextBlocksChange, showOriginalImage = true }: any) {
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [scaleFactor, setScaleFactor] = useState({ x: 1, y: 1 });
  const [textBlocks, setTextBlocks] = useState<any[]>([]);
  const [editingBlock, setEditingBlock] = useState<number | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Initialize text blocks when OCR results change
  useEffect(() => {
    const blocks = ocrResults.map((block: any, index: number) => ({
      ...block,
      id: index,
      isDragging: false
    }));
    setTextBlocks(blocks);
    onTextBlocksChange?.(blocks);
  }, [ocrResults, onTextBlocksChange]);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setImageElement(img);
    
    // Calculate scale factor between displayed image and original dimensions
    const scaleX = img.clientWidth / (imageDimensions?.width || img.naturalWidth);
    const scaleY = img.clientHeight / (imageDimensions?.height || img.naturalHeight);
    setScaleFactor({ x: scaleX, y: scaleY });
  };

  const handleMouseDown = (e: React.MouseEvent, blockIndex: number) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
    
    if (parentRect) {
      setDraggedBlock(blockIndex);
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedBlock !== null && imageElement) {
      e.preventDefault();
      const imageRect = imageElement.getBoundingClientRect();
      const newX = (e.clientX - imageRect.left - dragOffset.x) / scaleFactor.x;
      const newY = (e.clientY - imageRect.top - dragOffset.y) / scaleFactor.y;

      const updatedBlocks = textBlocks.map((block, index) => 
        index === draggedBlock 
          ? { ...block, x: Math.max(0, newX), y: Math.max(0, newY) }
          : block
      );
      setTextBlocks(updatedBlocks);
      onTextBlocksChange?.(updatedBlocks);
    }
  };

  const handleMouseUp = () => {
    setDraggedBlock(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleDoubleClick = (blockIndex: number) => {
    setEditingBlock(blockIndex);
  };

  const handleTextChange = (blockIndex: number, newText: string) => {
    const updatedBlocks = textBlocks.map((block, index) => 
      index === blockIndex ? { ...block, text: newText } : block
    );
    setTextBlocks(updatedBlocks);
    onTextBlocksChange?.(updatedBlocks);
  };

  const handleTextBlur = () => {
    setEditingBlock(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, blockIndex: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setEditingBlock(null);
    } else if (e.key === 'Escape') {
      setEditingBlock(null);
    }
  };

  // Helper function to determine if we should use light or dark text
  const shouldUseLightText = (bgColor: string) => {
    // Simple heuristic - if background is dark, use light text
    if (!bgColor || bgColor === '#ffffff') return false;
    if (bgColor === '#000000') return true;
    
    // For other colors, check if they're generally dark
    const darkColors = ['#333', '#444', '#555', '#666', '#777', '#888'];
    const darkKeywords = ['dark', 'black', 'navy', 'maroon'];
    
    return darkColors.some(c => bgColor.includes(c)) || 
           darkKeywords.some(k => bgColor.toLowerCase().includes(k));
  };

  // Get dynamic canvas styling based on color analysis
  const getCanvasStyle = () => {
    if (!colorAnalysis) return {};
    
    const style: any = {};
    
    // Apply background color or gradient
    if (colorAnalysis.backgroundStyle === 'gradient') {
      // Try to create a gradient from dominant colors
      if (colorAnalysis.dominantColors?.length >= 2) {
        style.background = `linear-gradient(135deg, ${colorAnalysis.dominantColors[0]}, ${colorAnalysis.dominantColors[1]})`;
      } else {
        style.backgroundColor = colorAnalysis.backgroundColor;
      }
    } else if (colorAnalysis.backgroundColor && colorAnalysis.backgroundColor !== '#ffffff') {
      style.backgroundColor = colorAnalysis.backgroundColor;
    }
    
    return style;
  };

  return (
    <div className="space-y-4 flex items-center justify-center">
      {/* Color Analysis Info Bar */}
      {colorAnalysis && (
        <div className="w-full max-w-4xl mb-4 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">🎨 Detected Colors:</span>
              <div className="flex items-center gap-2">
                {colorAnalysis.dominantColors?.slice(0, 5).map((color: string, index: number) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded border border-gray-300 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">
                {colorAnalysis.colorScheme} • {colorAnalysis.colorTemperature}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Style: {colorAnalysis.styleCharacteristics?.join(', ')}
            </div>
          </div>
          {colorAnalysis.error && (
            <div className="mt-2 text-xs text-orange-600">
              ⚠️ Color analysis: {colorAnalysis.error}
            </div>
          )}
        </div>
      )}

      <div 
        className="relative inline-block border-2 border-gray-200 rounded-lg overflow-hidden shadow-lg"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={getCanvasStyle()}
      >
        {/* Original image - conditionally rendered */}
        {showOriginalImage ? (
          <img
            src={imageUrl}
            alt="OCR Analysis"
            className="max-w-full h-auto block"
            style={{ maxHeight: '70vh' }}
            onLoad={handleImageLoad}
          />
        ) : (
          /* Placeholder div when image is hidden - maintains canvas dimensions */
          <div
            className="bg-transparent"
            style={{ 
              width: imageDimensions?.width ? `${imageDimensions.width * scaleFactor.x}px` : '100%',
              height: imageDimensions?.height ? `${imageDimensions.height * scaleFactor.y}px` : '70vh',
              minHeight: '300px'
            }}
            ref={(el) => {
              // If no image is shown, we need to ensure scale factors are correct
              if (el && !imageElement && imageDimensions) {
                const scaleX = el.clientWidth / imageDimensions.width;
                const scaleY = el.clientHeight / imageDimensions.height;
                setScaleFactor({ x: scaleX, y: scaleY });
              }
            }}
          />
        )}
        
        {/* OCR Overlay Boxes */}
        {imageElement && textBlocks.map((block: any, index: number) => (
          <div
            key={index}
            id={`ocr-block-${index}`}
            className={`absolute border-2 transition-colors cursor-move select-none ${
              draggedBlock === index 
                ? 'border-blue-500 bg-blue-500/20 z-30' 
                : editingBlock === index
                ? 'border-green-500 bg-green-500/10 z-20'
                : 'border-red-500 bg-red-500/10 hover:bg-red-500/20 z-10'
            }`}
            style={{
              left: `${block.x * scaleFactor.x}px`,
              top: `${block.y * scaleFactor.y}px`,
              width: `${block.w * scaleFactor.x}px`,
              height: `${block.h * scaleFactor.y}px`,
            }}
            title={`"${block.text}" (${block.fontPx}px) - Double-click to edit, drag to move`}
            onMouseDown={(e) => handleMouseDown(e, index)}
            onDoubleClick={() => handleDoubleClick(index)}
          >
            {/* Use intelligent text colors based on detected colors */}
            {editingBlock === index ? (
              <textarea
                className="absolute inset-0 w-full h-full bg-transparent font-medium leading-tight resize-none border-0 outline-0 p-1"
                style={{
                  fontSize: `${Math.max(8, Math.min(block.fontPx * scaleFactor.x * 0.8, (block.h * scaleFactor.y) * 0.8))}px`,
                  color: colorAnalysis?.textColors?.[0] || '#ffffff',
                  textShadow: shouldUseLightText(colorAnalysis?.backgroundColor || '#ffffff') 
                    ? '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)'
                    : '1px 1px 2px rgba(255,255,255,0.8), -1px -1px 2px rgba(255,255,255,0.8)',
                }}
                value={block.text}
                onChange={(e) => handleTextChange(index, e.target.value)}
                onBlur={handleTextBlur}
                onKeyDown={(e) => handleKeyDown(e, index)}
                autoFocus
              />
            ) : (
              <div 
                className="absolute font-medium leading-tight drop-shadow-lg pointer-events-none"
                style={{
                  left: '2px',
                  top: '2px',
                  fontSize: `${Math.max(8, Math.min(block.fontPx * scaleFactor.x * 0.8, (block.h * scaleFactor.y) * 0.8))}px`,
                  color: colorAnalysis?.textColors?.[0] || '#ffffff',
                  textShadow: shouldUseLightText(colorAnalysis?.backgroundColor || '#ffffff') 
                    ? '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)'
                    : '1px 1px 2px rgba(255,255,255,0.8), -1px -1px 2px rgba(255,255,255,0.8)',
                  wordBreak: 'break-word',
                  hyphens: 'auto',
                  maxWidth: `${(block.w * scaleFactor.x) - 4}px`,
                  maxHeight: `${(block.h * scaleFactor.y) - 4}px`,
                  overflow: 'hidden'
                }}
              >
                {block.text}
              </div>
            )}
            
            {/* Enhanced hover tooltip with interaction hints */}
            <div className="absolute -top-12 left-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none">
              <div>Font: {block.fontPx}px | Pos: {Math.round(block.x)},{Math.round(block.y)}</div>
              <div className="text-xs opacity-75">Double-click to edit • Drag to move</div>
            </div>

            {/* Drag handle indicator */}
            {draggedBlock === index && (
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg"></div>
            )}
          </div>
        ))}
        
        {/* Stats overlay - updated to show textBlocks */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
          <div className="text-sm font-medium">OCR Results: {textBlocks.length} blocks</div>
          {imageDimensions && (
            <div className="text-xs text-gray-600 mt-1">
              Original: {imageDimensions.width}×{imageDimensions.height}px
            </div>
          )}
          <div className="text-xs text-blue-600 mt-1">
            💡 Double-click text to edit • Drag to reposition
          </div>
        </div>
      </div>
    </div>
  );
}

// Temporary OCR Stats Component
function OCRStats({ ocrResults, textBlocks, colorAnalysis }: any) {
  const currentBlocks = textBlocks || ocrResults;
  const totalCharacters = currentBlocks.reduce((sum: number, block: any) => sum + block.text.length, 0);
  const averageFontSize = currentBlocks.length > 0
    ? Math.round(currentBlocks.reduce((sum: number, block: any) => sum + block.fontPx, 0) / currentBlocks.length)
    : 0;

  const exportTextBlocks = () => {
    const textData = {
      blocks: currentBlocks.map((block: any, index: number) => ({
        id: index,
        text: block.text,
        position: { x: Math.round(block.x), y: Math.round(block.y) },
        dimensions: { width: Math.round(block.w), height: Math.round(block.h) },
        fontSize: block.fontPx
      })),
      summary: {
        totalBlocks: currentBlocks.length,
        totalCharacters,
        averageFontSize,
        timestamp: new Date().toISOString()
      }
    };

    const dataStr = JSON.stringify(textData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edited-text-blocks-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          OCR Statistics
          <Button size="sm" variant="outline" onClick={exportTextBlocks}>
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold">{currentBlocks.length}</div>
            <div className="text-sm text-gray-600">Text Blocks</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold">{totalCharacters}</div>
            <div className="text-sm text-gray-600">Characters</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold">{averageFontSize}px</div>
            <div className="text-sm text-gray-600">Avg Font</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold">{currentBlocks.length > 0 ? Math.max(...currentBlocks.map((r: any) => r.fontPx)) : 0}px</div>
            <div className="text-sm text-gray-600">Max Font</div>
          </div>
        </div>
        
        {/* Text blocks list */}
        <div className="mt-4 max-h-60 overflow-y-auto">
          <div className="text-sm font-medium mb-2">Text Blocks:</div>
          <div className="space-y-1">
            {currentBlocks.map((block: any, index: number) => (
              <div key={index} className="text-xs bg-gray-50 p-2 rounded border-l-2 border-blue-400">
                <div className="font-medium truncate">"{block.text}"</div>
                <div className="text-gray-500 mt-1">
                  Pos: ({Math.round(block.x)}, {Math.round(block.y)}) • Size: {block.fontPx}px
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Color Analysis Section */}
        {colorAnalysis && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm font-medium mb-2">🎨 Color Analysis:</div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium">Background:</span>
                <div 
                  className="w-4 h-4 rounded border border-gray-300" 
                  style={{ backgroundColor: colorAnalysis.backgroundColor }}
                />
                <span className="text-gray-600">{colorAnalysis.backgroundColor}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Text Colors:</span>
                <div className="flex gap-1">
                  {colorAnalysis.textColors?.map((color: string, idx: number) => (
                    <div 
                      key={idx}
                      className="w-3 h-3 rounded border border-gray-300" 
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Palette:</span>
                <div className="flex gap-1">
                  {colorAnalysis.dominantColors?.slice(0, 4).map((color: string, idx: number) => (
                    <div 
                      key={idx}
                      className="w-3 h-3 rounded border border-gray-300" 
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="font-medium">Style:</span>
                <span className="ml-1 text-gray-600">
                  {colorAnalysis.styleCharacteristics?.join(', ')}
                </span>
              </div>

              <div>
                <span className="font-medium">Scheme:</span>
                <span className="ml-1 text-gray-600">
                  {colorAnalysis.colorScheme} ({colorAnalysis.colorTemperature})
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface OCRResult {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontPx: number;
}

interface OCRAnalysis {
  ocrResults: OCRResult[];
  imageUrl: string;
  imageDimensions: {
    width: number;
    height: number;
  };
  colorAnalysis?: {
    backgroundColor: string;
    backgroundStyle: string;
    dominantColors: string[];
    textColors: string[];
    accentColors: string[];
    colorScheme: string;
    styleCharacteristics: string[];
    hasBackgroundImage: boolean;
    backgroundDescription: string;
    contrastLevel: string;
    colorTemperature: string;
    error?: string;
  };
  timestamp: string;
}

export default function OCRViewerPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedTextBlocks, setEditedTextBlocks] = useState<any[]>([]);
  const [showOriginalImage, setShowOriginalImage] = useState(true); // Add state for image visibility

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setError(null);
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Analyze the file directly with OCR
      const ocrAnalysis = await analyzeFileWithOCR(imageFile);
      
      console.log('OCR Analysis received:', ocrAnalysis);
      console.log('OCR Results:', ocrAnalysis.ocrResults);
      
      // Create a temporary URL for the image to display
      const imageUrl = URL.createObjectURL(imageFile);
      
      setAnalysis({
        ocrResults: ocrAnalysis.ocrResults || [],
        imageUrl: imageUrl,
        imageDimensions: {
          width: ocrAnalysis.imageDimensions?.width || 800,
          height: ocrAnalysis.imageDimensions?.height || 600
        },
        colorAnalysis: ocrAnalysis.colorAnalysis,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
      console.error('OCR analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadResults = () => {
    if (!analysis) return;

    const currentBlocks = editedTextBlocks.length > 0 ? editedTextBlocks : analysis.ocrResults;
    
    const enhancedData = {
      metadata: {
        timestamp: analysis.timestamp,
        totalBlocks: currentBlocks.length,
        totalCharacters: currentBlocks.reduce((sum, block) => sum + block.text.length, 0),
        averageFontSize: currentBlocks.length > 0 
          ? Math.round(currentBlocks.reduce((sum: number, block: any) => sum + block.fontPx, 0) / currentBlocks.length) 
          : 0,
        imageDimensions: analysis.imageDimensions,
        hasEdits: editedTextBlocks.length > 0
      },
      originalOcrResults: analysis.ocrResults,
      editedTextBlocks: editedTextBlocks.length > 0 ? editedTextBlocks : null,
      currentResults: currentBlocks,
      colorAnalysis: analysis.colorAnalysis
    };

    const dataStr = JSON.stringify(enhancedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocr-analysis-${editedTextBlocks.length > 0 ? 'edited-' : ''}${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setAnalysis(null);
    setImageFile(null);
    setEditedTextBlocks([]);
    setError(null);
    setShowOriginalImage(true); // Reset image visibility
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 OCR Image Analyzer
          </h1>
          <p className="text-gray-600">
            Upload an image to extract and visualize text using OCR technology
          </p>
        </div>

        {/* Upload Section */}
        {!analysis && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {imageFile && (
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Selected: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                  <Button onClick={handleAnalyze} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Analyze Image
                      </>
                    )}
                  </Button>
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {analysis && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">OCR Analysis Results</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {analysis.ocrResults.length} text blocks detected
                  </span>
                  {editedTextBlocks.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      ✏️ Modified
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Image visibility toggle */}
                <div className="flex items-center mr-2">
                  <input
                    type="checkbox"
                    id="show-original-image"
                    checked={showOriginalImage}
                    onChange={(e) => setShowOriginalImage(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 mr-2"
                  />
                  <label htmlFor="show-original-image" className="text-sm font-medium text-gray-700">
                    Show Original Image
                  </label>
                </div>
                <Button variant="outline" onClick={handleDownloadResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Download JSON
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Analysis
                </Button>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* OCR Canvas - Takes up 3/4 of the space */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div>Visual OCR Overlay</div>
                      {!showOriginalImage && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                          Image Hidden
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {showOriginalImage 
                        ? "Showing original image with OCR text overlay. Use the checkbox above to hide the image." 
                        : "Original image is hidden. Only OCR text blocks are visible against the detected background."}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <OCRCanvas
                      imageUrl={analysis.imageUrl}
                      ocrResults={analysis.ocrResults}
                      imageDimensions={analysis.imageDimensions}
                      colorAnalysis={analysis.colorAnalysis}
                      onTextBlocksChange={setEditedTextBlocks}
                      showOriginalImage={showOriginalImage} // Pass down the visibility state
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Stats and Text Blocks - Takes up 1/4 of the space */}
              <div className="lg:col-span-1 space-y-6">
                <OCRStats 
                  ocrResults={analysis.ocrResults} 
                  textBlocks={editedTextBlocks.length > 0 ? editedTextBlocks : analysis.ocrResults}
                  colorAnalysis={analysis.colorAnalysis}
                />
              </div>
      
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
