"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/atoms/button"
import { Plus, Palette, AlertCircle } from "lucide-react"
import { Brand } from "@/lib/types/brands"
import { Alert, AlertDescription } from "@/components/atoms/alert"
import { useBrands } from "@/features/brands/use-brands"
import { LazyGrid } from "@/components/organisms/LazyGrid"
import InteractiveCard from "@/components/organisms/InteractiveCard/InteractiveCard"
import { SelectionProvider, useSelection } from "@/lib/context/selection-context"
import { SelectionActions } from "@/components/organisms/SelectionActions"
import { useToast } from "@components/atoms/use-toast"

export function BrandList() {
  return (
    <SelectionProvider>
      <BrandListContent />
    </SelectionProvider>
  )
}

function BrandListContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { selectedIds, clearSelection } = useSelection()

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
    if (selectedIds.length === 0) {
      toast({
        title: "No brands selected",
        description: "Please select brands to delete.",
        variant: "destructive"
      })
      return
    }

    try {
      // Delete each selected brand
      for (const brandId of selectedIds) {
        deleteBrand(brandId)
      }
      
      // Clear selection after initiating deletion
      clearSelection()
      
      // The success toast will be shown by the mutation's onSuccess handler
      // for each individual brand deletion
    } catch (error) {
      console.error("Failed to delete brands:", error)
      toast({
        title: "Error", 
        description: "Failed to delete brands. Please try again.",
        variant: "destructive"
      })
    }
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

  console.log("Brands:", brands)
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
      title={brand.name}
      subtitleLeft={brand.industry || "Brand"}
      subtitleRight={formatCreatedAt(brand.createdAt)}
      onClick={() => handleOpenBrand(brand._id)}
      onSelect={handleSelectBrand}
      onTitleChange={handleTitleChange}
    >
      <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col">


        {/* Brand accent bar */}
        {brand.colorPalettes && brand.colorPalettes.length > 0 && brand.colorPalettes[0].colors && brand.colorPalettes[0].colors.length > 0 && (
          <div className="h-2 absolute bottom-0 left-0 w-full flex">
            {brand.colorPalettes[0].colors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="flex-1"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>
    </InteractiveCard>
  )

  return (
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
            isInitialLoading={isLoading && (brands?.length === 0 || !brands)}
            loadingVariant="grid"
            loadingText="Loading your brands..."
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
  )
}