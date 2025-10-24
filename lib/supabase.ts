import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types based on production_schema.sql
export type PainSignal = {
  id: string
  raw_text: string
  source_platform: string
  source_url: string | null
  author_handle: string | null
  extracted_pain: string
  category: string
  tam_estimate: number | null
  willingness_to_pay_monthly: number | null
  ltv_cac_ratio: number | null
  build_time_weeks: number | null
  risk_score: 'LOW' | 'MEDIUM' | 'HIGH' | 'INSANE' | null
  moat_strength: 'WEAK' | 'MEDIUM' | 'STRONG' | null
  priority_score: number | null
  recommendation: 'BUILD' | 'RESEARCH' | 'SKIP' | null
  created_at: string
  analyzed_at: string | null
  status: 'pending' | 'qualified' | 'rejected' | 'built'
}

export type Product = {
  id: string
  pain_signal_id: string | null
  name: string
  slug: string
  tagline: string | null
  description: string | null
  pricing_model: 'free' | 'freemium' | 'subscription' | 'one_time' | 'usage_based'
  price_monthly: number | null
  price_yearly: number | null
  trial_days: number
  repo_url: string | null
  deployment_url: string | null
  status: 'idea' | 'building' | 'testing' | 'launched' | 'growing' | 'sunset'
  build_start_date: string | null
  launch_date: string | null
  total_dev_hours: number | null
  created_at: string
  updated_at: string
}

export type Subscription = {
  id: string
  user_id: string
  product_id: string
  status: 'trial' | 'active' | 'past_due' | 'canceled' | 'expired'
  stripe_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  mrr: number | null
  started_at: string
  canceled_at: string | null
  cancellation_reason: string | null
  created_at: string
  updated_at: string
}

export type AppIdea = {
  id: number
  name: string
  tagline: string | null
  category: string | null
  description: string | null
  problem: string | null
  solution: string | null
  estimated_mrr_3mo: number | null
  build_time_weeks: number | null
  difficulty: string | null
  viral_potential: number | null
  status: string
  priority: number
  created_at: string
  tech_stack: string | null
  key_features: string | null
  target_audience: string | null
  competition: string | null
  unique_angle: string | null
  monetization_strategy: string | null
  growth_strategy: string | null
  risks: string | null
  success_metrics: string | null
  ai_build_prompt: string | null
}
