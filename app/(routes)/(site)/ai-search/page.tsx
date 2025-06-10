"use client"

import { Section } from "@/components/atoms/section"
import { LazyGrid } from "@components/organisms/LazyGrid"
import { StickyControlsBar, ViewMode } from "@components/organisms/StickyControlsBar"
import { SelectionActions } from "@/components/organisms/SelectionActions"
import InteractiveCard from "@components/organisms/InteractiveCard/InteractiveCard"
import { HybridSearch } from "@/(routes)/(site)/assets/components/HybridSearch"
import { Badge } from "@components/atoms/badge"
import { Button } from "@components/atoms/button"
import { Card, CardContent } from "@components/atoms/card"
import { Skeleton } from "@components/atoms/skeleton"
import { useToast } from "@components/atoms/use-toast"
import { useAssets } from "@features/assets/use-assets"
import { Asset } from "@lib/types/api"
import { formatBytes, getRelativeTime } from "@lib/utils/utils"
import { SelectionProvider, useSelection } from "@lib/context/selection-context"
import {
    Brain,
    Download,
    File,
    FileImage,
    FileText,
    FileVideo,
    Plus,
    Search,
    Sparkles,
    Table,
    Trash2,
    Zap
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"

// Main AI Search component that wraps everything with SelectionProvider
export default function AISearchPage() {
    return (
        <SelectionProvider>
            <AISearchPageContent />
        </SelectionProvider>
    )
}

// Inner content component that can safely use the useSelection hook
function AISearchPageContent() {
    const { toast } = useToast()
    const { selectedIds, clearSelection } = useSelection()

    // State management
    const [searchResults, setSearchResults] = useState<Asset[]>([])
    const [isVectorSearch, setIsVectorSearch] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState<ViewMode>("grid")
    const [isSearching, setIsSearching] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    // API hooks
    const {
        assets,
        isLoading,
        getAssets,
        deleteAsset,
        updateAsset
    } = useAssets()

    // Load all assets on mount for fallback
    useEffect(() => {
        getAssets().catch(console.error)
    }, [getAssets])

    // Handle search results from HybridSearch component
    const handleSearchResults = useCallback((results: Asset[], isVector: boolean, query: string) => {
        setSearchResults(results)
        setIsVectorSearch(isVector)
        setSearchQuery(query)
        setHasSearched(true)
        
        // If it's a traditional search (not vector), we need to filter from all assets
        if (!isVector && assets) {
            const filteredAssets = assets.filter(asset =>
                asset.name.toLowerCase().includes(query.toLowerCase()) ||
                asset.originalFilename?.toLowerCase().includes(query.toLowerCase()) ||
                asset.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
            )
            setSearchResults(filteredAssets)
        }
    }, [assets])

    // Handle clearing search
    const handleClearSearch = useCallback(() => {
        setSearchResults([])
        setIsVectorSearch(false)
        setSearchQuery("")
        setHasSearched(false)
    }, [])

    // Asset actions
    const handleDeleteAsset = async (assetId: string) => {
        try {
            await deleteAsset(assetId)
            // Remove from search results
            setSearchResults(prev => prev.filter(asset => asset._id !== assetId))
            toast({
                title: "Asset deleted",
                description: "Asset has been successfully deleted."
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete asset. Please try again.",
                variant: "destructive"
            })
        }
    }

    // Handle deleting selected assets
    const handleDeleteSelectedAssets = async () => {
        if (selectedIds.length === 0) return

        try {
            // Delete all selected assets
            await Promise.all(selectedIds.map(id => deleteAsset(id)))
            
            // Remove from search results
            setSearchResults(prev => prev.filter(asset => !selectedIds.includes(asset._id)))
            
            // Clear selection
            clearSelection()
            
            toast({
                title: "Assets deleted",
                description: `${selectedIds.length} asset(s) deleted successfully.`
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete some assets. Please try again.",
                variant: "destructive"
            })
        }
    }

    const handleDownloadAsset = (asset: Asset) => {
        const link = document.createElement('a')
        link.href = asset.url || asset.cloudinaryUrl || ''
        link.download = asset.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleOpenAsset = (asset: Asset) => {
        // Open asset in a new tab/window for viewing
        if (asset.url || asset.cloudinaryUrl) {
            window.open(asset.url || asset.cloudinaryUrl, '_blank')
        }
    }

    const handleAssetTitleChange = async (assetId: string, newTitle: string) => {
        try {
            await updateAsset(assetId, { name: newTitle })
            // Update in search results
            setSearchResults(prev => prev.map(asset => 
                asset._id === assetId ? { ...asset, name: newTitle } : asset
            ))
            toast({
                title: "Asset renamed",
                description: "Asset has been successfully renamed."
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to rename asset. Please try again.",
                variant: "destructive"
            })
        }
    }

    // Get asset type icon
    const getAssetIcon = (type: string, asset?: Asset) => {
        switch (type) {
            case 'image':
                return <FileImage className="h-8 w-8 text-blue-500" />
            case 'video':
                return <FileVideo className="h-8 w-8 text-purple-500" />
            case 'document':
                // Check if it's a CSV file
                if (asset?.mimeType?.includes('csv') || asset?.originalFilename?.endsWith('.csv')) {
                    return <Table className="h-8 w-8 text-green-500" />
                }
                return <FileText className="h-8 w-8 text-red-500" />
            default:
                return <FileText className="h-8 w-8 text-gray-500" />
        }
    }

    // Create a wrapper function for loadMore (no pagination for search results)
    const handleLoadMore = useCallback(async () => {
        return
    }, [])

    // Render asset card for grid view using InteractiveCard
    const renderAssetCard = useCallback((asset: Asset & { similarity?: number }, index: number) => {
        const getThumbnailSrc = () => {
            if (asset.type === 'image' && asset.thumbnail) {
                return asset.thumbnail
            }
            return undefined
        }

        const image = getThumbnailSrc() ? {
            src: getThumbnailSrc()!,
            alt: asset.name
        } : undefined

        return (
            <div key={asset._id} className="relative">
                <InteractiveCard
                    id={asset._id}
                    image={image}
                    title={asset.name}
                    subtitleLeft={asset.type}
                    subtitleRight={getRelativeTime(asset.createdAt)}
                    onClick={() => handleOpenAsset(asset)}
                    onTitleChange={handleAssetTitleChange}
                >
                    {/* Custom content for non-image assets */}
                    {!image && (
                        <div className="h-full flex items-center justify-center bg-gray-50">
                            {getAssetIcon(asset.type, asset)}
                        </div>
                    )}
                </InteractiveCard>
                
                {/* Similarity badge for vector search results */}
                {isVectorSearch && asset.similarity && (
                    <Badge 
                        variant={asset.similarity > 0.8 ? "default" : "secondary"}
                        className="absolute top-2 right-2 text-xs"
                    >
                        {(asset.similarity * 100).toFixed(0)}%
                    </Badge>
                )}
            </div>
        )
    }, [isVectorSearch])

    // Render asset row for list view
    const renderAssetRow = useCallback((asset: Asset & { similarity?: number }, index: number) => {
        return (
            <Card
                key={asset._id}
                className="cursor-pointer transition-all hover:shadow-sm"
                onClick={() => handleOpenAsset(asset)}
            >
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        {/* Icon/Thumbnail */}
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded">
                            {asset.type === 'image' && asset.thumbnail ? (
                                <img
                                    src={asset.thumbnail}
                                    alt={asset.name}
                                    className="w-full h-full object-cover rounded"
                                />
                            ) : (
                                getAssetIcon(asset.type, asset)
                            )}
                        </div>

                        {/* Asset details */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{asset.name}</h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span>{asset.type}</span>
                                <span>{formatBytes(asset.fileSize || 0)}</span>
                                {asset.createdAt && (
                                    <span>{getRelativeTime(asset.createdAt)}</span>
                                )}
                                {isVectorSearch && asset.similarity && (
                                    <Badge 
                                        variant={asset.similarity > 0.8 ? "default" : "secondary"}
                                        className="text-xs"
                                    >
                                        {(asset.similarity * 100).toFixed(0)}% match
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleDownloadAsset(asset)
                                }}
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteAsset(asset._id)
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }, [isVectorSearch])

    return (
        <div className="min-h-screen space-y-6">
            {/* Selection Actions */}
            <SelectionActions
                onDelete={handleDeleteSelectedAssets}
            />

            {/* AI Search */}
            <Section 
                heading="AI-Powered Asset Search" 
                subHeading="Use natural language and semantic understanding to find your assets"
            >
                {/* Hybrid Search Component */}
                <HybridSearch
                    onSearchResults={handleSearchResults}
                    onClearSearch={handleClearSearch}
                    className="mb-6"
                />

                {/* Controls for search results */}
                {hasSearched && searchResults.length > 0 && (
                    <StickyControlsBar
                        showCondition={true}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        showViewToggle={true}
                    />
                )}

                {/* Search Results */}
                {hasSearched ? (
                    <>
                        {/* Results Header */}
                        {searchResults.length > 0 && (
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    {isVectorSearch ? (
                                        <>
                                            <Sparkles className="h-4 w-4" />
                                            AI search found {searchResults.length} assets
                                        </>
                                    ) : (
                                        <>
                                            <Search className="h-4 w-4" />
                                            Text search found {searchResults.length} assets
                                        </>
                                    )}
                                    {searchQuery && <span className="font-medium">for "{searchQuery}"</span>}
                                </div>
                                
                                {isVectorSearch && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Sparkles className="h-3 w-3" />
                                        Semantic Search
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Results Grid/List */}
                        {searchResults.length > 0 ? (
                            <>
                                {viewMode === "grid" ? (
                                    <div className="space-y-6">
                                        <LazyGrid
                                            items={searchResults}
                                            renderItem={renderAssetCard}
                                            loadMore={handleLoadMore}
                                            hasMore={false}
                                            isLoading={false}
                                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <LazyGrid
                                            items={searchResults}
                                            renderItem={renderAssetRow}
                                            loadMore={handleLoadMore}
                                            hasMore={false}
                                            isLoading={false}
                                            className="space-y-2"
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            /* No Results */
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                <div className="rounded-full bg-gray-100 p-6 mb-4">
                                    {isVectorSearch ? (
                                        <Sparkles className="h-12 w-12 text-gray-400" />
                                    ) : (
                                        <Search className="h-12 w-12 text-gray-400" />
                                    )}
                                </div>
                                <h3 className="text-xl font-medium mb-2">No results found</h3>
                                <p className="text-gray-500 mb-4 max-w-sm">
                                    {isVectorSearch 
                                        ? "Try describing your asset differently or adjusting the similarity threshold in advanced settings."
                                        : "No assets match your search terms. Try different keywords or use AI search for semantic matching."
                                    }
                                </p>
                                {!isVectorSearch && (
                                    <p className="text-sm text-gray-400">
                                        💡 Tip: Try using the AI search tab for more flexible, semantic-based results
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    /* Welcome State */
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="rounded-full bg-gradient-to-br from-blue-100 to-purple-100 p-8 mb-6">
                            <Brain className="h-16 w-16 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-3">Smart Asset Discovery</h2>
                        <p className="text-gray-600 mb-6 max-w-lg">
                            Search your assets using natural language descriptions, find visually similar content, 
                            or combine traditional and AI-powered search for the best results.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
                            <Card className="p-4 text-center">
                                <Search className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                <h3 className="font-medium mb-1">Text Search</h3>
                                <p className="text-sm text-gray-500">Search by filename, tags, and metadata</p>
                            </Card>
                            
                            <Card className="p-4 text-center">
                                <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                                <h3 className="font-medium mb-1">AI Search</h3>
                                <p className="text-sm text-gray-500">Describe what you're looking for naturally</p>
                            </Card>
                            
                            <Card className="p-4 text-center">
                                <Zap className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                                <h3 className="font-medium mb-1">Hybrid</h3>
                                <p className="text-sm text-gray-500">Combine both methods for comprehensive results</p>
                            </Card>
                        </div>
                        
                        <p className="text-sm text-gray-400 mt-6">
                            Start typing in the search box above to begin discovering your assets
                        </p>
                    </div>
                )}
            </Section>
        </div>
    )
}
