# Long Life - Launch-Ready Documentation

## Project Overview

Long Life is a premium superfood juice brand built with Next.js 14, Sanity CMS, and Tailwind CSS. This document provides comprehensive guidance for launching and maintaining the production site.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [Content Management](#content-management)
4. [Deployment](#deployment)
5. [Webhooks & Revalidation](#webhooks--revalidation)
6. [Forms & Integrations](#forms--integrations)
7. [Performance & SEO](#performance--seo)
8. [Troubleshooting](#troubleshooting)
9. [Rollback Plan](#rollback-plan)

---

## Quick Start

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables (see .env.example)
cp .env.example .env.local
# Edit .env.local with your Sanity project ID and tokens

# 3. Seed initial content (optional, first time only)
npm run seed

# 4. Start development servers
npm run dev          # Next.js app (http://localhost:3000)
npm run studio       # Sanity Studio (http://localhost:3000/studio)

# 5. Build for production
npm run build
npm run start
```

### First-Time Setup Checklist

- [ ] Create Sanity project at https://sanity.io
- [ ] Add project ID to `.env.local`
- [ ] Generate API tokens (read + write)
- [ ] Run seed script: `npm run seed`
- [ ] Upload images in Sanity Studio
- [ ] Configure Vercel project
- [ ] Set up revalidation webhook

---

## Environment Setup

### Required Environment Variables

Create `.env.local` for local development and configure these in Vercel for production:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://longlife.com

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# Sanity Tokens (for draft preview and seed script)
SANITY_READ_TOKEN=your_read_token
SANITY_WRITE_TOKEN=your_write_token

# Webhook Secret (for content revalidation)
SANITY_REVALIDATE_SECRET=your_random_secret_string

# Analytics (optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

### Getting Sanity Credentials

1. **Project ID**: Found in `sanity.io` dashboard under Project Settings
2. **Read Token**: Manage → API → Tokens → Add API Token (Viewer role)
3. **Write Token**: Manage → API → Tokens → Add API Token (Editor role)
4. **Revalidate Secret**: Generate a random string: `openssl rand -base64 32`

---

## Content Management

### Sanity Studio Access

Access the CMS at `/studio` (e.g., `https://longlife.com/studio`)

### Content Model Overview

**Singletons** (only one instance):
- **Site Settings**: Logo, social links, contact info, SEO defaults
- **Navigation**: Header and footer navigation links
- **Home Page**: Hero, value props, community section

**Collections** (multiple instances):
- **Blends**: Product pages (Yellow/Red/Green Bomb)
- **Ingredients**: Individual ingredient profiles
- **Farms**: Supplier information
- **Journal**: Blog posts
- **FAQ**: Question and answer pairs
- **Pages**: Generic CMS-managed pages

### How to Edit Key Sections

#### Update Home Page Hero
1. Go to `/studio`
2. Click "Home Page" (top of sidebar)
3. Edit `Hero` section
4. Click "Publish"
5. Changes appear in ~60 seconds (or instantly with webhook)

#### Add a New Blend
1. Click "Blends" in Studio
2. Click "+ Create" button
3. Fill in required fields:
   - Name, Slug, Tagline
   - Select ingredients (min 2)
   - Upload image (min 1200x1200px)
   - Set label color (yellow/red/green)
   - Set display order (1, 2, 3...)
4. Publish
5. Blend appears on homepage and `/blends`

#### Publish a Journal Post
1. Click "Journal" in Studio
2. Create new post
3. Add title, excerpt, body (rich text)
4. Upload featured image
5. Set publish date
6. Publish

### Image Guidelines

- **Blends**: 1200x1200px minimum, square ratio
- **Blog posts**: 1600x900px (16:9 ratio)
- **Logos**: SVG or PNG with transparency
- **File size**: Compress images to <500KB
- **Alt text**: Always required for accessibility

---

## Deployment

### Vercel Deployment (Recommended)

#### Initial Setup
1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables (copy from `.env.example`)
4. Deploy

#### Production Configuration

**Project Settings → General**:
- Framework: Next.js
- Root Directory: `./`
- Build Command: `npm run build`
- Output Directory: `.next`

**Project Settings → Environment Variables**:
Add all variables from `.env.example`

**Project Settings → Domains**:
- Primary: `longlife.com`
- Redirect: `www.longlife.com` → `longlife.com`

#### Cache Configuration

Vercel automatically handles Next.js caching. No additional config needed.

**Image Optimization**: Enabled by default via `next/image`

---

## Webhooks & Revalidation

### Why Webhooks Matter

By default, content changes take up to 60 seconds to appear (ISR). Webhooks enable instant updates.

### Setup Instructions

1. **In Vercel** (or production environment):
   - Add `SANITY_REVALIDATE_SECRET` environment variable
   - Redeploy to activate webhook endpoint

2. **In Sanity Studio**:
   - Go to `sanity.io` → Project → API → Webhooks
   - Click "Create Webhook"
   - Name: `Production Revalidation`
   - URL: `https://longlife.com/api/revalidate`
   - Dataset: `production`
   - Trigger on: Create, Update, Delete
   - Secret: Use the same value as `SANITY_REVALIDATE_SECRET`
   - HTTP Method: POST
   - Include drafts: NO
   - Filter: Leave empty (revalidates all changes)

3. **Test**:
   - Edit any content in Studio and publish
   - Check Sanity webhook logs (should show 200 OK)
   - Refresh your site (changes should appear instantly)

### Troubleshooting Webhooks

**Webhook fails (401 Unauthorized)**:
- Secret mismatch between Sanity and Vercel env var
- Regenerate secret and update both places

**Webhook succeeds but content doesn't update**:
- Check Vercel deployment logs
- Verify `revalidateTag()` is called for the content type
- Try manual revalidation: `https://longlife.com/api/revalidate?secret=YOUR_SECRET`

---

## Forms & Integrations

### Newsletter Form

**Current State**: Validates email and logs to server
**Integration Point**: `/lib/actions.ts` → `subscribeNewsletter()`

**To Connect Email Provider**:

```typescript
// In /lib/actions.ts

// Replace TODO section with:
const response = await fetch('https://api.mailchimp.com/3.0/lists/YOUR_LIST_ID/members', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email_address: email,
    status: 'subscribed',
  }),
});
```

**Providers to Consider**:
- Mailchimp (easiest)
- ConvertKit (creator-friendly)
- SendGrid (developer-friendly)
- Klaviyo (e-commerce focused)

### Wholesale Inquiry Form

**Current State**: Validates inputs and logs to server
**Integration Point**: `/lib/actions.ts` → `submitWholesaleInquiry()`

**To Connect CRM**:

```typescript
// Option 1: Save to Sanity
import { client } from '@/lib/sanity.client';

await client.create({
  _type: 'wholesaleInquiry',
  name,
  email,
  company,
  message,
  submittedAt: new Date().toISOString(),
});

// Option 2: Send to Google Sheets, Airtable, or Notion
// Use their respective APIs
```

### Rate Limiting

Forms currently have basic honeypot protection. For production:

1. **Add Vercel Rate Limiting** (edge config):
   ```typescript
   import { ratelimit } from '@vercel/edge-config';
   ```

2. **Add reCAPTCHA v3** (invisible):
   - Get keys from Google reCAPTCHA
   - Add `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` to env
   - Verify tokens server-side

---

## Performance & SEO

### Lighthouse Targets (Mobile)

- **Performance**: ≥ 90
- **Accessibility**: ≥ 95
- **Best Practices**: ≥ 95
- **SEO**: ≥ 95

### Image Optimization Checklist

- ✅ Use `next/image` for all images
- ✅ Specify `width` and `height` attributes
- ✅ Use `priority` only for hero images
- ✅ Use `sizes` attribute for responsive images
- ✅ Lazy load below-the-fold images (default)

### SEO Checklist

- ✅ Unique meta titles and descriptions per page
- ✅ JSON-LD structured data (Organization, Product, BlogPosting)
- ✅ Dynamic sitemap.xml at `/sitemap.xml`
- ✅ Robots.txt at `/robots.txt`
- ✅ Open Graph images for social sharing
- ✅ Twitter Card metadata
- ✅ Canonical URLs set correctly

### Testing Tools

**Before Launch**:
- Google Lighthouse (Chrome DevTools)
- PageSpeed Insights: https://pagespeed.web.dev
- Google Rich Results Test: https://search.google.com/test/rich-results
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug

---

## Troubleshooting

### Build Fails

**Error: Missing environment variables**
- Check Vercel dashboard → Settings → Environment Variables
- Ensure all vars from `.env.example` are set
- Redeploy

**Error: TypeScript errors**
```bash
npm run typecheck  # Run locally to see errors
```

**Error: Sanity client connection failed**
- Verify project ID is correct
- Check API token permissions
- Ensure dataset name matches

### Runtime Issues

**Images not loading**
- Check Sanity CDN URL in `next.config.js`
- Verify image asset exists in Sanity
- Check browser console for CORS errors

**Content not updating**
- Check webhook logs in Sanity
- Verify revalidation endpoint is accessible
- Try manual cache clear: Deploy → Redeploy

**Forms not submitting**
- Check browser console for validation errors
- Verify server actions are working (check Network tab)
- Check honeypot field isn't visible (bot protection)

---

## Rollback Plan

### Emergency Rollback (Vercel)

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Confirm

**Recovery Time**: ~2 minutes

### Content Rollback (Sanity)

1. Export current dataset:
   ```bash
   npm run export:sanity
   ```

2. Restore from backup:
   ```bash
   npm run import:sanity
   ```

3. Or use Sanity's built-in history:
   - Open document in Studio
   - Click "Changes" tab
   - Revert to previous version

### Database Backup Strategy

**Automated Backups** (recommended):
```bash
# Set up cron job or GitHub Action
0 2 * * * cd /path/to/project && npm run export:sanity
```

**Manual Backup**:
```bash
npm run export:sanity  # Creates backup.tar.gz
```

---

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Sanity Docs**: https://www.sanity.io/docs
- **Vercel Support**: https://vercel.com/support
- **Project Repository**: [Your GitHub URL]

---

## Launch Checklist

### Pre-Launch (Staging)

- [ ] All content populated in Sanity
- [ ] Images uploaded and optimized
- [ ] Navigation links working
- [ ] Forms submitting successfully
- [ ] Lighthouse scores meet targets (≥90/95/95/95)
- [ ] Test on mobile devices (iOS Safari, Chrome)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] 404 and 500 pages styled correctly
- [ ] Revalidation webhook configured and tested
- [ ] Social sharing previews tested (OG/Twitter)

### Go-Live

- [ ] DNS configured for primary domain
- [ ] SSL certificate active (automatic with Vercel)
- [ ] `NEXT_PUBLIC_SITE_URL` set to production domain
- [ ] Vercel analytics enabled
- [ ] Error monitoring active (Sentry optional)
- [ ] Email provider connected (newsletter/wholesale)
- [ ] Google Analytics / Tag Manager (optional)
- [ ] Sanity webhook pointed to production URL
- [ ] Submit sitemap to Google Search Console

### Post-Launch (24 hours)

- [ ] Monitor Vercel deployment logs
- [ ] Check error rates in analytics
- [ ] Test content publishing workflow
- [ ] Verify email forms working
- [ ] Monitor Lighthouse scores
- [ ] Check webhook success rate in Sanity

---

## Editor Quick Reference

### Top 5 Editing Tasks

1. **Change homepage hero text**: Studio → Home Page → Hero section
2. **Add a new blend**: Studio → Blends → Create new
3. **Publish blog post**: Studio → Journal → Create new
4. **Update FAQ**: Studio → FAQ → Edit existing or create new
5. **Change navigation links**: Studio → Navigation → Header Links

### Publishing Workflow

1. Make changes in Studio
2. Click "Publish" button (top right)
3. Changes go live in ~60 seconds (or instantly with webhook)

### Getting Help

For CMS questions, see: **Editor Quick Start Guide** (separate PDF)

---

**Last Updated**: Nov 2024
**Version**: 1.0 (Launch Ready)
