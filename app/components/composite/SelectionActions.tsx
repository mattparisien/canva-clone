"use client"

import { useSelection } from "@lib/context/selection-context"
import { Button } from "@/components/ui/button"
import { Folder, Loader2, Trash2, X } from "lucide-react"
import { useState } from "react"

interface SelectionActionsProps {
  onDelete?: () => Promise<void>
  onDuplicate?: () => Promise<void>
  onMove?: () => Promise<void>
  className?: string
}

export function SelectionActions({
  onDelete,
  onMove,
  className = "",
}: SelectionActionsProps) {
  const { selectedIds, clearSelection } = useSelection()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  
  if (selectedIds.length === 0) return null
  
  const handleDelete = async () => {
    if (!onDelete || isDeleting) return
    
    try {
      setIsDeleting(true)
      await onDelete()
    } catch (error) {
      console.error("Error during delete operation:", error)
    } finally {
      setIsDeleting(false)
    }
  }
  
  const handleMove = async () => {
    if (!onMove || isMoving) return
    
    try {
      setIsMoving(true)
      await onMove()
    } catch (error) {
      console.error("Error during move operation:", error)
    } finally {
      setIsMoving(false)
    }
  }
  
  return (
    <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white border border-gray-100 shadow-lg rounded-2xl px-4 py-3 flex items-center z-50 ${className}`}>
      <span className="text-sm font-medium text-gray-700 mr-6">
        {selectedIds.length} selected
      </span>
      
      {onMove && (
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={handleMove} 
          disabled={isMoving || isDeleting}
          className="rounded-md"
        >
          {isMoving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Folder className="h-5 w-5" />
          )}
        </Button>
      )}
      
      {onDelete && (
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={handleDelete} 
          disabled={isDeleting || isMoving}
          className="rounded-md"
        >
          {isDeleting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Trash2 className="h-5 w-5" />
          )}
        </Button>
      )}
      
      <div className="h-5 w-px bg-gray-200 mx-2" />
      
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={clearSelection} 
        disabled={isDeleting || isMoving}
        className="rounded-md"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  )
}