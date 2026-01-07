# Long Life - Launch QA Checklist

**Date**: _____________
**Tested By**: _____________
**Environment**: [ ] Staging  [ ] Production

---

## ✅ Content & CMS (Section 1)

### Content Population
- [ ] Site Settings populated with brand info, logo, social links, contact
- [ ] Navigation configured (header + footer links)
- [ ] Home page fully populated (hero, value props, featured blends, process, standards, newsletter CTA)
- [ ] All 3 blends created (Yellow Bomb, Red Bomb, Green Bomb)
- [ ] Blends have ingredients, functions, taglines, images, pricing
- [ ] At least 2 Journal posts with rich text content
- [ ] At least 8 FAQ entries
- [ ] Generic pages created (How We Make It, Ingredients & Sourcing, Wholesale, Terms, Privacy)

### Schema Validation & Help Text
- [ ] Required fields have validation (min/max lengths)
- [ ] Image fields require alt text
- [ ] Array fields have min/max item counts
- [ ] Help text visible and clear for editors
- [ ] Dropdown fields use appropriate layouts (radio, dropdown, etc.)

### Studio Structure
- [ ] Singletons pinned at top (Site Settings, Navigation, Home)
- [ ] Logical grouping with dividers
- [ ] Icons display for each content type
- [ ] Default ordering set (blends by order, posts by date)
- [ ] Desk structure loads without errors

### Live Preview
- [ ] Preview works for Home page
- [ ] Preview works for Blend detail pages
- [ ] Preview works for Journal posts
- [ ] Preview secret configured in environment
- [ ] Preview pane shows real-time updates

---

## 🎨 Visual Polish & Brand (Section 2)

### Design Tokens
- [ ] `tokens.css` imported in global styles
- [ ] Color variables defined (yellow, red, green, grays)
- [ ] Spacing scale (4px base unit)
- [ ] Typography tokens (font families, sizes, weights)
- [ ] Border radius, shadows, transitions defined
- [ ] Components use tokens instead of arbitrary values

### Typography
- [ ] Inter loaded for body text (`next/font`)
- [ ] Playfair Display loaded for headings
- [ ] `display: swap` prevents FOIT (Flash of Invisible Text)
- [ ] Font weights render correctly (400, 500, 600, 700)
- [ ] No font loading layout shift

### Accent Colors
- [ ] Yellow/red/green accents used consistently
- [ ] Blend cards show label colors
- [ ] Color not used as sole differentiator (icons/labels added)
- [ ] Accent colors pass AA contrast ratio

### Prose Styles
- [ ] Rich text renders correctly in Journal posts
- [ ] Headings (H2, H3) styled appropriately
- [ ] Paragraphs have good line height and spacing
- [ ] Lists (ul, ol) indented and styled
- [ ] Blockquotes have left border and italic styling
- [ ] Code blocks have syntax highlighting
- [ ] Images in prose have captions and proper spacing
- [ ] Links styled and hover states work

### Header & Footer
- [ ] Header sticky on scroll
- [ ] No layout shift on first paint
- [ ] Footer renders correctly on all pages
- [ ] Logo displays (or site title if no logo)
- [ ] Navigation links active state works

---

## 🔍 SEO, Social, and Schema (Section 3)

### Metadata API
- [ ] Home page has unique title and description
- [ ] Blend pages have dynamic meta titles
- [ ] Journal posts have dynamic meta titles
- [ ] Fallback to Site Settings if page meta missing
- [ ] Title template applied correctly (e.g., "Page | Long Life")

### Sitemap & Robots
- [ ] `/sitemap.xml` accessible and valid
- [ ] Sitemap includes all blends, posts, and pages
- [ ] `/robots.txt` accessible
- [ ] Canonical URLs use production domain

### Open Graph Images
- [ ] Dynamic OG image route created (`/opengraph-image.tsx`)
- [ ] OG images render with headline + brand mark
- [ ] Default OG image set in Site Settings
- [ ] Per-page OG images override default

### Social Card Validation
- [ ] Twitter Card tested in Twitter Card Validator
- [ ] Screenshot shows correct image and title
- [ ] Facebook OG tested in Facebook Sharing Debugger
- [ ] Screenshot shows correct preview

### JSON-LD Structured Data
- [ ] Organization schema on homepage
- [ ] Product schema on blend detail pages
- [ ] BlogPosting schema on journal posts
- [ ] FAQ schema on FAQ page
- [ ] All schemas validate in Google Rich Results Test
- [ ] Screenshot of "valid" result from Rich Results Test

---

## ⚡ Performance & Accessibility (Section 4)

