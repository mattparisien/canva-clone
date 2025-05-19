"use client"

import EditorNavbar from "@/components/layout/navbar"
import { NavigationSidebar } from "@/components/layout/navigation-sidebar"
import { EDITOR_NAVIGATION_ITEMS } from "@/lib/constants/navigation"
import { CanvasProvider } from "@lib/context/canvas-context"
import { EditorProvider } from "@lib/context/editor-context"
import { useCallback, useRef, useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import classNames from "classnames"
import './styles/Editor.css'; // Import editor-specific styles
import { set } from "lodash"

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

    const closeTimeout = useRef<NodeJS.Timeout>(null);


    const handleMouseEnter = useCallback((itemId: string) => {
        console.log('mouse entered!')
        clearTimeout(closeTimeout.current ? closeTimeout.current : undefined);
        setPopoverState((prev) => ({
            ...prev,
            isOpen: true,
            itemId: itemId,
        }));
    }, [popoverState.itemId]);

    const handleMouseLeave = useCallback((e: React.MouseEvent) => {
        
        if (e.target.contains(e.currentTarget)) return;

        // If the mouse is not on the sidebar or the popover, close the popover
        // if (!sidebarRef.current || !popoverRef.current || e.relatedTarget?.getAttribute("id") === "radix-«r0»") return;

        setPopoverState((prev) => ({
            ...prev,
            isOpen: false,
            itemId: null,
        }));

    }, [])

    const renderPopoverContent = useCallback(() => {
        return <div>{popoverState.itemId}</div>
    }, [popoverState.itemId]);




    return (
        <EditorProvider>
            <CanvasProvider>
                <Popover.Root open={popoverState.isOpen}>
                    <div className={"flex h-screen flex-col"}>
                        <Popover.Anchor>
                            <EditorNavbar />
                        </Popover.Anchor>
                        <NavigationSidebar
                            items={EDITOR_NAVIGATION_ITEMS}
                            variant="editor"
                            onItemMouseEnter={handleMouseEnter}
                            onItemMouseLeave={handleMouseLeave}
                            ref={sidebarRef}
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