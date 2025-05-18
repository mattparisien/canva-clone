"use client"

import EditorNavbar from "@/components/layout/navbar"
import { NavigationSidebar } from "@/components/layout/navigation-sidebar"
import { EDITOR_NAVIGATION_ITEMS } from "@/lib/constants/navigation"
import { CanvasProvider } from "@lib/context/canvas-context"
import { EditorProvider } from "@lib/context/editor-context"
import { useRef, useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import './styles/editor.css'; // Import editor-specific styles

export default function EditorLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {


    const [open, setOpen] = useState(false);
    const closeTimeout = useRef<NodeJS.Timeout>(null);

    const handleOpen = () => {
        clearTimeout(closeTimeout.current ? closeTimeout.current : undefined);
        setOpen(true);
    };

    const handleClose = () => {
        // small delay feels better when moving from trigger → content
        closeTimeout.current = setTimeout(() => setOpen(false), 100);
    };

    const handleMouseEnter = (itemId: string) => {
        console.log('here!')
        handleOpen();
    }



    return (
        <EditorProvider>
            <CanvasProvider>
                <Popover.Root open={open} onOpenChange={setOpen}>
                    <div className="flex h-screen flex-col bg-white">
                        <Popover.Anchor>
                            <EditorNavbar />
                        </Popover.Anchor>
                        <div className="flex flex-1 overflow-hidden">
                            <NavigationSidebar
                                items={EDITOR_NAVIGATION_ITEMS}
                                variant="editor"
                                onItemMouseEnter={handleMouseEnter}
                                onItemMouseLeave={handleClose}
                            />
                            {children}
                        </div>
                        {/* 3️⃣  the floating panel */}
                        <Popover.Portal>
                            <Popover.Content
                                side="bottom"       /* above | below | left | right */
                                align="end"      /* start | center | end  ↔  vertical */
                                alignOffset={4}     /* fine-tune distance from anchor edge */
                                onPointerEnter={handleOpen}  /* keep open while hovering panel */
                                onPointerLeave={handleClose}
                            >
                                
                                <Popover.Arrow />
                            </Popover.Content>
                        </Popover.Portal>
                    </div>
                </Popover.Root>
            </CanvasProvider>
        </EditorProvider>
    )
}