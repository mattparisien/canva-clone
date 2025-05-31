"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Palette, AlertCircle } from "lucide-react"
import { Brand } from "@/lib/types/brands"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useBrands } from "@/features/brands/use-brands"
import { LazyGrid } from "@/components/composite/LazyGrid"
import InteractiveCard from "@/components/composite/InteractiveCard/InteractiveCard"
import { SelectionProvider } from "@/lib/context/selection-context"
import { SelectionActions } from "@/components/composite/SelectionActions"
import { useToast } from "@components/ui/use-toast"

export function BrandList() {
  const router = useRouter()
  const { toast } = useToast()

  // Use the brands hook
  const { brands, isLoading, error, deleteBrand } = useBrands()


  // Handle brand selection
  const handleSelectBrand = (id: string, isSelected: boolean) => {
    console.log(`Brand ${id} is ${isSelected ? "selected" : "unselected"}`)
  }

  // Handle opening a brand
  const handleOpenBrand = (brandId: string) => {
    router.push(`/brands/${brandId}`)
  }

  // Handle brand title update
  const handleTitleChange = async (id: string, newTitle: string) => {
    try {
      // TODO: Call API to update brand name
      // await brandsAPI.update(id, { name: newTitle });

      toast({
        title: "Success",
        description: "Brand name updated successfully",
      })
    } catch (error) {
      console.error("Failed to update brand name:", error)
      toast({
        title: "Error",
        description: "Failed to update brand name. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle bulk actions
  const handleDeleteSelected = async () => {
    console.log("Delete selected brands")
    return Promise.resolve()
  }

  const handleDuplicateSelected = async () => {
    console.log("Duplicate selected brands")
    return Promise.resolve()
  }

  const handleMoveSelected = async () => {
    console.log("Move selected brands")
    return Promise.resolve()
  }

  // Navigate to create brand page
  const handleCreateBrand = () => {
    router.push('/brands/new')
  }

  // Format date helper
  const formatCreatedAt = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date)
  }

  

  // Render individual brand with InteractiveCard
  const renderBrandCard = (brand: Brand) => (
    <InteractiveCard
      key={brand._id}
      id={brand._id}
      image={{
        src: "/placeholder.jpg", // TODO: Use actual brand image/logo
        alt: brand.name,
      }}
      title={brand.name}
      subtitleLeft={brand.industry || "Brand"}
      subtitleRight={formatCreatedAt(brand.createdAt)}
      onClick={() => handleOpenBrand(brand._id)}
      onSelect={handleSelectBrand}
      onTitleChange={handleTitleChange}
    >
      <div className="absolute bottom-0 left-0 w-full h-2 bg-red-100">
        {brand.colorPalettes[0].primary}
        
      </div>
    </InteractiveCard>
  )

  return (
    <SelectionProvider>
      <div className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : brands?.length === 0 && !isLoading ? (
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
              <Button onClick={handleCreateBrand}>
                <Plus className="mr-2 h-4 w-4" />
                Create Brand
              </Button>
            </div>

            <LazyGrid
              items={brands || []}
              renderItem={(brand) => renderBrandCard(brand)}
              loadMore={() => { }} // No pagination for brands yet
              hasMore={false} // No pagination for brands yet
              isLoading={isLoading}
              className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            />

            <SelectionActions
              onDelete={handleDeleteSelected}
              onDuplicate={handleDuplicateSelected}
              onMove={handleMoveSelected}
            />
          </>
        )}
      </div>
    </SelectionProvider>
  )
}