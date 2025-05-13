"use client"
import Editor from "./components/Editor"
import React from "react"

export default function EditorPage() {
  // Add a global wheel event handler to prevent browser zoom
  React.useEffect(() => {
    // This function will prevent the default browser zoom behavior
    const preventZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        return false
      }
    }

    // Add the event listener to document with passive: false to allow preventDefault
    document.addEventListener("wheel", preventZoom, { passive: false })

    // Also add to window as a fallback
    window.addEventListener("wheel", preventZoom, { passive: false })

    // Add keydown event listener to prevent Ctrl+Plus/Minus zoom
    const preventKeyZoom = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "-" || e.key === "=")) {
        e.preventDefault()
        return false
      }
    }

    window.addEventListener("keydown", preventKeyZoom)

    return () => {
      document.removeEventListener("wheel", preventZoom)
      window.removeEventListener("wheel", preventZoom)
      window.removeEventListener("keydown", preventKeyZoom)
    }
  }, [])

  return <Editor />
}