"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Palette, RefreshCw, AlertCircle } from "lucide-react"
import { Brand } from "@/lib/types/brands"
import { BrandDocumentUpload } from "./BrandDocumentUpload"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useBrands } from "@/features/brands/use-brands"

export function BrandList() {
  // State management
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const router = useRouter()
  
  // Use the brands hook
  const { brands, isLoading, error, refetchBrands } = useBrands()

  // Handle successful brand creation
  const handleBrandCreated = (newBrand: Brand) => {
    // No need to manually update the brands array
    // The useBrands hook will handle invalidation and refetching
    setIsSheetOpen(false)
    refetchBrands()
  }

  // Navigate to brand details page
  const handleViewDetails = (brandId: string) => {
    router.push(`/brands/${brandId}`)
  }

  // Render color palette circles
  const renderColorPalette = (palette: Brand['colorPalettes'][0]) => {
    const colorCircles = [
      palette.primary,
      ...palette.secondary.slice(0, 2),
      ...palette.accent.slice(0, 1)
    ].slice(0, 4)

    return (
      <div className="flex items-center space-x-1">
        {colorCircles.map((color, index) => (
          <div
            key={`${color}-${index}`}
            className="w-4 h-4 rounded-full border border-gray-200"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Brand Assets</h1>
          <p className="text-gray-500 text-sm">Manage your brand identities</p>
        </div>
        <Button onClick={() => setIsSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Brand
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : brands?.length === 0 ? (
        <div className="py-20 text-center">
          <Palette className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-1">No Brands Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create your first brand by uploading documents or manually adding brand elements.
          </p>
          <Button onClick={() => setIsSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Brand
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands?.map(brand => (
            <Card key={brand._id} className="overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{brand.name}</CardTitle>
                {brand.industry && (
                  <CardDescription className="text-xs uppercase tracking-wide">
                    {brand.industry}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="text-sm">
                {brand.description && <p className="mb-3 text-gray-600">{brand.description}</p>}
                <div className="space-y-3">
                  {brand.colorPalettes && brand.colorPalettes.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">Colors:</span>
                      {renderColorPalette(brand.colorPalettes[0])}
                    </div>
                  )}
                  {brand.typography && brand.typography.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">Typography:</span>
                      <span className="text-xs font-mono">{brand.typography[0].headingFont}/{brand.typography[0].bodyFont}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-gray-50">
                <div className="w-full flex justify-between items-center">
                  <span className="text-xs text-gray-500">Created {new Date(brand.createdAt).toLocaleDateString()}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewDetails(brand._id)}
                  >
                    View Details
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Sheet for creating a new brand */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg md:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Create New Brand</SheetTitle>
            <SheetDescription>
              Upload documents to automatically generate a brand, or create one manually.
            </SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="upload" className="flex-1">Document Upload</TabsTrigger>
              <TabsTrigger value="manual" className="flex-1">Manual Creation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="mt-0">
              <BrandDocumentUpload
                onSuccess={handleBrandCreated}
                onCancel={() => setIsSheetOpen(false)}
              />
            </TabsContent>
            
            <TabsContent value="manual" className="mt-0">
              <div className="py-10 text-center">
                <p className="text-gray-500">
                  Manual brand creation feature coming soon. Please use document upload for now.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  )
}