"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Palette, AlertCircle, Trash2 } from "lucide-react"
import { Brand } from "@/lib/types/brands"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useBrands } from "@/features/brands/use-brands"

export function BrandList() {
  const router = useRouter()

  // Use the brands hook
  const { brands, isLoading, error, deleteBrand } = useBrands()

  // Handle brand deletion
  const handleDeleteBrand = async (brandId: string, brandName: string) => {
    if (window.confirm(`Are you sure you want to delete "${brandName}"? This action cannot be undone.`)) {
      try {
        deleteBrand(brandId)
      } catch (error) {
        console.error('Failed to delete brand:', error)
      }
    }
  }

  // Navigate to brand details page
  const handleViewDetails = (brandId: string) => {
    router.push(`/brands/${brandId}`)
  }

  // Navigate to create brand page
  const handleCreateBrand = () => {
    router.push('/brands/new')
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
    <div className="space-y-6">
      {isLoading ? (
        <div className="p-8">Loading brands...</div>
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
          <Button onClick={handleCreateBrand}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Brand
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Your Brand Kits</h2>
              <p className="text-gray-600">Manage and organize your brand identities</p>
            </div>
            <Button onClick={handleCreateBrand}>
              <Plus className="mr-2 h-4 w-4" />
              Create Brand
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands?.map(brand => (
              <Card key={brand._id} className="overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{brand.name}</CardTitle>
                  {brand.tagline && (
                    <p className="text-sm text-gray-600 italic mb-1">{brand.tagline}</p>
                  )}
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
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBrand(brand._id, brand.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(brand._id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}