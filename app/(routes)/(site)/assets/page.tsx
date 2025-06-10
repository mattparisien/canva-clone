"use client"

import { Section } from "@/components/atoms/section"
import { LazyGrid } from "@/components/organisms/LazyGrid/LazyGrid"
import { StickyControlsBar, ViewMode } from "@components/organisms/StickyControlsBar"
import { SelectionActions } from "@/components/organisms/SelectionActions"
import InteractiveCard from "@components/organisms/InteractiveCard/InteractiveCard"
import { Badge } from "@components/atoms/badge"
import { Button } from "@components/atoms/button"
import { Card, CardContent } from "@components/atoms/card"
import { Skeleton } from "@components/atoms/skeleton"
import EmptyState from "@/components/atoms/empty-state"
import { useToast } from "@components/atoms/use-toast"
import { useAssets } from "@features/assets/use-assets"
import { Asset } from "@lib/types/api"
import { formatBytes, getRelativeTime } from "@lib/utils/utils"
import { SelectionProvider, useSelection } from "@lib/context/selection-context"
import {
    Download,
    Eye,
    FileImage,
    FileText,
    FileVideo,
    Filter,
    Plus,
    SlidersHorizontal,
    Table,
    Trash2,
    Upload
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"

type AssetType = 'all' | 'image' | 'video' | 'document' | 'other'
type SortBy = 'newest' | 'oldest' | 'name' | 'size' | 'type'

// Main Assets component that wraps everything with SelectionProvider
export default function AssetsPage() {
    return (
        <SelectionProvider>
            <AssetsPageContent />
        </SelectionProvider>
    )
}

// Inner content component that can safely use the useSelection hook
function AssetsPageContent() {
    const { toast } = useToast()
    const { selectedIds, clearSelection } = useSelection()

    // State management
    const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState<AssetType>("all")
    const [sortBy, setSortBy] = useState<SortBy>("newest")
    const [viewMode, setViewMode] = useState<ViewMode>("grid")
    const [hasMore, setHasMore] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    // API hooks with built-in state management
    const {
        assets,
        isLoading,
        getAssets,
        uploadAsset,
        deleteAsset,
        updateAsset
    } = useAssets()

    // Load assets
    const loadAssets = useCallback(async () => {
        try {
            await getAssets()
            setHasMore(false) // For now, load all assets at once
        } catch (error) {
            console.error("Failed to load assets:", error)
            toast({
                title: "Error",
                description: "Failed to load assets. Please try again.",
                variant: "destructive"
            })
        }
    }, [getAssets, toast])

    // Filter and sort assets
    useEffect(() => {
        if (!assets) return

        let filtered = [...assets]

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(asset => asset.type === filterType)
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(asset =>
                asset.name.toLowerCase().includes(query) ||
                asset.originalFilename?.toLowerCase().includes(query) ||
                asset.tags?.some(tag => tag.toLowerCase().includes(query))
            )
        }

        // Sort assets
        filtered.sort((a, b) => {
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

        setFilteredAssets(filtered)
    }, [assets, searchQuery, filterType, sortBy])

    // Load assets on mount
    useEffect(() => {
        loadAssets()
    }, [loadAssets])

    // File upload handling
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return

        setIsUploading(true)
        const uploadPromises = acceptedFiles.map(async (file) => {
            try {
                const asset = await uploadAsset({
                    file,
                    name: file.name,
                    tags: ['user-upload']
                })
                return { success: true, asset, fileName: file.name }
            } catch (error) {
                console.error(`Failed to upload ${file.name}:`, error)
                return { success: false, error, fileName: file.name }
            }
        })

        try {
            const results = await Promise.all(uploadPromises)
            const successful = results.filter(r => r.success)
            const failed = results.filter(r => !r.success)

            if (successful.length > 0) {
                toast({
                    title: "Upload successful",
                    description: `${successful.length} file(s) uploaded successfully.`
                })
            }

            if (failed.length > 0) {
                toast({
                    title: "Some uploads failed",
                    description: `${failed.length} file(s) failed to upload.`,
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Upload failed",
                description: "Failed to upload files. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsUploading(false)
        }
    }, [uploadAsset, toast])

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        noClick: true,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
            'video/*': ['.mp4', '.mov', '.avi', '.webm'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/csv': ['.csv'],
            'application/csv': ['.csv'],
            'text/plain': ['.txt']
        }
    })

    // Asset actions
    const handleDeleteAsset = async (assetId: string) => {
        try {
            await deleteAsset(assetId)
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
                if (asset && (asset.mimeType?.includes('csv') || asset.originalFilename?.endsWith('.csv'))) {
                    return <Table className="h-8 w-8 text-green-500" />
                }
                return <FileText className="h-8 w-8 text-red-500" />
            default:
                return <FileText className="h-8 w-8 text-gray-500" />
        }
    }

    // Create a wrapper function for loadAssets to match the expected loadMore type signature
    const handleLoadMore = useCallback(async () => {
        // For now, we don't implement pagination
        return
    }, [])

    // Render asset card for grid view using InteractiveCard
    const renderAssetCard = useCallback((asset: Asset, index: number) => {
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
            <InteractiveCard
                key={asset._id}
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
        )
    }, [])

    // Render asset row for list view
    const renderAssetRow = useCallback((asset: Asset, index: number) => {
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
    }, [])

    return (
        <div
            {...getRootProps()}
            // className="min-h-screen space-y-6"
        >
            <input {...getInputProps()} />
            
            {/* Upload overlay */}
            {isDragActive && (
                <div className="fixed inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 shadow-lg text-center">
                        <Upload className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Drop files to upload</h2>
                        <p className="text-gray-600">Release to start uploading</p>
                    </div>
                </div>
            )}

            {/* Selection Actions */}
            <SelectionActions
                onDelete={handleDeleteSelectedAssets}
            />

            {/* All Assets */}
            <Section heading="My Assets">
                {/* Sticky Controls Bar */}
                <StickyControlsBar
                    showCondition={assets && assets.length > 0}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    showViewToggle={true}
                    showSearch={true}
                    searchValue={searchQuery}
                    searchPlaceholder="Search assets..."
                    onSearchChange={setSearchQuery}
                    showFilter={true}
                    filterValue={filterType}
                    filterOptions={[
                        { value: "all", label: "All Types" },
                        { value: "image", label: "Images" },
                        { value: "video", label: "Videos" },
                        { value: "document", label: "Documents" },
                        { value: "other", label: "Other" }
                    ]}
                    onFilterChange={(value) => setFilterType(value as AssetType)}
                    filterLabel="Type"
                    showSort={true}
                    sortValue={sortBy}
                    sortOptions={[
                        { value: "newest", label: "Newest" },
                        { value: "oldest", label: "Oldest" },
                        { value: "name", label: "Name" },
                        { value: "size", label: "Size" },
                        { value: "type", label: "Type" }
                    ]}
                    onSortChange={(value) => setSortBy(value as SortBy)}
                    sortLabel="Sort by"
                    customActions={[
                        {
                            icon: Filter,
                            label: "Filter",
                            onClick: () => {
                                // TODO: Implement advanced filter functionality
                                console.log("Filter clicked");
                            },
                        },
                        {
                            icon: SlidersHorizontal,
                            label: "Sort",
                            onClick: () => {
                                // TODO: Implement advanced sort functionality
                                console.log("Sort clicked");
                            },
                        }
                    ]}
                />

                {/* Loading state */}
                {/* Removed - now handled inside LazyGrid */}

                {/* Error state would go here if needed */}

                {/* Content - LazyGrid now handles its own loading states */}
                {viewMode === "grid" ? (
                    <div className="space-y-6">
                        <LazyGrid
                            items={filteredAssets}
                            renderItem={renderAssetCard}
                            loadMore={handleLoadMore}
                            hasMore={hasMore}
                            isLoading={isLoading}
                            isInitialLoading={isLoading && filteredAssets.length === 0}
                            loadingVariant="grid"
                            loadingText="Loading your assets..."
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full"
                        />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <LazyGrid
                            items={filteredAssets}
                            renderItem={renderAssetRow}
                            loadMore={handleLoadMore}
                            hasMore={hasMore}
                            isLoading={isLoading}
                            isInitialLoading={isLoading && filteredAssets.length === 0}
                            loadingVariant="list"
                            loadingText="Loading your assets..."
                            className="space-y-2"
                        />
                    </div>
                )}

                {/* Empty state */}
                {filteredAssets.length === 0 && !isLoading && (
                    <EmptyState
                        icon={<Upload className="h-16 w-16 text-gray-400 mx-auto" />}
                        heading="No assets found"
                        message={searchQuery || filterType !== 'all' ?
                            "Try adjusting your search or filters" :
                            "Start by uploading your first asset"}
                    >
                        {(!searchQuery && filterType === 'all') && (
                            <Button variant="gradient" onClick={open}>
                                <Plus className="h-4 w-4 mr-2" />
                                Upload Your First Asset
                            </Button>
                        )}
                    </EmptyState>
                )}

                {/* Upload button for empty state or floating action */}
                {filteredAssets.length > 0 && (
                    <div className="fixed bottom-6 right-6">
                        <Button
                            variant="gradient"
                            onClick={open}
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Upload
                        </Button>
                    </div>
                )}
            </Section>
        </div>
    )
}
