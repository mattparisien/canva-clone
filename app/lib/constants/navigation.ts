import { type NavigationItem } from "../types/navigation.types";

export const GLOBAL_NAVIGATION_ITEMS: NavigationItem[] = [
    {
        id: "design",
        path: "/",
        iconName: "home",
        label: "Home"
    },
    {
        id: "projects",
        path: "/projects",
        iconName: "folder-kanban",
        label: "Projects",
    },
    {
        id: "templates",
        path: "/templates",
        iconName: "layout-template",
        label: "Templates",
    },
    {
        id: "brands",
        path: "/brands",
        iconName: "square-kanban",
        label: 'Brands'
    }
]

export const EDITOR_NAVIGATION_ITEMS: NavigationItem[] = [
    {
        id: "design",
        iconName: "component",
        label: "Design"
    },
    {
        id: "elements",
        iconName: "shapes",
        label: "Elements",
    },
    {
        id: "text",
        iconName: "type",
        label: "Text",
    },
    {
        id: "uploads",
        iconName: "upload",
        label: 'Uploads'
    }
]