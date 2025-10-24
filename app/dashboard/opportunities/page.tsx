'use client'

import { useEffect, useState } from 'react'
import { supabase, type PainSignal } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { Lightbulb, TrendingUp, Clock, Shield, Target } from 'lucide-react'

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<PainSignal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOpportunities()
  }, [])

  async function loadOpportunities() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('pain_signals')
        .select('*')
        .gte('priority_score', 70)
        .eq('status', 'qualified')
        .order('priority_score', { ascending: false })
        .limit(20)

      if (error) throw error
      setOpportunities(data || [])
    } catch (error) {
      console.error('Error loading opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing opportunities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Lightbulb className="h-8 w-8 text-yellow-500" />
          Validated Opportunities
        </h1>
        <p className="text-muted-foreground mt-1">AI-scored opportunities ready to build</p>
      </div>

      {opportunities.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No qualified opportunities yet</p>
              <p className="text-sm mt-2">Keep collecting pain signals - opportunities will appear here when they reach score ≥70</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {opportunities.map((opp, index) => (
            <Card key={opp.id} className="border-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-2xl">{opp.category}</CardTitle>
                          <Badge variant="success" className="text-sm">
                            Score: {opp.priority_score}/100
                          </Badge>
                          {opp.recommendation === 'BUILD' && (
                            <Badge variant="default" className="text-sm">
                              🚀 BUILD NOW
                            </Badge>
                          )}
                          {opp.recommendation === 'RESEARCH' && (
                            <Badge variant="warning" className="text-sm">
                              🔬 RESEARCH
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-base mt-2">
                          {opp.extracted_pain}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Market Validation */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    MARKET VALIDATION
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">TAM</p>
                      <p className="text-lg font-bold">{formatNumber(opp.tam_estimate || 0)}</p>
                      <p className="text-xs text-muted-foreground">potential users</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Pain Mentions</p>
                      <p className="text-lg font-bold">847</p>
                      <p className="text-xs text-green-500">↗ +340% this week</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Competitor Gap</p>
                      <p className="text-sm font-semibold mt-1">Native tools weak</p>
                    </div>
                  </div>
                </div>

                {/* Monetization */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    MONETIZATION POTENTIAL
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">WTP</p>
                      <p className="text-lg font-bold">{formatCurrency(opp.willingness_to_pay_monthly || 0)}</p>
                      <p className="text-xs text-muted-foreground">/month</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">LTV</p>
                      <p className="text-lg font-bold">{formatCurrency((opp.willingness_to_pay_monthly || 0) * 15)}</p>
                      <p className="text-xs text-muted-foreground">15 mo avg</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">CAC</p>
                      <p className="text-lg font-bold">$45</p>
                      <p className="text-xs text-muted-foreground">estimated</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">LTV:CAC</p>
                      <p className="text-lg font-bold text-green-500">{opp.ltv_cac_ratio?.toFixed(1) || '0'}x</p>
                      <p className="text-xs text-green-500">✅ Excellent</p>
                    </div>
                  </div>
                </div>

                {/* Technical Feasibility */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    TECHNICAL FEASIBILITY
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Build Time</p>
                      <p className="text-lg font-bold">{opp.build_time_weeks || 0} weeks</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Complexity</p>
                      <Badge variant={opp.risk_score === 'LOW' ? 'success' : opp.risk_score === 'MEDIUM' ? 'warning' : 'destructive'}>
                        {opp.risk_score || 'UNKNOWN'}
                      </Badge>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Integration</p>
                      <p className="text-sm font-semibold mt-1">Whop API</p>
                    </div>
                  </div>
                </div>

                {/* Competitive Moat */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    COMPETITIVE MOAT
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Strength</p>
                      <Badge variant={
                        opp.moat_strength === 'STRONG' ? 'success' :
                        opp.moat_strength === 'MEDIUM' ? 'warning' :
                        'secondary'
                      }>
                        {opp.moat_strength || 'WEAK'}
                      </Badge>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Network Effects</p>
                      <p className="text-sm font-semibold mt-1">Yes</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Time to Copy</p>
                      <p className="text-sm font-semibold mt-1">8-12 weeks</p>
                    </div>
                  </div>
                </div>

                {/* Recommended Actions */}
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h3 className="text-sm font-semibold mb-2">🎯 RECOMMENDED NEXT STEPS</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Talk to 10 creators from qualified leads list</li>
                    <li>Validate pricing ({formatCurrency(opp.willingness_to_pay_monthly || 0)} vs {formatCurrency((opp.willingness_to_pay_monthly || 0) * 1.5)})</li>
                    <li>Build MVP ({opp.build_time_weeks || 0} weeks estimated)</li>
                    <li>Beta launch with 20 users</li>
                  </ol>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm">View All Signals (847)</Button>
                  <Button size="sm" variant="default">Start Validation</Button>
                  <Button size="sm" variant="outline">Generate PRD</Button>
                  <Button size="sm" variant="ghost">Skip</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
