import { NavigationSidebar } from "@/components/layout/navigation-sidebar";
import { EDITOR_NAVIGATION_ITEMS } from "@/lib/constants/navigation";
import useEditorStore from "@/lib/stores/useEditorStore";
import { SidebarPanelMode } from "@/lib/types/sidebar";
import { useCallback } from "react";

interface EditorSidebarProps {
    onTextColorChange?: (color: string) => void;
    onBackgroundColorChange?: (color: string) => void;
}


const EditorSidebar = ({ onTextColorChange, onBackgroundColorChange }: EditorSidebarProps) => {
    const openSidebarPanel = useEditorStore((state) => state.openSidebarPanel);

    const handleItemClick = useCallback((itemId: string) => {
        openSidebarPanel(itemId, SidebarPanelMode.POPOVER);
    }, [openSidebarPanel]);

    return (
        <>
            <NavigationSidebar
                items={EDITOR_NAVIGATION_ITEMS}
                variant="editor"
                onItemClick={handleItemClick}
            />
        </>
    );
};

export default EditorSidebar;