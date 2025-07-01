"use client"

import { useState } from 'react';
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
function OCRCanvas({ imageUrl, ocrResults, imageDimensions }: any) {
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [scaleFactor, setScaleFactor] = useState({ x: 1, y: 1 });

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setImageElement(img);
    
    // Calculate scale factor between displayed image and original dimensions
    const scaleX = img.clientWidth / (imageDimensions?.width || img.naturalWidth);
    const scaleY = img.clientHeight / (imageDimensions?.height || img.naturalHeight);
    setScaleFactor({ x: scaleX, y: scaleY });
  };

  return (
    <div className="space-y-4 flex items-center justify-center">
      <div className="relative inline-block border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg">
        <img
          src={imageUrl}
          alt="OCR Analysis"
          className="max-w-full h-auto block"
          style={{ maxHeight: '70vh' }}
          onLoad={handleImageLoad}
        />
        
        {/* OCR Overlay Boxes */}
        {imageElement && ocrResults.map((block: any, index: number) => (
          <div
            key={index}
            id={`ocr-block-${index}`}
            className="absolute border-2 border-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer"
            style={{
              left: `${block.x * scaleFactor.x}px`,
              top: `${block.y * scaleFactor.y}px`,
              width: `${block.w * scaleFactor.x}px`,
              height: `${block.h * scaleFactor.y}px`,
            }}
            title={`"${block.text}" (${block.fontPx}px)`}
          >
            {/* Display the actual text content directly on the image with precise positioning */}
            <div 
              className="absolute text-white font-medium leading-tight drop-shadow-lg"
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
            
            {/* Hover tooltip with more details */}
            <div className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
              Font: {block.fontPx}px | Pos: {block.x},{block.y}
            </div>
          </div>
        ))}
        
        {/* Stats overlay */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
          <div className="text-sm font-medium">OCR Results: {ocrResults.length} blocks</div>
          {imageDimensions && (
            <div className="text-xs text-gray-600 mt-1">
              Original: {imageDimensions.width}×{imageDimensions.height}px
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Temporary OCR Stats Component
function OCRStats({ ocrResults }: any) {
  const totalCharacters = ocrResults.reduce((sum: number, block: any) => sum + block.text.length, 0);
  const averageFontSize = ocrResults.length > 0
    ? Math.round(ocrResults.reduce((sum: number, block: any) => sum + block.fontPx, 0) / ocrResults.length)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>OCR Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold">{ocrResults.length}</div>
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
            <div className="text-lg font-bold">{ocrResults.length > 0 ? Math.max(...ocrResults.map((r: any) => r.fontPx)) : 0}px</div>
            <div className="text-sm text-gray-600">Max Font</div>
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
