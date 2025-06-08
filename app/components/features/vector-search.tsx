import React, { useState, useCallback } from 'react'
import { Search, Loader2, Sparkles, Filter } from 'lucide-react'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Slider } from '@components/ui/slider'
import { Label } from '@components/ui/label'
import { Switch } from '@components/ui/switch'
import { useAssets } from '@features/assets/use-assets'
import { Asset } from '@lib/types/api'

// Simple AssetCard component
const AssetCard: React.FC<{ 
  asset: Asset & { similarity?: number }
  onSelect?: () => void
  className?: string
}> = ({ asset, onSelect, className }) => (
  <Card className={`relative overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow ${className}`} onClick={onSelect}>
    <CardContent className="p-4">
      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
        {asset.thumbnail ? (
          <img
            src={asset.thumbnail}
            alt={asset.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-gray-400 text-xs uppercase tracking-wide">
            {asset.type}
          </div>
        )}
      </div>
      <h3 className="font-medium text-sm truncate">{asset.name}</h3>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500 capitalize">{asset.type}</span>
        {asset.similarity && (
          <Badge variant="secondary" className="text-xs">
            {Math.round(asset.similarity * 100)}%
          </Badge>
        )}
      </div>
    </CardContent>
  </Card>
)

interface VectorSearchResult extends Asset {
  similarity: number
}

interface VectorSearchProps {
  onAssetSelect?: (asset: Asset) => void
  className?: string
}

export function VectorSearch({ onAssetSelect, className }: VectorSearchProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<VectorSearchResult[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [threshold, setThreshold] = useState([0.7])
  const [limit, setLimit] = useState([10])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [lastQuery, setLastQuery] = useState('')

  const { vectorSearchAssets } = useAssets()

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const searchResults = await vectorSearchAssets(query, {
        threshold: threshold[0],
        limit: limit[0]
      })
      
      setResults(searchResults.results)
      setTotalResults(searchResults.total)
      setLastQuery(query)
    } catch (error) {
      console.error('Vector search failed:', error)
      // Handle error - could show toast notification
    } finally {
      setIsSearching(false)
    }
  }, [query, threshold, limit, vectorSearchAssets])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.9) return 'bg-green-500'
    if (similarity >= 0.8) return 'bg-blue-500'
    if (similarity >= 0.7) return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 0.9) return 'Excellent'
    if (similarity >= 0.8) return 'Good'
    if (similarity >= 0.7) return 'Fair'
    return 'Weak'
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI-Powered Asset Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Describe what you're looking for..."
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={!query.trim() || isSearching}
              className="px-6"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </div>

          {/* Advanced Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={showAdvanced}
                onCheckedChange={setShowAdvanced}
                id="advanced-options"
              />
              <Label htmlFor="advanced-options" className="text-sm">
                Advanced Options
              </Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Similarity Threshold: {threshold[0].toFixed(2)}
                </Label>
                <Slider
                  value={threshold}
                  onValueChange={setThreshold}
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  className="w-full"
                />
                <p className="text-xs text-gray-600">
                  Higher values show only very similar assets
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Max Results: {limit[0]}
                </Label>
                <Slider
                  value={limit}
                  onValueChange={setLimit}
                  min={5}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Search Results */}
          {lastQuery && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Results for "{lastQuery}"
                </h3>
                <Badge variant="secondary">
                  {totalResults} {totalResults === 1 ? 'result' : 'results'}
                </Badge>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No similar assets found</p>
                  <p className="text-sm">Try adjusting your search terms or lowering the similarity threshold</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {results.map((asset) => (
                    <div key={asset._id} className="relative">
                      <AssetCard
                        asset={asset}
                        onSelect={() => onAssetSelect?.(asset)}
                        className="h-full"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge 
                          className={`${getSimilarityColor(asset.similarity)} text-white text-xs`}
                        >
                          {getSimilarityLabel(asset.similarity)} ({(asset.similarity * 100).toFixed(0)}%)
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search Tips */}
          {!lastQuery && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Search Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Try descriptive terms like "modern logo", "nature photography", or "business presentation"</li>
                <li>• Use style descriptions: "minimalist", "colorful", "professional"</li>
                <li>• Mention content: "people", "buildings", "abstract shapes"</li>
                <li>• Include mood: "cheerful", "elegant", "bold"</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default VectorSearch
