"use client"

import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SelectableGrid, SelectableGridItem } from "@/components/ui/selectable-grid"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { assetsAPI, type Asset } from "@/lib/api/assets"
import { foldersAPI, type Folder as FolderType } from "@/lib/api/folders"
import { pathToBreadcrumbs } from "@/lib/utils/folder-utils"
import { ArrowLeft, File, Folder as FolderIcon, FolderOpen, Plus, Trash, Upload } from "lucide-react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function FolderBySlugPage() {
    const params = useParams()
    const router = useRouter()
    const folderSlug = params.slug as string

    const { toast } = useToast()
    const { data: session } = useSession()
    const [isCreatingFolder, setIsCreatingFolder] = useState(false)
    const [folderName, setFolderName] = useState("")
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null)
    const [folders, setFolders] = useState<FolderType[]>([])
    const [assets, setAssets] = useState<Asset[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [breadcrumbs, setBreadcrumbs] = useState<FolderType[]>([])
    const [selectedFolders, setSelectedFolders] = useState<string[]>([])
    const [selectedAssets, setSelectedAssets] = useState<string[]>([])

    // Function to toggle selection of asset
    const toggleAssetSelection = (assetId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedAssets(prev =>
            prev.includes(assetId)
                ? prev.filter(id => id !== assetId)
                : [...prev, assetId]
        );
    }

    // Check if item is selected
    const isFolderSelected = (folderId: string) => selectedFolders.includes(folderId);
    const isAssetSelected = (assetId: string) => selectedAssets.includes(assetId);

    // Clear selections
    const clearSelections = () => {
        setSelectedFolders([]);
        setSelectedAssets([]);
    }


    // Fetch folder by slug when component mounts
    useEffect(() => {
        if (!session?.user?.id || !folderSlug) return

        const fetchFolder = async () => {
            setIsLoading(true)
            try {
                const folder = await foldersAPI.getBySlug(folderSlug, session.user.id)
                console.log(folder);
                setCurrentFolder(folder)
            } catch (error) {
                console.error("Failed to fetch folder:", error)
                toast({
                    title: "Error",
                    description: "Failed to load folder",
                    variant: "destructive"
                })
            }
        }

        fetchFolder()
    }, [folderSlug, session?.user?.id, toast])

    // Fetch folders and assets when current folder changes
    useEffect(() => {
        if (!session?.user?.id || !currentFolder) return
        console.log("Current folder:", currentFolder);

        const fetchData = async () => {
            setIsLoading(true)
            try {
                // Fetch folders
                const userFolders = await foldersAPI.getAll(
                    session.user.id,
                    currentFolder._id  // This passes the current folder ID as parent
                )

                console.log("Fetched folders:", userFolders);
                setFolders(userFolders)

                // Fetch assets
                const userAssets = await assetsAPI.getAll(
                    session.user.id,
                    currentFolder._id
                )



                setAssets(userAssets)

                // Build breadcrumbs
                const buildBreadcrumbs = async (folder: FolderType) => {
                    const breadcrumbTrail: FolderType[] = [folder]
                    let parent = folder.parentId

                    while (parent) {
                        const parentFolder = await foldersAPI.getById(parent)
                        breadcrumbTrail.unshift(parentFolder)
                        parent = parentFolder.parentId
                    }

                    return breadcrumbTrail
                }

                const breadcrumbTrail = await buildBreadcrumbs(currentFolder)
                setBreadcrumbs(breadcrumbTrail)
            } catch (error) {
                console.error("Failed to fetch data:", error)
                toast({
                    title: "Error",
                    description: "Failed to load your files and folders",
                    variant: "destructive"
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [currentFolder, session?.user?.id, toast])

    const handleCreateFolder = async () => {
        if (!session?.user?.id) {
            toast({
                title: "Error",
                description: "You must be logged in to create folders",
                variant: "destructive"
            })
            return
        }

        if (!folderName.trim()) {
            toast({
                title: "Error",
                description: "Folder name cannot be empty",
                variant: "destructive"
            })
            return
        }

        try {
            const newFolder = await foldersAPI.create({
                name: folderName.trim(),
                userId: session.user.id,
                parentId: null
            })

            console.log(newFolder);

            setFolders(prev => [...prev, newFolder])

            toast({
                title: "Success",
                description: `Folder "${folderName}" created successfully!`,
            })

            setFolderName("")
            setIsCreatingFolder(false)
            setIsPopoverOpen(false)
        } catch (error) {
            console.error("Failed to create folder:", error)
            toast({
                title: "Error",
                description: "Failed to create folder. Please try again.",
                variant: "destructive"
            })
        }
    }

    const handleFileUpload = () => {
        document.getElementById("file-upload")?.click()
    }

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0 || !session?.user?.id || !currentFolder) return

        toast({
            title: "Upload started",
            description: `Uploading ${files.length} file(s)...`,
        })

        setIsPopoverOpen(false)

        // Handle each file
        const uploadPromises = Array.from(files).map(async (file) => {
            try {
                const asset = await assetsAPI.upload({
                    file,
                    userId: session.user.id,
                    folderId: currentFolder._id
                })

                return { success: true, asset }
            } catch (error) {
                console.error(`Failed to upload ${file.name}:`, error)
                return { success: false, filename: file.name }
            }
        })

        const results = await Promise.all(uploadPromises)

        // Add successful uploads to state
        const successfulAssets = results
            .filter((result): result is { success: true, asset: Asset } => result.success)
            .map(result => result.asset)

        if (successfulAssets.length > 0) {
            setAssets(prev => [...prev, ...successfulAssets])
        }

        // Report results
        const failedCount = results.filter(r => !r.success).length

        if (failedCount === 0) {
            toast({
                title: "Upload complete",
                description: `Successfully uploaded ${successfulAssets.length} file(s)`,
            })
        } else {
            toast({
                title: "Upload results",
                description: `Uploaded ${successfulAssets.length} file(s), ${failedCount} failed`,
                variant: failedCount === results.length ? "destructive" : "default"
            })
        }

        // Reset the file input
        e.target.value = ''
    }

    const handleOpenFolder = (folder: FolderType) => {
        router.push(folder.slug);
    }

    const navigateToParent = () => {
        if (breadcrumbs.length > 1) {
            // Navigate to parent folder using slug
            window.location.href = `/folder/${breadcrumbs[breadcrumbs.length - 2].slug}`
        } else if (breadcrumbs.length === 1 && breadcrumbs[0].parentId) {
            // Navigate to parent if it exists
            foldersAPI.getById(breadcrumbs[0].parentId)
                .then(parentFolder => {
                    window.location.href = `/folder/${parentFolder.slug}`
                })
                .catch(error => {
                    console.error("Failed to fetch parent folder:", error)
                    toast({
                        title: "Error",
                        description: "Failed to navigate to parent folder",
                        variant: "destructive"
                    })
                })
        } else {
            // Navigate to root files page
            window.location.href = "/files"
        }
    }

    const handleDeleteFolder = async (folder: FolderType, e: React.MouseEvent) => {
        e.stopPropagation() // Prevent opening the folder

        if (!confirm(`Are you sure you want to delete the folder "${folder.name}" and all its contents?`)) {
            return
        }

        try {
            await foldersAPI.delete(folder._id)
            setFolders(prev => prev.filter(f => f._id !== folder._id))

            toast({
                title: "Success",
                description: `Folder "${folder.name}" deleted successfully!`,
            })
        } catch (error) {
            console.error("Failed to delete folder:", error)
            toast({
                title: "Error",
                description: "Failed to delete folder. Please try again.",
                variant: "destructive"
            })
        }
    }

    const handleDeleteFolders = async (folderIds: string[]) => {


        if (!confirm(`Are you sure you want to delete ${folderIds.length} folders?`)) {
            return
        }

        try {
            await Promise.all(folderIds.map(id => foldersAPI.delete(id)))
            setFolders(prev => prev.filter(f => !folderIds.includes(f._id)))

            toast({
                title: "Success",
                description: `Deleted ${folderIds.length} folders successfully!`,
            })
        } catch (error) {
            console.error("Failed to delete folders:", error)
            toast({
                title: "Error",
                description: "Failed to delete folders. Please try again.",
                variant: "destructive"
            })
        }
    }

    const handleDeleteAsset = async (asset: Asset, e: React.MouseEvent) => {
        e.stopPropagation() // Prevent triggering any parent click handlers

        if (!confirm(`Are you sure you want to delete the file "${asset.name}"?`)) {
            return
        }

        try {
            await assetsAPI.delete(asset._id)
            setAssets(prev => prev.filter(a => a._id !== asset._id))

            toast({
                title: "Success",
                description: `File "${asset.name}" deleted successfully!`,
            })
        } catch (error) {
            console.error("Failed to delete file:", error)
            toast({
                title: "Error",
                description: "Failed to delete file. Please try again.",
                variant: "destructive"
            })
        }
    }

    // Function to generate a thumbnail URL for assets
    const getThumbnailUrl = (asset: Asset) => {
        // If there's a thumbnail URL, use that first
        if (asset.thumbnail) {
            // The thumbnail URL is already a complete URL from GridFS
            return asset.thumbnail;
        }

        // If it's an image type and has a URL, use the main image
        if (asset.type === 'image' && asset.url) {
            // The URL is already a complete URL from GridFS
            return asset.url;
        }

        // Return appropriate icon based on file type
        if (asset.type === 'video') return '/placeholder.jpg';
        if (asset.type === 'document') return '/placeholder.svg';

        return '/placeholder-logo.svg'; // Default placeholder
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">{currentFolder?.name || "Loading..."}</h1>
                        <p className="text-muted-foreground">Manage your files and folders</p>
                    </div>

                    {selectedFolders.length > 0 || selectedAssets.length > 0 ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {selectedFolders.length + selectedAssets.length} item{selectedFolders.length + selectedAssets.length > 1 ? 's' : ''} selected
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={clearSelections}
                            >
                                Clear
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                    // Handle bulk deletion
                                    if (confirm(`Are you sure you want to delete ${selectedFolders.length + selectedAssets.length} selected items?`)) {
                                        // Delete folders
                                        const folderPromises = selectedFolders.map(folderId =>
                                            foldersAPI.delete(folderId)
                                                .then(() => ({ success: true, id: folderId }))
                                                .catch(() => ({ success: false, id: folderId }))
                                        );

                                        // Delete assets
                                        const assetPromises = selectedAssets.map(assetId =>
                                            assetsAPI.delete(assetId)
                                                .then(() => ({ success: true, id: assetId }))
                                                .catch(() => ({ success: false, id: assetId }))
                                        );

                                        // Process all deletions
                                        Promise.all([...folderPromises, ...assetPromises])
                                            .then(results => {
                                                const successfulFolderIds = results
                                                    .filter(r => r.success && selectedFolders.includes(r.id))
                                                    .map(r => r.id);

                                                const successfulAssetIds = results
                                                    .filter(r => r.success && selectedAssets.includes(r.id))
                                                    .map(r => r.id);

                                                setFolders(prev => prev.filter(f => !successfulFolderIds.includes(f._id)));
                                                setAssets(prev => prev.filter(a => !successfulAssetIds.includes(a._id)));

                                                const totalSuccess = successfulFolderIds.length + successfulAssetIds.length;
                                                const totalFailures = selectedFolders.length + selectedAssets.length - totalSuccess;

                                                toast({
                                                    title: totalFailures > 0 ? "Partial Success" : "Success",
                                                    description: `Deleted ${totalSuccess} items${totalFailures > 0 ? `, ${totalFailures} items failed` : ''}`,
                                                    variant: totalFailures > 0 ? "default" : "default"
                                                });

                                                clearSelections();
                                            });
                                    }
                                }}
                            >
                                Delete Selected
                            </Button>
                        </div>
                    ) : (
                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus size={50} />
                                    <span>Create</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56" align="end">
                                <h3 className="px-3 pb-3">Create New</h3>
                                {isCreatingFolder ? (
                                    <div className="space-y-2">
                                        <h3 className="font-medium">New Folder</h3>
                                        <Input
                                            placeholder="Folder name"
                                            value={folderName}
                                            onChange={(e) => setFolderName(e.target.value)}
                                            className="h-8"
                                        />
                                        <div className="flex justify-end gap-1 mt-2">
                                            <Button
                                                rounded="none"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsCreatingFolder(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                rounded="none"
                                                size="sm"
                                                onClick={handleCreateFolder}
                                            >
                                                Create
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-2 px-3"
                                            onClick={() => setIsCreatingFolder(true)}
                                        >
                                            <FolderIcon className="h-4 w-4" />
                                            <span>Create folder</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-2 px-3"
                                            onClick={handleFileUpload}
                                        >
                                            <Upload className="h-4 w-4" />
                                            <span>Upload file</span>
                                        </Button>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileSelected}
                                        />
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>
                    )}
                </div>

                {/* Use our new utility function for breadcrumbs */}
                {currentFolder && (
                    <Breadcrumbs
                        className="py-2"
                        items={
                            // If paths array exists, use it; otherwise fall back to the computed breadcrumbs
                            currentFolder.paths && currentFolder.paths.length > 0
                                ? pathToBreadcrumbs(
                                    currentFolder.paths,
                                    // Create a slug mapping from the breadcrumbs array for correct links
                                    Object.fromEntries(
                                        breadcrumbs.map(folder => [folder.name.toLowerCase(), folder.slug])
                                    )
                                )
                                : [
                                    {
                                        label: "Root",
                                        href: "/files",
                                        icon: <FolderIcon className="h-4 w-4" />
                                    },
                                    ...breadcrumbs
                                        .filter(folder => folder.slug !== 'root')
                                        .map(folder => ({
                                            label: folder.name,
                                            href: `/folder/${folder.slug}`,
                                            icon: <FolderIcon className="h-4 w-4" />
                                        }))
                                ]
                        }
                    />
                )}

                {/* Back button when in a folder */}
                {currentFolder && currentFolder.slug !== 'root' && (
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 max-w-fit mb-4"
                        onClick={navigateToParent}
                    >
                        <ArrowLeft size={16} />
                        <span>Back to {breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2].name : 'Root'}</span>
                    </Button>
                )}

                {isLoading ? (
                    // Loading state
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex flex-col space-y-3">
                                <Skeleton className="h-32 w-full rounded-md" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        ))}
                    </div>
                ) : (
                    folders.length === 0 && assets.length === 0 ? (
                        // Empty state
                        <div className="border rounded-md p-8 flex flex-col items-center justify-center text-center text-muted-foreground">
                            <div className="rounded-full bg-muted p-3 mb-3">
                                {currentFolder ? <FolderOpen size={24} /> : <File size={24} />}
                            </div>
                            <h3 className="font-medium mb-1">No items</h3>
                            <p>This folder is empty</p>
                            <div className="flex gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsCreatingFolder(true)}
                                >
                                    Create folder
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleFileUpload}
                                >
                                    Upload files
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Folders and Assets sections
                        <div className="space-y-8">
                            {/* Folders Section */}
                            {folders.length > 0 && (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold">Folders</h2>
                                        </div>
                                    </div>
                                    <SelectableGrid<FolderType>
                                        // onSelect={(folder) => toggleFolderSelection(folder._id, new MouseEvent('click') as any)}
                                        onDelete={(selectedItems) => handleDeleteFolders(selectedItems.map((x: FolderType) => x._id))}
                                    >
                                        {folders.map(folder => (
                                            <SelectableGridItem
                                                key={folder._id}
                                                item={folder}
                                            >

                                                <div
                                                    className="flex items-center space-x-4"
                                                    onClick={() => handleOpenFolder(folder)}
                                                >
                                                    <div className="flex-shrink-0">
                                                        <FolderIcon size={60} className="text-transparent fill-gray-200" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {folder.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {folder.itemCount || 0} items
                                                        </p>
                                                    </div>

                                                </div>
                                            </SelectableGridItem>
                                        ))}
                                    </SelectableGrid>
                                </>
                            )}

                            {/* Assets/Files Section */}
                            {assets.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold">Files</h2>
                                        </div>
                                        {selectedAssets.length > 0 && (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={clearSelections}
                                                >
                                                    Clear selection
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {assets.map(asset => (
                                            <div
                                                key={asset._id}
                                                className={`relative group rounded-lg border ${isAssetSelected(asset._id)
                                                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                                                    : 'border-border hover:border-muted-foreground/50'
                                                    } transition-all`}
                                            >
                                                <div
                                                    className="absolute left-3 top-3 z-10"
                                                    onClick={(e) => toggleAssetSelection(asset._id, e)}
                                                >
                                                    <div className={`h-6 w-6 rounded-md flex items-center justify-center ${isAssetSelected(asset._id)
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted border border-border'
                                                        }`}>
                                                        {isAssetSelected(asset._id) && (
                                                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="p-4">
                                                    {/* Asset thumbnail or preview */}
                                                    <div className="relative mb-3 h-24 w-full flex items-center justify-center bg-gray-100 rounded-md">
                                                        {asset.type === 'image' ? (
                                                            <img
                                                                src={getThumbnailUrl(asset)}
                                                                alt={asset.name}
                                                                className="h-full max-h-24 w-auto mx-auto object-contain"
                                                            />
                                                        ) : (
                                                            <File size={32} className="text-muted-foreground" />
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {asset.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {(asset.fileSize / (1024 * 1024)).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={(e) => handleDeleteAsset(asset, e)}
                                                            >
                                                                <Trash size={16} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>
        </div>
    )
}