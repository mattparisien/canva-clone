"use client"

import { Alert, AlertDescription } from "@components/ui/alert"
import { Button } from "@components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { CollapsibleSection } from "@components/ui/collapsible-section"
import { EnhancedColorPicker } from "@components/ui/enhanced-color-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover"
import { Skeleton } from "@components/ui/skeleton"
import { useToast } from "@components/ui/use-toast"
import { brandsAPI } from "@lib/api"
import { Brand } from "@lib/types/brands"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertCircle, ArrowLeft, Check, Palette } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState, useCallback, useRef } from "react"
import React from "react"
import type { FC } from "react"

export default function BrandDetailPage() {
    const params = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const brandId = params?.id as string
    const [selectedColor, setSelectedColor] = useState<{
        value: string;
        paletteIndex: number;
        colorIndex: number;
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
        onMutate: async (updatedData) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['brand', brandId] })
            
            // Save the current brand data in case we need to roll back
            const previousBrand = queryClient.getQueryData(['brand', brandId])
            
            // Perform an optimistic update to the UI
            if (updatedData.colorPalettes && previousBrand) {
                queryClient.setQueryData(['brand', brandId], (old: any) => {
                    return {
                        ...old,
                        ...updatedData
                    }
                })
            }
            
            return { previousBrand }
        },
        onSuccess: () => {
            // Only invalidate and refetch if needed
            // Since we're already updating the UI optimistically, this is a backup
            queryClient.invalidateQueries({ queryKey: ['brand', brandId] })
        },
        onError: (error, _, context) => {
            // Roll back to the previous state if mutation fails
            if (context?.previousBrand) {
                queryClient.setQueryData(['brand', brandId], context.previousBrand)
            }
            
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

            const { paletteIndex, colorIndex } = selectedColor

            // Create a deep copy of the brand's color palettes
            const updatedColorPalettes = JSON.parse(JSON.stringify(brand.colorPalettes || []))

            // Update the specific color in the array
            if (updatedColorPalettes[paletteIndex] && updatedColorPalettes[paletteIndex].colors) {
                updatedColorPalettes[paletteIndex].colors[colorIndex] = color
            }

            // Update brand with new colors
            updateBrandMutation.mutate({ colorPalettes: updatedColorPalettes })
        }, 200) // Reduced to 200ms for a more responsive feel while still debouncing
    }, [selectedColor, brand, updateBrandMutation])

    // Handle color change (update temp state and visual UI immediately, debounce server save)
    const handleColorChange = (color: string) => {
        // Validate color format
        if (!color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
            // If not a valid hex color, do nothing
            return;
        }
        
        // Immediately update the color in the UI for visual feedback
        setTempColor(color)
        
        // Update the visual representation of the swatch immediately
        if (selectedColor && brand) {
            const { paletteIndex, colorIndex } = selectedColor
            
            // Create a temporary copy of the brand for UI display only
            const updatedBrand = {
                ...brand,
                colorPalettes: brand.colorPalettes.map((palette, i) => {
                    if (i === paletteIndex) {
                        return {
                            ...palette,
                            colors: palette.colors.map((c, j) => j === colorIndex ? color : c)
                        }
                    }
                    return palette
                })
            }
            
            // Update the UI immediately without triggering a re-fetch
            // This ensures all components using this query data will be updated
            queryClient.setQueryData(['brand', brandId], updatedBrand)
        }
        
        // Debounce the actual API call to save the change
        debouncedSave(color)
    }

    // Actually save the color to the database
    const handleColorSave = (color: string) => {
        if (!selectedColor || !brand) return

        const { paletteIndex, colorIndex } = selectedColor

        // Create a deep copy of the brand's color palettes
        const updatedColorPalettes = JSON.parse(JSON.stringify(brand.colorPalettes || []))

        // Update the specific color in the array
        if (updatedColorPalettes[paletteIndex] && updatedColorPalettes[paletteIndex].colors) {
            updatedColorPalettes[paletteIndex].colors[colorIndex] = color
        }

        // Update brand with new colors
        updateBrandMutation.mutate({ colorPalettes: updatedColorPalettes })
    }

    // Handle color selection complete (when user clicks the check button)
    const handleColorComplete = () => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
            saveTimeoutRef.current = null
        }
        
        if (tempColor) {
            // Immediately save the color to the database without debouncing
            handleColorSave(tempColor)
            
            // Provide some visual feedback that the color has been applied
            toast({
                title: "Color applied",
                description: "Color has been updated successfully",
                duration: 2000 // Short duration for a better user experience
            })
        }
        
        // Close the popover
        setOpenPopoverId(null)
        setTempColor("")
    }

    // Generate unique ID for each color picker
    const getColorPickerId = (paletteIndex: number, colorIndex: number) => {
        return `color-${paletteIndex}-${colorIndex}`
    }

    // Handle popover open change
    const handlePopoverOpenChange = (popoverId: string, isOpen: boolean, colorData: {
        value: string;
        paletteIndex: number;
        colorIndex: number;
    }) => {
        if (isOpen) {
            setOpenPopoverId(popoverId)
            setSelectedColor(colorData)
            setTempColor(colorData.value)
        } else {
            // When closing, automatically apply any color changes
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
                saveTimeoutRef.current = null
            }
            
            // If there's a pending color change, apply it
            if (tempColor && tempColor !== colorData.value) {
                handleColorSave(tempColor)
            }
            
            // Reset state
            setOpenPopoverId(null)
            setSelectedColor(null)
            setTempColor("")
        }
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

                    <div className="space-y-6">
                        {/* Overview Section */}
                        <CollapsibleSection title="Overview" defaultOpen={true}>
                            <div className="space-y-8">
                                {brand.tagline && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Tagline</h3>
                                        <p className="text-2xl italic text-gray-700 leading-relaxed">{brand.tagline}</p>
                                    </div>
                                )}

                                {brand.description && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                                        <p className="text-gray-700 leading-relaxed">{brand.description}</p>
                                    </div>
                                )}

                                {brand.colorPalettes && brand.colorPalettes.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Palettes</h3>
                                        <div className="space-y-6">
                                            {brand.colorPalettes.map((palette, index) => (
                                                <div key={index}>
                                                    <h4 className="text-sm font-medium text-gray-600 mb-3">{palette.name}</h4>
                                                    <div className="flex flex-wrap gap-3">
                                                        {palette.colors.map((color, colorIndex) => (
                                                            <div key={colorIndex} className="flex flex-col items-center gap-2">
                                                                <div
                                                                    className="w-12 h-12 rounded-lg border border-gray-200 shadow-sm"
                                                                    style={{ backgroundColor: color }}
                                                                    title={color}
                                                                />
                                                                <span className="text-xs font-mono text-gray-500">{color}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {brand.typography && brand.typography.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
                                        <div className="space-y-6">
                                            {brand.typography.map((typo, index) => (
                                                <div key={index} className="space-y-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600 mb-2">Heading</p>
                                                        <p className="text-2xl font-medium" style={{ fontFamily: typo.headingFont }}>{typo.headingFont}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600 mb-2">Body</p>
                                                        <p className="text-base" style={{ fontFamily: typo.bodyFont }}>{typo.bodyFont}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CollapsibleSection>

                        {/* Colors Section */}
                        <CollapsibleSection title="Colors" defaultOpen={false}>
                            <div className="space-y-6">
                                {brand.colorPalettes && brand.colorPalettes.length > 0 ? (
                                    brand.colorPalettes.map((palette, paletteIndex) => (
                                        <div key={paletteIndex}>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{palette.name}</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                                {palette.colors.map((color, colorIndex) => {
                                                    const popoverId = getColorPickerId(paletteIndex, colorIndex)
                                                    const colorData = {
                                                        value: color,
                                                        paletteIndex: paletteIndex,
                                                        colorIndex: colorIndex
                                                    }

                                                    return (
                                                        <Popover
                                                            key={colorIndex}
                                                            open={openPopoverId === popoverId}
                                                            onOpenChange={(isOpen) => handlePopoverOpenChange(popoverId, isOpen, colorData)}
                                                        >
                                                            <PopoverTrigger asChild>
                                                                <div className="group flex flex-col items-center space-y-3 cursor-pointer">
                                                                    <div
                                                                        className="w-20 h-20 rounded-xl border border-gray-200 shadow-sm cursor-pointer group-hover:ring-2 group-hover:ring-blue-200 group-hover:shadow-md transition-all duration-200"
                                                                        style={{ 
                                                                            backgroundColor: openPopoverId === popoverId ? (tempColor || color) : color 
                                                                        }}
                                                                        title={`Click to edit: ${openPopoverId === popoverId ? (tempColor || color) : color}`}
                                                                    />
                                                                    <code className="text-xs font-mono text-gray-600 group-hover:text-gray-900 transition-colors">
                                                                        {openPopoverId === popoverId ? (tempColor || color) : color}
                                                                    </code>
                                                                </div>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0 shadow-lg">
                                                                <EnhancedColorPicker
                                                                    color={tempColor || color}
                                                                    onChange={(newColor: string) => {
                                                                        if (selectedColor) {
                                                                            handleColorChange(newColor);
                                                                        }
                                                                    }}
                                                                    colorName={`Color ${selectedColor?.paletteIndex || 0}-${selectedColor?.colorIndex || 0}`}
                                                                    savedColors={[
                                                                        "#624b23", "#ecf3f5", "#dcd6cf", "#645840",
                                                                        "#f0f8ff", "#e6e6fa"
                                                                    ]}
                                                                    onSaveColor={(color) => {
                                                                        // Immediate local UI update
                                                                        handleColorChange(color);
                                                                        
                                                                        // Show a notification for the saved color
                                                                        toast({
                                                                            title: "Color saved",
                                                                            description: "Color has been added to saved colors",
                                                                            duration: 2000
                                                                        });
                                                                    }}
                                                                    className="border-none"
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <Palette className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-600 mb-2">No Color Palettes</h3>
                                        <p className="text-gray-500">This brand doesn't have any defined color palettes.</p>
                                    </div>
                                )}
                            </div>
                        </CollapsibleSection>

                        {/* Typography Section */}
                        <CollapsibleSection title="Typography" defaultOpen={false}>
                            <div className="space-y-8">
                                {brand.typography && brand.typography.length > 0 ? (
                                    brand.typography.map((typo, index) => (
                                        <div key={index} className="space-y-8">
                                            {typo.isDefault && (
                                                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                    Default Typography
                                                </div>
                                            )}

                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Heading Font</h4>
                                                    <div className="p-6 bg-gray-50 rounded-xl">
                                                        <p className="text-3xl font-semibold mb-4" style={{ fontFamily: typo.headingFont }}>
                                                            {typo.headingFont}
                                                        </p>
                                                        <p className="text-sm text-gray-500 font-mono">ABCDEFGHIJKLM</p>
                                                        <p className="text-sm text-gray-500 font-mono">abcdefghijklm</p>
                                                        <p className="text-sm text-gray-500 font-mono">0123456789</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Body Font</h4>
                                                    <div className="p-6 bg-gray-50 rounded-xl">
                                                        <p className="text-xl font-medium mb-4" style={{ fontFamily: typo.bodyFont }}>
                                                            {typo.bodyFont}
                                                        </p>
                                                        <p className="text-sm text-gray-500 font-mono">ABCDEFGHIJKLM</p>
                                                        <p className="text-sm text-gray-500 font-mono">abcdefghijklm</p>
                                                        <p className="text-sm text-gray-500 font-mono">0123456789</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {typo.fontPairings && typo.fontPairings.length > 0 && (
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Font Pairings</h4>
                                                    <div className="grid gap-4">
                                                        {typo.fontPairings.map((pair, i) => (
                                                            <div key={i} className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                                                                <div className="space-y-3">
                                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{pair.name}</p>
                                                                    <div className="space-y-2">
                                                                        <p className="text-2xl font-semibold" style={{ fontFamily: pair.heading }}>
                                                                            Heading with {pair.heading}
                                                                        </p>
                                                                        <p className="text-base leading-relaxed" style={{ fontFamily: pair.body }}>
                                                                            Body text using {pair.body} font family for optimal readability and visual hierarchy.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <Palette className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-600 mb-2">No Typography Defined</h3>
                                        <p className="text-gray-500">This brand doesn't have any defined typography.</p>
                                    </div>
                                )}
                            </div>
                        </CollapsibleSection>

                        {/* Brand Voice Section */}
                        <CollapsibleSection title="Brand Voice" defaultOpen={false}>
                            <div className="space-y-8">
                                {brand.brandVoice ? (
                                    <div className="space-y-8">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-3">Tone</h4>
                                                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                                    <p className="text-2xl font-semibold text-gray-900">{brand.brandVoice.tone}</p>
                                                </div>
                                            </div>

                                            {brand.brandVoice.description && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-3">Description</h4>
                                                    <div className="p-6 bg-gray-50 rounded-xl">
                                                        <p className="text-gray-700 leading-relaxed">{brand.brandVoice.description}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {brand.brandVoice.keywords && brand.brandVoice.keywords.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-4">Keywords</h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {brand.brandVoice.keywords.map((keyword, i) => (
                                                        <span
                                                            key={i}
                                                            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-200 hover:shadow-sm transition-shadow"
                                                        >
                                                            {keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {brand.brandVoice.sampleCopy && brand.brandVoice.sampleCopy.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-4">Sample Copy</h4>
                                                <div className="space-y-4">
                                                    {brand.brandVoice.sampleCopy.map((sample, i) => (
                                                        <div key={i} className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                    <h5 className="font-semibold text-gray-900">{sample.title}</h5>
                                                                </div>
                                                                <p className="text-gray-700 leading-relaxed pl-4 border-l-2 border-blue-200">{sample.content}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Palette className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-600 mb-2">No Brand Voice Defined</h3>
                                        <p className="text-gray-500">This brand doesn't have brand voice details defined.</p>
                                    </div>
                                )}
                            </div>
                        </CollapsibleSection>
                    </div>
                </>
            )}
        </div>
    )
}