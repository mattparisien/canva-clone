import React, { useState, useEffect } from 'react'
import { Sparkles, Loader2, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
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

interface SimilarAsset extends Asset {
  similarity: number
}

interface SimilarAssetsProps {
  assetId: string
  onAssetSelect?: (asset: Asset) => void
  className?: string
  autoLoad?: boolean
}

export function SimilarAssets({ 
  assetId, 
  onAssetSelect, 
  className, 
  autoLoad = true 
}: SimilarAssetsProps) {
  const [originalAsset, setOriginalAsset] = useState<Asset | null>(null)
  const [similarAssets, setSimilarAssets] = useState<SimilarAsset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const { findSimilarAssets } = useAssets()

  const loadSimilarAssets = async () => {
    if (!assetId) return

    setIsLoading(true)
    setError(null)
    
    try {
      const result = await findSimilarAssets(assetId, {
        limit: 8,
        threshold: 0.6
      })
      
      setOriginalAsset(result.originalAsset)
      setSimilarAssets(result.similarAssets)
      setHasLoaded(true)
    } catch (err: any) {
      setError(err.message || 'Failed to find similar assets')
      console.error('Error loading similar assets:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (autoLoad && assetId && !hasLoaded) {
      loadSimilarAssets()
    }
  }, [assetId, autoLoad, hasLoaded])

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

  if (!hasLoaded && !autoLoad) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Sparkles className="h-12 w-12 text-purple-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Discover Similar Assets</h3>
          <p className="text-gray-600 text-center mb-4">
            Find assets that are visually or semantically similar to this one
          </p>
          <Button onClick={loadSimilarAssets} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Finding Similar Assets...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Find Similar Assets
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="text-red-500 text-center">
            <p className="font-medium">Failed to load similar assets</p>
            <p className="text-sm">{error}</p>
            <Button 
              onClick={loadSimilarAssets} 
              variant="outline" 
              size="sm" 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
          <p>Finding similar assets...</p>
        </CardContent>
      </Card>
    )
  }

  if (similarAssets.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Similar Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No similar assets found</p>
            <p className="text-sm">This asset appears to be quite unique!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Similar Assets
          </div>
          <Badge variant="secondary">
            {similarAssets.length} {similarAssets.length === 1 ? 'match' : 'matches'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Original Asset Reference */}
        {originalAsset && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Similar to:</h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                {originalAsset.thumbnail || originalAsset.url ? (
                  <img
                    src={originalAsset.thumbnail || originalAsset.url}
                    alt={originalAsset.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-xs">No preview</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{originalAsset.name}</p>
                <p className="text-xs text-gray-500 capitalize">{originalAsset.type}</p>
              </div>
            </div>
          </div>
        )}

        {/* Similar Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {similarAssets.map((asset) => (
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

        {/* Load More Button */}
        {similarAssets.length >= 8 && (
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => loadSimilarAssets()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                'Refresh Results'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SimilarAssets
