# Long Life Admin - Complete Business Control Guide

## 🎯 Overview

Your admin interface is now a **complete e-commerce business control center** with full power over products, pricing, analytics, and operations. This guide covers all features and best practices.

## 📊 Business Intelligence Dashboard

Access at: `/admin`

### Key Metrics Displayed

1. **Revenue Metrics**
   - Total all-time revenue
   - Current month revenue
   - Month-over-month growth percentage
   - Trend indicators (green up arrow = growth, red down = decline)

2. **Order Statistics**
   - Total orders (all-time)
   - This month's orders
   - Average order value
   - Transaction insights

3. **Product Catalog Health**
   - Total products in system
   - Published products (live on site)
   - Draft products (not yet published)
   - Products missing variants (need pricing)

4. **Revenue Trends**
   - Visual chart showing last 30 days
   - Hover over bars to see daily revenue
   - Helps identify patterns and seasonal trends

5. **User & Subscription Metrics**
   - Total registered users
   - Users with Stripe accounts
   - Active subscriptions
   - Partnership tier breakdown

### Quick Actions
- Add Product → Create new product
- Add Ingredient → Create new ingredient
- Manage Users → View/edit user accounts
- View Discounts → Manage coupon codes

---

## 🛍️ Product Management

Access at: `/admin/products`

### Features

#### Product List View
- View all products with status indicators
- See variant count for each product
- Quick links to edit
- Visual status badges (Published/Draft)
- Missing variant warnings

#### Create/Edit Products
- **Basic Info**: Name, slug, tagline
- **Rich Content**: Description, story, function, usage instructions (Tiptap editor)
- **Visual**: Image URL, alt text, label color
- **SEO**: Meta title and description
- **Lists**: Function list, best for list
- **Stripe Integration**: Link to Stripe product
- **Variants**: Multiple sizes/prices per product
- **Ingredients**: Link ingredients with drag-and-drop ordering
- **Publishing**: Draft mode or published

#### Variant Management
- Add multiple price points (gallon, half-gallon, shot, etc.)
- Set default variant
- Link Stripe Price IDs
- Drag-and-drop reordering (▲▼ buttons)
- Activate/deactivate variants individually
- Track SKUs

#### Export Products to CSV
- Click "Export to CSV" button in toolbar
- Downloads file: `products_export_YYYY-MM-DD.csv`
- Includes all product data
- Use for:
  - Backup before major changes
  - Analysis in Excel/Google Sheets
  - Migration to other systems
  - Reporting

---

## 🌿 Ingredient Management

Access at: `/admin/ingredients`

### Features

#### Ingredient Library
- Full CRUD (Create, Read, Update, Delete)
- Type categorization: Fruit, Root, Green, Herb, Other
- Stats dashboard showing count by type
- Color-coded type badges

#### Create/Edit Ingredients
- **Basic Info**: Name, type, seasonality
- **Rich Content**:
  - Health benefits (Tiptap editor)
  - Sourcing story (Tiptap editor)
  - Nutritional profile
  - Internal notes
- **Visual**: Image URL, alt text

#### Export Ingredients to CSV
- Click "Export CSV" button
- Downloads file: `ingredients_export_YYYY-MM-DD.csv`
- Use for inventory management, supplier communication

#### Safety Features
- Cannot delete ingredients used in products
- System prevents orphaned data
- Clear error messages guide you

---

## 💳 Stripe Integration

### Automatic Stripe Product Sync

Your admin can create and update Stripe products directly.

#### How to Sync a Product to Stripe

1. **Create/Edit Product** in admin
2. **Add Variants** with prices (in USD)
3. **Click "Sync to Stripe"** button (coming soon in UI)
4. System will:
   - Create Stripe Product (if new)
   - Create Stripe Prices for each variant
   - Link Stripe IDs back to database
   - Update existing products if already synced

#### API Endpoint
```bash
POST /api/admin/products/{product_id}/sync-stripe
```

**Response:**
```json
{
  "success": true,
  "productId": "prod_xxxxx",
  "priceIds": ["price_xxxxx", "price_xxxxx"],
  "message": "Product synced to Stripe successfully"
}
```

