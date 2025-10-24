'use client'

import { useEffect, useState } from 'react'
import { supabase, type PainSignal } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatNumber, formatCurrency, formatRelativeTime } from '@/lib/utils'
import { Radio, Twitter, MessageSquare, Github, TrendingUp, DollarSign, AlertCircle } from 'lucide-react'

export default function SignalsFeedPage() {
  const [signals, setSignals] = useState<PainSignal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'high-score'>('all')

  useEffect(() => {
    loadSignals()

    // Real-time subscription
    const channel = supabase
      .channel('signals_feed')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pain_signals'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSignals((prev) => [payload.new as PainSignal, ...prev].slice(0, 50))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter])

  async function loadSignals() {
    setLoading(true)
    try {
      let query = supabase
        .from('pain_signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (filter === 'high-score') {
        query = query.gte('priority_score', 70)
      }

      const { data, error } = await query

      if (error) throw error
      setSignals(data || [])
    } catch (error) {
      console.error('Error loading signals:', error)
    } finally {
      setLoading(false)
    }
  }

  function getPlatformIcon(platform: string) {
    switch (platform.toLowerCase()) {
      case 'twitter':
      case 'x':
        return <Twitter className="h-4 w-4" />
      case 'discord':
        return <MessageSquare className="h-4 w-4" />
      case 'github':
        return <Github className="h-4 w-4" />
      case 'reddit':
        return <Radio className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  function getBuyingIntentLabel(score: number | null): string {
    if (!score) return 'UNKNOWN'
    if (score >= 85) return 'HIGH'
    if (score >= 70) return 'MEDIUM'
    return 'LOW'
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading signals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Radio className="h-8 w-8 text-red-500 animate-pulse" />
          Live Pain Signals
        </h1>
        <p className="text-muted-foreground mt-1">Real-time feed of validated creator pain points</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Signals
        </Button>
        <Button
          variant={filter === 'high-score' ? 'default' : 'outline'}
          onClick={() => setFilter('high-score')}
        >
          High Score (≥70)
        </Button>
      </div>

      {/* Signals Feed */}
      <div className="space-y-4">
        {signals.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No signals yet</p>
                <p className="text-sm mt-2">Start your scrapers to collect pain signals</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          signals.map((signal) => (
            <Card key={signal.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      (signal.priority_score || 0) >= 90 ? 'bg-red-100 dark:bg-red-900' :
                      (signal.priority_score || 0) >= 80 ? 'bg-orange-100 dark:bg-orange-900' :
                      (signal.priority_score || 0) >= 70 ? 'bg-yellow-100 dark:bg-yellow-900' :
                      'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {getPlatformIcon(signal.source_platform)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          (signal.priority_score || 0) >= 90 ? 'destructive' :
                          (signal.priority_score || 0) >= 80 ? 'warning' :
                          'secondary'
                        }>
                          ⚡ Score: {signal.priority_score || 0}
                        </Badge>
                        <span className="text-sm text-muted-foreground capitalize">
                          {signal.source_platform}
                        </span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {formatRelativeTime(signal.created_at)}
                        </span>
                      </div>
                      {signal.author_handle && (
                        <p className="text-sm font-medium mt-1">@{signal.author_handle}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <p className="text-base leading-relaxed">"{signal.raw_text}"</p>
                </div>

                <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Est. Revenue
                    </p>
                    <p className="font-semibold text-sm mt-1">
                      {signal.tam_estimate ? `${formatNumber(signal.tam_estimate)} TAM` : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Pain Type
                    </p>
                    <p className="font-semibold text-sm mt-1">{signal.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Buying Intent</p>
                    <Badge variant={
                      getBuyingIntentLabel(signal.priority_score) === 'HIGH' ? 'success' :
                      getBuyingIntentLabel(signal.priority_score) === 'MEDIUM' ? 'warning' :
                      'secondary'
                    } className="mt-1">
                      {getBuyingIntentLabel(signal.priority_score)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">WTP</p>
                    <p className="font-semibold text-sm mt-1">
                      {signal.willingness_to_pay_monthly ? formatCurrency(signal.willingness_to_pay_monthly) : 'TBD'}/mo
                    </p>
                  </div>
                </div>

                {signal.extracted_pain && (
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm font-medium">💡 Extracted Pain Point:</p>
                    <p className="text-sm mt-1">{signal.extracted_pain}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="default">Add to Research</Button>
                  {signal.source_url && (
                    <a href={signal.source_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">
                        View Source
                      </Button>
                    </a>
                  )}
                  <Button size="sm" variant="outline">Contact Now</Button>
                  <Button size="sm" variant="ghost">Dismiss</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {signals.length > 0 && (
        <div className="text-center">
          <Button variant="outline" onClick={loadSignals}>Load More</Button>
        </div>
      )}
    </div>
  )
}
