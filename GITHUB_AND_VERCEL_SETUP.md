# ✅ GitHub & Vercel Setup Complete

## What's Been Done

### ✅ GitHub Repository
- **Repo**: https://github.com/JohnConnorCode/drinklonglife
- **Status**: Code pushed, main branch set up
- **Initial Commit**: All project files
- **Visibility**: Public (ready for webhooks)

### 🚀 Ready for Vercel Deployment
Your code is ready to deploy. Just need your Sanity credentials!

---

## Next Step: Deploy to Vercel (5 minutes)

### Prerequisites
You need a **Sanity project**. If you don't have one yet:
1. Go to https://sanity.io
2. Create account (free)
3. Create new project:
   - Name: `Long Life`
   - Dataset: `production`
4. Copy your **Project ID** from Settings
5. Create a **Read Token** in API Tokens section

### Deploy Steps

1. **Open Vercel**: https://vercel.com/new
2. **Connect GitHub**: Click "Continue with GitHub"
3. **Find & Import**: Search for `drinklonglife` → Click "Import"
4. **Add Environment Variables** (before clicking Deploy):
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID = abc123...
   NEXT_PUBLIC_SANITY_DATASET = production
   SANITY_READ_TOKEN = sk-xyz...
   ```
5. **Deploy**: Click the Deploy button
6. **Wait**: 2-3 minutes for build & deployment

### Your Live Site
- **URL**: https://drinklonglife.vercel.app
- **Sanity Studio**: https://drinklonglife.vercel.app/studio
- **Custom Domain**: Add in Vercel Settings → Domains

---

## After Deployment: Populate Content

Once deployed, go to your Sanity Studio and create:

### Singletons (must exist)
- [ ] **siteSettings** — Brand info, logo, social links
- [ ] **navigation** — Header/footer navigation
- [ ] **homePage** — Hero, blends, CTA sections

### Collections
- [ ] **Blends** (3 required):
  - Yellow Bomb
  - Red Bomb
  - Green Bomb
- [ ] **Sizes & Pricing** (1-Gallon, ½-Gallon, Shot)
- [ ] **Ingredients** (optional, for sourcing)
- [ ] **Pages** (How We Make It, Subscriptions, etc.)
- [ ] **FAQ** (optional)
- [ ] **Journal Posts** (optional blog)

### First Content to Create
1. Create a **Blend** document (name: "Yellow Bomb")
2. Create a **Size** document (label: "1-Gallon Jug", price: 50)
3. Create **siteSettings** with your brand info
4. Create **homePage** and reference the blend + size
5. Publish all → Site auto-updates!

---

## Useful Links

- **GitHub Repo**: https://github.com/JohnConnorCode/drinklonglife
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Sanity Project**: https://sanity.io/manage
- **Sanity Studio**: https://drinklonglife.vercel.app/studio
- **Documentation**: See README.md for full setup guide

---

## Vercel Auto-Deployments

Every time you push to GitHub:
```bash
git push origin main
```

Vercel automatically:
1. Builds your Next.js app
2. Runs tests & checks
3. Deploys to production (if no errors)
4. Updates live site

---

## Sanity Webhooks (Optional)

For instant updates when content changes:

1. Go to Sanity project → API Webhooks
2. Create webhook:
   - URL: `https://drinklonglife.vercel.app/api/revalidate`
   - Token: `Bearer your-revalidate-token`
3. Add `REVALIDATE_SECRET` env var in Vercel
4. Publish in Sanity → Site updates instantly

---

## Troubleshooting

**Vercel deployment fails?**
- Check Node.js version: `node --version` (should be 18+)
- Check build output in Vercel dashboard

**Sanity Studio shows 404?**
- Ensure `NEXT_PUBLIC_SANITY_PROJECT_ID` is set correctly
- Confirm project is public or you have read token

**Content not showing?**
- Check Sanity documents are published (not draft)
- Verify SANITY_READ_TOKEN is valid
- Wait 60 seconds for ISR revalidation

---

**Ready?** Go to https://vercel.com/new and deploy! 🚀
