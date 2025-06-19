import { type NavigationItem } from "../types/navigation";

export const GLOBAL_NAVIGATION_ITEMS: NavigationItem[] = [
    {
        id: "home",
        path: "/",
        iconName: "home",
        label: "Home"
    },
    {
        id: "designs",
        path: "/designs",
        iconName: "panel-top",
        label: "Designs"
    },
    // {
    //     id: "projects",
    //     path: "/projects",
    //     iconName: "folder-kanban",
    //     label: "Projects",
    // },
    {
        id: "templates",
        path: "/templates",
        iconName: "layout-template",
        label: "Templates",
    },
    {
        id: "assets",
        path: "/assets",
        iconName: "database",
        label: "Assets",
    },
    // {
    //     id: "chatbot",
    //     path: "/chatbot",
    //     iconName: "message-circle",
    //     label: "Design Assistant",
    // },
    {
        id: "ai-search",
        path: "/ai-search",
        iconName: "brain",
        label: "AI Search",

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