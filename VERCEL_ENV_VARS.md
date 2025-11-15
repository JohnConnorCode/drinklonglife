# Vercel Environment Variables - Required Setup

## 🚨 CRITICAL: Set These in Vercel Dashboard

Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

---

## ✅ Required Variables (Must Have)

### Stripe (E-commerce)
```
STRIPE_SECRET_KEY_PRODUCTION=sk_live_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PRODUCTION=pk_live_51...
STRIPE_WEBHOOK_SECRET_PRODUCTION=whsec_...
```

OR use generic keys (will work for both test and production based on Sanity mode):
```
STRIPE_SECRET_KEY=sk_live_51... (or sk_test_51... for testing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51... (or pk_test_51... for testing)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Sanity CMS
```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_READ_TOKEN=sk...
SANITY_WRITE_TOKEN=sk...
```

### Supabase (Auth & Database)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Site Configuration
```
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

---

## 🔧 Optional Variables

### Webhooks & Revalidation
```
SANITY_REVALIDATE_SECRET=your_random_secret
PREVIEW_SECRET=your_preview_secret
```

---

## 📝 How to Set Them

### Method 1: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click your project
3. Click **Settings** tab
4. Click **Environment Variables** in sidebar
5. For each variable:
   - Enter **Key** (e.g., `STRIPE_SECRET_KEY`)
   - Enter **Value** (e.g., `sk_live_51...`)
   - Select environments: **Production**, **Preview**, **Development**
   - Click **Save**

### Method 2: Vercel CLI

```bash
vercel env add STRIPE_SECRET_KEY production
# Paste your secret key when prompted

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# Paste your publishable key when prompted
```

### Method 3: Pull from Vercel (to sync locally)

```bash
vercel env pull .env.local
```

This downloads all Vercel environment variables to your local `.env.local` file.

---

## ✅ Verify Setup

### Check if variables are set:

```bash
# Using Vercel CLI
vercel env ls
```

### Test locally with Vercel environment:

```bash
# Pull Vercel env vars to local
vercel env pull

# Run dev with Vercel env
vercel dev
```

---

## 🔍 Common Issues

### Issue: "Environment variable not found"
**Solution**: Make sure you selected the right environments when adding the variable (Production, Preview, Development)

### Issue: Changes not taking effect
**Solution**: Redeploy your application after adding environment variables

### Issue: "Stripe secret key is not configured"
**Solution**:
1. Verify `STRIPE_SECRET_KEY` or `STRIPE_SECRET_KEY_PRODUCTION` is set
2. Check it's assigned to Production environment
3. Verify the key is valid (starts with `sk_live_` or `sk_test_`)

---

## 🚀 After Setting Variables

1. **Redeploy** your application (Vercel auto-redeploys when env vars change)
2. **Test checkout** on your production site
3. **Check Sanity** - Set Stripe mode to `production` for live charges, or `test` for testing

---

## 📋 Quick Copy-Paste Template

Use this template to quickly fill in your variables:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_
STRIPE_WEBHOOK_SECRET=whsec_

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_READ_TOKEN=
SANITY_WRITE_TOKEN=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Site
NEXT_PUBLIC_SITE_URL=https://
```

Replace the values with your actual credentials.
