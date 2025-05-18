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
        <div className="h-12 flex items-center justify-between px-4 shadow-sm z-10">
            <div></div>

            {/* Right side - Zoom controls and page info */}
            <div className="flex items-center gap-4">
                {/* Zoom controls with improved UX */}
                <div className="flex items-center gap-2 rounded-lg p-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md text-neutral-600 hover:text-neutral-700"
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
                            // className is managed in slider.tsx for neutral colors
                        />
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md text-neutral-600 hover:text-neutral-700"
                        onClick={handleZoomIn}
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </Button>

                    <div className="mx-1 px-1.5 py-0.5 min-w-10 text-center font-medium text-sm text-neutral-700 rounded">
                        {zoom}%
                    </div>
                </div>

                {/* Pages info with badge */}
                <Badge variant="outline" className="px-3 py-1.5 h-7 gap-1.5 text-neutral-700 font-medium text-xs flex items-center">
                    <svg className="h-4 w-4 text-neutral-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        <path d="M8 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M8 14H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span>{currentPageIndex + 1} / {pages.length}</span>
                </Badge>

                {/* Control buttons with consistent styling */}
                <div className="flex items-center gap-1.5">
                    {/* Fullscreen */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-neutral-600 hover:text-neutral-700"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        <Maximize className="h-4.5 w-4.5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}