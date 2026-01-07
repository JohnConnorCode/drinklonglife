# Long Life — Next.js + Sanity CMS

A production-ready, fully-editable marketing and e-commerce foundation for **Long Life** cold-pressed juices. Built with **Next.js 14** (App Router) and **Sanity CMS v3**.

## Features

- **Content-Driven**: All copy, images, and structure managed in Sanity CMS
- **Fast & Accessible**: Lighthouse-optimized (90+), TypeScript, Tailwind CSS
- **SEO Ready**: Dynamic metadata, structured data, XML sitemap, robots.txt
- **Fully Editable**: Blends, ingredients, farms, journal posts, FAQs, pages—all from Sanity Studio
- **Embedded Studio**: Edit content directly at `/studio`
- **ISR & Webhooks**: Fast content updates via tag-based revalidation
- **Form Stubs**: Newsletter and wholesale inquiry forms (ready for provider integration)

## Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript, React Server Components)
- **Styling**: Tailwind CSS, CSS variables for theming
- **CMS**: Sanity v3 (embedded Studio, GROQ queries)
- **Images**: `next/image` + Sanity image pipeline (hotspot, AVIF/WebP)
- **Validation**: Zod for forms
- **Deploy**: Vercel (optimized)

## Project Structure

```
/app
  /(site)
    /[slug]/page.tsx           # Generic CMS pages
    /journal
      /page.tsx
      /[slug]/page.tsx
    /blends
      /page.tsx
      /[slug]/page.tsx
    /faq/page.tsx
    /page.tsx                  # Homepage
    /layout.tsx                # Global layout, Header/Footer
    /sitemap.ts
    /robots.ts
  /studio
    /[[...index]]/page.tsx     # Embedded Sanity Studio
    /layout.tsx
/components
  /ui/                         # shadcn/ui primitives (add as needed)
  Header.tsx
  Footer.tsx
  Section.tsx
  RichText.tsx
  BlendCard.tsx
  NewsletterForm.tsx
/lib
  sanity.client.ts
  sanity.queries.ts            # All GROQ queries
  image.ts                     # Image URL builder
  actions.ts                   # Server actions (forms)
/sanity
  /schemas                     # Content models
    blockContent.ts
    siteSettings.ts
    navigation.ts
    homePage.ts
    page.ts
    blend.ts
    ingredient.ts
    farm.ts
    sizePrice.ts
    processStep.ts
    standard.ts
    post.ts
    faq.ts
    cta.ts
  sanity.config.ts
  structure.ts                 # Desk configuration
/styles
  globals.css
  prose.css
/public
  (favicon, etc.)
```

## Getting Started

### 1. Prerequisites

