# DrinkLongLife - Remaining Implementation Guide

This document outlines the remaining work to complete the site improvements.

## ✅ Completed Today

### 1. Product Pages Redesign
- Redesigned blend detail pages with compact layout
- Sticky product image
- Moved description into hero section
- Compact 4-column ingredient grid with tooltips
- Added "Explore Other Blends" section
- Reduced white space by ~40%

### 2. Auth System Fixed
- Created `/api/auth/signout` route
- Fixed Header to use SignOutButton component
- Works in both desktop and mobile menus

### 3. Cart Counter Fixed
- Cart icon hidden when empty
- Shows with badge when items exist
- Proper top-right positioning

### 4. Email Infrastructure Started
- ✅ Installed `resend` package
- ✅ Created `lib/email/client.ts`
- ✅ Created `lib/email/templates/newsletter-welcome.tsx`
- ✅ Created `lib/email/templates/order-confirmation.tsx`
- ✅ Created `lib/email/templates/contact-form.tsx`

---

## 🔨 Remaining Work

### Phase 1: Complete Email Integration (2-3 hours)

#### Step 1: Add Environment Variable
Add to `.env.local`:
```bash
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM="Long Life <hello@drinklonglife.com>"
```

Add to `.env.example`:
```bash
# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM="Long Life <hello@drinklonglife.com>"
```

#### Step 2: Update `lib/actions.ts`

Replace lines 21-50 with:
```typescript
import { resend, EMAIL_CONFIG } from './email/client';
import { render } from '@react-email/render';
import NewsletterWelcomeEmail from './email/templates/newsletter-welcome';

export async function submitNewsletter(formData: FormData) {
  const email = formData.get('email');

  try {
    const validatedData = newsletterSchema.parse({ email });

    // Send welcome email
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: validatedData.email,
      subject: 'Welcome to Long Life! 🌱',
      react: NewsletterWelcomeEmail({ email: validatedData.email }),
    });

    // TODO: Save to database/Klaviyo for ongoing campaigns

    return {
      success: true,
      message: 'Thanks for subscribing! Check your email for confirmation.',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      error: 'Something went wrong. Please try again.',
    };
  }
}
```

Replace lines 53-100 with:
```typescript
import ContactFormEmail from './email/templates/contact-form';

export async function submitWholesaleInquiry(formData: FormData) {
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    company: formData.get('company'),
    location: formData.get('location'),
    expectedVolume: formData.get('expectedVolume'),
    message: formData.get('message'),
    honeypot: formData.get('honeypot'),
  };

  // Check honeypot (bot protection)
  if (data.honeypot) {
    return {
      success: true,
      message: 'Thanks! We will review your inquiry.',
    };
  }

  try {
    const validatedData = wholesaleSchema.parse(data);

    // Send to sales team
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.supportEmail,
      replyTo: validatedData.email,
      subject: `Wholesale Inquiry from ${validatedData.name}`,
      react: ContactFormEmail({
        name: validatedData.name,
        email: validatedData.email,
        message: `Company: ${validatedData.company}\nLocation: ${validatedData.location}\nExpected Volume: ${validatedData.expectedVolume}\n\n${validatedData.message}`,
        timestamp: new Date().toISOString(),
      }),
    });

    return {
      success: true,
      message:
        'Thanks for your inquiry! Our team will review and respond within 2 business days.',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      error: 'Something went wrong. Please try again.',
    };
  }
}
```

#### Step 3: Add to Stripe Webhook

In `app/api/stripe/webhook/route.ts`, after successful order creation, add:

```typescript
import { resend, EMAIL_CONFIG } from '@/lib/email/client';
import OrderConfirmationEmail from '@/lib/email/templates/order-confirmation';

// After creating order in database (around line 150+)
if (session.customer_email) {
  await resend.emails.send({
    from: EMAIL_CONFIG.from,
    to: session.customer_email,
    subject: `Order Confirmation - #${session.id}`,
    react: OrderConfirmationEmail({
      orderId: session.id,
      customerName: session.customer_details?.name || 'Customer',
      customerEmail: session.customer_email,
      items: lineItems.map(item => ({
        name: item.description || '',
        quantity: item.quantity || 1,
        price: item.amount_total || 0,
      })),
      subtotal: session.amount_subtotal || 0,
      shipping: session.total_details?.amount_shipping || 0,
      tax: session.total_details?.amount_tax || 0,
      total: session.amount_total || 0,
      orderDate: new Date().toISOString(),
    }),
  });
}
```

---

### Phase 2: Fix TypeScript Errors (2-3 hours)

Run `npx tsc --noEmit` to see all errors, then fix each:

#### Test Files

1. `tests/e2e/admin/order-management.spec.ts`:
   - Line 132, 385, 466: Add `.first()` to promises
   - Line X: Prefix unused `page` with `_page`

2. `tests/e2e/cart/coupon-validation.spec.ts`:
   - Lines 58, 122, 180, 184: Remove unused variables

3. `tests/e2e/checkout/guest-checkout.spec.ts`:
   - Lines 3-5, 10, 145: Remove unused imports

4. `tests/e2e/checkout/subscription-checkout.spec.ts`:
   - Line 2: Remove unused import

5. `tests/e2e/production/api-validation.spec.ts`:
   - Line 54: Update to newer API

6. `tests/e2e/production/sanity-verification.spec.ts`:
   - Lines 58, 95, 96: Add proper types

7. `app/api/klaviyo/status/route.ts`:
   - Line 8: Change `req` to `_req`

---

### Phase 3: Remove Console.logs (1-2 hours)

#### Step 1: Create Logger

Create `lib/logger.ts`:
```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, ...args: any[]) {
    if (this.isDevelopment) {
      console[level](...args);
    }
    // In production, send to logging service (e.g., Sentry, LogRocket)
  }

  debug(...args: any[]) {
    this.log('debug', ...args);
  }

  info(...args: any[]) {
    this.log('info', ...args);
  }

  warn(...args: any[]) {
    this.log('warn', ...args);
  }

  error(...args: any[]) {
    this.log('error', ...args);
  }
}

