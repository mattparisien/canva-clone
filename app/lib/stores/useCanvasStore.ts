import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { DEFAULT_CANVAS_SIZE } from '../constants/canvas';
import { CanvasContextType, Element, HistoryAction, CanvasSize } from '../types/canvas';
import { reorderByIndex } from '../utils/canvas-utils';
import useEditorStore from './useEditorStore';

interface CanvasState extends Omit<CanvasContextType, 'elements' | 'canvasSize'> {
  historyIndex: number;
  history: HistoryAction[];
  duplicateElement: (id: string) => void;
  elementActionBar: {
    isActive: boolean;
    position: { x: number; y: number };
    elementId: string | null;
  };
  // Alignment guides state
  alignmentGuides: {
    horizontal: number[];
    vertical: number[];
  };
  isDragging: boolean;
  activeDragElement: string | null;
  setAlignmentGuides: (alignments: { horizontal: number[], vertical: number[] }) => void;
  setDragState: (isDragging: boolean, elementId?: string | null) => void;
  clearAlignmentGuides: () => void;
  showElementActionBar: (elementId: string, position: { x: number; y: number }) => void;
  hideElementActionBar: () => void;
  setElementActionBarPosition: (position: { x: number; y: number }) => void;
  bringElementForward: (elementId: string) => void;
  sendElementBackward: (elementId: string) => void;
  bringElementToFront: (elementId: string) => void;
  sendElementToBack: (elementId: string) => void;
}

