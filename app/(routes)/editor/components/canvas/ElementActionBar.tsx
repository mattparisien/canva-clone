import { Button } from '@/components/ui/button';
import useCanvasStore from '@/lib/stores/useCanvasStore';
import { Element as CanvasElement } from "@/lib/types/canvas.types";
import { CopyIcon, LockIcon, TrashIcon } from 'lucide-react';
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
    // Create refs for positioning
    const actionBarRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    
    // State to track if mouse is down
    const [isMouseDown, setIsMouseDown] = useState(false);
    
    // Track last observed scale to detect changes
    const lastScaleRef = useRef<number>(1);
    
    // Track element's position for movement detection
    const lastElementPosRef = useRef({ x: element.x, y: element.y });
    
    // Function to update position based on canvas and element properties
    const updatePosition = useCallback(() => {
        const canvasElement = document.querySelector('[style*="--canvas-scale"]') as HTMLElement;
        
        if (canvasElement && actionBarRef.current) {
            // Get the canvas bounding rect
            const canvasRect = canvasElement.getBoundingClientRect();
            
            // Get the scale from the canvas element's CSS variable
            const scaleStr = getComputedStyle(canvasElement).getPropertyValue('--canvas-scale');
            const scale = parseFloat(scaleStr) || 1;
            
            // Update last scale reference
            lastScaleRef.current = scale;
            
            // Calculate the absolute position in viewport coordinates
            const elementCenterX = canvasRect.left + (element.x * scale) + (element.width * scale / 2);
            const elementTopY = canvasRect.top + (element.y * scale);
            
            // Position the action bar centered above the element
            const actionBarRect = actionBarRef.current.getBoundingClientRect();
            
            setPosition({
                left: elementCenterX,
                top: elementTopY - actionBarRect.height - 8 // Position above element with some margin
            });
            
            // Update the last known position of the element
            lastElementPosRef.current = { x: element.x, y: element.y };
        }
    }, [element.x, element.y, element.width]);
    
    // Check if element position has changed (it's being dragged)
    useEffect(() => {
        // If the position changed but we're not in a mouse down state, update
        if (
            (lastElementPosRef.current.x !== element.x || lastElementPosRef.current.y !== element.y) && 
            !isMouseDown
        ) {
            updatePosition();
        }
    }, [element.x, element.y, updatePosition, isMouseDown]);
    
    // Add mouse down/up event listeners to track dragging state
    useEffect(() => {
        const handleMouseDown = () => {
            setIsMouseDown(true);
        };
        
        const handleMouseUp = () => {
            setIsMouseDown(false);
            // When mouse is released, update position immediately
            updatePosition();
        };
        
        // Add global listeners to track mouse state
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);
        
        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [updatePosition]);
    
    // Get canvas container node by querying the DOM and set up all necessary listeners
    useEffect(() => {
        // Call immediately 
        updatePosition();
        
        // Set up resize observer to handle any size changes
        const resizeObserver = new ResizeObserver(() => {
            updatePosition();
        });
        
        // Observe the document body for size changes
        resizeObserver.observe(document.body);
        
        // Set up a mutation observer to watch for style attribute changes on the canvas
        // This will detect zoom level changes which modify the --canvas-scale CSS variable
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const canvas = mutation.target as HTMLElement;
                    const scaleStr = getComputedStyle(canvas).getPropertyValue('--canvas-scale');
                    const scale = parseFloat(scaleStr) || 1;
                    
                    // Only update if scale has changed
                    if (scale !== lastScaleRef.current) {
                        updatePosition();
                    }
                }
            });
        });
        
        // Find and observe the canvas element
        const canvasElement = document.querySelector('[style*="--canvas-scale"]') as HTMLElement;
        if (canvasElement) {
            mutationObserver.observe(canvasElement, { attributes: true, attributeFilter: ['style'] });
        }
        
        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [updatePosition]);

    // Render the action bar only when not dragging
    if (isMouseDown) {
        return null;
    }

    return (
        <div
            ref={actionBarRef}
            className="fixed bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_3px_10px_rgba(0,0,0,0.15)] flex items-center p-1 border border-gray-100 space-x-0.5 z-50 pointer-events-auto"
            style={{
                left: `${position.left}px`,
                top: `${position.top}px`,
                transform: 'translateX(-50%)', // Center horizontally
                zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()} // Prevent clicks from propagating to canvas
        >
            <Button variant="ghost" size="sm" onClick={onLock} title={element.locked ? "Unlock" : "Lock"} className="h-7 w-7 rounded-xl">
                <LockIcon size={14} className={element.locked ? "text-blue-500" : "text-gray-700"} />
            </Button>
            
            <Button variant="ghost" size="sm" onClick={onDuplicate} title="Duplicate" className="h-7 w-7 rounded-xl">
                <CopyIcon size={14} />
            </Button>

            <Button variant="ghost" size="sm" onClick={onDelete} title="Delete" className="h-7 w-7 rounded-xl hover:text-gray-900">
                <TrashIcon size={14} />
            </Button>
        </div>
    );
};