export const logger = new Logger();
```

#### Step 2: Replace Console.logs

Files to update:
- `lib/stripe/product-sync.ts` (lines 98, 120, 130, 149, 164, 185, 201)
- `lib/subscription.ts` (multiple)
- `app/(website)/cart/page.tsx` (lines 20-79)

Replace `console.log` with `logger.debug` or `logger.info`
Replace `console.error` with `logger.error`

---

### Phase 4: Improve SEO Metadata (6-8 hours)

#### Step 1: Update Root Layout

In `app/layout.tsx`, replace metadata (lines 12-15):

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://drinklonglife.com'),
  title: {
    default: 'Long Life | Cold-Pressed Wellness from Regenerative Farms',
    template: '%s | Long Life'
  },
  description: 'Cold-pressed juice blends made from organic, regenerative ingredients. Delivered fresh weekly. Support your immunity, energy, and longevity naturally.',
  keywords: ['cold-pressed juice', 'organic juice', 'wellness drinks', 'regenerative agriculture', 'health drinks', 'immunity boost'],
  authors: [{ name: 'Long Life' }],
  creator: 'Long Life',
  publisher: 'Long Life',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://drinklonglife.com',
    title: 'Long Life | Cold-Pressed Wellness',
    description: 'Cold-pressed juice blends from regenerative farms. Fresh, organic, delivered weekly.',
    siteName: 'Long Life',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Long Life Cold-Pressed Juice',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Long Life | Cold-Pressed Wellness',
    description: 'Cold-pressed juice blends from regenerative farms.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};
```

#### Step 2: Create Sitemap

Create `app/sitemap.ts`:
```typescript
import { MetadataRoute } from 'next';
import { getAllProducts } from '@/lib/supabase/queries/products';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://drinklonglife.com';

  // Get all products
  const products = await getAllProducts();

  // Static pages
  const staticPages = [
    '',
    '/blends',
    '/how-we-make-it',
    '/ingredients',
    '/journal',
    '/faq',
    '/login',
    '/signup',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Product pages
  const productPages = products.map(product => ({
    url: `${baseUrl}/blends/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...productPages];
}
```

#### Step 3: Create Robots.txt

Create `app/robots.ts`:
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://drinklonglife.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/_next/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

#### Step 4: Add JSON-LD to Blend Pages

In `app/(website)/blends/[slug]/page.tsx`, add after metadata generation:

```typescript
// Add this function
function generateProductSchema(blend: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: blend.name,
    description: blend.tagline || blend.meta_description,
    image: blend.image_url,
    brand: {
      '@type': 'Brand',
      name: 'Long Life',
    },
    offers: blend.variants?.map((variant: any) => ({
      '@type': 'Offer',
      price: variant.price_usd,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Long Life',
      },
    })),
  };
}

// Then in the page component, add:
return (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateProductSchema(blend)),
      }}
    />
    {/* rest of page */}
  </>
);
```

---

## Testing Checklist

After implementation:

- [ ] Run `npm run build` - should have 0 errors
- [ ] Test newsletter signup - check email received
- [ ] Test wholesale form - check email received
- [ ] Make test purchase - check order confirmation email
- [ ] Test SEO with https://www.opengraph.xyz/
- [ ] Validate JSON-LD with Google Rich Results Test
- [ ] Check sitemap at `/sitemap.xml`
- [ ] Check robots.txt at `/robots.txt`

---

## Next Steps (Future)

1. **Rate Limiting Upgrade** - Replace in-memory with Redis/Upstash
2. **ARIA Labels** - Add accessibility throughout
3. **Loading States** - Add to all async operations
4. **Google Analytics** - Uncomment and configure

---

## Estimated Time Remaining

- Email Integration: 2-3 hours
- TypeScript Fixes: 2-3 hours
- Console.log Cleanup: 1-2 hours
- SEO Improvements: 6-8 hours

**Total: 11-16 hours**
