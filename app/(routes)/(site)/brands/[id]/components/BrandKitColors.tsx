import { ColorPalette } from "@/lib/types/brands"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface BrandKitColorsProps {
  colorPalettes: ColorPalette[]
}

export default function BrandKitColors({ colorPalettes = [] }: BrandKitColorsProps) {
  // Helper function to render color swatches
  const renderColorSwatch = (color: string, colorName?: string) => {
    return (
      <div className="flex flex-col items-center">
        <div 
          className="w-16 h-16 rounded-full border mb-2"
          style={{ backgroundColor: color }}
        />
        {color && <div className="text-xs font-mono">{color}</div>}
        {colorName && <div className="text-xs text-gray-500">{colorName}</div>}
      </div>
    )
  }

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="colors"
      className="w-full bg-white border rounded-lg overflow-hidden"
    >
      <AccordionItem value="colors" className="border-none">
        <div className="flex items-center justify-between px-6 py-4">
          <AccordionTrigger className="[&>svg]:hidden hover:no-underline">
            <h2 className="text-xl font-semibold">Colors {colorPalettes.length > 0 && `(${colorPalettes.reduce((acc, palette) => acc + palette.colors.length, 0)})`}</h2>
          </AccordionTrigger>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add new
          </Button>
        </div>
        
        <AccordionContent className="pb-6">
          <div className="space-y-8">
            {colorPalettes.map((palette, index) => (
              <div key={`palette-${index}`} className="px-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium">
                    {palette.name || `Color palette ${index + 1}`}
                  </h3>
                  <Button variant="ghost" size="sm" className="text-xs h-8">Edit</Button>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {/* Render all colors in the palette */}
                    {palette.colors.map((color, colorIndex) => (
                      <div key={`color-${colorIndex}`}>
                        {renderColorSwatch(color)}
                      </div>
                    ))}

                    {/* Add new color button */}
                    <div className="flex items-center justify-center">
                      <Button variant="ghost" size="sm" className="rounded-full border-dashed border-2 border-gray-200 w-16 h-16 flex items-center justify-center">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {colorPalettes.length === 0 && (
              <div className="px-6">
                <div className="border border-dashed rounded-md p-6 text-center">
                  <p className="text-gray-500">No color palettes defined yet.</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Color Palette
                  </Button>
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}