"use client"

import EditorNavbar from "@/components/layout/navbar"
import { NavigationSidebar } from "@/components/layout/navigation-sidebar"
import { EDITOR_NAVIGATION_ITEMS } from "@/lib/constants/navigation"
import { CanvasProvider } from "@lib/context/canvas-context"
import { EditorProvider } from "@lib/context/editor-context"
import * as Popover from "@radix-ui/react-popover"
import './styles/editor.css' // Import editor-specific styles

export default function EditorLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {


    const handleMouseEnter = (itemId: string) => {
        console.log(itemId);
    }

    return (
        <EditorProvider>
            <CanvasProvider>
                <Popover.Root onOpenChange={(open) => {console.log(open)}}>
                    <div className="flex h-screen flex-col bg-white">
                        <Popover.Anchor>
                            <EditorNavbar />
                        </Popover.Anchor>
                        <div className="flex flex-1 overflow-hidden">
                            <NavigationSidebar
                                items={EDITOR_NAVIGATION_ITEMS}
                                variant="editor"
                                onItemMouseEnter={handleMouseEnter}
                            />
                            {children}
                        </div>
                        {/* 3️⃣  the floating panel */}
                        <Popover.Portal>
                            <Popover.Content
                                side="bottom"       /* above | below | left | right */
                                align="end"      /* start | center | end  ↔  vertical */
                                alignOffset={4}     /* fine-tune distance from anchor edge */
                            >
                                …popover contents…
                                <Popover.Arrow />
                            </Popover.Content>
                        </Popover.Portal>
                    </div>
                </Popover.Root>
            </CanvasProvider>
        </EditorProvider>
    )
}