- Node.js 18+
- npm or yarn
- A Sanity account (free at https://sanity.io)

### 2. Clone & Install

```bash
git clone <repo-url>
cd DrinkLongLife
npm install
```

### 3. Set Up Sanity Project

Create a new Sanity project at https://sanity.io/manage. Then:

```bash
# Get your Project ID and dataset name
# Add to .env.local (see .env.example)
```

**Create `.env.local`** (do not commit):

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: for draft preview
SANITY_READ_TOKEN=your_read_token_here
PREVIEW_SECRET=your_secret_token_here
```

### 4. Seed Initial Content

Seed the three blends and home page setup:

```bash
# TODO: Create a seed script in /scripts/seed.ts
# For now, manually create in Sanity Studio:
# - Home Page (singleton)
# - Site Settings (singleton)
# - Navigation (singleton)
# - Yellow Bomb, Red Bomb, Green Bomb (blends)
# - Sizes & Pricing
# - Process Steps
# - Quality Standards
```

### 5. Run Development Server

```bash
npm run dev
```

Visit:
- **Site**: http://localhost:3000
- **Sanity Studio**: http://localhost:3000/studio

## Sanity Content Model

All content is editable in Sanity Studio. Key document types:

### Singletons (Global)

- **siteSettings**: Brand title, logo, social links, contact info, SEO defaults
- **navigation**: Primary nav, footer nav, legal links
- **homePage**: Hero section, value props, featured blends, pricing, process, standards, newsletter CTA

### Collections

- **page**: Generic pages (e.g., "How We Make It", "Subscriptions", "Wholesale")
- **blend**: Juice blends with ingredients, sizes, description
- **ingredient**: Individual ingredients with type, seasonality, source farms
- **farm**: Farm/supplier details
- **sizePrice**: Bottle sizes and pricing (e.g., "$50 1-Gallon Jug")
- **processStep**: Steps in the production process
- **standard**: Quality/sourcing standards
- **post**: Journal/blog posts
- **faq**: Frequently asked questions
- **cta**: Reusable call-to-action buttons

### Key Fields

All text, images, and metadata pull from Sanity. No hardcoded content except UI labels.

**Portable Text**: Rich text fields (blockContent) support:
- Headings, bold, italic, links
- Images with alt text and captions
- Lists, quotes, code blocks

## Pages & Routing

| Route | Content Source | Features |
|-------|---|---|
| `/` | `homePage` singleton | Hero, blends, pricing, process, standards, newsletter |
| `/blends` | All `blend` documents | Grid of all blends |
| `/blends/[slug]` | Individual `blend` | Ingredients, sizes, description |
| `/journal` | All `post` documents | Blog grid with preview cards |
| `/journal/[slug]` | Individual `post` | Full article, metadata, publish date |
| `/faq` | `faq` collection | Expandable Q&A |
| `/[slug]` | `page` documents | Generic pages (How We Make It, Subscriptions, etc.) |
| `/studio` | Embedded Sanity | Content management interface |

## Forms

### Newsletter Signup

- **Component**: `NewsletterForm.tsx`
- **Server Action**: `submitNewsletter()` in `/lib/actions.ts`
- **TODO**: Integrate with Mailchimp, ConvertKit, or SendGrid
- **Validation**: Email required, Zod schema

### Wholesale Inquiry

- **Endpoint**: Create a route at `/wholesale/page.tsx` with form
- **Server Action**: `submitWholesaleInquiry()` in `/lib/actions.ts`
- **Fields**: Name, email, company, location, expected volume, message
- **Bot Protection**: Honeypot field
- **TODO**: Save to database/CRM, send confirmation + sales notification

## SEO & Performance

### Metadata

Each page uses Next.js `metadata` export:

```typescript
export const metadata: Metadata = {
  title: 'Blends | Long Life',
  description: 'Our cold-pressed juice blends...',
};
```

Fallback to `siteSettings` if document-specific SEO not set.

### Structured Data

- **Organization**: Root level with `siteSettings`
- **Product**: Each blend with name, description, image, price
- **BlogPosting**: Journal posts with author, date, content
- **LocalBusiness**: Footer contact info

(Implement in `openGraphImage.tsx` or API routes as needed)

### Sitemap & Robots

- **Sitemap**: `/sitemap.ts` — dynamic routes for blends, posts, pages
- **Robots**: `/robots.ts` — disallows `/studio`

### Image Optimization

- Uses `next/image` with dynamic width/height from Sanity metadata
- Supports AVIF, WebP via Sanity CDN
- Hotspot & crop support for manual fine-tuning

## Caching & Revalidation

### ISR (Incremental Static Regeneration)

Pages revalidate every **60 seconds** by default:

```typescript
export const revalidate = 60;
```

### Webhook Revalidation

**TODO**: Set up Sanity webhook to trigger revalidation on publish:

1. **Sanity → Webhooks**: Add HTTP POST webhook
2. **Endpoint**: `https://yoursite.com/api/revalidate`
3. **Trigger**: On publish of any document
4. **Payload**: `{ _type: 'blend', slug: '...' }`

**Handler** (create `/api/revalidate/route.ts`):

```typescript
export async function POST(req: Request) {
  const token = req.headers.get('sanity-webhook-token');
  if (token !== process.env.REVALIDATE_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await req.json();
  const type = body._type;

  // Tag-based revalidation
  if (type === 'blend') {
    revalidateTag('blend');
  } else if (type === 'post') {
    revalidateTag('post');
  } else if (type === 'homePage') {
    revalidateTag('home');
  }

  return new Response('Revalidated', { status: 200 });
}
```

## Environment Variables

Create `.env.local` based on `.env.example`:

```env
# Required
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional
SANITY_READ_TOKEN=xxx                    # For draft mode
PREVIEW_SECRET=xxx                       # Preview mode secret
REVALIDATE_SECRET=xxx                    # Webhook revalidation token
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=xxx      # Vercel Analytics
```

## Deployment

### Vercel

Fastest & easiest option:

1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Add environment variables (same as `.env.local`)
4. Deploy

**Vercel Config** (optional `vercel.json`):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": [
    "NEXT_PUBLIC_SANITY_PROJECT_ID",
    "NEXT_PUBLIC_SANITY_DATASET",
    "NEXT_PUBLIC_SITE_URL"
  ]
}
```

### Other Platforms

Works on any Node.js host (AWS, Render, Railway, etc.). Build output is a standard Next.js app.

```bash
npm run build
npm run start
```

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run typecheck

# Lint
npm run lint

# Sanity CLI commands
npm run studio                            # Run Sanity dev server (separate)
npm run sanity:deploy                     # Deploy Sanity Studio to CDN
```

## Testing

### E2E Tests with Playwright

The project includes comprehensive end-to-end tests covering checkout flows, subscription handling, and UI components.

#### Test Setup

Before running tests, validate your environment:

```bash
# Run environment validation script
bash scripts/setup-test-env.sh
```

