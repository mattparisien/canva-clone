"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SelectableGrid, SelectableGridItem } from "@/components/ui/selectable-grid"
import { useToast } from "@/components/ui/use-toast"
import { assetsAPI, type Asset } from "@/lib/api/assets"
import { foldersAPI, type Folder as FolderType } from "@/lib/api/folders"
import { Folder as FolderIcon, Plus, Upload } from "lucide-react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { CreateButton } from "@/components/ui/create-button"

export default function DeskPage() {
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
    const [breadcrumbs, setBreadcrumbs] = useState<FolderType[]>([])
    const [selectedFolders, setSelectedFolders] = useState<string[]>([])
    const [selectedAssets, setSelectedAssets] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // // Function to toggle selection of asset
    // const toggleAssetSelection = (assetId: string, e: React.MouseEvent) => {
    //     e.stopPropagation();
    //     setSelectedAssets(prev =>
    //         prev.includes(assetId)
    //             ? prev.filter(id => id !== assetId)
    //             : [...prev, assetId]
    //     );
    // }

    // // Check if item is selected
    // const isFolderSelected = (folderId: string) => selectedFolders.includes(folderId);
    // const isAssetSelected = (assetId: string) => selectedAssets.includes(assetId);

    // // Clear selections
    // const clearSelections = () => {
    //     setSelectedFolders([]);
    //     setSelectedAssets([]);
    // }

    // // To handle action on multiple items if needed
    // const handleBulkActions = () => {
    //     // Implementation for bulk actions (delete, move, etc.)
    //     // This would be implemented based on your requirements
    // }

    // // Fetch folder by slug when component mounts
    // useEffect(() => {
    //     if (!session?.user?.id || !folderSlug) return

    //     const fetchFolder = async () => {
    //         setIsLoading(true)
    //         try {
    //             const folder = await foldersAPI.getBySlug(folderSlug, session.user.id)
    //             console.log(folder);
    //             setCurrentFolder(folder)
    //         } catch (error) {
    //             console.error("Failed to fetch folder:", error)
    //             toast({
    //                 title: "Error",
    //                 description: "Failed to load folder",
    //                 variant: "destructive"
    //             })
    //         }
    //     }

    //     fetchFolder()
    // }, [folderSlug, session?.user?.id, toast])

    // // Fetch folders and assets when current folder changes
    useEffect(() => {
        if (!session?.user?.id) return
        console.log("Current folder:", currentFolder);

        const fetchData = async () => {
            setIsLoading(true)
            try {
                // Fetch folders
                const userFolders = await foldersAPI.getAll(
                    session.user.id,
                    null
                )

                console.log("Fetched folders:", userFolders);

                setFolders(userFolders)


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
        console.log('here!')
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
        router.push(`/folder/${folder.slug}`);
    }

    // const navigateToParent = () => {
    //     if (breadcrumbs.length > 1) {
    //         // Navigate to parent folder using slug
    //         window.location.href = `/folder/${breadcrumbs[breadcrumbs.length - 2].slug}`
    //     } else if (breadcrumbs.length === 1 && breadcrumbs[0].parentId) {
    //         // Navigate to parent if it exists
    //         foldersAPI.getById(breadcrumbs[0].parentId)
    //             .then(parentFolder => {
    //                 window.location.href = `/folder/${parentFolder.slug}`
    //             })
    //             .catch(error => {
    //                 console.error("Failed to fetch parent folder:", error)
    //                 toast({
    //                     title: "Error",
    //                     description: "Failed to navigate to parent folder",
    //                     variant: "destructive"
    //                 })
    //             })
    //     } else {
    //         // Navigate to root files page
    //         window.location.href = "/files"
    //     }
    // }

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
                    <div></div>

                    {selectedFolders.length > 0 || selectedAssets.length > 0 ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {selectedFolders.length + selectedAssets.length} item{selectedFolders.length + selectedAssets.length > 1 ? 's' : ''} selected
                            </span>

                        </div>
                    ) : (
                        <CreateButton
                            buttonText="Create New"
                            items={[
                                {
                                    id: "folder",
                                    label: "Folder",
                                    icon: <FolderIcon className="h-4 w-4" />,
                                    action: handleCreateFolder
                                },
                                {
                                    id: "file",
                                    label: "Upload File",
                                    icon: <Upload className="h-4 w-4" />,
                                    isFileUpload: true,
                                    acceptFileTypes: "image/*",
                                    action: handleFileUpload
                                }
                            ]}
                        />
                    )}
                </div>



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
                                        onClick={(item) => handleOpenFolder(item)}
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


                </div>
            </div>
        </div>
    )
}