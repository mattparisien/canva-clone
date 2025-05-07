"use client"

import { Badge } from "@components/ui/badge"
import { Button } from "@components/ui/button"
import { Card } from "@components/ui/card"
import { Checkbox } from "@components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import { Input } from "@components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip"
import { useToast } from "@components/ui/use-toast"
import { designsAPI } from "@lib/api"
import {
  Clock,
  Filter,
  Grid3x3,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  SlidersHorizontal,
  Star,
  StarOff,
  Trash2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { v4 as uuidv4 } from 'uuid'

// Design interface
interface Design {
  _id: string
  title: string
  type: string
  userId: string
  thumbnail?: string
  category?: string
  starred: boolean
  shared: boolean
  createdAt: string
  updatedAt: string
}

export default function Dashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("all")
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  // Move selected state up here to track all selected items
  const [selectedDesigns, setSelectedDesigns] = useState<Record<string, boolean>>({})

  // Toggle selection of a design
  const toggleDesignSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to the design when clicking the checkbox
    setSelectedDesigns(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  // Check if a design is selected
  const isDesignSelected = (id: string) => !!selectedDesigns[id];

  // Fetch designs from the backend
  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setLoading(true)
        const data = await designsAPI.getAll()
        setDesigns(data)
      } catch (err) {
        console.error('Error fetching designs:', err)
        setError('Failed to load designs. Please try again later.')
        toast({
          title: "Error",
          description: "Failed to load designs. Please try again later.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDesigns()
  }, [toast])

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
  const handleCreatePresentation = async () => {
    try {
      setIsCreating(true)

      // Create default presentation document
      const newDesign = {
        title: `Untitled Design - ${new Date().toLocaleDateString()}`,
        description: "",
        type: "presentation",
        userId: "user123", // Replace with actual user ID from auth
        canvasSize: {
          name: "Presentation 16:9",
          width: 1920,
          height: 1080
        },
        pages: [
          {
            id: uuidv4(),
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

      // Create the document in MongoDB
      const createdDesign = await designsAPI.create(newDesign)

      // Add the newly created design to the state
      setDesigns(prevDesigns => [createdDesign, ...prevDesigns])

      // Navigate to editor with the new design ID
      router.push(`/editor?id=${createdDesign._id}`)

      toast({
        title: "Success",
        description: "New design created successfully!",
        variant: "default"
      })
    } catch (error) {
      console.error("Failed to create design:", error)
      toast({
        title: "Error",
        description: "Failed to create design. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Open existing design
  const handleOpenDesign = (id: string) => {
    router.push(`/editor?id=${id}`)
  }

  // Delete design
  const handleDeleteDesign = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click

    try {
      await designsAPI.delete(id)
      setDesigns(designs.filter(d => d._id !== id))

      toast({
        title: "Success",
        description: "Design deleted successfully!",
        variant: "default"
      })
    } catch (error) {
      console.error("Failed to delete design:", error)
      toast({
        title: "Error",
        description: "Failed to delete design. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Toggle star status
  const toggleStar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click

    const design = designs.find(d => d._id === id)
    if (!design) return

    try {
      const updatedDesign = await designsAPI.update(id, {
        starred: !design.starred
      })

      setDesigns(designs.map(d =>
        d._id === id ? { ...d, starred: !d.starred } : d
      ))
    } catch (error) {
      console.error("Failed to update design:", error)
      toast({
        title: "Error",
        description: "Failed to update design. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Get visible designs based on active tab and search query
  const getVisibleDesigns = () => {
    let filteredDesigns = designs;
    
    // Filter by tab first
    switch (activeTab) {
      case "starred":
        filteredDesigns = filteredDesigns.filter(d => d.starred)
        break
      case "shared":
        filteredDesigns = filteredDesigns.filter(d => d.shared)
        break
      case "recent":
        filteredDesigns = [...filteredDesigns].sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ).slice(0, 3)
        break
    }
    
    // Then filter by search query if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredDesigns = filteredDesigns.filter(
        design => design.title.toLowerCase().includes(query) || 
                (design.category && design.category.toLowerCase().includes(query)) ||
                (design.type && design.type.toLowerCase().includes(query))
      );
    }
    
    return filteredDesigns;
  }

  const getDefaultThumbnail = (index: number) => {
    const thumbnails = [
      "/abstract-geometric-shapes.png",
      "/placeholder.jpg",
      "/placeholder-logo.svg",
      "/abstract-logo.png",
      "/placeholder.svg"
    ]
    return thumbnails[index % thumbnails.length]
  }

  // Get count of selected designs
  const selectedCount = Object.values(selectedDesigns).filter(Boolean).length;
  
  // Delete multiple designs
  const handleDeleteSelectedDesigns = async () => {
    try {
      const selectedIds = Object.entries(selectedDesigns)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => id);
      
      if (selectedIds.length === 0) return;
      
      // Delete each selected design
      await Promise.all(selectedIds.map(id => designsAPI.delete(id)));
      
      // Remove deleted designs from state
      setDesigns(designs.filter(d => !selectedDesigns[d._id]));
      
      // Clear selection
      setSelectedDesigns({});
      
      toast({
        title: "Success",
        description: `${selectedIds.length} ${selectedIds.length === 1 ? 'design' : 'designs'} deleted successfully!`,
        variant: "default"
      });
    } catch (error) {
      console.error("Failed to delete designs:", error);
      toast({
        title: "Error",
        description: "Failed to delete designs. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <main className="container mx-auto pb-10 pt-5 max-w-7xl">
      {/* Hero section */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-teal">Your Workspace</h1>
        <p className="text-gray-500 max-w-3xl">
          Create, edit and share stunning designs. All your creative work in one place.
        </p>
      </div>

      {/* Sticky Tabs and Controls */}
      <div className="sticky top-16 z-40 -mx-4 px-4 py-3 mb-8 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full md:w-auto"
              >
                <TabsList className="bg-gray-100/50 w-full md:w-auto">
                  <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-blue-light data-[state=active]:to-brand-teal-light data-[state=active]:text-gray-800">All</TabsTrigger>
                  <TabsTrigger value="recent" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-blue-light data-[state=active]:to-brand-teal-light data-[state=active]:text-gray-800">Recent</TabsTrigger>
                  <TabsTrigger value="starred" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-blue-light data-[state=active]:to-brand-teal-light data-[state=active]:text-gray-800">Starred</TabsTrigger>
                  <TabsTrigger value="shared" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-blue-light data-[state=active]:to-brand-teal-light data-[state=active]:text-gray-800">Shared</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Search input with fixed left padding to prevent text overlap */}
              <div className="relative w-full md:w-[300px] lg:w-[350px]">
                <div className="absolute inset-y-0 start-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <Input
                  type="search"
                  className="pl-10 py-2 bg-white border border-gray-200 rounded-xl focus-visible:ring-brand-blue/30 focus-visible:ring-offset-0"
                  placeholder="Search designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`rounded-xl ${viewMode === "grid" ? "border-brand-blue text-brand-blue bg-brand-blue/5" : ""}`}
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
                      className={`rounded-xl ${viewMode === "list" ? "border-brand-blue text-brand-blue bg-brand-blue/5" : ""}`}
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
                    <Button variant="outline" size="icon" className="rounded-xl">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Filter</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-xl">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Sort</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleCreatePresentation}
                      disabled={isCreating}
                      className="relative h-14 w-14 rounded-full bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue-dark hover:to-brand-teal-dark text-white shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/40 transition-all duration-300 hover:scale-105"
                    >
                      {isCreating ? (
                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <Plus className="h-6 w-6" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <div className="px-2 py-1 text-sm">Create new design</div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-brand-blue mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500">Loading your designs...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="rounded-full bg-red-100 p-6 mb-4">
            <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2">Failed to Load Designs</h3>
          <p className="text-gray-500 mb-6 max-w-sm">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue-dark hover:to-brand-teal-dark text-white font-medium"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Content when not loading and no error */}
      {!loading && !error && (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Create new presentation card */}
              <Card
                onClick={handleCreatePresentation}
                className={`cursor-pointer group h-[280px] border border-dashed rounded-2xl hover:border-brand-blue bg-gradient-to-br from-white to-gray-50 flex flex-col justify-center items-center hover:shadow-md hover:shadow-brand-blue/10 transition-all duration-300 ${isCreating ? 'opacity-70 pointer-events-none' : ''}`}
              >
                <div className="text-center p-6 transform group-hover:scale-105 transition-transform duration-300">
                  <div className="rounded-full bg-gradient-to-r from-brand-blue-light/20 to-brand-teal-light/20 p-6 mx-auto mb-5 w-20 h-20 flex items-center justify-center group-hover:from-brand-blue-light/30 group-hover:to-brand-teal-light/30 transition-all duration-300">
                    {isCreating ? (
                      <svg className="animate-spin h-8 w-8 text-brand-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Plus className="h-8 w-8 text-brand-blue group-hover:scale-110 transition-transform duration-300" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Create Design</h3>
                  <p className="text-sm text-gray-500">
                    Start with a blank canvas or template
                  </p>
                </div>
              </Card>

              {/* Design cards */}
              {getVisibleDesigns().map((design, index) => {
                const handleCardClick = () => {
                  handleOpenDesign(design._id);
                };
                
                const handleCheckboxClick = (e: React.MouseEvent) => {
                  toggleDesignSelection(design._id, e);
                };
                
                return (
                  <div 
                    key={design._id}
                    className={`group relative rounded-lg overflow-hidden bg-white hover:shadow-md transition-all duration-300 ${
                      isDesignSelected(design._id) ? 'ring-2 ring-brand-blue' : ''
                    }`}
                    onClick={handleCardClick}
                  >
                    {/* Preview thumbnail */}
                    <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative">
                      <img
                        src={design.thumbnail || getDefaultThumbnail(index)}
                        alt={design.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Page count indicator - show for presentations/documents */}
                      {(design.type === "presentation" || design.type === "document") && (
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md backdrop-blur-md">
                          1 of 2
                        </div>
                      )}
                      
                      {/* Selection checkbox - visible on hover or when selected */}
                      <div 
                        className={`absolute top-2 left-2 transition-opacity ${
                          isDesignSelected(design._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                        onClick={handleCheckboxClick}
                      >
                        <div className={`h-6 w-6 rounded border-2 flex items-center justify-center cursor-pointer ${
                          isDesignSelected(design._id) 
                            ? 'bg-brand-blue border-brand-blue text-white' 
                            : 'border-white bg-black/20 backdrop-blur-sm'
                        }`}>
                          {isDesignSelected(design._id) && (
                            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Design info */}
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-gray-900 truncate">{design.title}</h3>
                      <div className="flex items-center mt-1 text-gray-500 text-xs">
                        <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {formatDate(design.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-brand-blue-light/10 to-brand-teal-light/10">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Last Modified
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getVisibleDesigns().map((design, index) => (
                    <tr
                      key={design._id}
                      className="hover:bg-brand-blue-light/5 cursor-pointer transition-colors"
                      onClick={() => handleOpenDesign(design._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-gray-100">
                            <img src={design.thumbnail || getDefaultThumbnail(index)} alt="" className="h-10 w-10 object-cover" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{design.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="bg-brand-teal-light/10 border-brand-teal-light/20">
                          {design.category || design.type || "Design"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(design.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {design.shared && (
                            <Badge variant="secondary" className="bg-brand-blue-light/10 text-brand-blue border-brand-blue-light/20">
                              <Share2 className="h-3 w-3 mr-1" /> Shared
                            </Badge>
                          )}
                          {design.starred && (
                            <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              <Star className="h-3 w-3 mr-1 fill-yellow-500" /> Starred
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8" onClick={(e) => toggleStar(design._id, e)}>
                            {design.starred ? (
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
                            <DropdownMenuContent align="end" className="rounded-xl">
                              <DropdownMenuItem className="cursor-pointer">Rename</DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">Duplicate</DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">Download</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer text-red-500 focus:text-red-500"
                                onClick={(e) => handleDeleteDesign(design._id, e)}
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
          {getVisibleDesigns().length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="rounded-full bg-gradient-to-r from-brand-blue-light/20 to-brand-teal-light/20 p-6 mb-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-blue">
                  <path
                    d="M13 7L11.8845 4.76893C11.5634 4.1261 11.4029 3.80468 11.1634 3.57411C10.9516 3.37225 10.6963 3.21936 10.4161 3.12542C10.0992 3.02 9.74021 3.02 9.02229 3.02H5.2C4.0799 3.02 3.51984 3.02 3.09202 3.24327C2.71569 3.43861 2.41859 3.73571 2.22325 4.11204C2 4.53986 2 5.09992 2 6.22V17.78C2 18.9001 2 19.4602 2.22325 19.888C2.41859 20.2643 2.71569 20.5614 3.09202 20.7568C3.51984 20.98 4.0799 20.98 5.2 20.98H18.8C19.9201 20.98 20.4802 20.98 20.908 20.7568C21.2843 20.5614 21.5814 20.2643 21.7768 19.888C22 19.4602 22 18.9001 22 17.78V10.02C22 8.89992 22 8.33986 21.7768 7.91204C21.5814 7.53571 21.2843 7.23861 20.908 7.04327C20.4802 6.82 19.9201 6.82 18.8 6.82H13ZM13 7H8.61687C8.09853 7 7.83936 7 7.61522 6.9023C7.41806 6.81492 7.25028 6.67546 7.13348 6.49934C7 6.29918 7 6.03137 7 5.49574C7 4.96012 7 4.6923 7.13348 4.49214C7.25028 4.31603 7.41806 4.17657 7.61522 4.08919C7.83936 3.99149 8.09853 3.99149 8.61687 3.99149H9.02229C9.74021 3.99149 10.0992 3.99149 10.4161 4.09692C10.6963 4.19085 10.9516 4.34374 11.1634 4.54561C11.4029 4.77618 11.5634 5.0976 11.8845 5.74043L13 7Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-teal">No designs found</h3>
              <p className="text-gray-500 mb-6 max-w-sm">
                {activeTab === "all"
                  ? "You haven't created any designs yet. Create your first one now!"
                  : activeTab === "starred"
                    ? "You haven't starred any designs yet."
                    : activeTab === "shared"
                      ? "You don't have any shared designs."
                      : "No recent designs found."}
              </p>
              <Button
                onClick={handleCreatePresentation}
                disabled={isCreating}
                className="rounded-2xl bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue-dark hover:to-brand-teal-dark text-white font-medium py-3 h-auto"
              >
                {isCreating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Create Design
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Recently used templates section */}
          {activeTab === "all" && !loading && getVisibleDesigns().length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-teal">Recently Used Templates</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Card key={item} className="cursor-pointer overflow-hidden group h-40 hover:shadow-md transition-all rounded-2xl border-gray-100">
                    <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      <img
                        src={`/placeholder${item % 2 === 0 ? '.jpg' : '.svg'}`}
                        alt={`Template ${item}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/70 to-brand-teal/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Button size="sm" variant="secondary" className="bg-white hover:bg-white/90 text-sm rounded-xl">
                          Use
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Fixed selection popover */}
      {selectedCount > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-xl px-8 py-4 flex items-center gap-6 z-50 min-w-[320px] md:min-w-[400px] border border-gray-100">
          <span className="text-gray-700 font-medium">{selectedCount} selected</span>
          <div className="flex-1"></div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg hover:bg-gray-100"
            onClick={handleDeleteSelectedDesigns}
            aria-label="Delete selected items"
          >
            <Trash2 className="w-10 h-10 text-gray-600" />
          </Button>
        </div>
      )}
    </main>
  )
}