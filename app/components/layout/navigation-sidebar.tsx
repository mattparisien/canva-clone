"use client";

import { NavigationItem, NavigationIconName } from "@/lib/types/navigation.types";
import { cn } from "@/lib/utils/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import {
  Plus,
  Home,
  FolderKanban,
  SquareKanban,
  PanelsTopLeft
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
          <IconMapping iconName={iconName} />
        </div>
        <span className={cn("text-xs", isActive ? "font-medium text-black" : "text-gray-500")}>{label}</span>
      </div>
    </Link>
  );
};


export function NavigationSidebar({ items }: NavigationSidebarProps) {
  const pathname = usePathname();

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

  return (
    <div className="h-screen w-sidebar bg-white flex flex-col fixed left-0 top-0 shadow-[1px_0_10px_rgba(0,0,0,0.01),_3px_0_15px_rgba(0,0,0,0.05)]">
      {/* Create New Button */}
      <div className="p-4 mt-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="group relative h-14 w-14 rounded-full shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/40 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-brand-blue to-brand-teal transition-opacity duration-200 ease-in-out"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-brand-blue-dark to-brand-teal-dark opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out"></span>
                <span className="relative z-10">
                  {/* {isCreating ? (
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Plus className="text-white transition-transform duration-300 group-hover:scale-110" style={{
                      width: "1.3rem",
                      height: "1.3rem",
                    }} />
                  )} */}
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

// Filled versions of the icons
function HomeFilled(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function FolderFilled(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CalendarFilled(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" stroke="white" strokeWidth="2" />
      <line x1="8" y1="2" x2="8" y2="6" stroke="white" strokeWidth="2" />
      <line x1="3" y1="10" x2="21" y2="10" stroke="white" strokeWidth="2" />
    </svg>
  );
}

function LightbulbFilled(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
    </svg>
  );
}

// Custom icons with fill property
function TemplateIcon(props: React.SVGProps<SVGSVGElement>) {
  const { fill = "none", ...rest } = props;
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={fill === "none" ? "2" : "1"}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" stroke={fill === "currentColor" ? "white" : "currentColor"} strokeWidth="2" />
      <path d="M9 21V9" stroke={fill === "currentColor" ? "white" : "currentColor"} strokeWidth="2" />
    </svg>
  );
}

function PuzzleIcon(props: React.SVGProps<SVGSVGElement>) {
  const { fill = "none", ...rest } = props;
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={fill === "none" ? "2" : "1"}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M4 7h3a1 1 0 0 0 1-1V5a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a2 2 0 0 0 0 4h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-1a2 2 0 0 0-4 0v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H4a2 2 0 0 1 0-4h1a1 1 0 0 0 1-1V8a1 1 0 0 1 1-1z" stroke={fill === "currentColor" ? "white" : "currentColor"} />
    </svg>
  );
}