'use client'

import { useEffect, useState } from 'react'
import { supabase, type PainSignal } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import { TrendingUp, Database, Lightbulb, Package, ArrowUp } from 'lucide-react'

type Metrics = {
  mrr: number
  signals: number
  hotOpportunities: number
  products: number
  mrrGrowth: number
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics>({
    mrr: 0,
    signals: 0,
    hotOpportunities: 0,
    products: 0,
    mrrGrowth: 0
  })
  
  const [opportunities, setOpportunities] = useState<PainSignal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    
    // Real-time subscription for new signals
    const channel = supabase
      .channel('pain_signals_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pain_signals'
        },
        (payload) => {
          const newSignal = payload.new as PainSignal
          if (newSignal.priority_score && newSignal.priority_score > 90) {
            // Show notification for hot signals
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('🔥 Hot Signal Detected!', {
                body: `Score ${newSignal.priority_score}: ${newSignal.extracted_pain}`,
                icon: '/icon.png'
              })
            }
          }
          loadDashboardData() // Refresh data
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadDashboardData() {
    try {
      // Get MRR from subscriptions
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('mrr')
        .eq('status', 'active')
      
      const mrr = subs?.reduce((sum, s) => sum + (s.mrr || 0), 0) || 0

      // Get total signals count
      const { count: signalsCount } = await supabase
        .from('pain_signals')
        .select('*', { count: 'exact', head: true })

      // Get hot opportunities (score >= 85)
      const { count: hotCount } = await supabase
        .from('pain_signals')
        .select('*', { count: 'exact', head: true })
        .gte('priority_score', 85)
        .eq('status', 'qualified')

      // Get products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .in('status', ['launched', 'growing'])

      // Get top opportunities
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: topOpps } = await supabase
        .from('pain_signals')
        .select('*')
        .gte('priority_score', 80)
        .gte('created_at', sevenDaysAgo.toISOString())
        .eq('status', 'qualified')
        .order('priority_score', { ascending: false })
        .limit(3)

      setMetrics({
        mrr,
        signals: signalsCount || 0,
        hotOpportunities: hotCount || 0,
        products: productsCount || 0,
        mrrGrowth: 12.4 // TODO: Calculate from historical data
      })

      setOpportunities(topOpps || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading intelligence data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🎯 Intelligence Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time pain signal intelligence & opportunity discovery</p>
        </div>
        <Button onClick={requestNotificationPermission} variant="outline">
          Enable Notifications
        </Button>
      </div>

      {/* North Star Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.mrr)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+{formatCurrency(metrics.mrrGrowth * 1000)}</span>
              this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Signals</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.signals)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pain signals collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Opportunities</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.hotOpportunities}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Score ≥85, ready to build
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.products}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Launched & growing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hottest Opportunities */}
      <div>
        <h2 className="text-2xl font-bold mb-4">🔥 Hottest Opportunities Right Now</h2>
        
        {opportunities.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No opportunities yet</p>
                <p className="text-sm mt-2">Start scraping pain signals to discover validated opportunities</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opp, index) => (
              <Card key={opp.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-muted-foreground">{index + 1}.</span>
                        <CardTitle className="text-xl">{opp.category}</CardTitle>
                        <Badge variant="success">Score: {opp.priority_score}</Badge>
                        {opp.recommendation === 'BUILD' && (
                          <Badge variant="default">BUILD NOW</Badge>
                        )}
                      </div>
                      <CardDescription className="text-base">
                        {opp.extracted_pain}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">TAM</p>
                      <p className="font-semibold">{formatNumber(opp.tam_estimate || 0)} creators</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Willingness to Pay</p>
                      <p className="font-semibold">{formatCurrency(opp.willingness_to_pay_monthly || 0)}/mo</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Build Time</p>
                      <p className="font-semibold">{opp.build_time_weeks || 0} weeks</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Risk</p>
                      <Badge variant={
                        opp.risk_score === 'LOW' ? 'success' :
                        opp.risk_score === 'MEDIUM' ? 'warning' :
                        'destructive'
                      }>
                        {opp.risk_score || 'UNKNOWN'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm">View Details</Button>
                    <Button size="sm" variant="outline">Start Validation</Button>
                    <Button size="sm" variant="ghost">Dismiss</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