#### Manual Stripe Operations

If you need to manage Stripe directly:
1. Go to Stripe Dashboard
2. Products → Your products are linked by metadata `supabase_id`
3. Prices → Linked by metadata `supabase_variant_id`

#### Stripe Webhook Integration

Already configured! Your webhooks handle:
- ✅ Checkout completion
- ✅ Subscription creation/updates
- ✅ Payment success/failure
- ✅ Order recording

---

## 📤 Bulk Operations

### CSV Export

**Products Export:**
- URL: `/api/admin/export/products` or click button in UI
- Fields: id, name, slug, tagline, label_color, function_list, best_for, image_url, stripe_product_id, is_featured, is_active, display_order, published_at, created_at, updated_at

**Ingredients Export:**
- URL: `/api/admin/export/ingredients` or click button in UI
- Fields: id, name, type, seasonality, nutritional_profile, notes, image_url, image_alt, created_at, updated_at

### Use Cases

**Backup Before Major Changes**
```bash
1. Export products to CSV
2. Save file with timestamp
3. Make changes in admin
4. If issues occur, you have data backup
```

**Bulk Price Updates**
```bash
1. Export products
2. Update prices in Excel
3. (Future: Import CSV to bulk update)
```

**Business Reporting**
```bash
1. Export products
2. Open in Excel/Google Sheets
3. Create pivot tables
4. Share with stakeholders
```

---

## 🔒 Security & Access Control

### Admin Authentication
- Only users with `is_admin = true` in profiles table can access
- All admin routes protected by middleware
- RLS policies enforce database-level security

### API Endpoints Security
- All admin API routes check `is_admin` flag
- 401 Unauthorized if not logged in
- 403 Forbidden if not admin
- Service role bypass for webhooks only

### Row Level Security (RLS)
- **Products**: Anyone can view published, only admins can manage
- **Ingredients**: Anyone can view, only admins can manage
- **Product Variants**: Public can see active variants of published products
- **Orders**: Users see their own, admins see all

---

## 📈 Analytics & Reporting

### Available Analytics

1. **Revenue Analytics**
   - `getAnalyticsMetrics()` in `lib/supabase/queries/analytics.ts`
   - Total revenue, monthly revenue, growth rate
   - Calculated from `orders` table

2. **Order Analytics**
   - Total orders, monthly orders
   - Average order value
   - Time-based trends

3. **Product Performance**
   - Which products have variants
   - Which products are missing variants
   - Draft vs published ratio

4. **Revenue Trends**
   - `getRevenueTrends()` for last 30 days
   - Daily revenue breakdown
   - Visual chart on dashboard

### Future Analytics (Coming Soon)
- Top-selling products
- Customer lifetime value
- Revenue by product
- Conversion rates
- Cart abandonment

---

## 🧪 Testing & Validation

### Before Production Deployment

**1. Test Product Creation**
```
✓ Create product with variants
✓ Publish product
✓ View on website (/blends, /pricing)
✓ Add to cart
✓ Complete checkout
✓ Verify order in admin
```

**2. Test Stripe Sync**
```
✓ Create product with price
✓ Sync to Stripe via API
✓ Check Stripe dashboard
✓ Verify Price ID matches
✓ Test checkout with Stripe price
```

**3. Test Data Export**
```
✓ Export products to CSV
✓ Open in Excel/Google Sheets
✓ Verify all data present
✓ Check special characters handled
```

**4. Test RLS & Security**
```
✓ Try accessing /admin as non-admin (should fail)
✓ Try API endpoints without auth (should fail)
✓ Verify admin can see all data
✓ Verify customers see only published products
```

### E2E Tests

Your app includes Playwright tests:
```bash
npm run test:e2e        # Run all tests
npm run test:checkout   # Test checkout flow
npm run test:e2e:ui     # Visual test runner
```

---

## 🚀 Deployment Checklist

### Pre-Deploy
- [ ] Run database migration: `005_ecommerce_products.sql`
- [ ] Verify Supabase RLS policies active
- [ ] Test admin access in staging
- [ ] Export current Sanity data (backup)
- [ ] Test Stripe integration in test mode

