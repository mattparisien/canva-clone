import { Button } from '@/components/ui/button';
import { Element as CanvasElement } from "@/lib/types/canvas.types";
import { CopyIcon, LockIcon, TrashIcon } from 'lucide-react';
import { forwardRef, ForwardRefRenderFunction } from 'react';

type ActionBarPosition = 'top' | 'bottom' | 'left' | 'right';

interface ElementActionBarProps {
    element: CanvasElement;
    position: {
        left: number;
        top: number;
    };
    placement: ActionBarPosition;
    onLock: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
}

const ElementActionBarComponent: ForwardRefRenderFunction<HTMLDivElement, ElementActionBarProps> = ({
    element,
    position,
    placement,
    onLock,
    onDuplicate,
    onDelete
}, ref) => {
    const isVertical = placement === 'left' || placement === 'right';
    const shouldCenterHorizontally = placement === 'top' || placement === 'bottom';
    
    return (
        <div
            ref={ref}
            className={`fixed bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_3px_10px_rgba(0,0,0,0.15)] flex items-center p-1 border border-gray-100 z-50 pointer-events-auto ${
                isVertical ? 'flex-col space-y-0.5' : 'space-x-0.5'
            }`}
            style={{
                left: `${position.left}px`,
                top: `${position.top}px`,
                transform: shouldCenterHorizontally ? 'translateX(-50%)' : 'none',
                zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
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

export const ElementActionBar = forwardRef(ElementActionBarComponent);