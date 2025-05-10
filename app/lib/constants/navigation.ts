import { type NavigationItem } from "../types/navigation.types";

export const GLOBAL_NAVIGATION_ITEMS: NavigationItem[] = [
    {
        path: "/",
        iconName: "home",
        label: "Home"
    },
    {
        path: "/projects",
        iconName: "folder-kanban",
        label: "Projects",
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