### Deploy
- [ ] Push code to production
- [ ] Run migration on production database
- [ ] Verify admin dashboard loads
- [ ] Test product creation
- [ ] Test Stripe sync
- [ ] Test checkout flow end-to-end

### Post-Deploy
- [ ] Monitor Stripe webhooks (check for errors)
- [ ] Verify orders are recording correctly
- [ ] Check analytics dashboard shows data
- [ ] Test CSV export
- [ ] Announce to team

---

## 💡 Pro Tips

### Workflow Efficiency

**Daily Operations:**
1. Check dashboard for revenue trends
2. Monitor "Missing Variants" alert
3. Review draft products weekly
4. Export data monthly for records

**Product Launches:**
1. Create product as draft
2. Add all variants with pricing
3. Sync to Stripe
4. Test checkout in test mode
5. Publish when ready

**Bulk Updates:**
1. Export products to CSV
2. Make changes in spreadsheet
3. (Future: Re-import or use as reference)

### Data Integrity

**Always:**
- Set `published_at` to NULL for drafts
- Set `is_active = true` for live products
- Link correct Stripe IDs
- Add at least one variant before publishing
- Test checkout before marking as published

**Never:**
- Delete products with order history
- Change Stripe Price IDs on live products
- Publish products without variants
- Delete ingredients used in products

---

## 🛠️ Troubleshooting

### Common Issues

**Products Not Showing on Website**
- Check `published_at` is set (not NULL)
- Check `is_active = true`
- Check product has at least one active variant
- Clear Next.js cache

**Stripe Sync Fails**
- Verify Stripe API key in `.env`
- Check variant has `price_usd` set
- Ensure price is greater than $0
- Check Stripe dashboard for errors

**CSV Export Empty**
- Verify you're logged in as admin
- Check browser console for errors
- Try different browser
- Check API endpoint directly

**Analytics Not Loading**
- Check `orders` table has data
- Verify date ranges are correct
- Check Supabase connection
- Look for console errors

### Getting Help

1. Check server logs for errors
2. Check browser console
3. Verify database connection
4. Check Supabase RLS policies
5. Review this documentation
6. Contact development team

---

## 📚 Technical Reference

### Database Tables
- `products` - Main product catalog
- `product_variants` - Price points/sizes
- `ingredients` - Ingredient library
- `product_ingredients` - Many-to-many relationship
- `orders` - Order history (from Stripe webhooks)

### Key Files
- `lib/supabase/queries/analytics.ts` - Analytics functions
- `lib/stripe/product-sync.ts` - Stripe synchronization
- `lib/admin/csv-export.ts` - CSV export utilities
- `app/(admin)/admin/page.tsx` - Dashboard
- `app/api/admin/products/` - Product API routes
- `app/api/admin/ingredients/` - Ingredient API routes

### Environment Variables Required
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET_TEST=
STRIPE_WEBHOOK_SECRET_PRODUCTION=
```

---

## 🎓 Training & Onboarding

### For New Admin Users

**Week 1: Basics**
- Learn dashboard layout
- Create test product
- Practice adding ingredients
- Understand draft vs published

**Week 2: Operations**
- Create real products
- Add variants and pricing
- Sync to Stripe
- Monitor orders

**Week 3: Analysis**
- Use analytics dashboard
- Export data to CSV
- Create reports
- Identify trends

**Week 4: Advanced**
- Bulk operations
- Stripe integration deep dive
- Database queries
- Custom reports

---

## 📞 Support & Resources

- **Admin URL**: `https://yoursite.com/admin`
- **Stripe Dashboard**: `https://dashboard.stripe.com`
- **Supabase Dashboard**: `https://app.supabase.com`
- **Documentation**: This file
- **Migration Guide**: `README_ECOMMERCE.md`

**Remember:** You now have complete control over your e-commerce platform. No more Sanity subscriptions, no more external dependencies. Everything is in your database, fully customizable, and ready to scale.

---

*Last Updated: 2025-11-15*
*Version: 2.0 - Complete Business Control*
