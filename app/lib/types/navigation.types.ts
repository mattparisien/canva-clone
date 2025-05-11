import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes, ReactNode, ComponentType } from "react";

// Original icon type (keeping for reference)
export type NavigationItemIcon = 
  | ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>> 
  | ComponentType<React.SVGProps<SVGSVGElement>>
  | ReactNode;

// New icon type that uses string names instead of components
export type NavigationIconName = 'home' | 'folder-kanban' | 'square-kanban' | 'panels-top-left' | 'layout-template';

export interface NavigationItem {
    path: string;
    iconName: NavigationIconName; // Changed from icon to iconName
    label: string;
}