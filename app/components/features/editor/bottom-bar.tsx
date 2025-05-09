import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { PenLine, Plus, Minus, LayoutGrid, HelpCircle, Maximize } from "lucide-react"
import { MIN_ZOOM, MAX_ZOOM } from "@/lib/constants/editor"

interface BottomBarProps {
    zoom: number
    setZoom: (zoom: number) => void
    currentPageIndex: number
    pages: any[]
    handleZoomIn: () => void
    handleZoomOut: () => void
    toggleFullscreen: () => void
    isFullscreen: boolean
}

export default function BottomBar({
    zoom,
    setZoom,
    currentPageIndex,
    pages,
    handleZoomIn,
    handleZoomOut,
    toggleFullscreen,
    isFullscreen
}: BottomBarProps) {
    return (
        <div className="h-12 flex items-center justify-between px-4 bg-white border-t border-gray-100 shadow-sm z-10">
            {/* Left side - Notes button */}
            {/* <div className="flex items-center">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-brand-blue hover:bg-brand-blue-light/20 gap-2 rounded-lg">
                    <PenLine className="h-4 w-4" />
                    <span className="font-medium">Notes</span>
                </Button>
            </div> */}
            <div></div>

            {/* Right side - Zoom controls and page info */}
            <div className="flex items-center gap-4">
                {/* Zoom controls with improved UX */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md text-gray-600 hover:text-brand-blue hover:bg-brand-blue-light/20"
                        onClick={handleZoomOut}
                    >
                        <Minus className="h-3.5 w-3.5" />
                    </Button>

                    <div className="relative w-24 flex items-center px-2">
                        <Slider
                            value={[zoom]}
                            min={MIN_ZOOM}
                            max={MAX_ZOOM}
                            step={1}
                            onValueChange={([v]) => setZoom(v)}
                            className="[&>[role=slider]]:bg-brand-blue"
                        />
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md text-gray-600 hover:text-brand-blue hover:bg-brand-blue-light/20"
                        onClick={handleZoomIn}
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </Button>

                    <div className="mx-1 px-1.5 py-0.5 min-w-10 text-center font-medium text-sm text-gray-700 bg-white rounded border border-gray-100">
                        {zoom}%
                    </div>
                </div>

                {/* Pages info with badge */}
                <Badge variant="outline" className="bg-white px-3 py-1.5 h-7 gap-1.5 border-gray-200 text-gray-700 font-medium text-xs flex items-center">
                    <svg className="h-4 w-4 text-brand-blue" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        <path d="M8 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M8 14H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span>{currentPageIndex + 1} / {pages.length}</span>
                </Badge>

                {/* Control buttons with consistent styling */}
                <div className="flex items-center gap-1.5">
                    {/* Grid view */}
                    {/* <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-gray-600 hover:text-brand-blue hover:bg-brand-blue-light/20"
                        title="Grid View"
                    >
                        <LayoutGrid className="h-4.5 w-4.5" />
                    </Button> */}

                    {/* Fullscreen */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-gray-600 hover:text-brand-blue hover:bg-brand-blue-light/20"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        <Maximize className="h-4.5 w-4.5" />
                    </Button>

                    {/* Help */}
                    {/* <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-gray-600 hover:text-brand-blue hover:bg-brand-blue-light/20"
                        title="Help"
                    >
                        <HelpCircle className="h-4.5 w-4.5" />
                    </Button> */}
                </div>
            </div>
        </div>
    )
}