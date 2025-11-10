# Long Life - Vercel Deployment Guide

Complete step-by-step instructions for deploying Long Life to Vercel.

---

## Prerequisites

- [ ] GitHub repository with Long Life codebase
- [ ] Vercel account (free tier works)
- [ ] Sanity project created and seeded
- [ ] All environment variables ready (see `.env.example`)

---

## Part 1: Initial Deployment

### Step 1: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and log in
2. Click **"Add New..." → "Project"**
3. Select **"Import Git Repository"**
4. Choose your Long Life repository from GitHub
5. Click **"Import"**

### Step 2: Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (leave blank)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (auto-filled)
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

Click **"Deploy"** to proceed (it will fail without env vars, that's okay).

### Step 3: Add Environment Variables

1. Go to **Project Settings → Environment Variables**
2. Add each variable from `.env.example`:

#### Required Variables

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app` (initially) | Production, Preview, Development |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Your Sanity project ID | All |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | Production, Development |
| `NEXT_PUBLIC_SANITY_API_VERSION` | `2024-01-01` | All |
| `SANITY_READ_TOKEN` | Your read token | All |
| `SANITY_WRITE_TOKEN` | Your write token | Development only |
| `SANITY_REVALIDATE_SECRET` | Generated random string | Production, Preview |
| `PREVIEW_SECRET` | Generated random string | All |

**Tip**: Use the "Paste from .env" button to bulk import.

3. Click **"Save"**

### Step 4: Trigger Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the failed deployment
3. Or make a git push to trigger new deployment
4. Monitor build logs

---

## Part 2: Domain Configuration

### Step 1: Add Custom Domain

1. Go to **Project Settings → Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `longlife.com`)
4. Click **"Add"**

Vercel will provide DNS instructions.

### Step 2: Configure DNS

**If using Vercel DNS** (easiest):
1. Update nameservers at your registrar (GoDaddy, Namecheap, etc.)
2. Point to Vercel's nameservers (provided in UI)

**If using external DNS** (e.g., Cloudflare):
1. Add A record: `@` → `76.76.21.21`
2. Add CNAME record: `www` → `cname.vercel-dns.com`

### Step 3: Set Up WWW Redirect

1. Add `www.longlife.com` as a domain
2. Vercel auto-redirects `www` → apex
3. Or configure redirect in **Settings → Domains**

### Step 4: Update Site URL

1. Go to **Environment Variables**
2. Update `NEXT_PUBLIC_SITE_URL` to `https://longlife.com`
3. Redeploy for changes to take effect

### Step 5: SSL Certificate

Vercel automatically provisions SSL certificates. No action needed.

Verify:
- Visit `https://longlife.com`
- Should show lock icon (secure)
- Certificate auto-renews

---

## Part 3: Webhooks Setup

### Step 1: Get Webhook URL

Your revalidation endpoint is:
```
https://longlife.com/api/revalidate
```

### Step 2: Configure in Sanity

1. Go to [sanity.io](https://sanity.io)
2. Select your project
3. Navigate to **Manage → API → Webhooks**
4. Click **"Create webhook"**

**Webhook Configuration**:
- **Name**: `Production Revalidation`
- **URL**: `https://longlife.com/api/revalidate`
- **Dataset**: `production`
- **Trigger on**: `Create`, `Update`, `Delete`
- **HTTP method**: `POST`
- **HTTP Headers**: Leave empty
- **Secret**: Paste value of `SANITY_REVALIDATE_SECRET`
- **API version**: `2024-01-01`
- **Projection**: Leave default
- **Filter**: Leave empty
- **Include drafts**: Unchecked

5. Click **"Save"**

### Step 3: Test Webhook

1. Edit any content in Sanity Studio
2. Click **"Publish"**
3. Check webhook logs in Sanity (should show `200 OK`)
4. Refresh your site (changes should appear instantly)

**Troubleshooting**:
- `401 Unauthorized`: Secret mismatch
- `500 Error`: Check Vercel function logs
- `Timeout`: Increase function timeout in Vercel settings

---

## Part 4: Analytics & Monitoring

### Enable Vercel Analytics

1. Go to **Analytics** tab in Vercel dashboard
2. Click **"Enable"**
3. Select **Web Analytics** (or Speed Insights)
4. No code changes needed (Vercel auto-injects)

### Optional: Add Google Analytics

1. Get GA4 Measurement ID (e.g., `G-XXXXXXXXXX`)
2. Add to environment variables:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
3. Add tracking code to `app/layout.tsx`:
   ```tsx
   {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
     <Script
       src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
       strategy="afterInteractive"
     />
   )}
   ```

### Enable Vercel Speed Insights

1. Install package:
   ```bash
   npm install @vercel/speed-insights
   ```
2. Add to root layout:
   ```tsx
   import { SpeedInsights } from '@vercel/speed-insights/next';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <SpeedInsights />
         </body>
       </html>
     );
   }
   ```

---

## Part 5: Optimization Settings

### Image Optimization

**Default Config** (already optimal):
- Images served via Vercel Image Optimization
- Automatic WebP/AVIF conversion
- Responsive images with `next/image`

**Optional tweaks** in `next.config.js`:
```js
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

### Caching Headers

Vercel auto-configures Next.js cache headers. No manual config needed.

**Verify**:
- Static assets: `Cache-Control: public, max-age=31536000, immutable`
- ISR pages: `Cache-Control: s-maxage=60, stale-while-revalidate`

### Edge Config (Advanced)

For global data or feature flags:
1. Create Edge Config in Vercel dashboard
2. Use `@vercel/edge-config` package
3. Store feature flags, A/B test configs, etc.

---

## Part 6: Staging Environment

### Set Up Preview Deployments

1. Every git push to a branch creates a preview deployment
2. Preview URL: `https://longlife-git-branch-name.vercel.app`
3. Share with team for review before merging

### Staging Branch Strategy

**Option 1: Main = Production**
- `main` branch → Production
- Feature branches → Preview deployments
- Merge PR when ready to deploy

**Option 2: Separate Staging Branch**
- `production` branch → Production
- `staging` branch → Staging environment
- Feature branches → Preview deployments

**To configure**:
1. Go to **Settings → Git**
2. Set **Production Branch** (e.g., `main`)
3. All other branches deploy as previews

### Environment Variables per Environment

Use Vercel's environment scoping:
- **Production**: `longlife.com`
- **Preview**: Staging dataset or preview tokens
- **Development**: Local `.env.local`

Example:
```
NEXT_PUBLIC_SANITY_DATASET=production  (Production)
NEXT_PUBLIC_SANITY_DATASET=staging     (Preview)
```

---

## Part 7: Security & Best Practices

### Security Headers

Add to `next.config.js`:
```js
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ];
}
```

### Environment Variable Security

- [ ] Never commit `.env.local` to git
- [ ] Use Vercel's encrypted storage for secrets
- [ ] Rotate tokens periodically (every 90 days)
- [ ] Use least-privilege tokens (read vs. write)

### Rate Limiting

**Vercel Edge Middleware** (optional):
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: /* Upstash Redis */,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function middleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for');
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }

  return NextResponse.next();
}
```

---

## Part 8: Monitoring & Alerts

### Deploy Notifications

**Slack Integration**:
1. Vercel Settings → Integrations
2. Add Slack integration
3. Get notified on deploy success/failure

**Email Notifications**:
1. Settings → Notifications
2. Enable deploy notifications
3. Add team emails

### Uptime Monitoring

**External Services** (recommended):
- [UptimeRobot](https://uptimerobot.com) (free)
- [Pingdom](https://www.pingdom.com)
- [Better Uptime](https://betteruptime.com)

Monitor:
- `https://longlife.com` (homepage)
- `https://longlife.com/api/health` (if you create health check)