### Lighthouse Scores (Mobile)
- [ ] Home page: Performance ≥ 90
- [ ] Home page: Accessibility ≥ 95
- [ ] Home page: Best Practices ≥ 95
- [ ] Home page: SEO ≥ 95
- [ ] Blends page: All scores ≥ 90/95/95/95
- [ ] Journal post: All scores ≥ 90/95/95/95
- [ ] JSON export saved for all 3 pages

### Image Optimization
- [ ] All images use `next/image` component
- [ ] Width and height specified for all images
- [ ] `priority` set ONLY on hero image
- [ ] `sizes` attribute set for responsive images
- [ ] Lazy loading working for below-fold images
- [ ] Sanity CDN transforms applied (format, quality, resize)
- [ ] No cumulative layout shift (CLS) from images

### Accessibility
- [ ] Color contrast passes AA standard (4.5:1 for text)
- [ ] All images have alt text
- [ ] Forms have proper labels
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus states visible on all interactive elements
- [ ] ARIA labels added where needed (mobile menu, buttons)
- [ ] No accessibility errors in aXe or WAVE
- [ ] Screenshot of aXe report with 0 serious issues

---

## 📝 Forms & Server Actions (Section 5)

### Newsletter Form
- [ ] Email field validates (required, valid email format)
- [ ] Honeypot field hidden (anti-bot protection)
- [ ] Success message displays on submit
- [ ] Error message displays on failure
- [ ] Rate limiting prevents spam (basic throttle)
- [ ] Server action logs submission (or sends to ESP)
- [ ] Email provider integration point documented

### Wholesale Inquiry Form
- [ ] All fields validate (name, email, company, message)
- [ ] Email validation works
- [ ] Success and error states display
- [ ] Honeypot field hidden
- [ ] Server action logs inquiry
- [ ] Integration point for CRM documented

### Form UX
- [ ] Forms accessible on mobile
- [ ] Submit button disabled during submission
- [ ] Loading state shown during API call
- [ ] Error messages clear and helpful

---

## 🔄 Caching, ISR, and Webhooks (Section 6)

### Cache Tagging
- [ ] Pages use `revalidateTag()` in queries
- [ ] Tags set per content type (blends, posts, etc.)
- [ ] Default ISR revalidation: 60 seconds

### Revalidation Webhook
- [ ] `/api/revalidate` endpoint created and accessible
- [ ] Webhook configured in Sanity (Manage → API → Webhooks)
- [ ] URL: `https://[domain]/api/revalidate`
- [ ] Secret matches `SANITY_REVALIDATE_SECRET`
- [ ] Triggers on Create, Update, Delete
- [ ] Webhook logs show 200 OK responses
- [ ] Content update triggers instant revalidation (test: edit blend → refresh site)
- [ ] Screenshot of Sanity webhook config

### Demo Proof
- [ ] Loom/GIF recorded: Edit blend in Studio → content updates on site
- [ ] Demo shows <5 second update time (with webhook)

---

## 📊 Observability & Errors (Section 7)

### Analytics
- [ ] Vercel Analytics enabled in dashboard
- [ ] Analytics script loads on pages
- [ ] Page views tracked correctly

### Error Monitoring
- [ ] Sentry configured (optional) or placeholder added
- [ ] Environment-based guard (off in dev)
- [ ] Error boundaries catch React errors

### Error Pages
- [ ] 404 page styled with brand
- [ ] 404 page has "Back Home" CTA
- [ ] 500 error page styled
- [ ] 500 page has "Try Again" and "Go Home" buttons
- [ ] Global error page exists (root layout errors)
- [ ] Screenshots of 404 and 500 pages

### Server Logging
- [ ] Server action failures logged with event IDs
- [ ] User-friendly error messages surfaced
- [ ] No sensitive data leaked in errors

---

## 🔒 Security & Governance (Section 8)

### Sanity Roles
- [ ] Admin role: full access
- [ ] Editor role: create/update content, no schema changes
- [ ] Read-Only role: view only
- [ ] Screenshot of Sanity role configuration

### Content Validation
- [ ] Image uploads restricted to valid types (jpg, png, svg)
- [ ] Max file size enforced (or documented limit)
- [ ] Alt text required on all image fields

### Environment Variables
- [ ] `.env.example` complete and up-to-date
- [ ] No secrets committed to git
- [ ] `.gitignore` includes `.env.local`
- [ ] Production env vars set in Vercel

### Rate Limiting
- [ ] Basic rate limiting on server actions (in-memory or edge)
- [ ] IP throttling documented (basic implementation)
- [ ] Honeypot fields on all forms

---

## 💾 Backups, Migration, and Docs (Section 9)

### NPM Scripts
- [ ] `npm run seed` - idempotent seed script works
- [ ] `npm run export:sanity` - exports dataset to backup.tar.gz
- [ ] `npm run import:sanity` - imports dataset from backup
- [ ] Scripts documented in package.json

