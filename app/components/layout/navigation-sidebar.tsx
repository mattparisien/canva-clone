"use client";

import { useProjectQuery } from "@/features/projects/use-projects";
import { NavigationIconName, NavigationItem } from "@/lib/types/navigation.types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import classNames from "classnames";
import {
  Component,
  FolderKanban,
  Home,
  LayoutTemplate,
  PanelsTopLeft,
  Plus,
  Shapes,
  SquareKanban,
  Type,
  Upload
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { Button } from "../ui/button";


interface SidebarLinkProps {
  href: string;
  iconName: NavigationIconName;
  label: string;
  variant?: "global" | "editor";
  isActive?: boolean;
}

interface NavigationSidebarProps {
  items: NavigationItem[],
  variant?: "global" | "editor";
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
    default:
      return <Home {...props} /> // Default fallback
  }
};

const SidebarLink = ({ href, iconName, label, isActive, variant }: SidebarLinkProps) => {
  return (
    <Link
      href={href}
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
  );
};


export function NavigationSidebar({ items, variant = "global" }: NavigationSidebarProps) {
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
      const project = {
        title: 'Untitled Design',
        description: "",
        type: "presentation",
        userId: 1234,
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
    })}>
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
            isActive={getIsActive(item.path || "")}
            variant={variant}
          />
        ))}
      </nav>

      {/* Bottom Fixed Area - Can add more items here if needed */}
      <div className="p-4 mt-auto">
        {/* Placeholder for any bottom items */}
      </div>
    </div>
  );
}
