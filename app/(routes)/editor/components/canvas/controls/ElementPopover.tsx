import React from 'react';
import { LockIcon, CopyIcon, TrashIcon } from 'lucide-react';
import { Element as EditorCanvasElement } from "@lib/types/canvas.types";

interface ElementPopoverProps {
  element: EditorCanvasElement;
  onLock: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ElementPopover = ({ 
  element, 
  onLock, 
  onDuplicate, 
  onDelete 
}: ElementPopoverProps) => {
  // Handle click events and prevent propagation
  const handleButtonClick = (handler: (id: string) => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    handler(element.id);
  };

  return (
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-[calc(100%+8px)] z-10">
      <div className="bg-white/95 backdrop-blur-sm rounded-md shadow-md shadow-black/5 flex items-center p-1 border border-gray-100">
        <button 
          className="p-1.5 rounded-sm hover:bg-gray-100 transition-colors text-gray-700 flex items-center justify-center"
          onClick={handleButtonClick(onLock)}
          title={element.locked ? "Unlock element" : "Lock element"}
        >
          <LockIcon size={16} className={element.locked ? "text-blue-500" : "text-gray-700"} />
        </button>
        <button 
          className="p-1.5 rounded-sm hover:bg-gray-100 transition-colors text-gray-700 flex items-center justify-center"
          onClick={handleButtonClick(onDuplicate)}
          title="Duplicate element"
        >
          <CopyIcon size={16} />
        </button>
        <button 
          className="p-1.5 rounded-sm hover:bg-red-50 transition-colors text-gray-700 hover:text-red-500 flex items-center justify-center"
          onClick={handleButtonClick(onDelete)}
          title="Delete element"
        >
          <TrashIcon size={16} />
        </button>
      </div>
      {/* Small triangle pointer at the bottom of the popover */}
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-[5px]"></div>
    </div>
  );
};