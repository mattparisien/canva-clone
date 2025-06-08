import { useState, useCallback } from "react"
import { Asset } from "@lib/types/api"
import { assetsAPI } from "@lib/api"

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Get all assets for a user
  const getAssets = useCallback(async (userId?: string, folderId?: string): Promise<Asset[]> => {
    setIsLoading(true)
    try {
      const fetchedAssets = await assetsAPI.getAll(userId, folderId)
      setAssets(fetchedAssets)
      return fetchedAssets
    } catch (error) {
      console.error("Failed to fetch assets:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get asset by ID
  const getAssetById = useCallback(async (assetId: string): Promise<Asset> => {
    try {
      return await assetsAPI.getById(assetId)
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
  }): Promise<Asset> => {
    try {
      const uploadedAsset = await assetsAPI.upload(params)
      setAssets(prev => [uploadedAsset, ...prev])
      return uploadedAsset
    } catch (error) {
      console.error("Failed to upload asset:", error)
      throw error
    }
  }, [])

  // Upload multiple assets
  const uploadMultipleAssets = useCallback(async (
    files: File[], 
    tags: string[] = []
  ): Promise<Asset[]> => {
    try {
      const uploadedAssets = await assetsAPI.uploadMultiple(files, tags)
      setAssets(prev => [...uploadedAssets, ...prev])
      return uploadedAssets
    } catch (error) {
      console.error("Failed to upload multiple assets:", error)
      throw error
    }
  }, [])

  // Update asset
  const updateAsset = useCallback(async (
    assetId: string, 
    updateData: { name?: string; tags?: string[] }
  ): Promise<Asset> => {
    try {
      const updatedAsset = await assetsAPI.update(assetId, updateData)
      setAssets(prev => prev.map(asset => 
        asset._id === assetId ? updatedAsset : asset
      ))
      return updatedAsset
    } catch (error) {
      console.error(`Failed to update asset ${assetId}:`, error)
      throw error
    }
  }, [])

  // Delete asset
  const deleteAsset = useCallback(async (assetId: string): Promise<void> => {
    try {
      await assetsAPI.delete(assetId)
      setAssets(prev => prev.filter(asset => asset._id !== assetId))
    } catch (error) {
      console.error(`Failed to delete asset ${assetId}:`, error)
      throw error
    }
  }, [])

  // Get assets by tags
  const getAssetsByTags = useCallback(async (tags: string[]): Promise<Asset[]> => {
    try {
      return await assetsAPI.getByTags(tags)
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
  ): Promise<{ 
    query: string; 
    results: (Asset & { similarity: number })[]; 
    total: number; 
  }> => {
    try {
      return await assetsAPI.searchByVector(query, options)
    } catch (error) {
      console.error("Failed to search assets by vector:", error)
      throw error
    }
  }, [])

  // Find similar assets
  const findSimilarAssets = useCallback(async (
    assetId: string, 
    options?: { limit?: number; threshold?: number }
  ): Promise<{
    originalAsset: Asset;
    similarAssets: (Asset & { similarity: number })[];
    total: number;
  }> => {
    try {
      return await assetsAPI.findSimilar(assetId, options)
    } catch (error) {
      console.error(`Failed to find similar assets for ${assetId}:`, error)
      throw error
    }
  }, [])

  // Get vector statistics
  const getVectorStats = useCallback(async (userId?: string) => {
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
  }
}
