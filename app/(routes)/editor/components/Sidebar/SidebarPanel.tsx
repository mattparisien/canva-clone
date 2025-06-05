import React, { useRef, ReactNode } from 'react';
import * as Popover from "@radix-ui/react-popover";
import useEditorStore from "@/lib/stores/useEditorStore";

interface SidebarPanelProps {
  /** Content to render inside the popover */
  children: ReactNode;
  /** Custom width for the popover. Defaults to 450px */
  width?: number | string;
  /** Custom height for the popover. Defaults to CSS variable --editor-sidebar-popover-height */
  height?: string;
  /** Additional CSS classes for the popover container */
  className?: string;
  /** Custom left padding offset. Defaults to calc(var(--sidebar-width) + 1rem) */
  leftOffset?: string;
  /** Custom top padding offset. Defaults to 0.5rem (pt-2) */
  topOffset?: string;
  /** Whether the popover should be scrollable. Defaults to true */
  scrollable?: boolean;
  /** Custom padding for the popover content. Defaults to 0.5rem (p-2) */
  contentPadding?: string;
}

/**
 * Reusable sidebar panel component that handles the floating panel logic.
 * 
 * This component abstracts the common popover behavior used in the editor sidebar,
 * providing a consistent layout and positioning system while allowing flexible content.
 * 
 * @example
 * ```tsx
 * <SidebarPanel>
 *   <div className="p-6">
 *     <h3>My Content</h3>
 *     <p>Custom popover content goes here</p>
 *   </div>
 * </SidebarPanel>
 * ```
 */
export const SidebarPanel: React.FC<SidebarPanelProps> = ({
  children,
  width = "var(--editor-sidebarPanel-width)",
  height = "var(--editor-sidebarPanel-height)",
  className = "",
  leftOffset = "calc(var(--sidebar-width) + 1rem)",
  topOffset = "0.5rem",
  scrollable = true,
  contentPadding = "0.5rem"
}) => {
  
  const popoverRef = useRef<HTMLDivElement>(null);
  const isOpen = useEditorStore((state) => state.sidebarPanel.isOpen);
  
  // Only render the popover content when it should be open
  if (!isOpen) {
    return null;
  }

  const panelContent = (
    <div
      className={`
          border border-neutral-200 shadow-xl rounded-xl bg-white
          ${scrollable ? 'overflow-y-scroll' : 'overflow-hidden'}
          ${className}
        `}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: height,
        padding: contentPadding,
      }}
    >
      {children}
    </div>
  );

  return (
    <Popover.Content
      side="bottom"
      align="start"
      alignOffset={4}
      ref={popoverRef}
      className="z-sidebar-popover"
      id="sidebar-popover-content"
      style={{
        paddingLeft: leftOffset,
        paddingTop: topOffset,
      }}
      data-editor-interactive="true"
    >
      {panelContent}
    </Popover.Content>
  );
};

export default SidebarPanel;
