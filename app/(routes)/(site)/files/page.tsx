"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Folder, Plus, Upload, File, Trash, FolderOpen, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { assetsAPI, type Asset } from "@/lib/api/assets"
import { foldersAPI, type Folder as FolderType } from "@/lib/api/folders"
import { useSession } from "next-auth/react"
import { Skeleton } from "@/components/ui/skeleton"

export default function FilesPage() {
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

    // Fetch folders and assets when component mounts or current folder changes
    useEffect(() => {
        if (!session?.user?.id) return

        const fetchData = async () => {
            setIsLoading(true)
            try {
                // Fetch folders
                const userFolders = await foldersAPI.getAll(
                    session.user.id,
                    currentFolder?._id || null
                )
                setFolders(userFolders)

                // Fetch assets
                const userAssets = await assetsAPI.getAll(
                    session.user.id,
                    currentFolder?._id || null
                )
                setAssets(userAssets)

                // If we're in a subfolder, build breadcrumbs
                if (currentFolder) {
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
                } else {
                    setBreadcrumbs([])
                }
                
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
                parentId: currentFolder?._id || null
            })
            
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
        if (!files || files.length === 0 || !session?.user?.id) return

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
                    folderId: currentFolder?._id || null
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
        setCurrentFolder(folder)
    }

    const navigateToParent = () => {
        if (breadcrumbs.length > 1) {
            // Navigate to parent folder
            setCurrentFolder(breadcrumbs[breadcrumbs.length - 2])
        } else {
            // Navigate to root
            setCurrentFolder(null)
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
        if (asset.thumbnail) return asset.thumbnail
        
        if (asset.type === 'image') return asset.url
        
        // Return appropriate icon based on file type
        if (asset.type === 'video') return '/placeholder.jpg'
        if (asset.type === 'document') return '/placeholder.svg'
        
        return '/placeholder-logo.svg' // Default placeholder
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Files</h1>
                        <p className="text-muted-foreground">Manage your files and folders</p>
                    </div>
                    
                    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus size={16} />
                                <span>Create</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-3" align="end">
                            {isCreatingFolder ? (
                                <div className="space-y-2">
                                    <h3 className="font-medium">New Folder</h3>
                                    <Input
                                        placeholder="Folder name"
                                        value={folderName}
                                        onChange={(e) => setFolderName(e.target.value)}
                                        className="h-8"
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setIsCreatingFolder(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
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
                                        className="w-full justify-start gap-2 px-2" 
                                        onClick={() => setIsCreatingFolder(true)}
                                    >
                                        <Folder className="h-4 w-4" />
                                        <span>Create folder</span>
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        className="w-full justify-start gap-2 px-2"
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
                </div>
                
                {/* Breadcrumbs navigation */}
                {currentFolder && (
                    <div className="flex items-center gap-2 py-2 text-sm">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            className="flex items-center gap-1 h-7"
                            onClick={() => setCurrentFolder(null)}
                        >
                            <Folder className="h-4 w-4" />
                            <span>Root</span>
                        </Button>
                        
                        {breadcrumbs.length > 0 && (
                            <>
                                <span>/</span>
                                {breadcrumbs.map((folder, index) => (
                                    <div key={folder._id} className="flex items-center gap-1">
                                        {index > 0 && <span>/</span>}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7"
                                            onClick={() => setCurrentFolder(folder)}
                                        >
                                            {folder.name}
                                        </Button>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
                
                {/* Back button when in a folder */}
                {currentFolder && (
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
                    // Display folders and files
                    folders.length === 0 && assets.length === 0 ? (
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
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {/* Folders */}
                            {folders.map(folder => (
                                <Card 
                                    key={folder._id}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => handleOpenFolder(folder)}
                                >
                                    <CardContent className="p-4 flex flex-col items-center justify-center relative h-32">
                                        <Button
                                            variant="ghost" 
                                            size="icon"
                                            className="absolute right-2 top-2 opacity-0 hover:opacity-100 transition-opacity focus:opacity-100 h-7 w-7"
                                            onClick={(e) => handleDeleteFolder(folder, e)}
                                        >
                                            <Trash size={16} />
                                        </Button>
                                        <Folder size={40} className="text-blue-500 mb-2" />
                                        <p className="font-medium text-sm truncate max-w-full">{folder.name}</p>
                                    </CardContent>
                                </Card>
                            ))}
                            
                            {/* Assets/Files */}
                            {assets.map(asset => (
                                <Card 
                                    key={asset._id}
                                    className="overflow-hidden"
                                >
                                    <CardContent className="p-0 relative">
                                        <Button
                                            variant="ghost" 
                                            size="icon"
                                            className="absolute right-2 top-2 opacity-0 hover:opacity-100 transition-opacity focus:opacity-100 bg-black/50 text-white hover:bg-black/70 hover:text-white z-10 h-7 w-7"
                                            onClick={(e) => handleDeleteAsset(asset, e)}
                                        >
                                            <Trash size={16} />
                                        </Button>
                                        
                                        {/* Asset thumbnail or preview */}
                                        <div className="h-32 relative">
                                            {asset.type === 'image' ? (
                                                <img 
                                                    src={getThumbnailUrl(asset)} 
                                                    alt={asset.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="bg-muted w-full h-full flex items-center justify-center">
                                                    <File size={32} className="text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Asset metadata */}
                                        <div className="p-3">
                                            <p className="font-medium text-sm truncate">{asset.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {(asset.fileSize / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    )
}
