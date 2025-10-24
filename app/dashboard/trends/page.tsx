'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatNumber } from '@/lib/utils'
import { TrendingUp, TrendingDown, ArrowRight, Activity } from 'lucide-react'

type TrendData = {
  category: string
  mention_count: number
  growth_pct: number
  avg_score: number
  unique_creators: number
}

export default function TrendsPage() {
  const [trends, setTrends] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrends()
  }, [])

  async function loadTrends() {
    setLoading(true)
    try {
      // Get pain mentions by category from last 7 days
      const { data: currentWeek } = await supabase
        .from('pain_signals')
        .select('category, priority_score, author_handle')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      // Get previous week for comparison
      const { data: previousWeek } = await supabase
        .from('pain_signals')
        .select('category')
        .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      if (!currentWeek) {
        setTrends([])
        return
      }

      // Calculate trends by category
      const categoryData = currentWeek.reduce((acc, signal) => {
        const cat = signal.category || 'Uncategorized'
        if (!acc[cat]) {
          acc[cat] = {
            count: 0,
            scores: [],
            creators: new Set()
          }
        }
        acc[cat].count++
        acc[cat].scores.push(signal.priority_score || 0)
        if (signal.author_handle) {
          acc[cat].creators.add(signal.author_handle)
        }
        return acc
      }, {} as Record<string, any>)

      const prevCategoryData = previousWeek?.reduce((acc, signal) => {
        const cat = signal.category || 'Uncategorized'
        acc[cat] = (acc[cat] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Calculate growth
      const trendsData: TrendData[] = Object.entries(categoryData).map(([category, data]) => {
        const currentCount = data.count
        const prevCount = prevCategoryData[category] || 0
        const growth = prevCount > 0 
          ? ((currentCount - prevCount) / prevCount) * 100 
          : currentCount > 0 ? 100 : 0

        return {
          category,
          mention_count: currentCount,
          growth_pct: growth,
          avg_score: data.scores.reduce((a: number, b: number) => a + b, 0) / data.scores.length,
          unique_creators: data.creators.size
        }
      })

      // Sort by growth
      trendsData.sort((a, b) => b.growth_pct - a.growth_pct)

      setTrends(trendsData)
    } catch (error) {
      console.error('Error loading trends:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing trends...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity className="h-8 w-8 text-purple-500" />
          Pain Signal Trends
        </h1>
        <p className="text-muted-foreground mt-1">Velocity analysis - what's heating up vs cooling down</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trends.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hottest Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {trends[0]?.category || 'N/A'}
            </div>
            {trends[0] && (
              <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +{trends[0].growth_pct.toFixed(0)}%
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Mentions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(trends.reduce((sum, t) => sum + t.mention_count, 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unique Creators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(trends.reduce((sum, t) => sum + t.unique_creators, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends List */}
      {trends.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No trend data yet</p>
              <p className="text-sm mt-2">Collect pain signals for at least 7 days to see trends</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {trends.map((trend, index) => (
            <Card key={trend.category} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>

                    {/* Category & Stats */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{trend.category}</h3>
                        <Badge variant={
                          trend.growth_pct >= 200 ? 'destructive' :
                          trend.growth_pct >= 100 ? 'default' :
                          trend.growth_pct >= 0 ? 'secondary' :
                          'outline'
                        }>
                          {trend.growth_pct >= 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {trend.growth_pct >= 0 ? '+' : ''}{trend.growth_pct.toFixed(0)}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Mentions</p>
                          <p className="font-semibold">{formatNumber(trend.mention_count)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Score</p>
                          <p className="font-semibold">{trend.avg_score.toFixed(0)}/100</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Creators</p>
                          <p className="font-semibold">{formatNumber(trend.unique_creators)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Growth Indicator */}
                  <div className="text-right">
                    {trend.growth_pct >= 200 && (
                      <div className="text-red-500 font-bold text-2xl flex items-center gap-2">
                        <TrendingUp className="h-6 w-6" />
                        🔥 HOT
                      </div>
                    )}
                    {trend.growth_pct >= 100 && trend.growth_pct < 200 && (
                      <div className="text-orange-500 font-bold text-xl flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Growing Fast
                      </div>
                    )}
                    {trend.growth_pct >= 0 && trend.growth_pct < 100 && (
                      <div className="text-green-500 font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Growing
                      </div>
                    )}
                    {trend.growth_pct < 0 && (
                      <div className="text-gray-500 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        Declining
                      </div>
                    )}
                  </div>
                </div>

                {/* Insight */}
                {trend.growth_pct >= 200 && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      <span>
                        This pain is spiking! {trend.mention_count} mentions this week (was ~{Math.round(trend.mention_count / (1 + trend.growth_pct / 100))} last week)
                      </span>
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 ml-6">
                      → High urgency: Build solution NOW while pain is hot
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
