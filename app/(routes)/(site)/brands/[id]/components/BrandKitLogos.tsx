import { Logo } from "@/lib/types/brands"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"

interface BrandKitLogosProps {
  logos: Logo[]
}

export default function BrandKitLogos({ logos = [] }: BrandKitLogosProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="logos"
      className="w-full bg-white border rounded-lg overflow-hidden"
    >
      <AccordionItem value="logos" className="border-none">
        <div className="flex items-center justify-between px-6 py-4">
          <AccordionTrigger className="[&>svg]:hidden hover:no-underline">
            <h2 className="text-xl font-semibold">Logos</h2>
          </AccordionTrigger>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add new
          </Button>
        </div>
        
        <AccordionContent className="pb-6 px-0">
          <div className="px-6">
            {logos && logos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {logos.map((logo, index) => (
                  <div key={`${logo.name}-${index}`} className="border rounded-md overflow-hidden">
                    <div className="h-40 bg-gray-50 flex items-center justify-center p-4">
                      {logo.url ? (
                        <img 
                          src={logo.url} 
                          alt={logo.name} 
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-3 text-sm">
                      <p className="font-medium">{logo.name || `Logo ${index + 1}`}</p>
                      <p className="text-xs text-gray-500">{logo.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed rounded-lg p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-1">Add a logo or just drag and drop one</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  Upload your brand logos in various formats and styles
                </p>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}