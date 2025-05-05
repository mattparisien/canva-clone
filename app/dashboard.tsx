"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Trash2, 
  Share2, 
  MoreHorizontal, 
  Star, 
  StarOff,
  Grid3x3,
  List,
  Filter,
  SlidersHorizontal,
  Clock
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// More realistic presentation data with categories
const initialPresentations = [
  {
    id: "pres-1",
    title: "Marketing Strategy 2025",
    lastModified: "2025-05-01T10:30:00Z",
    thumbnail: "/abstract-geometric-shapes.png",
    category: "Marketing",
    starred: true,
    shared: true,
  },
  {
    id: "pres-2",
    title: "Q2 Sales Results",
    lastModified: "2025-04-28T14:45:00Z",
    thumbnail: "/placeholder.jpg",
    category: "Sales",
    starred: false,
    shared: true,
  },
  {
    id: "pres-3",
    title: "Product Launch Plan",
    lastModified: "2025-04-25T09:15:00Z",
    thumbnail: "/placeholder-logo.svg",
    category: "Product",
    starred: false,
    shared: false,
  },
  {
    id: "pres-4",
    title: "Company Branding Guidelines",
    lastModified: "2025-04-22T16:20:00Z",
    thumbnail: "/abstract-logo.png",
    category: "Design",
    starred: true,
    shared: false,
  },
  {
    id: "pres-5",
    title: "Annual Report 2024",
    lastModified: "2025-04-18T11:05:00Z",
    thumbnail: "/placeholder.svg",
    category: "Finance",
    starred: false,
    shared: true,
  }
]

