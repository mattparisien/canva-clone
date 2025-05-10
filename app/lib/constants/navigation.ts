import { type NavigationItem } from "../types/navigation.types";

export const GLOBAL_NAVIGATION_ITEMS: NavigationItem[] = [
    {
        path: "/",
        iconName: "home",
        label: "Home"
    },
    {
        path: "/files",
        iconName: "folder-kanban",
        label: "Files",
    },
    {
        path: "/brands",
        iconName: "square-kanban",
        label: 'Brands'
    },
    {
        path: "/templates",
        iconName: "panels-top-left",
        label: "Templates",
    }
]