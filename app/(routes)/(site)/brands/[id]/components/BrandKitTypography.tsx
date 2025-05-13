import { Typography } from "@/lib/types/brands"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface BrandKitTypographyProps {
  typography: Typography[]
}

export default function BrandKitTypography({ typography = [] }: BrandKitTypographyProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="typography"
      className="w-full bg-white border rounded-lg overflow-hidden"
    >
      <AccordionItem value="typography" className="border-none">
        <div className="flex items-center justify-between px-6 py-4">
          <AccordionTrigger className="[&>svg]:hidden hover:no-underline">
            <h2 className="text-xl font-semibold">Typography</h2>
          </AccordionTrigger>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add new
          </Button>
        </div>
        
        <AccordionContent className="pb-6">
          <div className="space-y-8">
            {typography.map((typo, index) => (
              <div key={`typography-${index}`} className="px-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium">
                    {typo.headingFont}/{typo.bodyFont} Set
                    {typo.isDefault && <span className="ml-2 text-xs text-gray-500">(Default)</span>}
                  </h3>
                  <Button variant="ghost" size="sm" className="text-xs h-8">Edit</Button>
                </div>
                
                <div className="border rounded-md p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Heading Font */}
                    <div className="space-y-3">
                      <h4 className="text-xs text-gray-500">Heading Font</h4>
                      <p 
                        className="text-2xl"
                        style={{ 
                          fontFamily: `"${typo.headingFont}", sans-serif`,
                        }}
                      >
                        {typo.headingFont}
                      </p>
                      <p className="text-sm text-gray-600">
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                        abcdefghijklmnopqrstuvwxyz<br />
                        1234567890
                      </p>
                    </div>
                    
                    {/* Body Font */}
                    <div className="space-y-3">
                      <h4 className="text-xs text-gray-500">Body Font</h4>
                      <p 
                        className="text-2xl"
                        style={{ 
                          fontFamily: `"${typo.bodyFont}", sans-serif`,
                        }}
                      >
                        {typo.bodyFont}
                      </p>
                      <p 
                        className="text-sm text-gray-600"
                        style={{ 
                          fontFamily: `"${typo.bodyFont}", sans-serif`,
                        }}
                      >
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                        abcdefghijklmnopqrstuvwxyz<br />
                        1234567890
                      </p>
                    </div>
                  </div>
                  
                  {/* Font Pairings */}
                  {typo.fontPairings && typo.fontPairings.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="text-xs text-gray-500 mb-3">Font Pairings</h4>
                      <div className="space-y-4">
                        {typo.fontPairings.map((pair, pairIndex) => (
                          <div key={`pair-${pairIndex}`} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{pair.name}</p>
                              <p className="text-xs text-gray-500">
                                {pair.heading} (heading) + {pair.body} (body)
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">Use</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {typography.length === 0 && (
              <div className="px-6">
                <div className="border border-dashed rounded-md p-6 text-center">
                  <p className="text-gray-500">No typography defined yet.</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Typography
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