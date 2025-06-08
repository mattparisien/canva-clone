"use client"

import { Section } from "@/components/ui/section"
import { LazyGrid } from "@components/composite/LazyGrid"
import { StickyControlsBar, ViewMode } from "@components/composite/StickyControlsBar"
import { SelectionActions } from "@/components/composite/SelectionActions"
import InteractiveCard from "@components/composite/InteractiveCard/InteractiveCard"
import { Badge } from "@components/ui/badge"
import { Button } from "@components/ui/button"
import { Card, CardContent } from "@components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@components/ui/dropdown-menu"
import { Skeleton } from "@components/ui/skeleton"
import { useToast } from "@components/ui/use-toast"
import { useAssets } from "@features/assets/use-assets"
import { Asset } from "@lib/types/api"
import { formatBytes, getRelativeTime } from "@lib/utils/utils"
import { SelectionProvider, useSelection } from "@lib/context/selection-context"
import {
    Download,
    Eye,
    File,
    FileImage,
    FileText,
    FileVideo,
    Filter,
    MoreVertical,
    Plus,
    SlidersHorizontal,
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
    const [hasMore, setHasMore] = useState(true)
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
                // The hook automatically updates the assets state
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
            'text/*': ['.txt']
        }
    })

    // Asset actions
    const handleDeleteAsset = async (assetId: string) => {
        try {
            await deleteAsset(assetId)
            // The hook automatically updates the assets state
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

    const toggleAssetSelection = (assetId: string) => {
        setSelectedAssets(prev => {
            const newSet = new Set(prev)
            if (newSet.has(assetId)) {
                newSet.delete(assetId)
            } else {
                newSet.add(assetId)
            }
            return newSet
        })
    }

    // Get asset type icon
    const getAssetIcon = (type: string) => {
        switch (type) {
            case 'image':
                return <FileImage className="h-4 w-4" />
            case 'video':
                return <FileVideo className="h-4 w-4" />
            case 'document':
                return <FileText className="h-4 w-4" />
            default:
                return <File className="h-4 w-4" />
        }
    }

    // Render asset card
    const renderAssetCard = (asset: Asset, index: number) => {
        const isSelected = selectedAssets.has(asset._id)

        return (
            <Card
                key={asset._id}
                className={`group cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                onClick={() => toggleAssetSelection(asset._id)}
            >
                <CardContent className="p-0">
                    {/* Asset preview */}
                    <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
                        {asset.type === 'image' && (asset.thumbnail || asset.url || asset.cloudinaryUrl) ? (
                            <img
                                src={asset.thumbnail || asset.url || asset.cloudinaryUrl}
                                alt={asset.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                <div className="text-center">
                                    {getAssetIcon(asset.type)}
                                    <p className="text-xs text-gray-500 mt-1">{asset.type.toUpperCase()}</p>
                                </div>
                            </div>
                        )}

                        {/* Overlay with actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleDownloadAsset(asset)
                                }}
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    window.open(asset.url || asset.cloudinaryUrl, '_blank')
                                }}
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleDownloadAsset(asset)}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => window.open(asset.url || asset.cloudinaryUrl, '_blank')}
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => handleDeleteAsset(asset._id)}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Asset info */}
                    <div className="p-3">
                        <h3 className="font-medium text-sm truncate" title={asset.name}>
                            {asset.name}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500">
                                {formatBytes(asset.fileSize || 0)}
                            </p>
                            {asset.tags && asset.tags.length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    {asset.tags[0]}
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const renderAssetRow = (asset: Asset, index: number) => {
        const isSelected = selectedAssets.has(asset._id)

        return (
            <Card
                key={asset._id}
                className={`cursor-pointer transition-all hover:shadow-sm ${isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                onClick={() => toggleAssetSelection(asset._id)}
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
                                getAssetIcon(asset.type)
                            )}
                        </div>

                        {/* Asset details */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{asset.name}</h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span>{asset.type}</span>
                                <span>{formatBytes(asset.fileSize || 0)}</span>
                                {asset.createdAt && (
                                    <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                                )}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex gap-1">
                            {asset.tags?.slice(0, 2).map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleDownloadAsset(asset)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => window.open(asset.url || asset.cloudinaryUrl, '_blank')}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => handleDeleteAsset(asset._id)}
                                    className="text-red-600"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div {...getRootProps()} className="min-h-screen">
            <input {...getInputProps()} />

            {/* Header */}
            <div className="container mb-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Assets</h1>
                        <p className="text-gray-600">Manage your media assets - images, videos, documents, and more</p>
                    </div>
                    <Button
                        onClick={open}
                        disabled={isUploading}
                        size="lg"
                        className="bg-primary hover:bg-primary/90"
                    >
                        <Upload className="h-5 w-5 mr-2" />
                        {isUploading ? "Uploading..." : "Upload Assets"}
                    </Button>
                </div>
            </div>


            {/* Drag and drop overlay */}
            {isDragActive && (
                <div className="fixed inset-0 bg-blue-500/20 backdrop-blur-sm border-4 border-dashed border-blue-500 z-50 flex items-center justify-center animate-pulse">
                    <div className="text-center bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-blue-200 max-w-md mx-4">
                        <div className="relative">
                            <Upload className="h-20 w-20 text-blue-500 mx-auto mb-6 animate-bounce" />
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full animate-ping"></div>
                        </div>
                        <h2 className="text-3xl font-bold mb-3 text-gray-800">Drop files here!</h2>
                        <p className="text-gray-600 text-lg mb-4">
                            Release to upload your files instantly
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <FileImage className="h-4 w-4" /> Images
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <FileVideo className="h-4 w-4" /> Videos
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <FileText className="h-4 w-4" /> Documents
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls */}
            <StickyControlsBar
                showCondition={assets && assets.length > 0}
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
                showViewToggle={true}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {/* Asset count and selection info */}
            <Section>
                <p className="text-sm text-gray-600">
                    {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'}
                    {selectedAssets.size > 0 && (
                        <span className="ml-2 font-medium">
                            • {selectedAssets.size} selected
                        </span>
                    )}
                </p>

                {selectedAssets.size > 0 && (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAssets(new Set())}
                        >
                            Clear selection
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                Array.from(selectedAssets).forEach(id => handleDeleteAsset(id))
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete selected
                        </Button>
                    </div>
                )}
            </Section>
            {/* Assets grid/list */}
            <Section>
                {isLoading ? (
                    <div className={viewMode === 'grid'
                        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                        : "space-y-2"
                    }>
                        {Array.from({ length: 12 }).map((_, i) => (
                            <Card key={i}>
                                <CardContent className="p-0">
                                    {viewMode === 'grid' ? (
                                        <>
                                            <Skeleton className="aspect-square rounded-t-lg" />
                                            <div className="p-3 space-y-2">
                                                <Skeleton className="h-4" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-4 flex items-center gap-4">
                                            <Skeleton className="w-12 h-12 rounded" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4" />
                                                <Skeleton className="h-3 w-1/3" />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredAssets.length === 0 ? (
                    <div className="text-center py-12">
                        <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">No assets found</h2>
                        <p className="text-gray-600 mb-4">
                            {searchQuery || filterType !== 'all'
                                ? "Try adjusting your search or filters"
                                : "Start by uploading your first asset"
                            }
                        </p>
                        {(!searchQuery && filterType === 'all') && (
                            <Button onClick={open}>
                                <Plus className="h-4 w-4 mr-2" />
                                Upload Your First Asset
                            </Button>
                        )}
                    </div>
                ) : (
                    <LazyGrid
                        items={filteredAssets}
                        renderItem={viewMode === 'grid' ? renderAssetCard : renderAssetRow}
                        loadMore={() => { }} // Not implemented for now
                        hasMore={hasMore}
                        isLoading={false}
                        className={viewMode === 'grid'
                            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                            : "space-y-2"
                        }
                    />
                )}
            </Section>
        </div>
    )
}
