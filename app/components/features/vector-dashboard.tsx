import React, { useState, useEffect } from 'react'
import { 
  Database, 
  RefreshCw, 
  Zap, 
  BarChart3, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Progress } from '@components/ui/progress'
import { Badge } from '@components/ui/badge'
import { useAssets } from '@features/assets/use-assets'

// Simple toast hook placeholder since the original import fails
const useToast = () => ({
  toast: ({ title, description, variant }: { title: string; description?: string; variant?: string }) => {
    console.log(`Toast: ${title} - ${description}`)
  }
})

interface VectorStats {
  user: string
  assets: {
    total: number
    vectorized: number
    pending: number
    vectorizationRate: string
  }
  vectorStore: any
  queueStats: any
}

interface VectorDashboardProps {
  userId?: string
  className?: string
}

export function VectorDashboard({ userId, className }: VectorDashboardProps) {
  const [stats, setStats] = useState<VectorStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isReVectorizing, setIsReVectorizing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { getVectorStats, processVectorJobs, reVectorizeAssets } = useAssets()
  const { toast } = useToast()

  const loadStats = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const vectorStats = await getVectorStats(userId)
      setStats(vectorStats)
    } catch (err: any) {
      setError(err.message || 'Failed to load vector statistics')
      console.error('Error loading vector stats:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcessJobs = async () => {
    setIsProcessing(true)
    
    try {
      const result = await processVectorJobs(userId)
      toast({
        title: "Processing Started",
        description: `${result.processed || 0} assets queued for vectorization`
      })
      
      // Refresh stats after a delay
      setTimeout(loadStats, 2000)
    } catch (err: any) {
      toast({
        title: "Processing Failed",
        description: err.message || 'Failed to process vector jobs',
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReVectorize = async () => {
    setIsReVectorizing(true)
    
    try {
      const result = await reVectorizeAssets(userId)
      toast({
        title: "Re-vectorization Started",
        description: `${result.processed || 0} assets queued for re-vectorization`
      })
      
      // Refresh stats after a delay
      setTimeout(loadStats, 2000)
    } catch (err: any) {
      toast({
        title: "Re-vectorization Failed",
        description: err.message || 'Failed to re-vectorize assets',
        variant: "destructive"
      })
    } finally {
      setIsReVectorizing(false)
    }
  }

  useEffect(() => {
    loadStats()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [userId])

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 font-medium">Failed to load vector dashboard</p>
          <p className="text-sm text-gray-600">{error}</p>
          <Button onClick={loadStats} variant="outline" size="sm" className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !stats) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
          <p>Loading vector store statistics...</p>
        </CardContent>
      </Card>
    )
  }

  const vectorizationProgress = parseFloat(stats.assets.vectorizationRate)
  const isFullyVectorized = stats.assets.pending === 0

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Asset Statistics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asset Vectorization</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{vectorizationProgress.toFixed(1)}%</span>
                </div>
                <Progress value={vectorizationProgress} className="w-full" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.assets.vectorized}</div>
                  <div className="text-xs text-gray-500">Vectorized</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{stats.assets.pending}</div>
                  <div className="text-xs text-gray-500">Pending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.assets.total}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Queue</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Jobs in Queue</span>
                <Badge variant={stats.queueStats.totalJobs > 0 ? "default" : "secondary"}>
                  {stats.queueStats.totalJobs || 0}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Currently Processing</span>
                <Badge variant={stats.queueStats.processing > 0 ? "destructive" : "secondary"}>
                  {stats.queueStats.processing || 0}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {stats.queueStats.processing > 0 ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                    <span className="text-sm text-orange-600">Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Idle</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vector Store Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vector Store</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={stats.vectorStore?.isAvailable ? "default" : "destructive"}>
                  {stats.vectorStore?.isAvailable ? "Available" : "Unavailable"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Type</span>
                <Badge variant="outline">
                  {stats.vectorStore?.type || "Unknown"}
                </Badge>
              </div>
              
              {stats.vectorStore?.totalVectors && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Vectors</span>
                  <span className="text-sm font-medium">{stats.vectorStore.totalVectors}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Vector Store Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={loadStats} 
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Stats
            </Button>
            
            <Button 
              onClick={handleProcessJobs}
              disabled={isProcessing || stats.assets.pending === 0}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Process Pending ({stats.assets.pending})
            </Button>
            
            <Button 
              onClick={handleReVectorize}
              variant="secondary"
              disabled={isReVectorizing || stats.assets.total === 0}
            >
              {isReVectorizing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Re-vectorize All
            </Button>
          </div>
          
          {isFullyVectorized && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  All assets are vectorized and ready for AI search!
                </span>
              </div>
            </div>
          )}
          
          {stats.assets.pending > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span className="text-orange-800">
                  {stats.assets.pending} assets are pending vectorization. 
                  Click "Process Pending" to enable AI search for these assets.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default VectorDashboard
