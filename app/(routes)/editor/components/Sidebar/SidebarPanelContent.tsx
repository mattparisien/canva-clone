import { Button } from "@/components/ui/button";
import { Search, ChevronRight, Circle, Palette, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import useCanvasStore from "@/lib/stores/useCanvasStore";
import { useQuery } from "@tanstack/react-query";
import { Brand } from "@/lib/types/brands";
import { brandsAPI } from "@/lib/api";

export const ElementsPanelContent = ({ handleAddShape }: { handleAddShape: (shapeType: "rectangle" | "circle" | "line" | "arrow") => void }) => (
    <div className="flex flex-col p-6">
        {/* Search bar */}
        <div className="mb-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Search elements"
                    className="h-12 rounded-full border-gray-200 bg-gray-50 pl-10 pr-4 text-base w-full"
                />
            </div>
        </div>

        {/* Element type buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            <Button
                variant="outline"
                className="rounded-full bg-white border-gray-200 h-12 px-6 whitespace-nowrap flex items-center gap-2"
                onClick={() => handleAddShape("arrow")}
            >
                <ArrowRight className="h-4 w-4" />
                Arrow
            </Button>
            <Button variant="outline" className="rounded-full bg-white border-gray-200 h-12 px-6 whitespace-nowrap">
                Frame
            </Button>
            <Button
                variant="outline"
                className="rounded-full bg-white border-gray-200 h-12 px-6 whitespace-nowrap flex items-center gap-2"
                onClick={() => handleAddShape("line")}
            >
                <div className="w-4 h-[2px] bg-current"></div>
                Line
            </Button>
            <Button variant="outline" className="rounded-full bg-white border-gray-200 h-12 px-6 whitespace-nowrap">
                Table
            </Button>
            <Button
                variant="outline"
                className="rounded-full bg-white border-gray-200 h-12 px-6 whitespace-nowrap flex items-center gap-2"
                onClick={() => handleAddShape("circle")}
            >
                <Circle className="h-4 w-4" />
                Circle
            </Button>
            <div className="flex items-center justify-center pl-2">
                <ChevronRight className="h-5 w-5 text-gray-500" />
            </div>
        </div>

        {/* Shapes Section */}
        <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Shapes</h3>
                <Button variant="link" className="text-sm font-medium text-gray-500 h-auto p-0">
                    See all
                </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
                {/* Square */}
                <div
                    className="w-[80px] h-[80px] bg-black flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleAddShape("rectangle")}
                    title="Add Rectangle"
                ></div>

                {/* Rounded square */}
                <div
                    className="w-[80px] h-[80px] bg-black rounded-xl flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleAddShape("rectangle")}
                    title="Add Rounded Rectangle"
                ></div>

                {/* Horizontal line */}
                <div
                    className="w-[80px] h-[80px] flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleAddShape("line")}
                    title="Add Line"
                >
                    <div className="w-full h-[2px] bg-black"></div>
                </div>

                {/* Arrow */}
                <div
                    className="w-[80px] h-[80px] flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleAddShape("arrow")}
                    title="Add Arrow"
                >
                    <div className="w-full h-[2px] bg-black relative">
                        <div className="absolute right-0 w-3 h-3 border-t-2 border-r-2 border-black transform rotate-45 -translate-y-1/2"></div>
                    </div>
                </div>

                {/* Circle */}
                <div
                    className="w-[80px] h-[80px] bg-black rounded-full flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleAddShape("circle")}
                    title="Add Circle"
                ></div>

                <div className="flex items-center justify-center">
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                </div>
            </div>
        </div>

        {/* Graphics Section */}
        <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Graphics</h3>
                <Button variant="link" className="text-sm font-medium text-gray-500 h-auto p-0">
                    See all
                </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
                {/* Floral decoration */}
                <div className="w-[80px] h-[80px] flex items-center justify-center flex-shrink-0 cursor-pointer rounded-md overflow-hidden">
                    <img src="/placeholder.jpg" alt="Floral decoration" className="w-full h-full object-cover" />
                </div>

                {/* Mint rectangle */}
                <div className="w-[80px] h-[80px] bg-green-100 flex-shrink-0 cursor-pointer rounded-md"></div>

                {/* Yellow scribble */}
                <div className="w-[80px] h-[80px] flex items-center justify-center flex-shrink-0 cursor-pointer rounded-md overflow-hidden">
                    <div className="w-3/4 h-3/4 border-4 border-yellow-400 rounded-full border-dashed"></div>
                </div>

                {/* Chevron pattern */}
                <div className="w-[80px] h-[80px] flex items-center justify-center flex-shrink-0 cursor-pointer rounded-md">
                    <div className="w-3/5 h-3/5">
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20,30 L50,60 L80,30" stroke="#D1D5DB" strokeWidth="8" fill="none" />
                            <path d="M20,50 L50,80 L80,50" stroke="#D1D5DB" strokeWidth="8" fill="none" />
                        </svg>
                    </div>
                </div>

                <div className="flex items-center justify-center">
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                </div>
            </div>
        </div>

        {/* Polls & Quizzes Section */}
        <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Polls & Quizzes</h3>
                <Button variant="link" className="text-sm font-medium text-gray-500 h-auto p-0">
                    See all
                </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
                {/* Blue quiz option */}
                <div className="w-[160px] h-[80px] bg-blue-500 flex-shrink-0 cursor-pointer rounded-md p-3 text-white text-xs">
                    <p className="font-medium">Guess the answer:</p>
                    <p>"Add a question"</p>
                    <p className="text-[10px] mt-2">Answer 1</p>
                </div>

                {/* Green survey option */}
                <div className="w-[160px] h-[80px] bg-green-600 flex-shrink-0 cursor-pointer rounded-md p-3 text-white text-xs">
                    <p className="font-medium">Ask a survey question</p>
                    <div className="mt-2 text-[9px]">
                        <p>Option 1</p>
                        <p className="mt-1">Option 2</p>
                    </div>
                </div>

                {/* Yellow poll option */}
                <div className="w-[160px] h-[80px] bg-yellow-400 flex-shrink-0 cursor-pointer rounded-md p-3 text-xs">
                    <p className="font-medium">"Add a poll"</p>
                    <p>Which is the best show in the sta...</p>
                    <p className="text-[10px] mt-1">Always I think</p>
                </div>

                <div className="flex items-center justify-center">
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                </div>
            </div>
        </div>

        {/* Bottom actions */}
        <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-6 h-6 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 19l9-9m0 0l9-9m-9 9l-9 9m9-9l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <span>Notes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-6 h-6 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
                <span>Duration</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-6 h-6 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
                <span>Timer</span>
            </div>
        </div>
    </div>
);

export const TextPanelContent = () => (
    <div className="flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            {/* Text content here */}
            <h3 className="text-lg font-medium mb-4">Text Tools</h3>
            <p className="text-gray-600">Text formatting options coming soon...</p>
        </div>
    </div>
);

export const TextColorPanelContent = ({ onTextColorChange }: { onTextColorChange?: (color: string) => void }) => {
    // Get the currently selected element to show which color is active
    const selectedElement = useCanvasStore(state => state.selectedElement);
    const currentTextColor = selectedElement?.kind === "text" ? selectedElement.color : null;
    const { data: brands } = useQuery<Brand[]>({
        queryKey: ["editor-brands"],
        queryFn: () => brandsAPI.getAll(),
    });

    return (
        <div className="flex flex-col p-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <Palette className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">Default colors</h3>
            </div>

            {/* Solid colors section */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-600 mb-4">Solid colors</h4>

                {/* Color grid - 6 columns, 4 rows */}
                <div className="grid grid-cols-6 gap-3">
                    {/* Row 1: Grays and white */}
                    {[
                        "#000000", // Black
                        "#4A4A4A", // Dark gray
                        "#7A7A7A", // Medium gray
                        "#A8A8A8", // Light gray
                        "#D1D1D1", // Very light gray
                        "#FFFFFF"  // White
                    ].map((color) => (
                        <button
                            key={color}
                            className={`w-12 h-12 rounded-full hover:scale-105 transition-transform ${color === "#FFFFFF" ? "border-2 border-gray-200" : ""
                                } ${currentTextColor === color ? "ring-2 ring-blue-500 ring-offset-2" : ""
                                }`}
                            style={{ backgroundColor: color }}
                            onClick={() => {
                                if (onTextColorChange) {
                                    onTextColorChange(color);
                                }
                            }}
                        />
                    ))}

                    {/* Row 2: Reds, pinks, purples */}
                    {[
                        "#EF4444", // Red
                        "#F87171", // Light red
                        "#EC4899", // Pink
                        "#C084FC", // Light purple
                        "#8B5CF6", // Purple
                        "#6366F1"  // Blue purple
                    ].map((color) => (
                        <button
                            key={color}
                            className={`w-12 h-12 rounded-full hover:scale-105 transition-transform ${currentTextColor === color ? "ring-2 ring-blue-500 ring-offset-2" : ""
                                }`}
                            style={{ backgroundColor: color }}
                            onClick={() => {
                                if (onTextColorChange) {
                                    onTextColorChange(color);
                                }
                            }}
                        />
                    ))}

                    {/* Row 3: Blues and teals */}
                    {[
                        "#0891B2", // Teal
                        "#06B6D4", // Cyan
                        "#22D3EE", // Light cyan
                        "#3B82F6", // Blue
                        "#6366F1", // Indigo
                        "#1E40AF"  // Dark blue
                    ].map((color) => (
                        <button
                            key={color}
                            className={`w-12 h-12 rounded-full hover:scale-105 transition-transform ${currentTextColor === color ? "ring-2 ring-blue-500 ring-offset-2" : ""
                                }`}
                            style={{ backgroundColor: color }}
                            onClick={() => {
                                if (onTextColorChange) {
                                    onTextColorChange(color);
                                }
                            }}
                        />
                    ))}

                    {/* Row 4: Greens, yellows, oranges */}
                    {[
                        "#10B981", // Green 
                        "#84CC16", // Lime
                        "#EAB308", // Yellow
                        "#F59E0B", // Amber
                        "#F97316", // Orange
                        "#EF4444"  // Red orange
                    ].map((color) => (
                        <button
                            key={color}
                            className={`w-12 h-12 rounded-full hover:scale-105 transition-transform ${currentTextColor === color ? "ring-2 ring-blue-500 ring-offset-2" : ""
                                }`}
                            style={{ backgroundColor: color }}
                            onClick={() => {
                                if (onTextColorChange) {
                                    onTextColorChange(color);
                                }
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Brand color palettes */}
            {brands && brands.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-600 mb-4">Brand palettes</h4>
                    {brands.map((brand) => (
                        <div key={brand._id} className="mb-4">
                            {brand.colorPalettes.map((palette, idx) => (
                                <div key={idx} className="mb-2">
                                    <div className="text-xs text-gray-500 mb-2">{palette.name}</div>
                                    <div className="flex gap-3 flex-wrap">
                                        {palette.colors.map((color) => (
                                            <button
                                                key={color}
                                                className={`w-10 h-10 rounded-full hover:scale-105 transition-transform ${currentTextColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => {
                                                    if (onTextColorChange) {
                                                        onTextColorChange(color);
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {/* Custom color input */}
            <div className="border-t pt-4">
                <div className="flex gap-3 items-center">
                    <input
                        type="color"
                        value={currentTextColor || "#000000"}
                        className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                        onChange={(e) => {
                            if (onTextColorChange) {
                                onTextColorChange(e.target.value);
                            }
                        }}
                    />
                    <input
                        type="text"
                        placeholder="#000000"
                        value={currentTextColor || ""}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^#[0-9A-F]{6}$/i.test(value) && onTextColorChange) {
                                onTextColorChange(value);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export const BackgroundColorPanelContent = ({ onBackgroundColorChange }: { onBackgroundColorChange?: (color: string) => void }) => {
    // Get the currently selected element to show which color is active
    const selectedElement = useCanvasStore(state => state.selectedElement);
    const currentBackgroundColor = selectedElement?.backgroundColor;
    const { data: brands } = useQuery<Brand[]>({
        queryKey: ["editor-brands"],
        queryFn: () => brandsAPI.getAll(),
    });

    return (
        <div className="flex flex-col p-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <Palette className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">Default colors</h3>
            </div>

            {/* Solid colors section */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-600 mb-4">Solid colors</h4>

                {/* Color grid - 6 columns, 4 rows */}
                <div className="grid grid-cols-6 gap-3">
                    {/* Row 1: Grays and white */}
                    {[
                        "#000000", // Black
                        "#4A4A4A", // Dark gray
                        "#7A7A7A", // Medium gray
                        "#A8A8A8", // Light gray
                        "#D1D1D1", // Very light gray
                        "#FFFFFF"  // White
                    ].map((color) => (
                        <button
                            key={color}
                            className={`w-12 h-12 rounded-full hover:scale-105 transition-transform ${color === "#FFFFFF" ? "border-2 border-gray-200" : ""
                                } ${currentBackgroundColor === color ? "ring-2 ring-blue-500 ring-offset-2" : ""
                                }`}
                            style={{ backgroundColor: color }}
                            onClick={() => {
                                if (onBackgroundColorChange) {
                                    onBackgroundColorChange(color);
                                }
                            }}
                        />
                    ))}

                    {/* Row 2: Reds, pinks, purples */}
                    {[
                        "#EF4444", // Red
                        "#F87171", // Light red
                        "#EC4899", // Pink
                        "#C084FC", // Light purple
                        "#8B5CF6", // Purple
                        "#6366F1"  // Blue purple
                    ].map((color) => (
                        <button
                            key={color}
                            className={`w-12 h-12 rounded-full hover:scale-105 transition-transform ${currentBackgroundColor === color ? "ring-2 ring-blue-500 ring-offset-2" : ""
                                }`}
                            style={{ backgroundColor: color }}
                            onClick={() => {
                                if (onBackgroundColorChange) {
                                    onBackgroundColorChange(color);
                                }
                            }}
                        />
                    ))}

                    {/* Row 3: Blues and teals */}
                    {[
                        "#0891B2", // Teal
                        "#06B6D4", // Cyan
                        "#22D3EE", // Light cyan
                        "#3B82F6", // Blue
                        "#6366F1", // Indigo
                        "#1E40AF"  // Dark blue
                    ].map((color) => (
                        <button
                            key={color}
                            className={`w-12 h-12 rounded-full hover:scale-105 transition-transform ${currentBackgroundColor === color ? "ring-2 ring-blue-500 ring-offset-2" : ""
                                }`}
                            style={{ backgroundColor: color }}
                            onClick={() => {
                                if (onBackgroundColorChange) {
                                    onBackgroundColorChange(color);
                                }
                            }}
                        />
                    ))}

                    {/* Row 4: Greens, yellows, oranges */}
                    {[
                        "#10B981", // Green 
                        "#84CC16", // Lime
                        "#EAB308", // Yellow
                        "#F59E0B", // Amber
                        "#F97316", // Orange
                        "#EF4444"  // Red orange
                    ].map((color) => (
                        <button
                            key={color}
                            className={`w-12 h-12 rounded-full hover:scale-105 transition-transform ${currentBackgroundColor === color ? "ring-2 ring-blue-500 ring-offset-2" : ""
                                }`}
                            style={{ backgroundColor: color }}
                            onClick={() => {
                                if (onBackgroundColorChange) {
                                    onBackgroundColorChange(color);
                                }
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Brand color palettes */}
            {brands && brands.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-600 mb-4">Brand palettes</h4>
                    {brands.map((brand) => (
                        <div key={brand._id} className="mb-4">
                            {brand.colorPalettes.map((palette, idx) => (
                                <div key={idx} className="mb-2">
                                    <div className="text-xs text-gray-500 mb-2">{palette.name}</div>
                                    <div className="flex gap-3 flex-wrap">
                                        {palette.colors.map((color) => (
                                            <button
                                                key={color}
                                                className={`w-10 h-10 rounded-full hover:scale-105 transition-transform ${currentBackgroundColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => {
                                                    if (onBackgroundColorChange) {
                                                        onBackgroundColorChange(color);
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {/* Custom color input */}
            <div className="border-t pt-4">
                <div className="flex gap-3 items-center">
                    <input
                        type="color"
                        value={currentBackgroundColor || "#000000"}
                        className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                        onChange={(e) => {
                            if (onBackgroundColorChange) {
                                onBackgroundColorChange(e.target.value);
                            }
                        }}
                    />
                    <input
                        type="text"
                        placeholder="#000000"
                        value={currentBackgroundColor || ""}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^#[0-9A-F]{6}$/i.test(value) && onBackgroundColorChange) {
                                onBackgroundColorChange(value);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export const DefaultPanelContent = ({ activeItemId }: { activeItemId: string }) => (
    <div className="flex flex-col p-6">
        <h3 className="text-lg font-medium">Content for {activeItemId}</h3>
        <p className="mt-2 text-gray-600">This panel is still under development.</p>
    </div>
);