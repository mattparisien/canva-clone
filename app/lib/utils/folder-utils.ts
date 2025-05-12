import type { BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { FolderIcon } from "lucide-react";
import React from "react";

/**
 * Converts folder path segments into breadcrumb items for navigation
 * @param paths An array of path segments (e.g. ["root", "projects", "design"])
 * @param slugMap A mapping of segment names to their corresponding slugs for linking
 * @returns An array of breadcrumb items ready to use in the Breadcrumbs component
 */
export function pathToBreadcrumbs(
  paths: string[],
  slugMap: Record<string, string> = {}
): BreadcrumbItem[] {
  if (!paths || !Array.isArray(paths) || paths.length === 0) {
    // Default to just the root if no paths
    return [
      {
        label: "Root",
        href: "/files",
        icon: React.createElement(FolderIcon, { className: "h-4 w-4" })
      }
    ];
  }

  return paths.map((segment, index) => {
    // For each segment, create a breadcrumb item
    const isLast = index === paths.length - 1;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1); // Capitalize first letter

    // Build the href based on the segment and any provided slug mappings
    const slug = slugMap[segment] || segment;
    const href = index === 0 ? "/files" : `/folder/${slug}`;

    return {
      label,
      href: isLast ? undefined : href, // Last item doesn't need a link
      icon: React.createElement(FolderIcon, { className: "h-4 w-4" })
    };
  });
}

/**
 * Builds a folder path string from its path segments
 * @param paths An array of folder path segments
 * @returns A path string with segments joined by forward slashes
 */
export function buildFolderPathString(paths: string[]): string {
  if (!paths || !Array.isArray(paths) || paths.length === 0) {
    return "/";
  }

  return "/" + paths.join("/");
}