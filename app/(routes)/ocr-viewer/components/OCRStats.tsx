"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Type, Ruler, Hash } from 'lucide-react';

interface OCRResult {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontPx: number;
}

interface OCRStatsProps {
  ocrResults: OCRResult[];
}

export function OCRStats({ ocrResults }: OCRStatsProps) {
  if (ocrResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            OCR Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            No text detected in the image
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const totalCharacters = ocrResults.reduce((sum, block) => sum + block.text.length, 0);
  const averageFontSize = Math.round(
    ocrResults.reduce((sum, block) => sum + block.fontPx, 0) / ocrResults.length
  );
  const averageBlockWidth = Math.round(
    ocrResults.reduce((sum, block) => sum + block.w, 0) / ocrResults.length
  );
  const averageBlockHeight = Math.round(
    ocrResults.reduce((sum, block) => sum + block.h, 0) / ocrResults.length
  );
  
  // Font size distribution
  const fontSizes = ocrResults.map(block => block.fontPx);
  const minFontSize = Math.min(...fontSizes);
  const maxFontSize = Math.max(...fontSizes);
  
  // Text length distribution
  const textLengths = ocrResults.map(block => block.text.length);
  const averageTextLength = Math.round(textLengths.reduce((a, b) => a + b, 0) / textLengths.length);
  const longestText = Math.max(...textLengths);

  // Position distribution
  const positions = ocrResults.map(block => ({ x: block.x, y: block.y }));
  const leftmost = Math.min(...positions.map(p => p.x));
  const rightmost = Math.max(...positions.map(p => p.x));
  const topmost = Math.min(...positions.map(p => p.y));
  const bottommost = Math.max(...positions.map(p => p.y));

  const stats = [
    {
      label: 'Text Blocks',
      value: ocrResults.length.toLocaleString(),
      icon: <Hash className="h-4 w-4" />,
      color: 'text-blue-600'
    },
    {
      label: 'Total Characters',
      value: totalCharacters.toLocaleString(),
      icon: <Type className="h-4 w-4" />,
      color: 'text-green-600'
    },
    {
      label: 'Avg Font Size',
      value: `${averageFontSize}px`,
      icon: <Type className="h-4 w-4" />,
      color: 'text-purple-600'
    },
    {
      label: 'Avg Block Size',
      value: `${averageBlockWidth}×${averageBlockHeight}`,
      icon: <Ruler className="h-4 w-4" />,
      color: 'text-orange-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          OCR Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`flex items-center justify-center gap-1 ${stat.color} mb-1`}>
                {stat.icon}
                <span className="text-xs font-medium">{stat.label}</span>
              </div>
              <div className="text-lg font-bold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Detailed Stats */}
        <div className="space-y-3 text-sm">
          <div className="border-t pt-3">
            <h4 className="font-medium mb-2">Font Size Range</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>Min: {minFontSize}px</div>
              <div>Max: {maxFontSize}px</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Text Analysis</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>Avg Length: {averageTextLength} chars</div>
              <div>Longest: {longestText} chars</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Position Bounds</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>Left: {leftmost}px</div>
              <div>Right: {rightmost}px</div>
              <div>Top: {topmost}px</div>
              <div>Bottom: {bottommost}px</div>
            </div>
          </div>
        </div>

        {/* Font Size Distribution */}
        <div>
          <h4 className="font-medium mb-2 text-sm">Font Size Distribution</h4>
          <div className="space-y-1">
            {Array.from(new Set(fontSizes))
              .sort((a, b) => b - a)
              .slice(0, 5) // Show top 5 most common sizes
              .map(size => {
                const count = fontSizes.filter(fs => fs === size).length;
                const percentage = (count / fontSizes.length) * 100;
                return (
                  <div key={size} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-right">{size}px</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-gray-500">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
