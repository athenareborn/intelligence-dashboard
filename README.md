# Intelligence Dashboard 🎯

**AI-powered real-time intelligence system for data-driven app discovery**

Part of the Pain-to-Profit System - let DATA decide what to build, not guesswork.

## Features

✅ **Real-time Pain Signal Feed** - Live stream of validated creator pain points  
✅ **AI-Scored Opportunities** - Automatic qualification with Groq  
✅ **Data Asymmetry Moat** - Proprietary dataset competitors can't replicate  
✅ **Product Portfolio Tracking** - Monitor your launched apps  
✅ **Outreach Campaign Manager** - AI-generated personalized messaging  

## Quick Start

### 1. Database Setup

Create a Supabase project:
```bash
# Go to https://supabase.com
# Create new project
# Copy your URL and anon key
```

Run the database schema:
```sql
-- Copy contents from ../production_schema.sql
-- Run in Supabase SQL Editor
```

### 2. Environment Variables

Create `.env.local` in project root:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## Pages

- `/dashboard` - Overview with North Star metrics
- `/dashboard/signals` - Real-time pain signal feed
- `/dashboard/opportunities` - AI-scored validated opportunities
- `/dashboard/research` - Custom analysis tools
- `/dashboard/products` - Your product portfolio
- `/dashboard/outreach` - Campaign management

## Tech Stack

- **Framework**: Next.js 15 + React Server Components
- **Database**: Supabase (Postgres + Realtime)
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Groq (for signal processing)
- **Charts**: Recharts
- **Icons**: Lucide React

## Data Flow

```
Scrapers → Pain Signals → AI Processing → Dashboard
                ↓              ↓              ↓
           Supabase      Groq API      Real-time UI
```

## Real-time Features

Dashboard automatically updates when:
- New pain signals arrive (INSERT on `pain_signals`)
- Opportunities score changes (UPDATE)
- Products launch (INSERT on `products`)

Desktop notifications for signals with score >90.

## Next Steps

1. **Set up scrapers** (see `../ELITE_SCRAPING_ARSENAL.md`)
2. **Configure AI processing** (Groq API for qualification)
3. **Start collecting signals** (10K+/day target)
4. **Review opportunities** (let DATA tell you what to build)

## Production Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Environment Variables
Add to Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Cost Structure

- **Development**: Free (Supabase free tier + Vercel hobby)
- **Production**: ~$25/mo (Supabase pro + Vercel)
- **At Scale**: ~$175/mo (includes AI processing)

**ROI**: 111x (300K signals → $100K MRR products)

## Support

Issues? Check:
1. Supabase connection working?
2. Database schema deployed?
3. Environment variables set?
4. Console for errors?

---

**Built for the Pain-to-Profit System**  
Data asymmetry is your moat. 🚀
