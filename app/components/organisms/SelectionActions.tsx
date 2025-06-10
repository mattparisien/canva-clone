"use client"

import { Button } from "@components/atoms/button"
import {
  ActionButtonGroup,
  SelectionCounter
} from "@components/molecules"
import { useSelection } from "@lib/context/selection-context"
import { Folder, Trash2, X } from "lucide-react"
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
      <SelectionCounter count={selectedIds.length} className="mr-6" />

      <ActionButtonGroup
        actions={[
          ...(onMove ? [{
            icon: Folder,
            label: "Move",
            onClick: handleMove,
            loading: isMoving,
            disabled: isDeleting
          }] : []),
          ...(onDelete ? [{
            icon: Trash2,
            label: "Delete",
            onClick: handleDelete,
            loading: isDeleting,
            disabled: isMoving
          }] : [])
        ]}
        disabled={isDeleting || isMoving}
      />

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