"use client";

import { useProjectQuery } from "@/features/projects/use-projects";
import { useAuth } from "@/lib/context/auth-context";
import { NavigationIconName, NavigationItem } from "@/lib/types/navigation.types";
import { cn } from "@/lib/utils/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import {
  FolderKanban,
  Home,
  LayoutTemplate,
  PanelsTopLeft,
  Plus,
  SquareKanban
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { Button } from "../ui/button";


interface SidebarLinkProps {
  href: string;
  iconName: NavigationIconName;
  label: string;
  isActive?: boolean;
}

interface NavigationSidebarProps {
  items: NavigationItem[]
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
    default:
      return <Home {...props} /> // Default fallback
  }
};

const SidebarLink = ({ href, iconName, label, isActive }: SidebarLinkProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center py-3 text-gray-600 hover:text-gray-900 transition-colors group"
      )}
    >
      <div className="relative flex flex-col items-center">
        <div className={cn(
          "w-10 h-10 flex items-center justify-center rounded-md mb-1 transition-all duration-200",
          isActive
            ? "bg-neutral-200/80 text-black shadow-sm"
            : "text-black/80 group-hover:bg-neutral-100"
        )}>
          <IconMapping iconName={iconName} fill={isActive ? "black" : "none"} />
        </div>
        <span className={cn("text-xs", isActive ? "font-medium text-black" : "text-gray-500")}>{label}</span>
      </div>
    </Link>
  );
};


export function NavigationSidebar({ items }: NavigationSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth()
  const { createProject } = useProjectQuery();

  // Fix the active state logic to prevent multiple selections
  const getIsActive = (path: string): boolean => {
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

  const handleCreateProject = async () => {
    try {
      const project = {
        title: 'Untitled Design',
        description: "",
        type: "presentation",
        userId: user?.id, // Replace with actual user ID from auth
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

      // if (newProject) {
      // Redirect to the new project page
      // window.location.href = `/editor?id=${newProject._id}`;
    } catch (error) {
      console.error("Error creating project:", error);
    }
  }

  return (
    <div className="h-screen w-sidebar bg-white flex flex-col fixed left-0 top-0 shadow-[1px_0_10px_rgba(0,0,0,0.01),_3px_0_15px_rgba(0,0,0,0.05)]">
      {/* Create New Button */}
      <div className="p-4 mt-2">
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
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col mt-4">
        {items.map((item) => (
          <SidebarLink
            key={item.path}
            href={item.path}
            iconName={item.iconName}
            label={item.label}
            isActive={getIsActive(item.path)}
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