// Create the canvas store
const useCanvasStore = create<CanvasState>((set, get) => {
  const getCurrentPage = () => {
    const { currentPageId, pages } = useEditorStore.getState();
    if (!currentPageId) return null;
    return pages.find(page => page.id === currentPageId) || null;
  };

  return {
  // Elements selection state
  selectedElement: null,
  selectedElementIds: [],
  isCanvasSelected: false,
  isLoaded: true,
  historyIndex: -1,
  history: [],
  canUndo: false,
  canRedo: false,
  elementActionBar: {
    isActive: false,
    position: { x: 0, y: 0 },
    elementId: null,
  },
  // Alignment guides state
  alignmentGuides: {
    horizontal: [],
    vertical: [],
  },
  isDragging: false,
  activeDragElement: null,

  // Alignment guides methods
  setAlignmentGuides: (alignments) => {
    set({ alignmentGuides: alignments });
  },

  setDragState: (isDragging, elementId = null) => {
    set({
      isDragging,
      activeDragElement: elementId,
      // Clear alignment guides when drag ends
      alignmentGuides: isDragging ? get().alignmentGuides : { horizontal: [], vertical: [] }
    });
  },

  clearAlignmentGuides: () => {
    set({ alignmentGuides: { horizontal: [], vertical: [] } });
  },

  // Add new element to the canvas
  addElement: (elementData) => {
    const editor = useEditorStore.getState();
    const currentPageId = editor.currentPageId;
    const currentPage = getCurrentPage();

    if (!currentPageId || !currentPage) return;

    // Generate a unique ID for the new element
    const newElement: Element = {
      ...elementData,
      id: nanoid()
    };

    // Add element to current page
    const updatedElements = [...currentPage.elements, newElement];

    // Update page elements in the editor store
    editor.updatePageElements(currentPageId, updatedElements);

    // Add to history
    const historyAction: HistoryAction = {
      type: 'ADD_ELEMENT',
      element: newElement,
      pageId: currentPageId
    };

    // Update history in canvas store
    set(state => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(historyAction);

      return {
        selectedElement: newElement,
        selectedElementIds: [newElement.id],
        isCanvasSelected: false,
        historyIndex: state.historyIndex + 1,
        history: newHistory,
        canUndo: true,
        canRedo: false
      };
    });
  },

  // Update an existing element
  updateElement: (id, updates) => {
    const editor = useEditorStore.getState();
    const currentPageId = editor.currentPageId;
    const currentPage = getCurrentPage();

    if (!currentPageId || !currentPage) return;

    // Find the element to update
    const elementToUpdate = currentPage.elements.find(el => el.id === id);

    if (!elementToUpdate) return;

    // Store the previous state for history
    const before = { ...elementToUpdate };

    // Create updated elements array
    const updatedElements = currentPage.elements.map(element =>
      element.id === id ? { ...element, ...updates } : element
    );

    // Update the page elements
    editor.updatePageElements(currentPageId, updatedElements);

    // Add to history
    const historyAction: HistoryAction = {
      type: 'UPDATE_ELEMENT',
      id,
      before,
      after: updates,
      pageId: currentPageId
    };

    // Update history in canvas store
    set(state => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(historyAction);

      // Update selected element if it's the one being updated
      const updatedSelectedElement = state.selectedElement?.id === id
        ? { ...state.selectedElement, ...updates }
        : state.selectedElement;

      return {
        selectedElement: updatedSelectedElement,
        historyIndex: state.historyIndex + 1,
        history: newHistory,
        canUndo: true,
        canRedo: false
      };
    });
  },

  // Update multiple elements at once
  updateMultipleElements: (updates) => {
    const editor = useEditorStore.getState();
    const state = get();
    const currentPageId = editor.currentPageId;
    const selectedIds = state.selectedElementIds;
    const currentPage = getCurrentPage();

    if (!currentPageId || !currentPage || selectedIds.length === 0) return;

    // Store previous states for history
    const updatedElements = currentPage.elements.map(element => {
      if (selectedIds.includes(element.id)) {
        const updatedProps = typeof updates === 'function'
          ? updates(element)
          : updates;

        return { ...element, ...updatedProps };
      }
      return element;
    });

    // Update the page elements
    editor.updatePageElements(currentPageId, updatedElements);

    // We're not tracking individual history for bulk updates
    // But we could add a more complex history action if needed

    // Update selected element if it's in the selection
    set(state => {
      if (state.selectedElement && selectedIds.includes(state.selectedElement.id)) {
        const updatedProps = typeof updates === 'function'
          ? updates(state.selectedElement)
          : updates;

        return {
          selectedElement: { ...state.selectedElement, ...updatedProps }
        };
      }
      return {};
    });
  },

  // Delete an element
  deleteElement: (id) => {
    const editor = useEditorStore.getState();
    const currentPageId = editor.currentPageId;
    const currentPage = getCurrentPage();

    if (!currentPageId || !currentPage) return;

    // Find the element to delete for history
    const elementToDelete = currentPage.elements.find(el => el.id === id);

    if (!elementToDelete) return;

    // Filter out the element to delete
    const updatedElements = currentPage.elements.filter(element => element.id !== id);

    // Update the page elements
    editor.updatePageElements(currentPageId, updatedElements);

    // Add to history
    const historyAction: HistoryAction = {
      type: 'DELETE_ELEMENT',
      element: elementToDelete,
      pageId: currentPageId
    };

    // Update history and selection in canvas store
    set(state => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(historyAction);

      // Clear selection if the deleted element was selected
      const newSelectedElement = state.selectedElement?.id === id ? null : state.selectedElement;
      const newSelectedElementIds = state.selectedElementIds.filter(elementId => elementId !== id);

      return {
        selectedElement: newSelectedElement,
        selectedElementIds: newSelectedElementIds,
        isCanvasSelected: newSelectedElementIds.length === 0,
        historyIndex: state.historyIndex + 1,
        history: newHistory,
        canUndo: true,
        canRedo: false
      };
    });
  },

  // Delete all selected elements
  deleteSelectedElements: () => {
    const state = get();
    const selectedIds = state.selectedElementIds;

    if (selectedIds.length === 0) return;

    // Delete each selected element
    selectedIds.forEach(id => {
      get().deleteElement(id);
    });

    // Clear selection
    set({
      selectedElement: null,
      selectedElementIds: [],
      isCanvasSelected: true
    });
  },

  // Select a specific element
  selectElement: (id, addToSelection = false) => {
    const editor = useEditorStore.getState();
    const currentPageId = editor.currentPageId;
    const currentPage = getCurrentPage();

    if (!currentPageId || !currentPage || !id) {
      // If id is null, clear selection
      set({
        selectedElement: null,
        selectedElementIds: [],
        isCanvasSelected: true
      });
      return;
    }

    const elementToSelect = currentPage.elements.find(el => el.id === id);

    if (!elementToSelect) return;

    set(state => {
      // Determine the new selected IDs based on addToSelection flag
      let newSelectedIds: string[];

      if (addToSelection) {
        // Toggle selection: if already selected, remove it; otherwise add it
        if (state.selectedElementIds.includes(id)) {
          newSelectedIds = state.selectedElementIds.filter(elId => elId !== id);
        } else {
          newSelectedIds = [...state.selectedElementIds, id];
        }
      } else {
        // Replace selection with just this element
        newSelectedIds = [id];
      }

      // If multiple elements are selected, don't set a single selectedElement
      const newSelectedElement = newSelectedIds.length === 1
        ? elementToSelect
        : null;

      return {
        selectedElement: newSelectedElement,
        selectedElementIds: newSelectedIds,
        isCanvasSelected: false
      };
    });
  },

  deselectElement: (id: string) => {
    const state = get();
    const selectedIds = state.selectedElementIds;

    if (!selectedIds.includes(id)) return;

    // Remove the element from selection
    const newSelectedIds = selectedIds.filter(elId => elId !== id);


    set({
      selectedElementIds: newSelectedIds,
    });
  },

  // Select multiple elements at once
  selectMultipleElements: (ids) => {
    if (ids.length === 0) {
      set({
        selectedElement: null,
        selectedElementIds: [],
        isCanvasSelected: true
      });
      return;
    }

    set({
      selectedElement: null, // No single element focus when multiple are selected
      selectedElementIds: ids,
      isCanvasSelected: false
    });
  },

  // Select or deselect the canvas
  selectCanvas: (select) => {
    if (select) {
      set({
        selectedElement: null,
        selectedElementIds: [],
        isCanvasSelected: true
      });
    } else {
      set({
        isCanvasSelected: false
      });
    }
  },

  // Clear all selections
  clearSelection: () => {
    set({
      selectedElement: null,
      selectedElementIds: [],
      isCanvasSelected: true
    });
  },

  // Change the canvas size
  changeCanvasSize: (size) => {
    const editor = useEditorStore.getState();
    const currentPageId = editor.currentPageId;
    const currentPage = getCurrentPage();

    if (!currentPageId || !currentPage) return;

    // Store the previous size for history
    const before: CanvasSize = currentPage.canvas 
      ? { name: 'Custom', width: currentPage.canvas.width, height: currentPage.canvas.height }
      : (currentPage.canvasSize || DEFAULT_CANVAS_SIZE);

    // Update the page canvas size
    editor.updatePageCanvasSize(currentPageId, size);

    // Add to history
    const historyAction: HistoryAction = {
      type: 'CHANGE_CANVAS_SIZE',
      before,
      after: size,
      pageId: currentPageId
    };

    // Update history in canvas store
    set(state => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(historyAction);

      return {
        historyIndex: state.historyIndex + 1,
        history: newHistory,
        canUndo: true,
        canRedo: false
      };
    });
  },

  // Clear the "isNew" flag after an element is placed
  clearNewElementFlag: (id) => {
    const editor = useEditorStore.getState();
    const currentPageId = editor.currentPageId;
    const currentPage = getCurrentPage();

    if (!currentPageId || !currentPage) return;

    // Find the element
    const element = currentPage.elements.find(el => el.id === id);

    if (!element || !element.isNew) return;

    // Update the element to remove the isNew flag
    get().updateElement(id, { isNew: false });
  },

  // Helper to scale an element's position and size
  scaleElement: (element, scaleFactor) => {
    return {
      ...element,
      x: element.x * scaleFactor,
      y: element.y * scaleFactor,
      width: element.width * scaleFactor,
      height: element.height * scaleFactor,
      fontSize: element.fontSize ? element.fontSize * scaleFactor : undefined
    };
  },

  // Undo the last action
  undo: () => {
    const state = get();

    if (!state.canUndo || state.historyIndex < 0) return;

    const action = state.history[state.historyIndex];
    const editor = useEditorStore.getState();

    // Apply the reverse of the action
    switch (action.type) {
      case 'ADD_ELEMENT': {
        // Get the current page
        const currentPage = editor.pages.find(page => page.id === action.pageId);

        if (!currentPage) break;

        // Remove the added element
        const updatedElements = currentPage.elements.filter(el => el.id !== action.element.id);

        // Update the page
        editor.updatePageElements(action.pageId, updatedElements);

        // Update selection if needed
        if (state.selectedElement?.id === action.element.id) {
          set({
            selectedElement: null,
            selectedElementIds: state.selectedElementIds.filter(id => id !== action.element.id),
            isCanvasSelected: true
          });
        }
        break;
      }

      case 'UPDATE_ELEMENT': {
        // Get the current page
        const currentPage = editor.pages.find(page => page.id === action.pageId);

        if (!currentPage) break;

        // Find the element to revert
        const elementToUpdate = currentPage.elements.find(el => el.id === action.id);

        if (!elementToUpdate) break;

        // Create updated elements array with reverted element
        const updatedElements = currentPage.elements.map(element =>
          element.id === action.id ? { ...element, ...action.before } : element
        );

        // Update the page
        editor.updatePageElements(action.pageId, updatedElements);

        // Update selected element if it's the one being reverted
        if (state.selectedElement?.id === action.id) {
          set({
            selectedElement: { ...state.selectedElement, ...action.before }
          });
        }
        break;
      }

      case 'DELETE_ELEMENT': {
        // Get the current page
        const currentPage = editor.pages.find(page => page.id === action.pageId);

        if (!currentPage) break;

        // Add the deleted element back
        const updatedElements = [...currentPage.elements, action.element];

        // Update the page
        editor.updatePageElements(action.pageId, updatedElements);
        break;
      }

      case 'CHANGE_CANVAS_SIZE': {
        // Get the current page
        const currentPage = editor.pages.find(page => page.id === action.pageId);

        if (!currentPage) break;

        // Revert to previous canvas size
        editor.updatePageCanvasSize(action.pageId, action.before);
        break;
      }

      case 'REORDER_ELEMENT': {
        const currentPage = editor.pages.find(page => page.id === action.pageId);
        if (!currentPage) break;

        const reordered = reorderByIndex(currentPage.elements, action.toIndex, action.fromIndex);
        editor.updatePageElements(action.pageId, reordered);
        break;
      }

      // Handle other action types as needed
    }

    // Update history state
    set({
      historyIndex: state.historyIndex - 1,
      canUndo: state.historyIndex > 0,
      canRedo: true
    });
  },

  // Redo the previously undone action
  redo: () => {
    const state = get();

    if (!state.canRedo || state.historyIndex >= state.history.length - 1) return;

    const action = state.history[state.historyIndex + 1];
    const editor = useEditorStore.getState();

    // Apply the action again
    switch (action.type) {
      case 'ADD_ELEMENT': {
        // Get the current page
        const currentPage = editor.pages.find(page => page.id === action.pageId);

        if (!currentPage) break;

        // Add the element back
        const updatedElements = [...currentPage.elements, action.element];

        // Update the page
        editor.updatePageElements(action.pageId, updatedElements);
        break;
      }

      case 'UPDATE_ELEMENT': {
        // Get the current page
        const currentPage = editor.pages.find(page => page.id === action.pageId);

        if (!currentPage) break;

        // Find the element to update
        const elementToUpdate = currentPage.elements.find(el => el.id === action.id);

        if (!elementToUpdate) break;

        // Create updated elements array
        const updatedElements = currentPage.elements.map(element =>
          element.id === action.id ? { ...element, ...action.after } : element
        );

        // Update the page
        editor.updatePageElements(action.pageId, updatedElements);

        // Update selected element if it's the one being updated
        if (state.selectedElement?.id === action.id) {
          set({
            selectedElement: { ...state.selectedElement, ...action.after }
          });
        }
        break;
      }

      case 'DELETE_ELEMENT': {
        // Get the current page
        const currentPage = editor.pages.find(page => page.id === action.pageId);

        if (!currentPage) break;

        // Remove the element
        const updatedElements = currentPage.elements.filter(el => el.id !== action.element.id);

        // Update the page
        editor.updatePageElements(action.pageId, updatedElements);

        // Update selection if needed
        if (state.selectedElement?.id === action.element.id) {
          set({
            selectedElement: null,
            selectedElementIds: state.selectedElementIds.filter(id => id !== action.element.id),
            isCanvasSelected: true
          });
        }
        break;
      }

      case 'CHANGE_CANVAS_SIZE': {
        // Get the current page
        const currentPage = editor.pages.find(page => page.id === action.pageId);

        if (!currentPage) break;

        // Apply the canvas size change
        editor.updatePageCanvasSize(action.pageId, action.after);
        break;
      }

      case 'REORDER_ELEMENT': {
        const currentPage = editor.pages.find(page => page.id === action.pageId);
        if (!currentPage) break;

        const reordered = reorderByIndex(currentPage.elements, action.fromIndex, action.toIndex);
        editor.updatePageElements(action.pageId, reordered);
        break;
      }

      // Handle other action types as needed
    }

    // Update history state
    set({
      historyIndex: state.historyIndex + 1,
      canUndo: true,
      canRedo: state.historyIndex + 1 < state.history.length - 1
    });
  },

  // Helper function to check if an element is selected
  isElementSelected: (id) => {
    return get().selectedElementIds.includes(id);
  },
  // Helper to calculate zoom to fit canvas in view
  fitCanvasToView: (container: HTMLElement, canvas: HTMLElement): number => {
    if (!container || !canvas) return 1;

    // Force layout update if needed
    const containerRect = container.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const canvasWidth = canvas.offsetWidth || 1;
    const canvasHeight = canvas.offsetHeight || 1;

    console.log(containerWidth, containerHeight);

    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;

    const scale = Math.min(scaleX, scaleY) * 0.9;

    // Apply scale using CSS transform
    canvas.style.transformOrigin = "top left";
    canvas.style.transform = `scale(${scale})`;

    return scale;
  },

  toggleCanvasSelection: () => {
    set(state => ({
      isCanvasSelected: !state.isCanvasSelected
    }));
  },

  // Duplicate an element
  duplicateElement: (id: string) => {
    const editor = useEditorStore.getState();
    const currentPageId = editor.currentPageId;
    const currentPage = getCurrentPage();

    if (!currentPageId || !currentPage) return;

    // Find the element to duplicate
    const elementToDuplicate = currentPage.elements.find(el => el.id === id);

    if (!elementToDuplicate) return;

    // Create a copy with a new ID, slightly offset position
    const newElement: Element = {
      ...elementToDuplicate,
      id: nanoid(),
      x: elementToDuplicate.x + 20, // Offset the copied element by 20px
      y: elementToDuplicate.y + 20
    };

    // Add the duplicate to the canvas
    const updatedElements = [...currentPage.elements, newElement];

    // Update the page elements
    editor.updatePageElements(currentPageId, updatedElements);

    // Add to history
    const historyAction: HistoryAction = {
      type: 'ADD_ELEMENT',
      element: newElement,
      pageId: currentPageId
    };

    // Update history and selection in canvas store
    set(state => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(historyAction);

      return {
        selectedElement: newElement,
        selectedElementIds: [newElement.id],
        isCanvasSelected: false,
        historyIndex: state.historyIndex + 1,
        history: newHistory,
        canUndo: true,
        canRedo: false
      };
    });
  },

  // Element Action Bar actions
  showElementActionBar: (elementId, position) => {
    set({
      elementActionBar: {
        isActive: true,
        position,
        elementId,
      },
    });
  },
  hideElementActionBar: () => {
    set(state => ({
      elementActionBar: { ...state.elementActionBar, isActive: false, elementId: null },
    }));
  },
  setElementActionBarPosition: (position) => {
    set(state => ({
      elementActionBar: { ...state.elementActionBar, position },
    }));
  },

  // Element reordering actions
  bringElementForward: (elementId) => {
    const editor = useEditorStore.getState();
    const currentPageId = editor.currentPageId;
    const currentPage = getCurrentPage();
    if (!currentPageId || !currentPage) return;

    const elements = [...currentPage.elements];
    const index = elements.findIndex(el => el.id === elementId);

    if (index === -1 || index === elements.length - 1) return; // Not found or already at front

    const element = elements.splice(index, 1)[0];
    elements.splice(index + 1, 0, element);

    editor.updatePageElements(currentPageId, elements);
    // Add to history
    const historyAction: HistoryAction = {
      type: 'REORDER_ELEMENT',
      pageId: currentPageId,
      elementId,
      fromIndex: index,
      toIndex: index + 1,
    };
    set(state => ({
      history: [...state.history.slice(0, state.historyIndex + 1), historyAction],
      historyIndex: state.historyIndex + 1,
      canUndo: true,
      canRedo: false,
    }));
  },

  sendElementBackward: (elementId) => {
    const editor = useEditorStore.getState();
    const currentPageId = editor.currentPageId;
    const currentPage = getCurrentPage();
    if (!currentPageId || !currentPage) return;

    const elements = [...currentPage.elements];
    const index = elements.findIndex(el => el.id === elementId);

    if (index === -1 || index === 0) return; // Not found or already at back

    const element = elements.splice(index, 1)[0];
    elements.splice(index - 1, 0, element);

    editor.updatePageElements(currentPageId, elements);
    // Add to history
    const historyAction: HistoryAction = {
      type: 'REORDER_ELEMENT',
      pageId: currentPageId,
      elementId,
      fromIndex: index,
      toIndex: index - 1,
    };
    set(state => ({
      history: [...state.history.slice(0, state.historyIndex + 1), historyAction],
      historyIndex: state.historyIndex + 1,
      canUndo: true,
      canRedo: false,
    }));
  },

  bringElementToFront: (elementId) => {
    const editor = useEditorStore.getState();
    const currentPageId = editor.currentPageId;
    const currentPage = getCurrentPage();
    if (!currentPageId || !currentPage) return;

    const elements = [...currentPage.elements];
    const index = elements.findIndex(el => el.id === elementId);

    if (index === -1 || index === elements.length - 1) return; // Not found or already at front

    const element = elements.splice(index, 1)[0];
    elements.push(element);

    editor.updatePageElements(currentPageId, elements);
    // Add to history
    const historyAction: HistoryAction = {
      type: 'REORDER_ELEMENT',
      pageId: currentPageId,
      elementId,
      fromIndex: index,
      toIndex: elements.length - 1,
    };
    set(state => ({
      history: [...state.history.slice(0, state.historyIndex + 1), historyAction],
      historyIndex: state.historyIndex + 1,
      canUndo: true,
      canRedo: false,
    }));
  },

  sendElementToBack: (elementId) => {
    const editor = useEditorStore.getState();
    const currentPageId = editor.currentPageId;
    const currentPage = getCurrentPage();
    if (!currentPageId || !currentPage) return;

    const elements = [...currentPage.elements];
    const index = elements.findIndex(el => el.id === elementId);

    if (index === -1 || index === 0) return; // Not found or already at back

    const element = elements.splice(index, 1)[0];
    elements.unshift(element);

    editor.updatePageElements(currentPageId, elements);
    // Add to history
    const historyAction: HistoryAction = {
      type: 'REORDER_ELEMENT',
      pageId: currentPageId,
      elementId,
      fromIndex: index,
      toIndex: 0,
    };
    set(state => ({
      history: [...state.history.slice(0, state.historyIndex + 1), historyAction],
      historyIndex: state.historyIndex + 1,
      canUndo: true,
      canRedo: false,
    }));
  },

  // Text styling methods
  handleTextColorChange: (color: string) => {
    const { selectedElementIds } = get();
    if (selectedElementIds.length === 0) return;

    const editor = useEditorStore.getState();
    const currentPageId = editor.currentPageId;
    const currentPage = getCurrentPage();
    if (!currentPageId || !currentPage) return;

    // Update all selected text elements
    const elements = currentPage.elements.map(element => {
      if (selectedElementIds.includes(element.id) && element.kind === 'text') {
        return { ...element, color };
      }
      return element;
    });

    editor.updatePageElements(currentPageId, elements);
  },

  // Shape/element background color styling
  handleBackgroundColorChange: (color: string) => {
    const { selectedElementIds } = get();
    if (selectedElementIds.length === 0) return;

    const editor = useEditorStore.getState();
    const currentPageId = editor.currentPageId;
    const currentPage = getCurrentPage();
    if (!currentPageId || !currentPage) return;

    // Update all selected elements that support background color
    const elements = currentPage.elements.map(element => {
      if (selectedElementIds.includes(element.id) && (element.kind === 'shape' || element.kind === 'text')) {
        return { ...element, backgroundColor: color };
      }
      return element;
    });

    editor.updatePageElements(currentPageId, elements);
  },

  // Canvas background color styling
  handleCanvasBackgroundColorChange: (color: string) => {
    const editor = useEditorStore.getState();
    const currentPageId = editor.currentPageId;
    if (!currentPageId) return;

    // Update the current page's background
    editor.updatePageBackground(currentPageId, {
      type: 'color',
      value: color
    });
  },
  };
});

// Create a selector to get the current page elements
export const useCurrentPageElements = () => {
  const currentPage = useEditorStore(state => {
    return state.pages.find(page => page.id === state.currentPageId);
  });

  return currentPage?.elements || [];
};

// Create a selector to get the current page canvas size
export const useCurrentCanvasSize = () => {
  const currentPage = useEditorStore(state => {
    return state.pages.find(page => page.id === state.currentPageId);
  });

  return currentPage?.canvas || DEFAULT_CANVAS_SIZE;
};

export default useCanvasStore;