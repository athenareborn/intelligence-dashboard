# Intelligence Dashboard - Complete Setup Guide

## Step-by-Step Setup (30 minutes)

### Step 1: Supabase Setup (10 min)

1. **Create Supabase Project**
   ```
   1. Go to https://supabase.com
   2. Click "New Project"
   3. Name: "whop-intel-dashboard"
   4. Database Password: (save this)
   5. Region: Choose closest to you
   6. Wait ~2 minutes for provisioning
   ```

2. **Get API Credentials**
   ```
   1. Click "Settings" (gear icon)
   2. Click "API"
   3. Copy "Project URL" → save as SUPABASE_URL
   4. Copy "anon public" key → save as SUPABASE_ANON_KEY
   ```

3. **Run Database Schema**
   ```
   1. Click "SQL Editor" in sidebar
   2. Click "New Query"
   3. Open ../production_schema.sql in this repo
   4. Copy ALL contents
   5. Paste into Supabase SQL Editor
   6. Click "Run"
   7. Should see "Success. No rows returned"
   ```

4. **Verify Tables Created**
   ```
   1. Click "Table Editor" in sidebar
   2. Should see: pain_signals, products, users, subscriptions, etc.
   3. If tables missing, re-run schema
   ```

### Step 2: Environment Variables (2 min)

1. **Create .env.local file** in project root:
   ```bash
   cd /Users/atzarakis/whop\ app\ labs/intelligence-dashboard
   touch .env.local
   ```

2. **Add your credentials**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   Replace with actual values from Step 1.2

### Step 3: Install Dependencies (3 min)

```bash
cd /Users/atzarakis/whop\ app\ labs/intelligence-dashboard
npm install
```

Wait for packages to install (~2-3 minutes).

### Step 4: Start Development Server (1 min)

```bash
npm run dev
```

You should see:
```
   ▲ Next.js 15.x.x
   - Local:        http://localhost:3000
   - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.3s
```

### Step 5: Test Dashboard (2 min)

1. **Open Browser**
   ```
   Go to: http://localhost:3000
   Should auto-redirect to: http://localhost:3000/dashboard
   ```

2. **You Should See**:
   - 4 metric cards (MRR, Data Signals, Hot Opportunities, Products)
   - All showing $0 or 0 (that's normal - no data yet)
   - "No opportunities yet" message

3. **Test Navigation**:
   - Click "Signals Feed" → Should see empty state
   - Click "Opportunities" → Should see empty state
   - All pages load without errors ✅

### Step 6: Add Test Data (5 min)

Let's add some fake data to see dashboard in action:

1. **Go to Supabase**
   - Click "Table Editor"
   - Click "pain_signals" table
   - Click "Insert" → "Insert row"

2. **Add Test Signal**:
   ```
   raw_text: "Whop's analytics are terrible, can't see which content drives sales"
   source_platform: "twitter"
   source_url: "https://twitter.com/example/status/123"
   author_handle: "creator_mike"
   extracted_pain: "Analytics attribution problem"
   category: "Analytics & Attribution"
   tam_estimate: 15000
   willingness_to_pay_monthly: 99.00
   ltv_cac_ratio: 39.7
   build_time_weeks: 2.0
   risk_score: "LOW"
   moat_strength: "MEDIUM"
   priority_score: 94
   recommendation: "BUILD"
   status: "qualified"
   ```

3. **Click "Save"**

4. **Refresh Dashboard**
   - Should now show 1 signal
   - Should show 1 hot opportunity
   - Opportunity card should appear on Overview

### Step 7: Test Real-time (2 min)

1. **Keep dashboard open in browser**

2. **In Supabase, add another signal** (same as Step 6)
   - Change some values (different text, score, etc.)

3. **Dashboard should auto-update** without refresh!
   - New signal appears in feed
   - Metrics update automatically
   - This is Supabase Realtime in action ✅

### Step 8: Enable Notifications (1 min)

1. **On Dashboard, click "Enable Notifications" button**
2. **Browser will ask permission** → Click "Allow"
3. **Add signal with score >90 in Supabase**
4. **Should see desktop notification** 🔥

---

## Troubleshooting

### Issue: "Failed to connect to Supabase"

**Solution**:
1. Check `.env.local` exists in project root
2. Check URLs have NO trailing slash
3. Restart dev server (`Ctrl+C`, then `npm run dev`)

### Issue: "Table doesn't exist"

**Solution**:
1. Go to Supabase SQL Editor
2. Re-run `production_schema.sql`
3. Check for any errors in SQL output

### Issue: "Real-time not working"

**Solution**:
1. Supabase → Settings → API
2. Check "Realtime" is enabled
3. Check "Enable Realtime" toggle is ON

### Issue: "npm install fails"

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

Now that dashboard is running:

### 1. Set Up Scrapers (See `ELITE_SCRAPING_ARSENAL.md`)
   - Twitter scraper (nitter-scraper)
   - Reddit scraper (PRAW)
   - Discord monitor (discord.py-self)

### 2. Set Up AI Processing (Groq)
   - Sign up at https://console.groq.com
   - Get API key
   - Process signals with Llama 3.1 70B

### 3. Start Collecting Data
   - Run scrapers 24/7
   - Target: 10K+ signals/day
   - Let dashboard show you opportunities

### 4. Review & Validate
   - Check /opportunities daily
   - Pick top 3 by score
   - Interview 10 creators each
   - Build what data validates

---

## Production Deployment (Bonus)

### Deploy to Vercel:

```bash
npm install -g vercel
vercel login
vercel --prod
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Your dashboard will be live at: `https://your-project.vercel.app`

---

## Cost Breakdown

**Development (Free)**:
- Supabase: Free tier (500MB, 50K monthly active users)
- Vercel: Hobby tier (100GB bandwidth)
- Total: $0/mo

**Production (~$25/mo)**:
- Supabase Pro: $25/mo (8GB database, 5GB bandwidth)
- Vercel Pro: $20/mo (1TB bandwidth) - optional
- Total: $25-45/mo

**At Scale (~$175/mo)**:
- Above + BrightData proxies ($500/mo)
- Groq AI processing (~$5-20/mo for 100K signals)
- Total cost still <$200/mo for $100K MRR potential

---

## Support

Stuck? Check:
1. Console errors (F12 in browser)
2. Supabase logs (Dashboard → Logs)
3. `.env.local` variables correct?
4. Database schema deployed?

Still stuck? Review:
- `../INTELLIGENCE_DASHBOARD.md` (design doc)
- `../ELITE_2025_PLAN.md` (overall strategy)

---

**You're ready to start! 🚀**

Open `http://localhost:3000/dashboard` and let the data guide you.
