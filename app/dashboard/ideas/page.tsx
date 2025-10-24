'use client'

import { useEffect, useState } from 'react'
import { supabase, type AppIdea } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Sparkles, TrendingUp, Clock, Zap, Target, Flame, ChevronDown, ChevronUp, Copy, CheckCircle } from 'lucide-react'

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<AppIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, highPriority: 0, totalMrr: 0, avgBuildTime: 0 })
  const [expandedIdeas, setExpandedIdeas] = useState<Set<number>>(new Set())
  const [copiedPrompt, setCopiedPrompt] = useState<number | null>(null)

  useEffect(() => {
    loadIdeas()
  }, [])

  async function loadIdeas() {
    try {
      const { data, error } = await supabase
        .from('app_ideas')
        .select('*')
        .order('priority', { ascending: false })
        .order('estimated_mrr_3mo', { ascending: false })

      if (error) throw error

      setIdeas(data || [])
      
      // Calculate stats
      const total = data?.length || 0
      const highPriority = data?.filter(i => i.priority >= 5).length || 0
      const totalMrr = data?.reduce((sum, i) => sum + (i.estimated_mrr_3mo || 0), 0) || 0
      const avgBuildTime = total > 0 
        ? Math.round(data.reduce((sum, i) => sum + (i.build_time_weeks || 0), 0) / total)
        : 0

      setStats({ total, highPriority, totalMrr, avgBuildTime })
    } catch (error) {
      console.error('Error loading ideas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return 'bg-red-500'
    if (priority >= 4) return 'bg-orange-500'
    if (priority >= 3) return 'bg-blue-500'
    return 'bg-gray-500'
  }

  const getPriorityLabel = (priority: number) => {
    if (priority >= 5) return '🔥 HOT'
    if (priority >= 4) return '⚡ HIGH'
    if (priority >= 3) return '📈 MEDIUM'
    return '💭 LOW'
  }

  const getDifficultyColor = (difficulty: string | null) => {
    if (difficulty === 'Easy') return 'bg-green-100 text-green-800'
    if (difficulty === 'Medium') return 'bg-yellow-100 text-yellow-800'
    if (difficulty === 'Hard') return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedIdeas)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIdeas(newExpanded)
  }

  const copyPrompt = (id: number, prompt: string) => {
    navigator.clipboard.writeText(prompt)
    setCopiedPrompt(id)
    setTimeout(() => setCopiedPrompt(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">💡 App Ideas</h1>
        <p className="text-muted-foreground">
          Curated Whop app concepts with revenue projections and build times
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Ideas</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>High Priority</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Flame className="h-6 w-6 text-red-500" />
              {stats.highPriority}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total MRR Potential (3mo)</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(stats.totalMrr)}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Build Time</CardDescription>
            <CardTitle className="text-3xl">{stats.avgBuildTime}w</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ideas.map((idea) => (
          <Card key={idea.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-1">{idea.name}</CardTitle>
                  {idea.tagline && (
                    <p className="text-sm text-muted-foreground italic">"{idea.tagline}"</p>
                  )}
                </div>
                <Badge className={`${getPriorityColor(idea.priority)} text-white ml-2`}>
                  {getPriorityLabel(idea.priority)}
                </Badge>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-300">
                  🤖 AI-First
                </Badge>
                {idea.category && (
                  <Badge variant="outline">
                    {idea.category}
                  </Badge>
                )}
              </div>

              {/* AI Features Highlight */}
              {idea.ai_features && (
                <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">🤖 AI FEATURES</p>
                  <p className="text-sm text-purple-900 dark:text-purple-100">{idea.ai_features}</p>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Problem/Solution */}
              {idea.problem && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-red-600">❌ PROBLEM</p>
                  <p className="text-sm">{idea.problem}</p>
                </div>
              )}

              {idea.solution && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-green-600">✅ SOLUTION</p>
                  <p className="text-sm">{idea.solution}</p>
                </div>
              )}

              {idea.description && !idea.problem && !idea.solution && (
                <p className="text-sm text-muted-foreground">{idea.description}</p>
              )}

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">MRR (3mo)</p>
                      <p className="font-bold">{formatCurrency(idea.estimated_mrr_3mo || 0)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Viral Potential</p>
                      <p className="font-bold">{idea.viral_potential || 0}/5</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Build Time</p>
                      <p className="font-bold">{idea.build_time_weeks || 0} weeks</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Difficulty</p>
                      <Badge className={getDifficultyColor(idea.difficulty)} variant="secondary">
                        {idea.difficulty || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedIdeas.has(idea.id) && (
                <div className="space-y-4 pt-4 border-t">
                  {idea.tech_stack && (
                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-1">🔧 TECH STACK</p>
                      <p className="text-sm">{idea.tech_stack}</p>
                    </div>
                  )}

                  {idea.key_features && (
                    <div>
                      <p className="text-xs font-semibold text-purple-600 mb-1">⚡ KEY FEATURES</p>
                      <p className="text-sm">{idea.key_features}</p>
                    </div>
                  )}

                  {idea.target_audience && (
                    <div>
                      <p className="text-xs font-semibold text-orange-600 mb-1">🎯 TARGET AUDIENCE</p>
                      <p className="text-sm">{idea.target_audience}</p>
                    </div>
                  )}

                  {idea.competition && (
                    <div>
                      <p className="text-xs font-semibold text-red-600 mb-1">⚔️ COMPETITION</p>
                      <p className="text-sm">{idea.competition}</p>
                    </div>
                  )}

                  {idea.unique_angle && (
                    <div>
                      <p className="text-xs font-semibold text-green-600 mb-1">💎 UNIQUE ANGLE</p>
                      <p className="text-sm font-medium">{idea.unique_angle}</p>
                    </div>
                  )}

                  {idea.monetization_strategy && (
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 mb-1">💰 MONETIZATION</p>
                      <p className="text-sm">{idea.monetization_strategy}</p>
                    </div>
                  )}

                  {idea.growth_strategy && (
                    <div>
                      <p className="text-xs font-semibold text-cyan-600 mb-1">📈 GROWTH STRATEGY</p>
                      <p className="text-sm">{idea.growth_strategy}</p>
                    </div>
                  )}

                  {idea.risks && (
                    <div>
                      <p className="text-xs font-semibold text-amber-600 mb-1">⚠️ RISKS</p>
                      <p className="text-sm">{idea.risks}</p>
                    </div>
                  )}

                  {idea.success_metrics && (
                    <div>
                      <p className="text-xs font-semibold text-indigo-600 mb-1">📊 SUCCESS METRICS</p>
                      <p className="text-sm">{idea.success_metrics}</p>
                    </div>
                  )}

                  {idea.ai_build_prompt && (
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-violet-600">🤖 AI BUILD PROMPT (One-Shot)</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyPrompt(idea.id, idea.ai_build_prompt!)}
                        >
                          {copiedPrompt === idea.id ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-sm font-mono bg-white dark:bg-slate-950 p-3 rounded border">
                        {idea.ai_build_prompt}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        💡 Copy this prompt and give it to Claude/GPT to generate full architecture
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Toggle Button */}
              <Button 
                variant="ghost" 
                className="w-full mt-4"
                onClick={() => toggleExpanded(idea.id)}
              >
                {expandedIdeas.has(idea.id) ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show Full Details & AI Prompt
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {ideas.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No ideas yet</p>
            <p className="text-sm text-muted-foreground">
              Run the SQL scripts to populate your ideas database
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