This will check:
- Node.js version (18+ required)
- Playwright installation
- Required environment variables
- Test directory structure

#### Running Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run tests with visible browser
npm run test:e2e:headed

# Run tests with Playwright UI (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run only checkout tests
npm run test:checkout

# Run only visual/UI tests
npm run test:visual

# View test report
npm run test:report

# Run tests in CI mode (GitHub Actions format)
npm run test:ci
```

#### Test Structure

```
tests/
  e2e/
    checkout/
      guest-checkout.spec.ts          # Guest checkout flow
      authenticated-checkout.spec.ts  # Logged-in user checkout
      subscription-checkout.spec.ts   # Subscription purchases
      checkout-errors.spec.ts         # Error handling
      webhook-verification.spec.ts    # Stripe webhook tests
    ui/
      homepage.spec.ts                # Homepage rendering
      blend-pages.spec.ts             # Product pages
      navigation.spec.ts              # Site navigation
      responsive.spec.ts              # Mobile/tablet views
      image-loading.spec.ts           # Image optimization
```

#### Continuous Integration

Tests run automatically on:
- Pull requests to `main`
- Pushes to `main`
- Manual workflow dispatch

See `.github/workflows/e2e-tests.yml` for CI configuration.

#### Environment Variables for Testing

Required in `.env.local` and GitHub Secrets:

```env
# Public
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Private (for backend tests)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
SANITY_READ_TOKEN=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

**Note**: Use TEST mode Stripe keys for local development. Production keys are only needed in the production environment.

## Adding Features

### Add a New Page

1. Create `/sanity/schemas/mypage.ts` (or add to `page.ts`)
2. Create `/app/mypage/page.tsx` (or `/app/[slug]/page.tsx` handles generics)
3. Add GROQ query to `/lib/sanity.queries.ts`
4. Create Sanity document in Studio

### Add a New Content Section

1. Create schema in `/sanity/schemas/`
2. Reference in `homePage.ts` or relevant document
3. Add GROQ fragment in `/lib/sanity.queries.ts`
4. Create React component in `/components/`
5. Use in page component

### Customize Styling

Edit `/styles/globals.css` and `/styles/prose.css`. Theme colors are CSS variables:

```css
:root {
  --bg: #ffffff;
  --fg: #000000;
  --accent-yellow: #fcd34d;
  --accent-red: #ef4444;
  --accent-green: #10b981;
}
```

Override in Sanity `siteSettings` for dynamic theming.

### Connect Email Provider

Edit `/lib/actions.ts`:

```typescript
// Example: Mailchimp
import mailchimp from '@mailchimp/mailchimp_marketing';

export async function submitNewsletter(formData: FormData) {
  const { email } = newsletterSchema.parse({ email: formData.get('email') });

  mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER_PREFIX,
  });

  try {
    await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
      email_address: email,
      status: 'pending',
    });
    return { success: true, message: 'Check your email to confirm.' };
  } catch (error) {
    return { success: false, error: 'Subscription failed.' };
  }
}
```

## Troubleshooting

### `NEXT_PUBLIC_SANITY_PROJECT_ID is missing`

- Ensure `.env.local` exists and has `NEXT_PUBLIC_SANITY_PROJECT_ID`
- Restart dev server after env changes

### Sanity Studio won't load

- Check Project ID and dataset are correct
- Ensure `NEXT_PUBLIC_SANITY_DATASET` matches Sanity project dataset
- Try clearing `.next/` and reinstalling: `rm -rf .next node_modules && npm install`

### Images not showing

- Verify Sanity project is set to public (or read token provided)
- Check Sanity CDN is accessible (may be blocked by firewall)
- Ensure image asset is published, not draft

### Build fails with TypeScript errors

```bash
npm run typecheck
# Fix errors, then
npm run build
```

## Performance Targets

- **Lighthouse**: Performance 90+, Accessibility 95+, Best Practices 95+, SEO 95+
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1
- **Bundle Size**: Main JS <100KB

Monitor with Vercel Analytics + Sentry (optional).

## Support & Next Steps

### TODO Items

- [ ] Integrate email provider (Mailchimp, ConvertKit, SendGrid)
- [ ] Add to database for form submissions
- [ ] Implement checkout flow (Shopify, Stripe)
- [ ] Add customer account/subscription management
- [ ] Set up SMS notifications (Twilio, etc.)
- [ ] Implement advanced filtering/search on blends
- [ ] Create blog tag system
- [ ] Add testimonials/reviews section
- [ ] Implement location-aware messaging
- [ ] Set up analytics (Vercel Analytics, Posthog)
- [ ] Add A/B testing framework
- [ ] Internationalization (i18n) for multiple languages

### Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Sanity Docs](https://www.sanity.io/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [GROQ Documentation](https://www.sanity.io/docs/groq)

## License

Proprietary. All rights reserved.

---

**Built with ❤️ for Long Life**
