"use client";

import { useProjectQuery } from "@/features/projects/use-projects";
import { Project } from "@/lib/types/api";
import { NavigationIconName, NavigationItem } from "@/lib/types/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/atoms/tooltip";
import * as Popover from "@radix-ui/react-popover";
import classNames from "classnames";
import {
  Brain,
  Component,
  Database,
  FolderKanban,
  Home,
  LayoutTemplate,
  MessageCircle,
  PanelsTopLeft,
  Plus,
  Shapes,
  SquareKanban,
  Type,
  Upload
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { forwardRef, ReactNode } from "react";
import { v4 as uuid } from "uuid";
import { Button } from "../atoms/button";


export type NavigationItemMouseEnterHandler = (itemId: string) => void;
export type NavigationItemMouseLeaveHandler = (event: React.PointerEvent) => void;


interface SidebarLinkProps {
  href: string;
  iconName: NavigationIconName;
  label: string;
  itemId: string;
  onClick: (itemId: string) => void;
  variant?: "global" | "editor";
  isActive?: boolean;
  className?: string; // Optional className prop
}

interface NavigationSidebarProps {
  items: NavigationItem[],
  variant?: "global" | "editor";
  onItemClick: (itemId: string) => void; // Callback for item click

}

interface ConditionalPopoverTriggerWrapperProps {
  children: ReactNode;
  condition: boolean;
  itemId: string;
  onClick: (itemId: string) => void; // Callback for item click
}

// Icon mapping component that converts string names to actual icons
const IconMapping = ({ iconName, ...props }: { iconName: NavigationIconName } & React.SVGProps<SVGSVGElement>) => {
  switch (iconName) {
    case 'home':
      return <Home {...props} />
    case 'folder-kanban':
      return <FolderKanban {...props} />
    case 'square-kanban':
      return <SquareKanban {...props} />
    case 'panels-top-left':
      return <PanelsTopLeft {...props} />
    case 'layout-template':
      return <LayoutTemplate {...props} />
    case 'component':
      return <Component {...props} />
    case 'type':
      return <Type {...props} />
    case 'upload':
      return <Upload {...props} />
    case 'shapes':
      return <Shapes {...props} />
    case 'database':
      return <Database {...props} />
    case 'brain':
      return <Brain {...props} />
    case 'message-circle':
      return <MessageCircle {...props} />
    default:
      return <Home {...props} /> // Default fallback
  }
};


export const NavigationSidebar = forwardRef<HTMLDivElement, NavigationSidebarProps>(({ items, variant = "global", onItemClick }: NavigationSidebarProps, ref) => {
  const pathname = usePathname();
  const router = useRouter();
  const { createProject } = useProjectQuery();

  // Fix the active state logic to prevent multiple selections
  const getIsActive = (path: string): boolean => {

    if (!path || path.trim() === "") return false;

    // Exact match for home page
    if (path === '/' && pathname === '/') {
      return true;
    }

    // For other paths, check if it's an exact match or in the correct section
    // But exclude the root path to prevent "/" matching with everything
    if (path !== '/') {
      // Match either exact path or path with trailing slash to prevent partial matches
      return pathname === path ||
        pathname === `${path}/` ||
        (pathname.startsWith(`${path}/`) && !pathname.slice(path.length + 1).includes('/'));
    }

    return false;
  };

  // Move handleCreateProject to an event handler instead of render-time execution
  const handleCreateProject = async () => {
    try {
      const project: Project = {
        _id: uuid(),
        isTemplate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: 'Untitled Design',
        description: "",
        type: "presentation",
        userId: "1234",
        canvasSize: {
          name: "Presentation 16:9",
          width: 1920,
          height: 1080
        },
        pages: [
          {
            id: uuid(),
            canvasSize: {
              name: "Presentation 16:9",
              width: 1920,
              height: 1080
            },
            elements: [],
            background: {
              type: "color",
              value: "#ffffff"
            }
          }
        ],
        starred: false,
        shared: false
      }

      const newProject = await createProject(project);
      if (newProject) router.push(`/editor?id=${newProject._id}`);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  }

  return (
    <div className={classNames("h-screen w-sidebar z-sidebar flex flex-col fixed left-0 top-0", {
      "bg-white": variant !== "editor",
      "bg-editor": variant === "editor",
      "shadow-[1px_0_10px_rgba(0,0,0,0.01),_3px_0_15px_rgba(0,0,0,0.05)]": variant !== "editor",
      "pt-header": variant === "editor"
    })}
      ref={ref}
      data-sidebar
    >
      {/* Create New Button */}
      {variant === "global" && <div className="p-4 mt-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="group relative h-14 w-14 rounded-full shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/40 transition-all duration-300 overflow-hidden"
                onClick={handleCreateProject}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-brand-blue to-brand-teal transition-opacity duration-200 ease-in-out"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-brand-blue-dark to-brand-teal-dark opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out"></span>
                <span className="relative z-10">
                  <Plus className="text-white transition-transform duration-300 group-hover:scale-110" style={{
                    width: "1.3rem",
                    height: "1.3rem",
                  }} />
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Create New</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>}

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col mt-4">
        {items.map((item, idx) => (
          <SidebarLink
            key={idx}
            href={item.path ?? "#"}
            iconName={item.iconName}
            label={item.label}
            itemId={item.id} // Pass item.id to SidebarLink
            isActive={getIsActive(item.path || "")}
            onClick={onItemClick}
            variant={variant}
          // Pass the callback to the renamed prop 'onItemHover'
          />
        ))}
      </nav>
    </div>
  );
});

const SidebarLink = forwardRef<HTMLAnchorElement, SidebarLinkProps>(
  ({
    href,
    iconName,
    label,
    itemId,
    isActive,
    variant,
    className,
    onClick,
    ...rest       // Other HTML attributes
  }: SidebarLinkProps, ref) => {

    return (
      <aside
        className={classNames("relative", className)} // Merge passed className
        {...rest} // Spread other HTML attributes
      >
        <ConditionalPopoverTriggerWrapper itemId={itemId} condition={variant === "editor"} onClick={onClick}>

          <Link
            href={href}
            ref={ref}
            className={classNames("flex flex-col items-center justify-center py-3 transition-colors group")}
          >
            <div className="relative flex flex-col items-center">
              <div className={classNames("w-9 h-9 flex items-center justify-center rounded-xl mb-1 transition-all duration-200", {
                "bg-neutral-200 text-black shadow-sm": isActive,
                " group-hover:bg-neutral-100": !isActive && variant !== "editor",
                "text-gray-500 group-hover:bg-white group-hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] group-hover:text-primary": !isActive && variant === "editor",
              })} >
                <IconMapping iconName={iconName} fill={isActive ? "black" : "none"} />
              </div>
              <span className={classNames("text-xs", {
                "text-black": isActive,
                "text-gray-500": !isActive,
              })
              }>{label}</span>
            </div>
          </Link >
        </ConditionalPopoverTriggerWrapper>

      </aside>
    );
  });
SidebarLink.displayName = "SidebarLink"; // Good practice for forwardRef components



function ConditionalPopoverTriggerWrapper({ children, condition, onClick, itemId }: ConditionalPopoverTriggerWrapperProps) {
  if (!condition) {
    return <>{children}</>; // Return children directly if condition is false
  }
  return (
    <Popover.Trigger
      asChild
      onClick={() => onClick(itemId)}
    >

      {children}
    </Popover.Trigger>
  )
}
