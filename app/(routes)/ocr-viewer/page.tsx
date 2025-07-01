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
function OCRCanvas({ imageUrl, ocrResults, imageDimensions, onTextBlocksChange }: any) {
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

      setTextBlocks(prev => prev.map((block, index) => 
        index === draggedBlock 
          ? { ...block, x: Math.max(0, newX), y: Math.max(0, newY) }
          : block
      ));
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
    setTextBlocks(prev => prev.map((block, index) => 
      index === blockIndex ? { ...block, text: newText } : block
    ));
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

  return (
    <div className="space-y-4 flex items-center justify-center">
      <div 
        className="relative inline-block border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageUrl}
          alt="OCR Analysis"
          className="max-w-full h-auto block"
          style={{ maxHeight: '70vh' }}
          onLoad={handleImageLoad}
        />
        
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
            {/* Editable text content */}
            {editingBlock === index ? (
              <textarea
                className="absolute inset-0 w-full h-full bg-transparent text-white font-medium leading-tight resize-none border-0 outline-0 p-1"
                style={{
                  fontSize: `${Math.max(8, Math.min(block.fontPx * scaleFactor.x * 0.8, (block.h * scaleFactor.y) * 0.8))}px`,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)',
                }}
                value={block.text}
                onChange={(e) => handleTextChange(index, e.target.value)}
                onBlur={handleTextBlur}
                onKeyDown={(e) => handleKeyDown(e, index)}
                autoFocus
              />
            ) : (
              <div 
                className="absolute text-white font-medium leading-tight drop-shadow-lg pointer-events-none"
                style={{
                  left: '2px',
                  top: '2px',
                  fontSize: `${Math.max(8, Math.min(block.fontPx * scaleFactor.x * 0.8, (block.h * scaleFactor.y) * 0.8))}px`,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)',
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
function OCRStats({ ocrResults, textBlocks }: any) {
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
  timestamp: string;
}

export default function OCRViewerPage() {
  const [analysis, setAnalysis] = useState<OCRAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editedTextBlocks, setEditedTextBlocks] = useState<any[]>([]);

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

    const enhancedData = {
      metadata: {
        timestamp: analysis.timestamp,
        totalBlocks: analysis.ocrResults.length,
        totalCharacters: analysis.ocrResults.reduce((sum, block) => sum + block.text.length, 0),
        averageFontSize: analysis.ocrResults.length > 0 
          ? Math.round(analysis.ocrResults.reduce((sum, block) => sum + block.fontPx, 0) / analysis.ocrResults.length) 
          : 0,
        imageDimensions: analysis.imageDimensions
      },
      ocrResults: analysis.ocrResults
    };

    const dataStr = JSON.stringify(enhancedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocr-analysis-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setAnalysis(null);
    setImageFile(null);
    setError(null);
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
                <span className="text-sm text-gray-500">
                  {analysis.ocrResults.length} text blocks detected
                </span>
              </div>
              <div className="flex gap-2">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* OCR Canvas - Takes up 2/3 of the space */}
              <div className="lg:col-span-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Visual OCR Overlay</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OCRCanvas
                      imageUrl={analysis.imageUrl}
                      ocrResults={analysis.ocrResults}
                      imageDimensions={analysis.imageDimensions}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Stats and Text Blocks - Takes up 1/3 of the space */}
      
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
