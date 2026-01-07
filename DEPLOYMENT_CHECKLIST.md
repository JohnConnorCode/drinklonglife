# Deployment Checklist - Admin Panel Implementation

## Pre-Deployment Verification

### 1. Code Quality
- [x] TypeScript build passes without errors (`npm run build`)
- [ ] All tests pass (`npm run test:e2e`)
- [x] No console errors in development mode
- [x] Code reviewed and approved

### 2. Database Setup
- [ ] Run admin user setup SQL script in Supabase Dashboard
  - Location: `scripts/create-admin-simple.sql`
  - Verify admin profile created with `is_admin = true`
  - Verify referral code generated
  - Verify referral entry created
- [ ] Verify RLS policies are in place
  - Run: `node scripts/check-rls-policies.mjs`
  - Confirm admin_orders_policy exists and is correct
- [ ] Validate database configuration
  - Run: `node scripts/validate-database.mjs`
  - Confirm admin user exists with proper permissions

### 3. Environment Variables
- [ ] Production environment variables configured in Vercel
  - NEXT_PUBLIC_SITE_URL
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET
  - All Sanity CMS variables
- [ ] Admin emails configured in `lib/auth/admin.ts`
  - Verify all authorized admin emails are in ADMIN_EMAILS array

## Deployment Steps

### 1. Create Pull Request
```bash
git checkout -b feat/admin-panel-implementation
git add .
git commit -m "Add comprehensive admin panel for order management"
git push -u origin feat/admin-panel-implementation
gh pr create --title "Add Admin Panel for Order Management" --body "..."
```

### 2. Merge to Main
- [ ] PR approved by team
- [ ] All CI/CD checks pass
- [ ] Merge PR to main branch
- [ ] Pull latest main locally: `git checkout main && git pull`

### 3. Deploy to Production
```bash
vercel deploy --prod
```

### 4. Post-Deployment Database Migration
**IMPORTANT: Run this AFTER code is deployed**

1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Run `scripts/create-admin-simple.sql`
4. Verify results with validation queries included in script

## Post-Deployment Validation

### 1. Admin Access Verification
- [ ] Sign in with admin email (jt.connor88@gmail.com)
- [ ] Navigate to https://drinklonglife.com/admin
- [ ] Verify NOT redirected to /unauthorized
- [ ] Verify admin dashboard loads correctly
- [ ] Check for any console errors

### 2. Admin Orders Functionality
- [ ] Navigate to https://drinklonglife.com/admin/orders
- [ ] Verify orders list displays
- [ ] Test order filtering by status
- [ ] Test order search functionality
- [ ] Click "View Details" on an order
- [ ] Verify order details page loads with all information

### 3. Order Management Actions
- [ ] Test order status update (pending → processing)
- [ ] Verify status badge updates correctly
- [ ] Test refund functionality
- [ ] Verify Stripe mode toggle works (Test/Live)
- [ ] Check that all Stripe API calls use correct mode

### 4. Security Verification
- [ ] Sign out
- [ ] Try accessing /admin as non-admin user
- [ ] Verify redirect to /unauthorized
- [ ] Try accessing /admin/orders directly
- [ ] Verify unauthorized access is blocked
- [ ] Test API endpoints return 401 for non-admin users

### 5. Database Validation
Run validation script:
```bash
node scripts/validate-database.mjs
```

Expected output:
- ✅ Admin user configured correctly
- ✅ Orders exist in database
- ✅ Payment methods are tracked
- ✅ RLS policies are in place

## Rollback Procedure

If issues are detected after deployment:

### 1. Immediate Rollback
```bash
# Revert to previous deployment in Vercel dashboard
# OR redeploy previous commit
git log --oneline -10  # Find previous commit
vercel deploy --prod <previous-commit-sha>
```

### 2. Database Rollback
If admin user needs to be removed:
```sql
-- Run in Supabase SQL Editor
DELETE FROM public.referrals
WHERE referrer_id = '13356806-31ef-4ea8-8c2a-9dff3189894e';

UPDATE public.profiles
SET is_admin = false
WHERE id = '13356806-31ef-4ea8-8c2a-9dff3189894e';
```

### 3. Code Rollback
```bash
git revert <commit-sha>
git push origin main
vercel deploy --prod
```

## Success Criteria

Deployment is considered successful when:

1. ✅ Build completes without errors
2. ✅ All E2E tests pass
3. ✅ Admin user can access /admin and /admin/orders
4. ✅ Non-admin users are blocked from admin routes
5. ✅ Order management functionality works correctly
6. ✅ Status updates and refunds process successfully
7. ✅ No console errors in production
8. ✅ Database validation script passes all checks
9. ✅ RLS policies are enforced correctly
10. ✅ Stripe API integration works in both test and live modes

## Monitoring

After deployment, monitor:

- Vercel deployment logs for errors
- Supabase logs for database errors
- Stripe webhook logs for payment processing issues
- Browser console for client-side errors
- User reports of issues accessing admin panel

## Notes

- Admin panel requires both database `is_admin = true` AND email in `ADMIN_EMAILS` array
- Database trigger issues were resolved by temporarily disabling triggers during admin setup
- RLS policy `admin_orders_policy` allows admins to view all orders
- Order status updates use Supabase service role client to bypass RLS
- Refund functionality integrates directly with Stripe API