export default function Dashboard() {
  const router = useRouter()
  const [presentations, setPresentations] = useState(initialPresentations)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("all")
  
  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const differenceInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24))

    if (differenceInDays === 0) {
      return "Today, " + date.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit'
      })
    } else if (differenceInDays === 1) {
      return "Yesterday, " + date.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit'
      })
    } else if (differenceInDays < 7) {
      return `${differenceInDays} days ago`
    } else {
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
      })
    }
  }
  
  // Create new presentation
  const handleCreatePresentation = () => {
    router.push('/editor')
  }
  
  // Open existing presentation
  const handleOpenPresentation = (id: string) => {
    router.push(`/editor?id=${id}`)
  }
  
  // Delete presentation
  const handleDeletePresentation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click
    setPresentations(presentations.filter(p => p.id !== id))
  }
  
  // Toggle star status
  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click
    setPresentations(presentations.map(p => 
      p.id === id ? { ...p, starred: !p.starred } : p
    ))
  }

  // Get visible presentations based on active tab
  const getVisiblePresentations = () => {
    switch(activeTab) {
      case "starred":
        return presentations.filter(p => p.starred)
      case "shared":
        return presentations.filter(p => p.shared)
      case "recent":
        return [...presentations].sort((a, b) => 
          new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        ).slice(0, 3)
      default:
        return presentations
    }
  }
  
  return (
    <main className="container mx-auto py-10 max-w-7xl">
      {/* Hero section */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Your Workspace</h1>
        <p className="text-gray-500 max-w-3xl">
          Create, edit and share stunning presentations. All your creative work in one place.
        </p>
      </div>
      
      {/* Tabs and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList className="bg-gray-100/50 w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="starred">Starred</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`rounded-md ${viewMode === "grid" ? "bg-gray-100" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid view</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`rounded-md ${viewMode === "list" ? "bg-gray-100" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>List view</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-md">
                  <Filter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Filter</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-md">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sort</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button onClick={handleCreatePresentation} className="rounded-md bg-gradient-to-r from-[#2ec4e6] to-[#7c3aed] hover:opacity-90 transition-opacity">
            <Plus className="mr-2 h-4 w-4" /> New
          </Button>
        </div>
      </div>
      
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Create new presentation card */}
          <Card 
            onClick={handleCreatePresentation}
            className="cursor-pointer group h-[280px] border border-dashed hover:border-primary bg-gradient-to-br from-white to-gray-50 flex flex-col justify-center items-center hover:shadow-md hover:shadow-primary/5 transition-all duration-300"
          >
            <div className="text-center p-6 transform group-hover:scale-105 transition-transform duration-300">
              <div className="rounded-full bg-gradient-to-r from-[#2ec4e6]/10 to-[#7c3aed]/10 p-6 mx-auto mb-5 w-20 h-20 flex items-center justify-center group-hover:from-[#2ec4e6]/20 group-hover:to-[#7c3aed]/20 transition-all duration-300">
                <Plus className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Create Presentation</h3>
              <p className="text-sm text-gray-500">
                Start with a blank canvas or template
              </p>
            </div>
          </Card>
          
          {/* Presentation cards */}
          {getVisiblePresentations().map((presentation) => (
            <Card 
              key={presentation.id} 
              className="cursor-pointer overflow-hidden h-[280px] hover:shadow-lg transition-all duration-300 group border-gray-100"
              onClick={() => handleOpenPresentation(presentation.id)}
            >
              <div className="h-[160px] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                <img 
                  src={presentation.thumbnail} 
                  alt={presentation.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  {presentation.shared && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white">
                            <Share2 className="h-3.5 w-3.5" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Shared</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="bg-gray-50 text-xs font-normal">
                    {presentation.category}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => toggleStar(presentation.id, e)} className="text-gray-400 hover:text-yellow-400 transition-colors">
                      {presentation.starred ? (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="cursor-pointer">Rename</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">Download</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer text-red-500 focus:text-red-500"
                          onClick={(e) => handleDeletePresentation(presentation.id, e)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <h3 className="font-medium text-base truncate">{presentation.title}</h3>
                <div className="flex items-center mt-2 text-gray-500">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  <span className="text-xs">
                    {formatDate(presentation.lastModified)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getVisiblePresentations().map((presentation) => (
                <tr 
                  key={presentation.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleOpenPresentation(presentation.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-gray-100">
                        <img src={presentation.thumbnail} alt="" className="h-10 w-10 object-cover" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{presentation.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className="bg-gray-50">
                      {presentation.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(presentation.lastModified)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {presentation.shared && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Share2 className="h-3 w-3 mr-1" /> Shared
                        </Badge>
                      )}
                      {presentation.starred && (
                        <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <Star className="h-3 w-3 mr-1 fill-yellow-500" /> Starred
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8" onClick={(e) => toggleStar(presentation.id, e)}>
                        {presentation.starred ? (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Share2 className="h-4 w-4 text-gray-500" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8">
                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer">Rename</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">Duplicate</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">Download</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="cursor-pointer text-red-500 focus:text-red-500"
                            onClick={(e) => handleDeletePresentation(presentation.id, e)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Empty state */}
      {getVisiblePresentations().length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="rounded-full bg-gray-100 p-6 mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M13 7L11.8845 4.76893C11.5634 4.1261 11.4029 3.80468 11.1634 3.57411C10.9516 3.37225 10.6963 3.21936 10.4161 3.12542C10.0992 3.02 9.74021 3.02 9.02229 3.02H5.2C4.0799 3.02 3.51984 3.02 3.09202 3.24327C2.71569 3.43861 2.41859 3.73571 2.22325 4.11204C2 4.53986 2 5.09992 2 6.22V17.78C2 18.9001 2 19.4602 2.22325 19.888C2.41859 20.2643 2.71569 20.5614 3.09202 20.7568C3.51984 20.98 4.0799 20.98 5.2 20.98H18.8C19.9201 20.98 20.4802 20.98 20.908 20.7568C21.2843 20.5614 21.5814 20.2643 21.7768 19.888C22 19.4602 22 18.9001 22 17.78V10.02C22 8.89992 22 8.33986 21.7768 7.91204C21.5814 7.53571 21.2843 7.23861 20.908 7.04327C20.4802 6.82 19.9201 6.82 18.8 6.82H13ZM13 7H8.61687C8.09853 7 7.83936 7 7.61522 6.9023C7.41806 6.81492 7.25028 6.67546 7.13348 6.49934C7 6.29918 7 6.03137 7 5.49574C7 4.96012 7 4.6923 7.13348 4.49214C7.25028 4.31603 7.41806 4.17657 7.61522 4.08919C7.83936 3.99149 8.09853 3.99149 8.61687 3.99149H9.02229C9.74021 3.99149 10.0992 3.99149 10.4161 4.09692C10.6963 4.19085 10.9516 4.34374 11.1634 4.54561C11.4029 4.77618 11.5634 5.0976 11.8845 5.74043L13 7Z"
                stroke="#71717A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2">No presentations found</h3>
          <p className="text-gray-500 mb-6 max-w-sm">
            {activeTab === "all" 
              ? "You haven't created any presentations yet. Create your first one now!"
              : activeTab === "starred"
                ? "You haven't starred any presentations yet."
                : activeTab === "shared" 
                  ? "You don't have any shared presentations."
                  : "No recent presentations found."}
          </p>
          <Button onClick={handleCreatePresentation} className="rounded-md bg-gradient-to-r from-[#2ec4e6] to-[#7c3aed]">
            <Plus className="mr-2 h-4 w-4" /> Create Presentation
          </Button>
        </div>
      )}

      {/* Recently used templates section */}
      {activeTab === "all" && getVisiblePresentations().length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-semibold mb-6">Recently Used Templates</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="cursor-pointer overflow-hidden group h-40 hover:shadow-md transition-all">
                <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  <img 
                    src={`/placeholder${item % 2 === 0 ? '.jpg' : '.svg'}`}
                    alt={`Template ${item}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Button size="sm" variant="secondary" className="bg-white hover:bg-white/90 text-sm">
                      Use
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
    </main>
  )
}