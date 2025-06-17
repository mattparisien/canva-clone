import {
  AssetListResponse,
  AssetResponse,
  DeleteAssetResponse,
  FindSimilarAssetsResponse,
  SearchAssetsByVectorResponse,
  UpdateAssetResponse,
  UploadAssetResponse
} from "@canva-clone/shared-types/dist/api/asset/asset.responses"
import { Asset } from "@canva-clone/shared-types/dist/models/asset"
import { assetsAPI } from "@lib/api"
import { Asset as LegacyAsset } from "@lib/types/api"
import { useCallback, useState } from "react"

// Helper function to convert legacy Asset format to shared Asset format
const convertLegacyAsset = (legacyAsset: LegacyAsset): Asset => {
  const { _id, ...rest } = legacyAsset;
  return {
    ...rest,
    id: _id,
    fileSize: rest.fileSize || rest.size || 0,
  } as Asset;
};

// Helper function to convert vector search results
const convertVectorSearchResult = (result: LegacyAsset & { similarity: number }): Asset & { similarity: number } => {
  const { similarity, ...asset } = result;
  return {
    ...convertLegacyAsset(asset as LegacyAsset),
    similarity
  };
};

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Get all assets for a user
  const getAssets = useCallback(async (userId?: string, folderId?: string): Promise<AssetListResponse> => {
    setIsLoading(true)
    try {
      const legacyAssets = await assetsAPI.getAll(userId, folderId)
      const convertedAssets = legacyAssets.map(convertLegacyAsset)
      setAssets(convertedAssets)

      const response: AssetListResponse = {
        success: true,
        data: convertedAssets
      }
      return response
    } catch (error) {
      console.error("Failed to fetch assets:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get asset by ID
  const getAssetById = useCallback(async (assetId: string): Promise<AssetResponse> => {
    try {
      const legacyAsset = await assetsAPI.getById(assetId)
      const convertedAsset = convertLegacyAsset(legacyAsset)

      const response: AssetResponse = {
        success: true,
        data: convertedAsset
      }
      return response
    } catch (error) {
      console.error(`Failed to fetch asset ${assetId}:`, error)
      throw error
    }
  }, [])

  // Upload asset
  const uploadAsset = useCallback(async (params: {
    file: File
    userId?: string
    folderId?: string
    name?: string
    tags?: string[]
  }): Promise<UploadAssetResponse> => {
    try {
      const legacyAsset = await assetsAPI.upload(params)
      const convertedAsset = convertLegacyAsset(legacyAsset)
      setAssets(prev => [convertedAsset, ...prev])

      const response: UploadAssetResponse = {
        success: true,
        data: convertedAsset
      }
      return response
    } catch (error) {
      console.error("Failed to upload asset:", error)
      throw error
    }
  }, [])

  // Upload multiple assets
  const uploadMultipleAssets = useCallback(async (
    files: File[],
    tags: string[] = []
  ): Promise<AssetListResponse> => {
    try {
      const legacyAssets = await assetsAPI.uploadMultiple(files, tags)
      const convertedAssets = legacyAssets.map(convertLegacyAsset)
      setAssets(prev => [...convertedAssets, ...prev])

      const response: AssetListResponse = {
        success: true,
        data: convertedAssets
      }
      return response
    } catch (error) {
      console.error("Failed to upload multiple assets:", error)
      throw error
    }
  }, [])

  // Update asset
  const updateAsset = useCallback(async (
    assetId: string,
    updateData: { name?: string; tags?: string[] }
  ): Promise<UpdateAssetResponse> => {
    try {
      const legacyAsset = await assetsAPI.update(assetId, updateData)
      const convertedAsset = convertLegacyAsset(legacyAsset)
      setAssets(prev => prev.map(asset =>
        asset.id === assetId ? convertedAsset : asset
      ))

      const response: UpdateAssetResponse = {
        success: true,
        data: convertedAsset
      }
      return response
    } catch (error) {
      console.error(`Failed to update asset ${assetId}:`, error)
      throw error
    }
  }, [])

  // Delete asset
  const deleteAsset = useCallback(async (assetId: string): Promise<DeleteAssetResponse> => {
    try {
      await assetsAPI.delete(assetId)
      setAssets(prev => prev.filter(asset => asset.id !== assetId))

      const response: DeleteAssetResponse = {
        success: true,
        id: assetId as any,
        message: "Asset deleted successfully"
      }
      return response
    } catch (error) {
      console.error(`Failed to delete asset ${assetId}:`, error)
      throw error
    }
  }, [])

  // Get assets by tags
  const getAssetsByTags = useCallback(async (tags: string[]): Promise<AssetListResponse> => {
    try {
      const legacyAssets = await assetsAPI.getByTags(tags)
      const convertedAssets = legacyAssets.map(convertLegacyAsset)

      const response: AssetListResponse = {
        success: true,
        data: convertedAssets
      }
      return response
    } catch (error) {
      console.error("Failed to fetch assets by tags:", error)
      throw error
    }
  }, [])

  // Search assets
  const searchAssets = useCallback((query: string, assetsToSearch?: Asset[]): Asset[] => {
    const searchIn = assetsToSearch || assets
    if (!query.trim()) return searchIn

    const lowerQuery = query.toLowerCase()
    return searchIn.filter(asset =>
      asset.name.toLowerCase().includes(lowerQuery) ||
      asset.originalFilename?.toLowerCase().includes(lowerQuery) ||
      asset.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }, [assets])

  // Filter assets by type
  const filterAssetsByType = useCallback((type: string, assetsToFilter?: Asset[]): Asset[] => {
    const filterFrom = assetsToFilter || assets
    if (type === 'all') return filterFrom
    return filterFrom.filter(asset => asset.type === type)
  }, [assets])

  // Sort assets
  const sortAssets = useCallback((
    sortBy: 'newest' | 'oldest' | 'name' | 'size' | 'type',
    assetsToSort?: Asset[]
  ): Asset[] => {
    const sorted = [...(assetsToSort || assets)]

    return sorted.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        case 'size':
          return (b.fileSize || 0) - (a.fileSize || 0)
        case 'type':
          return a.type.localeCompare(b.type)
        default:
          return 0
      }
    })
  }, [assets])

  // Vector search assets
  const vectorSearchAssets = useCallback(async (
    query: string,
    options?: { userId?: string; limit?: number; threshold?: number }
  ): Promise<SearchAssetsByVectorResponse> => {
    try {
      const legacyResult = await assetsAPI.searchByVector(query, options)
      const convertedResults = legacyResult.results.map(convertVectorSearchResult)

      const response: SearchAssetsByVectorResponse = {
        success: true,
        data: convertedResults.map(result => ({
          asset: result,
          score: result.similarity,
          similarity: result.similarity
        })),
        query: legacyResult.query,
        totalResults: legacyResult.total
      }
      return response
    } catch (error) {
      console.error("Failed to search assets by vector:", error)
      throw error
    }
  }, [])

  // Find similar assets
  const findSimilarAssets = useCallback(async (
    assetId: string,
    options?: { limit?: number; threshold?: number }
  ): Promise<FindSimilarAssetsResponse> => {
    try {
      const legacyResult = await assetsAPI.findSimilar(assetId, options)
      const convertedSimilarAssets = legacyResult.similarAssets.map(convertVectorSearchResult)

      const response: FindSimilarAssetsResponse = {
        success: true,
        data: convertedSimilarAssets.map(result => ({
          asset: result,
          score: result.similarity,
          similarity: result.similarity
        })),
        sourceAssetId: assetId as any,
        totalResults: legacyResult.total
      }
      return response
    } catch (error) {
      console.error(`Failed to find similar assets for ${assetId}:`, error)
      throw error
    }
  }, [])

  // Get vector statistics
  const getVectorStats = useCallback(async (userId?: string): Promise<GetVectorStatsResponse> => {
    try {
      return await assetsAPI.getVectorStats(userId)
    } catch (error) {
      console.error("Failed to get vector stats:", error)
      throw error
    }
  }, [])

  // Process vector jobs
  const processVectorJobs = useCallback(async (userId?: string) => {
    try {
      return await assetsAPI.processVectorJobs(userId)
    } catch (error) {
      console.error("Failed to process vector jobs:", error)
      throw error
    }
  }, [])

  // Re-vectorize assets
  const reVectorizeAssets = useCallback(async (userId?: string) => {
    try {
      return await assetsAPI.reVectorizeAssets(userId)
    } catch (error) {
      console.error("Failed to re-vectorize assets:", error)
      throw error
    }
  }, [])

  // Analyze asset with AI
  const analyzeAsset = useCallback(async (assetId: string) => {
    try {
      return await assetsAPI.analyzeAsset(assetId)
    } catch (error) {
      console.error("Failed to analyze asset:", error)
      throw error
    }
  }, [])

  // Batch analyze assets with AI
  const batchAnalyzeAssets = useCallback(async (options?: {
    userId?: string;
    limit?: number;
    forceReanalyze?: boolean;
  }) => {
    try {
      return await assetsAPI.batchAnalyzeAssets(options)
    } catch (error) {
      console.error("Failed to batch analyze assets:", error)
      throw error
    }
  }, [])

  return {
    assets,
    isLoading,
    getAssets,
    getAssetById,
    uploadAsset,
    uploadMultipleAssets,
    updateAsset,
    deleteAsset,
    getAssetsByTags,
    searchAssets,
    filterAssetsByType,
    sortAssets,
    vectorSearchAssets,
    findSimilarAssets,
    getVectorStats,
    processVectorJobs,
    reVectorizeAssets,
    analyzeAsset,
    batchAnalyzeAssets,
  }
}
