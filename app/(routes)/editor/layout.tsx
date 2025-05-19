"use client"

import EditorNavbar from "@/components/layout/navbar"
import { NavigationSidebar } from "@/components/layout/navigation-sidebar"
import { EDITOR_NAVIGATION_ITEMS } from "@/lib/constants/navigation"
import { CanvasProvider } from "@lib/context/canvas-context"
import { EditorProvider } from "@lib/context/editor-context"
import * as Popover from "@radix-ui/react-popover"
import { useCallback, useRef, useState } from "react"
import './styles/Editor.css'; // Import editor-specific styles
import { ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PopoverState {
    isOpen: boolean
    itemId: string | null
}

export default function EditorLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {


    const [popoverState, setPopoverState] = useState<PopoverState>({
        isOpen: false,
        itemId: null,
    });

    const sidebarRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Render appropriate content based on active item
    const renderPopoverContent = useCallback(() => {
        if (popoverState.itemId === "elements") {
            return (
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
                        <Button variant="outline" className="rounded-full bg-white border-gray-200 h-12 px-6 whitespace-nowrap">
                            Arrow
                        </Button>
                        <Button variant="outline" className="rounded-full bg-white border-gray-200 h-12 px-6 whitespace-nowrap">
                            Frame
                        </Button>
                        <Button variant="outline" className="rounded-full bg-white border-gray-200 h-12 px-6 whitespace-nowrap">
                            Line
                        </Button>
                        <Button variant="outline" className="rounded-full bg-white border-gray-200 h-12 px-6 whitespace-nowrap">
                            Table
                        </Button>
                        <Button variant="outline" className="rounded-full bg-white border-gray-200 h-12 px-6 whitespace-nowrap">
                            Circle
                        </Button>
                        <div className="flex items-center justify-center pl-2">
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                        </div>
                    </div>

                    {/* Recently Used Section */}
                    <div className="mb-10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Recently used</h3>
                            <Button variant="link" className="text-sm font-medium text-gray-500 h-auto p-0">
                                See all
                            </Button>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {/* Black square */}
                            <div className="w-[104px] h-[104px] bg-black flex-shrink-0 cursor-pointer"></div>
                            
                            {/* Horizontal line */}
                            <div className="w-[104px] h-[104px] flex items-center justify-center flex-shrink-0 cursor-pointer">
                                <div className="w-full h-[2px] bg-black"></div>
                            </div>
                            
                            {/* Cloud image */}
                            <div className="w-[104px] h-[104px] flex items-center justify-center bg-sky-100 flex-shrink-0 cursor-pointer">
                                <div className="w-3/4 h-1/2 bg-white rounded-full"></div>
                            </div>
                            
                            {/* Green landscape */}
                            <div className="w-[104px] h-[104px] flex-shrink-0 cursor-pointer relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-green-500/50"></div>
                                <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-green-500"></div>
                                <div className="absolute top-0 left-0 right-0 h-1/2 bg-sky-100"></div>
                            </div>
                            
                            <div className="flex items-center justify-center">
                                <ChevronRight className="h-5 w-5 text-gray-500" />
                            </div>
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
                            <div className="w-[80px] h-[80px] bg-black flex-shrink-0 cursor-pointer"></div>
                            
                            {/* Rounded square */}
                            <div className="w-[80px] h-[80px] bg-black rounded-xl flex-shrink-0 cursor-pointer"></div>
                            
                            {/* Horizontal line */}
                            <div className="w-[80px] h-[80px] flex items-center justify-center flex-shrink-0 cursor-pointer">
                                <div className="w-full h-[2px] bg-black"></div>
                            </div>
                            
                            {/* Arrow */}
                            <div className="w-[80px] h-[80px] flex items-center justify-center flex-shrink-0 cursor-pointer">
                                <div className="w-full h-[2px] bg-black relative">
                                    <div className="absolute right-0 w-3 h-3 border-t-2 border-r-2 border-black transform rotate-45 -translate-y-1/2"></div>
                                </div>
                            </div>
                            
                            {/* Circle */}
                            <div className="w-[80px] h-[80px] bg-black rounded-full flex-shrink-0 cursor-pointer"></div>
                            
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
                                    <path d="M3 19l9-9m0 0l9-9m-9 9l-9 9m9-9l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <span>Notes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-6 h-6 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <span>Duration</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-6 h-6 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <span>Timer</span>
                        </div>
                    </div>
                </div>
            );
        }
        else if (popoverState.itemId === "text") {
            // Text menu content (fallback to previous implementation)
            return (
                <div className="flex flex-col">
                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                        {/* Text content here */}
                    </div>
                </div>
            );
        }
        // Fallback for other menu items
        return (
            <div className="flex flex-col p-6">
                <h3 className="text-lg font-medium">Content for {popoverState.itemId}</h3>
                <p className="mt-2 text-gray-600">This panel is still under development.</p>
            </div>
        );
    }, [popoverState.itemId]);

    const handleSidebarItemClick = useCallback((itemId: string) => {
        console.log(itemId)
        setPopoverState((prevState) => ({
            ...prevState,
            itemId
        }));
    }, []);

    return (
        <EditorProvider>
            <CanvasProvider>
                <Popover.Root>
                    <div className={"flex h-screen flex-col"}>
                        <Popover.Anchor>
                            <EditorNavbar />
                        </Popover.Anchor>
                        <NavigationSidebar
                            items={EDITOR_NAVIGATION_ITEMS}
                            variant="editor"
                            ref={sidebarRef}
                            onItemClick={handleSidebarItemClick}
                        />
                        {children}
                        {/* 3️⃣  the floating panel */}
                        <Popover.Portal>
                            <Popover.Content
                                side="bottom"       /* above | below | left | right */
                                align="start"      /* start | center | end  ↔  vertical */
                                alignOffset={4}     /* fine-tune distance from anchor edge */
                                className="pl-[calc(var(--sidebar-width)+1rem)] pt-2"
                                ref={popoverRef}
                                id="popover-content"
                            >
                                <div className="border border-neutral-200 shadow-xl rounded-xl h-[var(--editor-sidebar-popover-height)] bg-white min-w-[450px]">
                                    {renderPopoverContent()}
                                </div>

                            </Popover.Content>
                        </Popover.Portal>
                    </div>
                </Popover.Root>
            </CanvasProvider>
        </EditorProvider >
    )
}