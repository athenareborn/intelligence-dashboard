'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Store, TrendingUp, Star, Users, ExternalLink } from 'lucide-react'

type WhopApp = {
  id: string
  name: string
  category: string
  pricing_model: string
  price_monthly: number | null
  install_range: string | null
  rating: number | null
  review_count: number
  features: any
  last_updated_at: string
}

export default function MarketplacePage() {
  const [apps, setApps] = useState<WhopApp[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'analytics' | 'automation' | 'community'>('all')

  useEffect(() => {
    loadApps()
  }, [filter])

  async function loadApps() {
    setLoading(true)
    try {
      let query = supabase
        .from('whop_apps')
        .select('*')
        .order('rating', { ascending: false })
        .limit(50)

      if (filter !== 'all') {
        query = query.eq('category', filter.charAt(0).toUpperCase() + filter.slice(1))
      }

      const { data, error } = await query

      if (error) throw error
      setApps(data || [])
    } catch (error) {
      console.error('Error loading apps:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading marketplace data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Store className="h-8 w-8" />
          Whop App Marketplace Intelligence
        </h1>
        <p className="text-muted-foreground mt-1">Competitive intelligence on existing Whop apps</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Apps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(apps.length)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {(apps.reduce((sum, a) => sum + (a.rating || 0), 0) / apps.length || 0).toFixed(1)}
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(apps.reduce((sum, a) => sum + (a.price_monthly || 0), 0) / apps.filter(a => a.price_monthly).length || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(apps.map(a => a.category)).size}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Apps
        </Button>
        <Button
          variant={filter === 'analytics' ? 'default' : 'outline'}
          onClick={() => setFilter('analytics')}
        >
          Analytics
        </Button>
        <Button
          variant={filter === 'automation' ? 'default' : 'outline'}
          onClick={() => setFilter('automation')}
        >
          Automation
        </Button>
        <Button
          variant={filter === 'community' ? 'default' : 'outline'}
          onClick={() => setFilter('community')}
        >
          Community
        </Button>
      </div>

      {/* Apps Grid */}
      {apps.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No marketplace data yet</p>
              <p className="text-sm mt-2">Run Whop marketplace scraper to collect app data</p>
              <p className="text-xs mt-4 text-muted-foreground">
                See: <code className="bg-muted px-2 py-1 rounded">ELITE_SCRAPING_ARSENAL.md</code>
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <Card key={app.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{app.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{app.category}</p>
                  </div>
                  {app.rating && (
                    <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{app.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pricing */}
                <div>
                  <div className="text-2xl font-bold">
                    {app.price_monthly ? formatCurrency(app.price_monthly) : 'Free'}
                    {app.price_monthly && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                  </div>
                  <Badge variant="outline" className="mt-1">{app.pricing_model}</Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {app.install_range && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{app.install_range} installs</span>
                    </div>
                  )}
                  {app.review_count > 0 && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span>{app.review_count} reviews</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                {app.features && Array.isArray(app.features) && app.features.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {app.features.slice(0, 3).map((feature: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {app.features.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{app.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View App
                  </Button>
                  <Button size="sm" variant="ghost">
                    Reviews
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