### README Documentation
- [ ] Setup instructions (local/dev/prod)
- [ ] Environment variables explained
- [ ] Content model overview
- [ ] Revalidation/webhook setup steps
- [ ] Forms wiring guide
- [ ] Release checklist
- [ ] Rollback plan

### Editor Quick Start
- [ ] PDF or Markdown created
- [ ] Screenshots of key CMS fields
- [ ] "How to update home page in 60 seconds"
- [ ] Top 5 editing tasks explained
- [ ] Troubleshooting section

---

## 🚀 Domain & Deployment (Section 10)

### Vercel Configuration
- [ ] Project connected to Git repository
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`
- [ ] Framework preset: Next.js
- [ ] Node version: 18 or higher

### Environment Variables (Production)
- [ ] `NEXT_PUBLIC_SITE_URL` set to production domain
- [ ] All Sanity vars configured
- [ ] `SANITY_REVALIDATE_SECRET` set
- [ ] Webhook secret matches Sanity config

### Domain Setup
- [ ] Primary domain connected (e.g., `longlife.com`)
- [ ] WWW redirect configured (`www` → apex)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] DNS propagated (check with `dig` or `nslookup`)

### Cache & Image Optimization
- [ ] Vercel Image Optimization enabled (default)
- [ ] Cache headers for fonts and static assets
- [ ] CDN enabled for global distribution

### Deployment Logs
- [ ] Build completes without errors
- [ ] No warnings in build log
- [ ] No hydration errors in browser console
- [ ] Screenshot of clean build log

### Staging → Production
- [ ] Staging URL deployed and tested
- [ ] UAT (user acceptance testing) completed
- [ ] Production deployment plan documented
- [ ] DNS cutover scheduled

---

## ✅ Final QA Checklist (Section 11)

### Content
- [ ] No hardcoded business copy; all content in Sanity
- [ ] All blends have images and descriptions
- [ ] Journal has at least 2 posts with rich content
- [ ] FAQ has at least 8 entries

### CMS & Preview
- [ ] Live preview works for Home, Blend, Post
- [ ] Editors can update content without developer help
- [ ] Desk structure organized and logical

### SEO & Structured Data
- [ ] JSON-LD validates (Org, Product, BlogPosting)
- [ ] OG/Twitter cards render correctly
- [ ] Sitemap.xml accessible
- [ ] Robots.txt configured

### Performance
- [ ] Lighthouse mobile scores meet targets (≥90/95/95/95)
- [ ] No layout shift on load
- [ ] Images optimized and lazy loaded

### Forms
- [ ] Newsletter form validates and submits
- [ ] Wholesale form validates and submits
- [ ] Success/error states working
- [ ] Honeypot protection active

### Revalidation
- [ ] Webhook configured and tested
- [ ] Content updates reflect in <60 seconds (or instantly with webhook)
- [ ] Revalidation tags working correctly

### Error Handling
- [ ] 404 and 500 pages styled and functional
- [ ] No console errors on any page
- [ ] Error boundaries catch React errors

### Documentation
- [ ] README complete with all sections
- [ ] Editor Quick Start delivered
- [ ] `.env.example` up-to-date

---

## 📦 Deliverables Checklist

- [ ] Repo link (branch/tag: `launch-ready`)
- [ ] Staging URL: __________________________
- [ ] Production URL: __________________________
- [ ] README_LAUNCH.md
- [ ] EDITOR_QUICK_START.md (or PDF)
- [ ] Lighthouse reports (3 pages, JSON + screenshots)
- [ ] aXe accessibility report
- [ ] Google Rich Results Test screenshots (Org, Product, BlogPosting)
- [ ] Twitter Card Validator screenshot
- [ ] Facebook Sharing Debugger screenshot
- [ ] Sanity webhook configuration screenshot
- [ ] Demo video/GIF of preview or revalidation workflow

---

## 🔥 Remaining TODOs

List any incomplete items with estimates:

1. **Item**: _________________________________
   **Estimate**: ___ hours
   **Blocker**: [ ] Yes  [ ] No

2. **Item**: _________________________________
   **Estimate**: ___ hours
   **Blocker**: [ ] Yes  [ ] No

3. **Item**: _________________________________
   **Estimate**: ___ hours
   **Blocker**: [ ] Yes  [ ] No

---

## ✍️ Sign-Off

**QA Tester**: _____________________________ Date: __________

**Lead Developer**: ________________________ Date: __________

**Product Owner**: _________________________ Date: __________

---

## 📝 Notes

_Add any additional notes, observations, or follow-up items here:_

---

**Launch Status**: [ ] **READY** [ ] **NEEDS WORK** [ ] **BLOCKED**

**Target Launch Date**: __________________________
