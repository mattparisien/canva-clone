import { Button } from '@/components/ui/button';
import useCanvasStore, { useCurrentCanvasSize } from '@/lib/stores/useCanvasStore';
import { Element as CanvasElement } from "@/lib/types/canvas.types";
import { ArrowDownIcon, ArrowUpIcon, ChevronsDownIcon, ChevronsUpIcon, CopyIcon, LockIcon, TrashIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ElementActionBarProps {
    element: CanvasElement;
    onLock: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
}

export const ElementActionBar = ({
    element,
    onLock,
    onDuplicate,
    onDelete
}: ElementActionBarProps) => {
    // Use separate selectors for each action to avoid unnecessary re-renders
    const bringElementForward = useCanvasStore(state => state.bringElementForward);
    const sendElementBackward = useCanvasStore(state => state.sendElementBackward);
    const bringElementToFront = useCanvasStore(state => state.bringElementToFront);
    const sendElementToBack = useCanvasStore(state => state.sendElementToBack);
    
    // Create refs for positioning
    const actionBarRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    
    // Get canvas container node by querying the DOM
    useEffect(() => {
        // Use a function to find the canvas element and calculate position
        const updatePosition = () => {
            const canvasElement = document.querySelector('[style*="--canvas-scale"]') as HTMLElement;
            
            if (canvasElement && actionBarRef.current) {
                // Get the canvas bounding rect
                const canvasRect = canvasElement.getBoundingClientRect();
                
                // Get the scale from the canvas element's CSS variable
                const scaleStr = getComputedStyle(canvasElement).getPropertyValue('--canvas-scale');
                const scale = parseFloat(scaleStr) || 1;
                
                // Calculate the absolute position in viewport coordinates
                const elementCenterX = canvasRect.left + (element.x * scale) + (element.width * scale / 2);
                const elementTopY = canvasRect.top + (element.y * scale);
                
                // Position the action bar centered above the element
                const actionBarRect = actionBarRef.current.getBoundingClientRect();
                
                setPosition({
                    left: elementCenterX,
                    top: elementTopY - actionBarRect.height - 8 // Position above element with some margin
                });
            }
        };
        
        // Call immediately and set up observer
        updatePosition();
        
        // Set up resize observer to handle any size changes
        const resizeObserver = new ResizeObserver(() => {
            updatePosition();
        });
        
        // Observe the document body for size changes
        resizeObserver.observe(document.body);
        
        // Clean up
        return () => {
            resizeObserver.disconnect();
        };
    }, [element.x, element.y, element.width]);
    
    // Memoize handlers to prevent unnecessary re-renders
    const handleBringForward = useCallback(() => bringElementForward(element.id), [bringElementForward, element.id]);
    const handleSendBackward = useCallback(() => sendElementBackward(element.id), [sendElementBackward, element.id]);
    const handleBringToFront = useCallback(() => bringElementToFront(element.id), [bringElementToFront, element.id]);
    const handleSendToBack = useCallback(() => sendElementToBack(element.id), [sendElementToBack, element.id]);

    return (
        <div
            ref={actionBarRef}
            className="fixed bg-white/95 backdrop-blur-sm rounded-md shadow-lg flex items-center p-1 border border-gray-200 space-x-1 z-50 pointer-events-auto"
            style={{
                left: `${position.left}px`,
                top: `${position.top}px`,
                transform: 'translateX(-50%)', // Center horizontally
                zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()} // Prevent clicks from propagating to canvas
        >
            <Button variant="ghost" size="icon" onClick={onLock} title={element.locked ? "Unlock" : "Lock"}>
                <LockIcon size={16} className={element.locked ? "text-blue-500" : "text-gray-700"} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDuplicate} title="Duplicate">
                <CopyIcon size={16} />
            </Button>

            {/* Reordering Buttons */}
            <Button variant="ghost" size="icon" onClick={handleBringForward} title="Bring Forward">
                <ArrowUpIcon size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSendBackward} title="Send Backward">
                <ArrowDownIcon size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleBringToFront} title="Bring to Front">
                <ChevronsUpIcon size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSendToBack} title="Send to Back">
                <ChevronsDownIcon size={16} />
            </Button>

            <div className="h-4 w-px bg-gray-300 mx-1"></div> {/* Separator */}

            <Button variant="ghost" size="icon" onClick={onDelete} title="Delete" className="hover:bg-red-50 hover:text-red-500">
                <TrashIcon size={16} />
            </Button>
        </div>
    );
};
