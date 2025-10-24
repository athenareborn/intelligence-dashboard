'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Users, DollarSign, Target, Twitter, AlertCircle } from 'lucide-react'

type Creator = {
  id: string
  username: string
  display_name: string | null
  estimated_revenue_low: number | null
  estimated_revenue_high: number | null
  twitter_followers: number | null
  pain_categories: string[] | null
  outreach_priority: number | null
  contacted: boolean
  products: any
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'high-priority' | 'not-contacted'>('high-priority')

  useEffect(() => {
    loadCreators()
  }, [filter])

  async function loadCreators() {
    setLoading(true)
    try {
      let query = supabase
        .from('whop_creators')
        .select('*')
        .order('outreach_priority', { ascending: false })
        .limit(50)

      if (filter === 'high-priority') {
        query = query.gte('outreach_priority', 70)
      } else if (filter === 'not-contacted') {
        query = query.eq('contacted', false)
      }

      const { data, error } = await query

      if (error) throw error
      setCreators(data || [])
    } catch (error) {
      console.error('Error loading creators:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading creator database...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Target className="h-8 w-8 text-blue-500" />
          Whop Creator Database
        </h1>
        <p className="text-muted-foreground mt-1">Target audience for outreach campaigns</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Creators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(creators.length)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {creators.filter(c => (c.outreach_priority || 0) >= 80).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Not Contacted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {creators.filter(c => !c.contacted).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                creators.reduce((sum, c) => sum + (c.estimated_revenue_high || 0), 0) / 
                creators.filter(c => c.estimated_revenue_high).length || 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Creators
        </Button>
        <Button
          variant={filter === 'high-priority' ? 'default' : 'outline'}
          onClick={() => setFilter('high-priority')}
        >
          High Priority (≥70)
        </Button>
        <Button
          variant={filter === 'not-contacted' ? 'default' : 'outline'}
          onClick={() => setFilter('not-contacted')}
        >
          Not Contacted
        </Button>
      </div>

      {/* Creators List */}
      {creators.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No creator data yet</p>
              <p className="text-sm mt-2">Run Whop creator scraper to build target database</p>
              <p className="text-xs mt-4 text-muted-foreground">
                See: <code className="bg-muted px-2 py-1 rounded">ELITE_SCRAPING_ARSENAL.md</code>
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {creators.map((creator) => (
            <Card key={creator.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {creator.display_name || creator.username}
                        </h3>
                        <p className="text-sm text-muted-foreground">@{creator.username}</p>
                      </div>
                      {creator.outreach_priority && creator.outreach_priority >= 80 && (
                        <Badge variant="destructive">HOT LEAD</Badge>
                      )}
                      {creator.contacted && (
                        <Badge variant="secondary">Contacted</Badge>
                      )}
                    </div>

                    {/* Revenue & Products */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Est. Revenue</p>
                        <p className="font-semibold">
                          {creator.estimated_revenue_low && creator.estimated_revenue_high ? (
                            `${formatCurrency(creator.estimated_revenue_low)}-${formatCurrency(creator.estimated_revenue_high)}/mo`
                          ) : (
                            'Unknown'
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Products</p>
                        <p className="font-semibold">
                          {creator.products && Array.isArray(creator.products) 
                            ? creator.products.length 
                            : 0} products
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Social</p>
                        <div className="flex items-center gap-1">
                          <Twitter className="h-3 w-3" />
                          <p className="font-semibold">
                            {creator.twitter_followers 
                              ? formatNumber(creator.twitter_followers)
                              : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pain Categories */}
                    {creator.pain_categories && creator.pain_categories.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Pain Points:</p>
                        <div className="flex flex-wrap gap-1">
                          {creator.pain_categories.map((pain, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {pain}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Products List */}
                    {creator.products && Array.isArray(creator.products) && creator.products.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Products:</p>
                        <div className="space-y-1">
                          {creator.products.slice(0, 2).map((product: any, i: number) => (
                            <div key={i} className="text-sm flex items-center gap-2">
                              <span className="font-medium">{product.name}</span>
                              {product.price && (
                                <span className="text-muted-foreground">
                                  {formatCurrency(product.price)}
                                </span>
                              )}
                              {product.members && (
                                <Badge variant="secondary" className="text-xs">
                                  {product.members} members
                                </Badge>
                              )}
                            </div>
                          ))}
                          {creator.products.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{creator.products.length - 2} more products
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Priority Score & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    {creator.outreach_priority && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Priority</p>
                        <div className={`text-3xl font-bold ${
                          creator.outreach_priority >= 90 ? 'text-red-500' :
                          creator.outreach_priority >= 80 ? 'text-orange-500' :
                          creator.outreach_priority >= 70 ? 'text-yellow-500' :
                          'text-gray-500'
                        }`}>
                          {creator.outreach_priority}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="default">
                        Generate Outreach
                      </Button>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                      {!creator.contacted && (
                        <Button size="sm" variant="ghost">
                          Mark Contacted
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
