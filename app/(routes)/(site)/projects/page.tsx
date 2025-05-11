"use client"

import { CreateButton } from "@/components/ui/create-button"
import { SelectableGrid, SelectableGridItem } from "@/components/ui/selectable-grid"
import { useToast } from "@/components/ui/use-toast"
import { assetsAPI, type Asset } from "@/lib/api/assets"
import { foldersAPI, type Folder as FolderType } from "@/lib/api/folders"
import { useProjectQuery } from "@features/projects/use-projects"
import { File, FileImage, Folder as FolderIcon, Upload } from "lucide-react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function ProjectsPage() {
    const params = useParams()
    const router = useRouter()
    const folderSlug = params.slug as string

    const { toast } = useToast()
    const { data: session } = useSession()
    const { projects, isLoading: isLoadingProjects, deleteProject } = useProjectQuery()
    const [isCreatingFolder, setIsCreatingFolder] = useState(false)
    const [folderName, setFolderName] = useState("")
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null)
    const [folders, setFolders] = useState<FolderType[]>([])
    const [assets, setAssets] = useState<Asset[]>([])
    const [breadcrumbs, setBreadcrumbs] = useState<FolderType[]>([])
    const [selectedFolders, setSelectedFolders] = useState<string[]>([])
    const [selectedAssets, setSelectedAssets] = useState<string[]>([])
    const [selectedProjects, setSelectedProjects] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    
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

    const handleOpenProject = (projectId: string) => {
        router.push(`/editor?id=${projectId}`);
    }

    const handleDeleteProject = async (projectId: string) => {
        if (!confirm("Are you sure you want to delete this project?")) {
            return;
        }

        try {
            deleteProject(projectId);
        } catch (error) {
            console.error("Failed to delete project:", error);
            toast({
                title: "Error",
                description: "Failed to delete project. Please try again.",
                variant: "destructive"
            });
        }
    }

    const handleDeleteProjects = async (projectIds: string[]) => {
        if (!confirm(`Are you sure you want to delete ${projectIds.length} projects?`)) {
            return;
        }

        try {
            for (const id of projectIds) {
                deleteProject(id);
            }

            toast({
                title: "Success",
                description: `Deleted ${projectIds.length} projects successfully!`,
            });
        } catch (error) {
            console.error("Failed to delete projects:", error);
            toast({
                title: "Error",
                description: "Failed to delete projects. Please try again.",
                variant: "destructive"
            });
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

    // Function to get default thumbnail for projects that don't have one
    const getDefaultThumbnail = (index: number) => {
        const thumbnails = [
            "/abstract-geometric-shapes.png",
            "/placeholder.jpg",
            "/placeholder-logo.svg",
            "/abstract-logo.png",
            "/placeholder.svg"
        ];
        return thumbnails[index % thumbnails.length];
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <div></div>

                    {selectedFolders.length > 0 || selectedAssets.length > 0 || selectedProjects.length > 0 ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {selectedFolders.length + selectedAssets.length + selectedProjects.length} item{selectedFolders.length + selectedAssets.length + selectedProjects.length > 1 ? 's' : ''} selected
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
                    {/* Designs/Projects Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold">Designs</h2>
                            </div>
                        </div>
                        {isLoadingProjects ? (
                            <div className="flex justify-center items-center h-40">
                                <p className="text-gray-500">Loading your designs...</p>
                            </div>
                        ) : projects.length > 0 ? (
                            <SelectableGrid
                                onDelete={(selectedItems) => handleDeleteProjects(selectedItems.map((item: any) => item._id))}
                            >
                                {projects.map((project, index) => (
                                    <SelectableGridItem
                                        key={project._id}
                                        item={project}
                                        onClick={(item) => handleOpenProject(item._id)}
                                    >
                                        <div className="flex flex-col space-y-2">
                                            <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-background">
                                                {project.thumbnail ? (
                                                    <Image
                                                        src={project.thumbnail}
                                                        alt={project.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <Image
                                                        src={getDefaultThumbnail(index)}
                                                        alt={project.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-medium line-clamp-1">{project.title}</h3>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(project.updatedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </SelectableGridItem>
                                ))}
                            </SelectableGrid>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg border-gray-300 bg-gray-50">
                                <FileImage className="h-10 w-10 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">No designs yet</p>
                                <p className="text-xs text-gray-400">Your designs will appear here</p>
                            </div>
                        )}
                    </div>

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