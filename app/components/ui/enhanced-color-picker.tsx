"use client"

import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils/utils"
import { Edit3, Plus, Trash2 } from "lucide-react"
import React, { useEffect, useState } from "react"
import { HexColorPicker } from "react-colorful"

// Type fix for HexColorPicker
const ColorPicker = HexColorPicker as React.ComponentType<{
    color: string;
    onChange: (color: string) => void;
    style?: React.CSSProperties;
}>

interface ColorPickerProps {
    color: string
    onChange: (color: string) => void
    onColorNameChange?: (name: string) => void
    colorName?: string
    savedColors?: string[]
    onSaveColor?: (color: string) => void
    onDeleteColor?: (color: string) => void
    className?: string
}

export function EnhancedColorPicker({
    color,
    onChange,
    onColorNameChange,
    colorName = "Untitled color",
    savedColors = [],
    onSaveColor,
    onDeleteColor,
    className
}: ColorPickerProps) {
    const [activeTab, setActiveTab] = useState("solid")
    const [currentColorName, setCurrentColorName] = useState(colorName)
    const [isEditingName, setIsEditingName] = useState(false)

    // Update local state when props change
    useEffect(() => {
        setCurrentColorName(colorName)
    }, [colorName])

    const handleColorNameSubmit = () => {
        setIsEditingName(false)
        if (onColorNameChange) {
            onColorNameChange(currentColorName)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleColorNameSubmit()
        }
        if (e.key === 'Escape') {
            setCurrentColorName(colorName)
            setIsEditingName(false)
        }
    }

    const formatHexColor = (hex: string) => {
        // Remove # if present and ensure it's 6 characters
        const cleanHex = hex.replace('#', '').toUpperCase()
        return `#${cleanHex.padEnd(6, '0').substring(0, 6)}`
    }

    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value
        if (!value.startsWith('#')) {
            value = '#' + value
        }

        // Only update if it's a valid hex color (3 or 6 characters after #)
        const hexPart = value.substring(1)
        if (/^[0-9A-Fa-f]{0,6}$/.test(hexPart)) {
            onChange(value)
        }
    }

    return (
        <div className={cn("w-64 p-3 space-y-3", className)}>
            {/* Color Name Section */}
            <div className="flex items-center gap-2">
                {isEditingName ? (
                    <Input
                        value={currentColorName}
                        onChange={(e) => setCurrentColorName(e.target.value)}
                        onBlur={handleColorNameSubmit}
                        onKeyDown={handleKeyPress}
                        className="flex-1 text-sm font-medium"
                        autoFocus
                    />
                ) : (
                    <h3
                        className="flex-1 text-sm font-medium cursor-pointer hover:text-gray-600 transition-colors flex items-center gap-2"
                        onClick={() => setIsEditingName(true)}
                    >
                        {currentColorName}
                        <Edit3 className="h-3 w-3 opacity-50" />
                    </h3>
                )}
            </div>

            {/* Solid/Gradient Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                    <TabsTrigger value="solid" className="text-xs py-1">Solid color</TabsTrigger>
                    <TabsTrigger value="gradient" className="text-xs py-1">Gradient</TabsTrigger>
                </TabsList>

                <TabsContent value="solid" className="space-y-3 mt-3">
                    {/* Main Color Picker */}
                    <div className="relative">
                        <ColorPicker
                            color={color}
                            onChange={onChange}
                            style={{ width: '100%', height: '140px' }}
                        />
                    </div>

                    {/* Hue Bar - this is already included in HexColorPicker but we'll add our own */}
                    <div className="w-full h-3 rounded-md overflow-hidden relative bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500">
                        <div
                            className="absolute top-0 w-1.5 h-full bg-white border border-gray-300 rounded-sm shadow-sm cursor-pointer"
                            style={{
                                left: `calc(${(parseInt(color.slice(1, 3), 16) / 255) * 100}% - 3px)`,
                            }}
                        />
                    </div>

                    {/* Color Input */}
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1.5 flex-1">
                            <Trash2 className="h-3 w-3 text-gray-400" />
                            <div
                                className="w-6 h-6 rounded-md border border-gray-200 shadow-sm"
                                style={{ backgroundColor: color }}
                            />
                            <Input
                                value={formatHexColor(color)}
                                onChange={handleHexInputChange}
                                className="flex-1 font-mono text-xs h-7"
                                placeholder="#000000"
                            />
                        </div>
                        <Edit3 className="h-3 w-3 text-gray-400" />
                    </div>

           
                </TabsContent>

                <TabsContent value="gradient" className="space-y-3 mt-3">
                    <div className="text-center py-4 text-gray-500">
                        <p className="text-xs">Gradient picker coming soon</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