### Error Tracking

**Sentry Integration**:
1. Create Sentry project
2. Add env vars:
   ```
   NEXT_PUBLIC_SENTRY_DSN=your_dsn
   SENTRY_AUTH_TOKEN=your_token
   ```
3. Install Sentry SDK:
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

---

## Part 9: CI/CD Automation

### Automatic Deployments

**On Git Push**:
- Every push triggers build
- Production branch → production deployment
- Other branches → preview deployments

**Manual Deployments**:
1. Vercel dashboard → Deployments
2. Click "Redeploy" on any deployment

### Deploy Hooks

Create webhook to trigger deployments from external services:

1. Settings → Git → Deploy Hooks
2. Click **"Create Hook"**
3. Name: `Manual Deploy`
4. Branch: `main`
5. Copy webhook URL

**Trigger via curl**:
```bash
curl -X POST https://api.vercel.com/v1/integrations/deploy/...
```

### GitHub Actions (Optional)

Run tests before deploy:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
```

---

## Part 10: Rollback & Disaster Recovery

### Instant Rollback

**Via Vercel Dashboard**:
1. Go to Deployments
2. Find last working deployment
3. Click **"..."** → **"Promote to Production"**
4. Confirm

**Recovery Time**: ~2 minutes

### Content Rollback

**Sanity Studio**:
1. Open document
2. Click "Changes" tab
3. View history
4. Click "Restore" on previous version

**Full Dataset Restore**:
```bash
npm run export:sanity  # Regular backups
npm run import:sanity  # Restore from backup
```

### Backup Strategy

**Automated Daily Backups** (GitHub Actions):

```yaml
# .github/workflows/backup-sanity.yml
name: Backup Sanity
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run export:sanity
      - uses: actions/upload-artifact@v3
        with:
          name: sanity-backup
          path: backup.tar.gz
```

---

## Checklist: Deployment Complete

- [ ] Project deployed to Vercel
- [ ] Custom domain connected and SSL active
- [ ] All environment variables set
- [ ] Sanity webhook configured and tested
- [ ] Analytics enabled
- [ ] Build succeeds without errors
- [ ] Preview deployments working
- [ ] Error monitoring active (optional)
- [ ] Team notifications configured
- [ ] Backup strategy in place

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Sanity Webhooks**: https://www.sanity.io/docs/webhooks
- **Vercel Support**: https://vercel.com/support

---

**Deployed By**: _________________________
**Date**: _________________________
**Production URL**: https://longlife.com
