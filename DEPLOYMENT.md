# Long Life — Deployment Guide

Your **Long Life** Next.js + Sanity project is production-ready and can be deployed immediately. Follow these steps to get live.

## Quick Start: Vercel Deployment (Recommended)

### 1. Create a Sanity Project

If you haven't already:

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Create a new project:
   - **Project name**: Long Life
   - **Dataset**: production
   - **Visibility**: Private (you can make it public later for webhooks)
3. Copy your **Project ID** (looks like `abc123xyz`)
4. Go to **Settings → API** → Create a **Read Token**

### 2. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial Long Life project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/drinklonglife.git
git push -u origin main
```

### 3. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure environment variables:

| Key | Value | Source |
|-----|-------|--------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `abc123xyz` | Sanity project settings |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | Sanity project settings |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` | Vercel deployment domain or custom domain |
| `SANITY_READ_TOKEN` | Your read token | Sanity API tokens page |

4. Click **Deploy**
5. Your site is live! 🎉

**Custom domain?** Add it in Vercel **Settings → Domains**.

## Post-Deployment Setup

### 1. Configure Sanity Webhooks (Optional but Recommended)

Webhooks enable instant content updates:

1. In **Sanity Studio** → Go to **Settings → API**
2. Click **Webhooks**
3. **Add webhook**:
   - **URL**: `https://yourdomain.com/api/revalidate` (create this route first)
   - **Events**: Select "Document published" and "Document updated"
   - **Include draft**: No
4. **Create webhook**, copy the webhook token

### 2. Create Revalidation Route (Optional)

If you want instant updates on publish, create `/app/api/revalidate/route.ts`:

```typescript
import { revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  const token = request.headers.get('authorization');
  if (token !== `Bearer ${process.env.REVALIDATE_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();

  // Revalidate based on document type
  const type = body._type;
  if (type === 'blend') revalidateTag('blend');
  if (type === 'post') revalidateTag('post');
  if (type === 'homePage') revalidateTag('home');

  return new Response('Revalidated', { status: 200 });
}
```

Add `REVALIDATE_SECRET` to Vercel env vars with a random token.

### 3. Seed Initial Content

Log in to your Sanity Studio at `https://yourdomain.com/studio` and create:

1. **Home Page** (singleton document):
   - Fill in hero section, value props, featured blends, etc.

2. **Site Settings** (singleton):
   - Add your logo, contact info, social links

3. **Navigation** (singleton):
   - Configure header and footer navigation

4. **Blends** (create three):
   - **Yellow Bomb** (tagline: "Wake the system. Feel the rush.")
   - **Red Bomb** (tagline: "Rebuild from the inside out.")
   - **Green Bomb** (tagline: "Find your edge — stay in flow.")
   - Assign ingredients, sizes, images

5. **Sizes & Pricing**:
   - 1-Gallon: $50
   - ½-Gallon: $35
   - Shot: $5

6. **Pages** (as needed):
   - How We Make It
   - Ingredients & Sourcing
   - Subscriptions
   - Wholesale
   - Terms & Privacy

## Common Tasks

### Add a New Page

1. Create document in Sanity (type: `page`)
2. Add to navigation if needed
3. Site auto-generates route at `/{slug}`

### Update Copy

All text is editable in Sanity Studio. Simply publish changes and the site revalidates within seconds (60s default).

### Change Colors/Branding

Edit `siteSettings` in Sanity Studio or update CSS variables in `/styles/globals.css`.

### Connect Email Provider

Edit `/lib/actions.ts` and add your provider SDK (Mailchimp, SendGrid, etc.).

## Monitoring

### Vercel Analytics

- Built-in to Vercel deployments
- View at **Vercel Dashboard → Analytics**

### Logs

View deployment logs in **Vercel Dashboard → Deployments**.

## Troubleshooting

**Site shows placeholder content?**
- Ensure `NEXT_PUBLIC_SANITY_PROJECT_ID` is correct
- Check Sanity project is public or you have valid read token
- Verify Sanity dataset name matches env var

**Studio won't load?**
- Ensure you're on `/studio` route
- Check Project ID matches Sanity project
- Verify API version is correct (`2024-01-01`)

**Webhooks not firing?**
- Confirm webhook URL is correct
- Check webhook token in Sanity settings
- Test webhook in Sanity dashboard

## Next Steps

- [ ] Configure email provider for newsletter/forms
- [ ] Set up analytics (Vercel, Sentry, Posthog)
- [ ] Integrate payment processor (Stripe, Shopify)
- [ ] Set up customer accounts
- [ ] Deploy to production domain
- [ ] Configure SSL (auto with Vercel)
- [ ] Set up backups

## Support

Refer to **README.md** for development, architecture, and customization details.

---

**Ready to go live?** 🚀

Questions? Check Sanity docs: https://www.sanity.io/docs
