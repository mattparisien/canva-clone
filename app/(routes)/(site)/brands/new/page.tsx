"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import { Brand } from "@/lib/types/brands"
import { BrandDocumentUpload } from "../components/BrandDocumentUpload"

export default function CreateBrandPage() {
  const router = useRouter()

  // Handle successful brand creation
  const handleBrandCreated = (newBrand: Brand) => {
    // Navigate to the brand detail page after creation
    router.push(`/brands/${newBrand._id}`)
  }

  // Handle cancel action
  const handleCancel = () => {
    router.push('/brands')
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

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Brand</h1>
          <p className="text-gray-600">
            Upload documents to automatically generate a brand, or create one manually.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="upload" className="flex-1">Document Upload</TabsTrigger>
                <TabsTrigger value="manual" className="flex-1">Manual Creation</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-0">
                <BrandDocumentUpload
                  onSuccess={handleBrandCreated}
                  onCancel={handleCancel}
                />
              </TabsContent>

              <TabsContent value="manual" className="mt-0">
                <div className="py-20 text-center">
                  <p className="text-gray-500 text-lg">
                    Manual brand creation feature coming soon.
                  </p>
                  <p className="text-gray-400 mt-2">
                    Please use document upload for now to create your brand.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
