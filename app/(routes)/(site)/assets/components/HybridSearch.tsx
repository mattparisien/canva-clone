"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Asset } from "@/lib/types/api"
import { cn } from "@/lib/utils/utils"
import { Filter, Loader2, Search, Sparkles, X, Zap } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

interface HybridSearchProps {
  onSearchResults: (results: Asset[], isVectorSearch: boolean, query: string) => void
  onClearSearch: () => void
  className?: string
}

interface VectorSearchResult extends Asset {
  similarity: number
}

interface VectorSearchResponse {
  query: string
  results: VectorSearchResult[]
  total: number
}

export function HybridSearch({ onSearchResults, onClearSearch, className }: HybridSearchProps) {
  const { toast } = useToast()

  // Search state
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchMode, setSearchMode] = useState<"traditional" | "vector" | "hybrid">("traditional")
  const [vectorEnabled, setVectorEnabled] = useState(false)
  const [similarityThreshold, setSimilarityThreshold] = useState([0.78])
  const [maxResults, setMaxResults] = useState([20])
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Results state
  const [lastQuery, setLastQuery] = useState("")
  const [vectorResults, setVectorResults] = useState<VectorSearchResult[]>([])
  const [hasResults, setHasResults] = useState(false)

  // Handle search execution
  const executeSearch = useCallback(async (searchQuery: string, mode: typeof searchMode) => {
    if (!searchQuery.trim()) {
      onClearSearch()
      setHasResults(false)
      setVectorResults([])
      return
    }

    setIsSearching(true)
    setLastQuery(searchQuery)

    try {
      if (mode === "vector" || mode === "hybrid") {
        // Import the assets API for vector search
        const { assetsAPI } = await import("@/lib/api")

        const vectorResponse: VectorSearchResponse = await assetsAPI.searchByVector(searchQuery, {
          limit: maxResults[0],
          threshold: similarityThreshold[0]
        })

        setVectorResults(vectorResponse.results)

        if (mode === "vector") {
          // Pure vector search
          onSearchResults(vectorResponse.results, true, searchQuery)
          setHasResults(vectorResponse.results.length > 0)
        } else {
          // Hybrid: combine with traditional search
          // For now, prioritize vector results but this could be enhanced
          onSearchResults(vectorResponse.results, true, searchQuery)
          setHasResults(vectorResponse.results.length > 0)
        }

        if (vectorResponse.results.length === 0) {
          toast({
            title: "No similar assets found",
            description: "Try adjusting your search terms or lowering the similarity threshold.",
          })
        }
      } else {
        // Traditional text search - handled by parent component
        onSearchResults([], false, searchQuery)
        setHasResults(true)
        setVectorResults([])
      }
    } catch (error) {
      console.error("Search failed:", error)
      toast({
        title: "Search failed",
        description: "There was an error performing the search. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSearching(false)
    }
  }, [onSearchResults, onClearSearch, maxResults, similarityThreshold, toast])

  // Handle search form submission
  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    executeSearch(query, searchMode)
  }, [query, searchMode, executeSearch])

  // Handle clear search
  const handleClear = useCallback(() => {
    setQuery("")
    setLastQuery("")
    setVectorResults([])
    setHasResults(false)
    onClearSearch()
  }, [onClearSearch])

  // Auto-search as user types (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query !== lastQuery) {
        executeSearch(query, searchMode)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [query, searchMode, lastQuery, executeSearch])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={
              searchMode === "vector"
                ? "Describe what you're looking for..."
                : searchMode === "hybrid"
                  ? "Search by name, description, or visual similarity..."
                  : "Search assets by name or tag..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-20"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-12 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
          )}
        </div>

        <Button
          type="button"
          variant={showAdvanced ? "default" : "outline"}
          size="icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </form>

      {/* Search Mode Tabs */}
      <Tabs value={searchMode} onValueChange={(value) => setSearchMode(value as typeof searchMode)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="traditional" className="flex items-center gap-2">
            <Search className="h-3 w-3" />
            Text
          </TabsTrigger>
          <TabsTrigger value="vector" className="flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            AI Search
          </TabsTrigger>
          <TabsTrigger value="hybrid" className="flex items-center gap-2">
            <Zap className="h-3 w-3" />
            Hybrid
          </TabsTrigger>
        </TabsList>

        <TabsContent value="traditional" className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Search by asset name, filename, and tags using exact text matching.
          </p>
        </TabsContent>

        <TabsContent value="vector" className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Search using AI-powered semantic understanding to find visually and conceptually similar assets.
          </p>
        </TabsContent>

        <TabsContent value="hybrid" className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Combines traditional text search with AI-powered semantic search for comprehensive results.
          </p>
        </TabsContent>
      </Tabs>

      {/* Advanced Options */}
      {showAdvanced && (searchMode === "vector" || searchMode === "hybrid") && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Search Settings
            </CardTitle>
            <CardDescription>
              Fine-tune the semantic search parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Similarity Threshold: {(similarityThreshold[0] * 100).toFixed(0)}%
              </Label>
              <Slider
                value={similarityThreshold}
                onValueChange={setSimilarityThreshold}
                max={1}
                min={0.1}
                step={0.05}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Higher values show only very similar results, lower values show more diverse matches.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Max Results: {maxResults[0]}
              </Label>
              <Slider
                value={maxResults}
                onValueChange={setMaxResults}
                max={50}
                min={5}
                step={5}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results Info */}
      {hasResults && lastQuery && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {searchMode === "vector" || searchMode === "hybrid" ? (
              <>
                <Sparkles className="h-3 w-3" />
                AI search for "{lastQuery}"
              </>
            ) : (
              <>
                <Search className="h-3 w-3" />
                Text search for "{lastQuery}"
              </>
            )}
          </div>

          {vectorResults.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {vectorResults.length} semantic matches
            </Badge>
          )}
        </div>
      )}

      {/* Vector Results Preview */}
      {searchMode === "vector" && vectorResults.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Similarity Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {vectorResults.slice(0, 5).map((result) => (
                <div key={result._id} className="flex items-center justify-between text-xs">
                  <span className="truncate flex-1 mr-2">{result.name}</span>
                  <Badge
                    variant={result.similarity > 0.8 ? "default" : "secondary"}
                    className="text-xs px-1 py-0"
                  >
                    {(result.similarity * 100).toFixed(0)}%
                  </Badge>
                </div>
              ))}
              {vectorResults.length > 5 && (
                <p className="text-xs text-muted-foreground pt-1">
                  + {vectorResults.length - 5} more results
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
