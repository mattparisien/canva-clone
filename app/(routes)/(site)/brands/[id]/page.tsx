"use client"

import { Alert, AlertDescription } from "@components/ui/alert"
import { Button } from "@components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover"
import { Skeleton } from "@components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { useToast } from "@components/ui/use-toast"
import { brandsAPI } from "@lib/api"
import { Brand } from "@lib/types/brands"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertCircle, ArrowLeft, Check, Palette } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState, useCallback, useRef } from "react"
import React from "react"
import { HexColorPicker } from "react-colorful"
import type { FC } from "react"

export default function BrandDetailPage() {
    const params = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const brandId = params?.id as string
    const [activeTab, setActiveTab] = useState("overview")
    const [selectedColor, setSelectedColor] = useState<{
        value: string;
        type: "primary" | "secondary" | "accent";
        paletteIndex: number;
        colorIndex?: number;
    } | null>(null)
    const [tempColor, setTempColor] = useState<string>("")
    const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Use React Query to fetch the brand data
    const {
        data: brand,
        isLoading,
        error
    } = useQuery<Brand>({
        queryKey: ['brand', brandId],
        queryFn: () => brandsAPI.getById(brandId),
        enabled: !!brandId, // Only run the query if brandId exists
    })

    // Mutation for updating brand colors
    const updateBrandMutation = useMutation({
        mutationFn: (updatedBrand: Partial<Brand>) => {
            return brandsAPI.update(brandId, updatedBrand)
        },
        onSuccess: () => {
            // Invalidate and refetch brand data
            queryClient.invalidateQueries({ queryKey: ['brand', brandId] })
            toast({
                title: "Color updated",
                description: "Brand color has been updated successfully",
            })
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update color",
                variant: "destructive",
            })
        }
    })

    // Debounced save function
    const debouncedSave = useCallback((color: string) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }
        
        saveTimeoutRef.current = setTimeout(() => {
            if (!selectedColor || !brand) return

            const { type, paletteIndex, colorIndex } = selectedColor

            // Create a deep copy of the brand's color palettes
            const updatedColorPalettes = JSON.parse(JSON.stringify(brand.colorPalettes || []))

            // Update the specific color
            if (type === "primary") {
                updatedColorPalettes[paletteIndex].primary = color
            } else if (colorIndex !== undefined) {
                updatedColorPalettes[paletteIndex][type][colorIndex] = color
            }

            // Update brand with new colors
            updateBrandMutation.mutate({ colorPalettes: updatedColorPalettes })
        }, 500) // Wait 500ms after user stops changing color
    }, [selectedColor, brand, updateBrandMutation])

    // Handle color change (just update temp state, don't save)
    const handleColorChange = (color: string) => {
        setTempColor(color)
        debouncedSave(color)
    }

    // Actually save the color to the database
    const handleColorSave = (color: string) => {
        if (!selectedColor || !brand) return

        const { type, paletteIndex, colorIndex } = selectedColor

        // Create a deep copy of the brand's color palettes
        const updatedColorPalettes = JSON.parse(JSON.stringify(brand.colorPalettes || []))

        // Update the specific color
        if (type === "primary") {
            updatedColorPalettes[paletteIndex].primary = color
        } else if (colorIndex !== undefined) {
            updatedColorPalettes[paletteIndex][type][colorIndex] = color
        }

        // Update brand with new colors
        updateBrandMutation.mutate({ colorPalettes: updatedColorPalettes })
    }

    // Handle color selection complete (when user clicks the check button)
    const handleColorComplete = () => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }
        if (tempColor) {
            handleColorSave(tempColor)
        }
        // Don't clear selectedColor here, just close the popover
        setOpenPopoverId(null)
        setTempColor("")
    }

    // Generate unique ID for each color picker
    const getColorPickerId = (type: string, paletteIndex: number, colorIndex?: number) => {
        return `${type}-${paletteIndex}-${colorIndex !== undefined ? colorIndex : 'primary'}`
    }

    // Handle popover open change
    const handlePopoverOpenChange = (popoverId: string, isOpen: boolean, colorData: {
        value: string;
        type: "primary" | "secondary" | "accent";
        paletteIndex: number;
        colorIndex?: number;
    }) => {
        if (isOpen) {
            setOpenPopoverId(popoverId)
            setSelectedColor(colorData)
            setTempColor(colorData.value)
        } else {
            setOpenPopoverId(null)
            setSelectedColor(null)
            setTempColor("")
        }
    }


    // Generate color palette component
    const renderColorPalette = (colors: string[], type: "primary" | "secondary" | "accent", paletteIndex: number) => {
        return (
            <div className="flex items-center space-x-2 mt-2">
                {colors.map((color, index) => {
                    const popoverId = getColorPickerId(type, paletteIndex, type !== "primary" ? index : undefined)
                    const colorData = {
                        value: color,
                        type: type,
                        paletteIndex: paletteIndex,
                        colorIndex: type !== "primary" ? index : undefined
                    }
                    
                    return (
                        <Popover 
                            key={`${color}-${index}`}
                            open={openPopoverId === popoverId}
                            onOpenChange={(isOpen) => handlePopoverOpenChange(popoverId, isOpen, colorData)}
                        >
                            <PopoverTrigger asChild>
                                <div
                                    className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-primary transition-all"
                                    style={{ backgroundColor: color }}
                                    title={`Click to change color: ${color}`}
                                />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-3">
                                <div className="space-y-4">
                                    <p className="text-sm font-medium">Choose a color</p>
                                    {React.createElement(HexColorPicker as any, {
                                        color: tempColor || color,
                                        onChange: (newColor: string) => {
                                            if (selectedColor) {
                                                handleColorChange(newColor);
                                            }
                                        }
                                    })}
                                    <div className="flex items-center justify-between">
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{tempColor || color}</code>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="ml-2"
                                            disabled={updateBrandMutation.isPending}
                                            onClick={() => handleColorComplete()}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/brands')}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Brands
                </Button>
            </div>

            {isLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-1/3" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-64 w-full" />
                </div>
            )}

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertDescription>
                        {error instanceof Error ? error.message : "Failed to load brand details"}
                    </AlertDescription>
                </Alert>
            )}

            {brand && !isLoading && (
                <>
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{brand.name}</h1>
                        {brand.tagline && (
                            <p className="text-lg text-gray-700 italic mb-3">{brand.tagline}</p>
                        )}
                        {brand.industry && (
                            <p className="text-gray-500 text-sm">{brand.industry}</p>
                        )}
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="colors">Colors</TabsTrigger>
                            <TabsTrigger value="typography">Typography</TabsTrigger>
                            <TabsTrigger value="voice">Brand Voice</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4 mt-6">
                            {brand.tagline && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tagline</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-lg italic text-gray-800">{brand.tagline}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {brand.description && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>About</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p>{brand.description}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {brand.colorPalettes && brand.colorPalettes.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Color Palette</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {brand.colorPalettes.map((palette, index) => (
                                            <div key={index} className="mb-4">
                                                <h4 className="font-medium mb-2">{palette.name}</h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Primary</p>
                                                        {renderColorPalette([palette.primary], "primary", index)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Secondary</p>
                                                        {renderColorPalette(palette.secondary, "secondary", index)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Accent</p>
                                                        {renderColorPalette(palette.accent, "accent", index)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {brand.typography && brand.typography.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Typography</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {brand.typography.map((typo, index) => (
                                            <div key={index}>
                                                <p className="text-sm text-gray-500">Heading Font</p>
                                                <p className="text-xl mb-2" style={{ fontFamily: typo.headingFont }}>{typo.headingFont}</p>
                                                <p className="text-sm text-gray-500">Body Font</p>
                                                <p className="mb-2" style={{ fontFamily: typo.bodyFont }}>{typo.bodyFont}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="colors" className="space-y-4 mt-6">
                            {brand.colorPalettes && brand.colorPalettes.length > 0 ? (
                                brand.colorPalettes.map((palette, index) => (
                                    <Card key={index}>
                                        <CardHeader>
                                            <CardTitle>{palette.name}</CardTitle>
                                            {palette.isDefault && (
                                                <CardDescription>Default Palette</CardDescription>
                                            )}
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <p className="text-sm font-medium mb-2">Primary Color</p>
                                                <div className="flex items-center gap-3">
                                                    {(() => {
                                                        const popoverId = getColorPickerId("primary", index)
                                                        const colorData = {
                                                            value: palette.primary,
                                                            type: "primary" as const,
                                                            paletteIndex: index
                                                        }
                                                        
                                                        return (
                                                            <Popover 
                                                                open={openPopoverId === popoverId}
                                                                onOpenChange={(isOpen) => handlePopoverOpenChange(popoverId, isOpen, colorData)}
                                                            >
                                                                <PopoverTrigger asChild>
                                                                    <div
                                                                        className="w-12 h-12 rounded-md border cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-primary transition-all"
                                                                        style={{ backgroundColor: palette.primary }}
                                                                        title={`Click to change color: ${palette.primary}`}
                                                                    />
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-3">
                                                                    <div className="space-y-4">
                                                                        <p className="text-sm font-medium">Choose a color</p>
                                                                        {React.createElement(HexColorPicker as any, {
                                                                            color: tempColor || palette.primary,
                                                                            onChange: (newColor: string) => {
                                                                                if (selectedColor) {
                                                                                    handleColorChange(newColor);
                                                                                }
                                                                            }
                                                                        })}
                                                                        <div className="flex items-center justify-between">
                                                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{tempColor || palette.primary}</code>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="ml-2"
                                                                                disabled={updateBrandMutation.isPending}
                                                                                onClick={() => handleColorComplete()}
                                                                            >
                                                                                <Check className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                        )
                                                    })()}
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium mb-2">Secondary Colors</p>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    {palette.secondary.map((color, i) => {
                                                        const popoverId = getColorPickerId("secondary", index, i)
                                                        const colorData = {
                                                            value: color,
                                                            type: "secondary" as const,
                                                            paletteIndex: index,
                                                            colorIndex: i
                                                        }
                                                        
                                                        return (
                                                            <Popover 
                                                                key={i}
                                                                open={openPopoverId === popoverId}
                                                                onOpenChange={(isOpen) => handlePopoverOpenChange(popoverId, isOpen, colorData)}
                                                            >
                                                                <PopoverTrigger asChild>
                                                                    <div
                                                                        className="w-12 h-12 rounded-md border cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-primary transition-all"
                                                                        style={{ backgroundColor: color }}
                                                                        title={`Click to change color: ${color}`}
                                                                    />
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-3">
                                                                    <div className="space-y-4">
                                                                        <p className="text-sm font-medium">Choose a color</p>
                                                                        {React.createElement(HexColorPicker as any, {
                                                                            color: tempColor || color,
                                                                            onChange: (newColor: string) => {
                                                                                if (selectedColor) {
                                                                                    handleColorChange(newColor);
                                                                                }
                                                                            }
                                                                        })}
                                                                        <div className="flex items-center justify-between">
                                                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{tempColor || color}</code>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="ml-2"
                                                                                disabled={updateBrandMutation.isPending}
                                                                                onClick={() => handleColorComplete()}
                                                                            >
                                                                                <Check className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium mb-2">Accent Colors</p>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    {palette.accent.map((color, i) => {
                                                        const popoverId = getColorPickerId("accent", index, i)
                                                        const colorData = {
                                                            value: color,
                                                            type: "accent" as const,
                                                            paletteIndex: index,
                                                            colorIndex: i
                                                        }
                                                        
                                                        return (
                                                            <Popover 
                                                                key={i}
                                                                open={openPopoverId === popoverId}
                                                                onOpenChange={(isOpen) => handlePopoverOpenChange(popoverId, isOpen, colorData)}
                                                            >
                                                                <PopoverTrigger asChild>
                                                                    <div
                                                                        className="w-12 h-12 rounded-md border cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-primary transition-all"
                                                                        style={{ backgroundColor: color }}
                                                                        title={`Click to change color: ${color}`}
                                                                    />
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-3">
                                                                    <div className="space-y-4">
                                                                        <p className="text-sm font-medium">Choose a color</p>
                                                                        {React.createElement(HexColorPicker as any, {
                                                                            color: tempColor || color,
                                                                            onChange: (newColor: string) => {
                                                                                if (selectedColor) {
                                                                                    handleColorChange(newColor);
                                                                                }
                                                                            }
                                                                        })}
                                                                        <div className="flex items-center justify-between">
                                                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{tempColor || color}</code>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="ml-2"
                                                                                disabled={updateBrandMutation.isPending}
                                                                                onClick={() => handleColorComplete()}
                                                                            >
                                                                                <Check className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card>
                                    <CardContent className="py-10 text-center">
                                        <Palette className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-medium text-gray-600 mb-1">No Color Palettes</h3>
                                        <p className="text-gray-500">This brand doesn't have any defined color palettes.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="typography" className="space-y-4 mt-6">
                            {brand.typography && brand.typography.length > 0 ? (
                                brand.typography.map((typo, index) => (
                                    <Card key={index}>
                                        <CardHeader>
                                            <CardTitle>Typography Set {index + 1}</CardTitle>
                                            {typo.isDefault && (
                                                <CardDescription>Default Typography</CardDescription>
                                            )}
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div>
                                                <p className="text-sm font-medium mb-2">Heading Font</p>
                                                <div className="space-y-2">
                                                    <p className="text-3xl" style={{ fontFamily: typo.headingFont }}>
                                                        {typo.headingFont}
                                                    </p>
                                                    <p className="text-xs text-gray-500">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium mb-2">Body Font</p>
                                                <div className="space-y-2">
                                                    <p className="text-lg" style={{ fontFamily: typo.bodyFont }}>
                                                        {typo.bodyFont}
                                                    </p>
                                                    <p className="text-xs text-gray-500">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789</p>
                                                </div>
                                            </div>

                                            {typo.fontPairings && typo.fontPairings.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-medium mb-2">Font Pairings</p>
                                                    {typo.fontPairings.map((pair, i) => (
                                                        <div key={i} className="p-3 border rounded-md mb-2">
                                                            <p className="text-sm text-gray-500">{pair.name}</p>
                                                            <p className="text-xl mb-1" style={{ fontFamily: pair.heading }}>
                                                                {pair.heading}
                                                            </p>
                                                            <p style={{ fontFamily: pair.body }}>
                                                                {pair.body}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card>
                                    <CardContent className="py-10 text-center">
                                        <Palette className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-medium text-gray-600 mb-1">No Typography Defined</h3>
                                        <p className="text-gray-500">This brand doesn't have any defined typography.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="voice" className="space-y-4 mt-6">
                            {brand.brandVoice ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Brand Voice</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <p className="text-sm font-medium mb-2">Tone</p>
                                            <p className="text-lg font-medium">{brand.brandVoice.tone}</p>
                                        </div>

                                        {brand.brandVoice.description && (
                                            <div>
                                                <p className="text-sm font-medium mb-2">Description</p>
                                                <p>{brand.brandVoice.description}</p>
                                            </div>
                                        )}

                                        {brand.brandVoice.keywords && brand.brandVoice.keywords.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium mb-2">Keywords</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {brand.brandVoice.keywords.map((keyword, i) => (
                                                        <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                                                            {keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {brand.brandVoice.sampleCopy && brand.brandVoice.sampleCopy.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium mb-2">Sample Copy</p>
                                                <div className="space-y-4">
                                                    {brand.brandVoice.sampleCopy.map((sample, i) => (
                                                        <div key={i} className="p-3 border rounded-md">
                                                            <p className="font-medium mb-1">{sample.title}</p>
                                                            <p className="text-gray-700">{sample.content}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="py-10 text-center">
                                        <Palette className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-medium text-gray-600 mb-1">No Brand Voice Defined</h3>
                                        <p className="text-gray-500">This brand doesn't have brand voice details defined.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    )
}