"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBrands } from "@/features/brands/use-brands"
import { Brand } from "@/lib/types/brands"
import { Loader2, MoreHorizontal, Share } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import BrandKitColors from "./components/BrandKitColors"
import BrandKitLogos from "./components/BrandKitLogos"
import BrandKitTypography from "./components/BrandKitTypography"

export default function BrandDetailsPage() {
    const { id } = useParams() as { id: string }
    const { getBrandById } = useBrands()
    const [brand, setBrand] = useState<Brand | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchBrand() {
            try {
                setLoading(true)
                const data = await getBrandById(id)
                setBrand(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load brand details")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchBrand()
        }
    }, [id, getBrandById])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (error || !brand) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] space-y-4">
                <h2 className="text-2xl font-bold">Error Loading Brand</h2>
                <p className="text-gray-500">{error || "Brand not found"}</p>
                <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="flex justify-between items-center pb-6 border-b">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{brand.name}</h1>
                    {brand.industry && (
                        <p className="text-gray-500 text-sm mt-1">{brand.industry}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Share className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                    <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="brand-kit" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="brand-kit">Brand Kit</TabsTrigger>
                    <TabsTrigger value="assets">Assets</TabsTrigger>
                    <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
                </TabsList>

                <TabsContent value="brand-kit" className="space-y-8">
                    {/* Logos Section */}
                    <BrandKitLogos logos={brand.logos} />

                    {/* Colors Section */}
                    <BrandKitColors colorPalettes={brand.colorPalettes} />

                    {/* Typography Section */}
                    <BrandKitTypography typography={brand.typography} />
                </TabsContent>

                <TabsContent value="assets" className="space-y-6">
                    <h2 className="text-2xl font-bold">Assets</h2>
                    <p className="text-muted-foreground">Coming soon</p>
                </TabsContent>

                <TabsContent value="guidelines" className="space-y-6">
                    <h2 className="text-2xl font-bold">Guidelines</h2>
                    {brand.guidelines ? (
                        <div className="prose max-w-none">
                            <p>{brand.guidelines}</p>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No guidelines provided.</p>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}