"use client"

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface SelectionContextType {
  selectedIds: string[];
  toggleSelection: (id: string) => void;
  isSelected: (id: string) => boolean;
  clearSelection: () => void;
  selectMultiple: (ids: string[]) => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const selectMultiple = (ids: string[]) => {
    setSelectedIds(ids);
  };

  return (
    <SelectionContext.Provider value={{ 
      selectedIds, 
      toggleSelection, 
      isSelected,
      clearSelection,
      selectMultiple
    }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}