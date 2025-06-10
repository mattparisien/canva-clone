"use client"

import { Alert, AlertDescription, AlertTitle } from "@components/atoms/alert"
import { Button } from "@components/atoms/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/atoms/card"
import { Input } from "@components/atoms/input"
import { Label } from "@components/atoms/label"
import { Progress } from "@components/atoms/progress"
import { useToast } from "@components/atoms/use-toast"
import { Brand } from "@lib/types/brands"
import { AlertCircle, FileText, Loader2, UploadCloud } from "lucide-react"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { useBrands } from "@features/brands/use-brands"

interface BrandDocumentUploadProps {
    onSuccess?: (brand: Brand) => void
    onCancel?: () => void
}

export function BrandDocumentUpload({ onSuccess, onCancel }: BrandDocumentUploadProps) {
    // State management
    const [files, setFiles] = useState<File[]>([])
    const [brandName, setBrandName] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()
    
    // Use the brands hook
    const { uploadDocumentsAndGenerateBrand } = useBrands()

    // Handle file drop
    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Only accept PDF, DOCX, CSV, images, and text files
        const validFiles = acceptedFiles.filter(file =>
            file.type.match(/^(application\/(pdf|vnd.openxmlformats-officedocument.wordprocessingml.document)|image\/(jpeg|png|jpg|gif)|text\/(plain|csv)|application\/csv)$/i)
        )

        if (validFiles.length !== acceptedFiles.length) {
            toast({
                title: "Invalid file type",
                description: "Only PDF, DOCX, CSV, images, and text files are supported.",
                variant: "destructive",
            })
        }

        setFiles(prevFiles => [...prevFiles, ...validFiles])
    }, [toast])

    // Dropzone setup
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/csv': ['.csv'],
            'application/csv': ['.csv'],
            'image/*': ['.jpeg', '.png', '.jpg', '.gif'],
            'text/plain': ['.txt']
        }
    })

    // Remove a file from the list
    const removeFile = (fileIndex: number) => {
        setFiles(files => files.filter((_, index) => index !== fileIndex))
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!brandName.trim()) {
            setError("Brand name is required")
            return
        }

        if (files.length === 0) {
            setError("Please upload at least one file")
            return
        }

        setIsUploading(true)
        setProgress(10)
        setError(null)

        try {
            // Show progress updates to improve user experience
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    const increment = Math.random() * 15
                    const newProgress = Math.min(prev + increment, 90)
                    return newProgress
                })
            }, 1000)

            // Use the hook to upload and generate brand
            const brand = await uploadDocumentsAndGenerateBrand(files, brandName)

            clearInterval(progressInterval)
            setProgress(100)

            toast({
                title: "Brand created successfully!",
                description: `AI has analyzed your documents and created the brand "${brandName}".`,
            })

            if (onSuccess) {
                onSuccess(brand)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create brand")
            toast({
                title: "Failed to create brand",
                description: err instanceof Error ? err.message : "An unexpected error occurred",
                variant: "destructive",
            })
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Create Brand from Documents</CardTitle>
                        <CardDescription>
                            Upload documents related to your brand. Our AI will analyze them and generate a brand identity including colors, typography, and voice.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="brandName">Brand Name</Label>
                            <Input
                                id="brandName"
                                value={brandName}
                                onChange={e => setBrandName(e.target.value)}
                                placeholder="Enter brand name"
                                disabled={isUploading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Upload Documents</Label>
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${isDragActive
                                        ? "border-primary bg-primary/10"
                                        : "border-gray-300 hover:border-primary hover:bg-gray-50"
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <UploadCloud className="h-10 w-10 text-gray-400" />
                                    <p className="text-sm font-medium">
                                        {isDragActive
                                            ? "Drop the files here..."
                                            : "Drag & drop files, or click to select"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Supports PDF, DOCX, CSV, images, and text files
                                    </p>
                                </div>
                            </div>
                        </div>

                        {files.length > 0 && (
                            <div className="space-y-2">
                                <Label>Selected Files ({files.length})</Label>
                                <div className="border rounded-md divide-y">
                                    {files.map((file, index) => (
                                        <div key={`${file.name}-${index}`} className="flex justify-between items-center p-3">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="h-5 w-5 text-blue-500" />
                                                <div>
                                                    <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {(file.size / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                                disabled={isUploading}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {isUploading && (
                            <div className="space-y-2">
                                <Label>Uploading and generating brand...</Label>
                                <Progress value={progress} className="h-2" />
                                <p className="text-xs text-gray-500 text-center">
                                    {progress < 40
                                        ? "Uploading documents..."
                                        : progress < 80
                                            ? "AI analyzing content and creating brand identity..."
                                            : "Finalizing brand creation..."}
                                </p>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isUploading || files.length === 0 || !brandName.trim()}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>Create Brand</>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}