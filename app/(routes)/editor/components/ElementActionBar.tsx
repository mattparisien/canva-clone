import React from 'react';
import useCanvasStore from '@/lib/stores/useCanvasStore';
import { LockIcon, CopyIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, ChevronsUpIcon, ChevronsDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import useEditorStore from '@/lib/stores/useEditorStore';

export const ElementActionBar = () => {
  const {
    elementActionBar,
    hideElementActionBar,
    updateElement,
    duplicateElement,
    deleteElement,
    bringElementForward,
    sendElementBackward,
    bringElementToFront,
    sendElementToBack,
  } = useCanvasStore(state => ({
    elementActionBar: state.elementActionBar,
    hideElementActionBar: state.hideElementActionBar,
    updateElement: state.updateElement,
    duplicateElement: state.duplicateElement,
    deleteElement: state.deleteElement,
    bringElementForward: state.bringElementForward,
    sendElementBackward: state.sendElementBackward,
    bringElementToFront: state.bringElementToFront,
    sendElementToBack: state.sendElementToBack,
  }));

  const { isActive, position, elementId } = elementActionBar;
  const currentElement = useCanvasStore(state => 
    useEditorStore.getState().pages.find(p => p.id === useEditorStore.getState().currentPageId)?.elements.find(el => el.id === elementId)
  );

  if (!isActive || !elementId || !currentElement) {
    return null;
  }

  const handleLock = () => {
    updateElement(elementId, { locked: !currentElement.locked });
    // Optionally hide action bar after action
    // hideElementActionBar(); 
  };

  const handleDuplicate = () => {
    duplicateElement(elementId);
    hideElementActionBar(); 
  };

  const handleDelete = () => {
    deleteElement(elementId);
    hideElementActionBar();
  };

  const handleBringForward = () => bringElementForward(elementId);
  const handleSendBackward = () => sendElementBackward(elementId);
  const handleBringToFront = () => bringElementToFront(elementId);
  const handleSendToBack = () => sendElementToBack(elementId);

  return (
    <div
      className="absolute bg-white/95 backdrop-blur-sm rounded-md shadow-lg flex items-center p-1 border border-gray-200 space-x-1"
      style={{
        left: position.x,
        top: position.y,
        zIndex: 'var(--z-element-action-bar)', // Use the CSS variable
        transform: 'translate(-50%, -100%)', // Adjust to position above the element
      }}
      onClick={(e) => e.stopPropagation()} // Prevent clicks from propagating to canvas
    >
      <Button variant="ghost" size="icon" onClick={handleLock} title={currentElement.locked ? "Unlock" : "Lock"}>
        <LockIcon size={16} className={currentElement.locked ? "text-blue-500" : "text-gray-700"} />
      </Button>
      <Button variant="ghost" size="icon" onClick={handleDuplicate} title="Duplicate">
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

      <Button variant="ghost" size="icon" onClick={handleDelete} title="Delete" className="hover:bg-red-50 hover:text-red-500">
        <TrashIcon size={16} />
      </Button>
    </div>
  );
};
