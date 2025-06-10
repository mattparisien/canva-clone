"use client"

import { Input } from "@/components/atoms/input"
import { cn } from "@/lib/utils/utils"
import { Edit3, Plus, Trash2 , Pipette} from "lucide-react"
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
    const [currentColorName, setCurrentColorName] = useState(colorName)
    const [isEditingName, setIsEditingName] = useState(false)

    // Utility function to convert hex to HSL
    const hexToHSL = (hex: string): { h: number, s: number, l: number } => {
        // Remove the # if present
        hex = hex.replace(/^#/, '');
        
        // Parse the hex values to RGB
        let r = parseInt(hex.slice(0, 2), 16) / 255;
        let g = parseInt(hex.slice(2, 4), 16) / 255;
        let b = parseInt(hex.slice(4, 6), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        let l = (max + min) / 2;
        
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return { h: h * 360, s: s * 100, l: l * 100 };
    };

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

            {/* Color Picker */}
            <div className="space-y-3 mt-3">
                {/* Main Color Picker */}
                <div className="relative">
                    <ColorPicker
                        color={color}
                        onChange={onChange}
                        style={{ width: '100%', height: '140px' }}
                    />
                </div>

             

                {/* Color Input */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-1">
                        <button className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center">
                            <Trash2 className="h-8 w-8 text-gray-500" />
                        </button>
                        <div
                            className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                            style={{ backgroundColor: color }}
                        />
                        <Input
                            value={formatHexColor(color)}
                            onChange={handleHexInputChange}
                            className="flex-1 font-mono text-sm h-7"
                            placeholder="#000000"
                            
                        />
                    </div>
                    <button className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center">
                        <Pipette className="h-4 w-4 text-gray-500 h-8 w-8" />
                    </button>
                </div>


                {/* Saved Colors */}
                {savedColors.length > 0 && (
                    <div className="space-y-2 mt-3">
                        <h4 className="text-xs font-medium text-gray-700">Saved Colors</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {savedColors.map((savedColor, index) => (
                                <div key={index} className="relative group">
                                    <button
                                        className="w-8 h-8 rounded-full border border-gray-200 shadow-sm hover:ring-1 hover:ring-blue-200 transition-all duration-200"
                                        style={{ backgroundColor: savedColor }}
                                        onClick={() => onChange(savedColor)}
                                        title={savedColor}
                                    >
                                        {onDeleteColor && (
                                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                <span className="text-[9px]">×</span>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            ))}
                            
                            {onSaveColor && (
                                <button
                                    className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors flex items-center justify-center"
                                    onClick={() => onSaveColor(color)}
                                    title="Add current color"
                                >
                                    <Plus className="h-4 w-4 text-gray-400" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
