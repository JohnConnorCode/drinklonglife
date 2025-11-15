# Admin Order Management - Validation & Production Checklist

## ✅ Completed Tasks

### 1. Code Implementation
- [x] Fixed payment_method_id in webhook to store actual PM IDs
- [x] Created 16 comprehensive Playwright E2E tests
- [x] Fixed all TypeScript build errors
- [x] Proper RLS policies in place
- [x] Admin authentication with `requireAdmin()`
- [x] Order detail pages with Stripe session data
- [x] Refund functionality (full and partial)
- [x] Status update functionality
- [x] CSV export functionality

## 🔴 CRITICAL - Must Complete Before Production

### 1. Set Admin User in Supabase
**Status:** SQL script created, needs execution

**Steps:**
```bash
# Run this SQL in Supabase SQL Editor:
cd scripts
# Copy contents of set-admin.sql and run in Supabase Dashboard > SQL Editor
```

**Verify:**
```sql
SELECT id, email, is_admin FROM profiles WHERE email = 'jt.connor88@gmail.com';
```

### 2. Set Environment Variables
**Required for E2E tests:**
```bash
export ADMIN_TEST_EMAIL="jt.connor88@gmail.com"
export ADMIN_TEST_PASSWORD="your-password-here"
```

### 3. Run E2E Tests (UNEXECUTED)
```bash
# Full admin test suite
npx playwright test tests/e2e/admin/order-management.spec.ts

# Or run specific test groups:
npx playwright test tests/e2e/admin/order-management.spec.ts --grep "Dashboard"
npx playwright test tests/e2e/admin/order-management.spec.ts --grep "Refund"
npx playwright test tests/e2e/admin/order-management.spec.ts --grep "CSV"
```

## ⚠️ Known Issues & Limitations

### 1. Stripe Integration
- **Payment Method ID fix:** Code updated but NOT verified with real webhook data
- **Test Mode:** Currently using test mode keys, production keys untested
- **Refunds:** Refund API calls are untested with live Stripe

### 2. Data Validation Needed
- **Order count:** Unknown if orders table has data
- **Payment method IDs:** Need to verify webhook stores `pm_xxx` not `"card"`
- **RLS Policies:** Untested - need to verify non-admins cannot access

### 3. UI/UX Gaps
- **No loading states** on admin pages
- **No error boundaries** for failed API calls
- **Empty state handling:** What happens with 0 orders?
- **No pagination** implemented (uses limit of 10,000)

### 4. Security Concerns
- **Admin detection:** Only checks `is_admin` flag, no role-based permissions
- **No rate limiting** on admin endpoints
- **No audit logging** for admin actions
- **No 2FA** for admin access

## 🧪 Validation Test Plan

### Phase 1: Database Validation
```bash
# 1. Check admin user exists
psql $DATABASE_URL -c "SELECT email, is_admin FROM profiles WHERE is_admin = true;"

# 2. Check orders exist
psql $DATABASE_URL -c "SELECT COUNT(*), MAX(created_at) FROM orders;"

# 3. Check payment_method_id data
psql $DATABASE_URL -c "SELECT DISTINCT payment_method_id FROM orders LIMIT 10;"
```

### Phase 2: Manual Testing
1. **Login as Admin**
   - Navigate to `/login`
   - Login with jt.connor88@gmail.com
   - Verify redirect to `/admin`

2. **Dashboard**
   - Check order statistics display
   - Verify no console errors
   - Check loading states

3. **Orders List**
   - Navigate to `/admin/orders`
   - Verify orders display
   - Test filtering by status
   - Test search functionality

4. **Order Detail**
   - Click on an order
   - Verify all data displays correctly
   - Check Stripe session details
   - Verify customer information

5. **Refunds (⚠️ BE CAREFUL)**
   - Use TEST MODE only
   - Try partial refund on test order
   - Verify refund processes correctly
   - Check order status updates

6. **CSV Export**
   - Click export button
   - Verify CSV downloads
   - Check CSV contains all fields
   - Verify data format

### Phase 3: E2E Test Execution
```bash
# Run all admin tests
npm run test:e2e -- tests/e2e/admin/

# Expected: Some tests may fail initially
# Action: Fix issues and rerun
```

## 📋 Production Deployment Checklist

### Pre-Deployment
- [ ] Admin user created in production Supabase
- [ ] All E2E tests passing
- [ ] Manual testing completed
- [ ] Stripe live keys configured
- [ ] Webhook endpoints verified in Stripe Dashboard
- [ ] RLS policies tested with non-admin users
- [ ] Error handling tested
- [ ] Loading states confirmed working

### Deployment
- [ ] Run `npm run build` - verify no errors
- [ ] Deploy to Vercel
- [ ] Verify environment variables in production
- [ ] Test admin login in production
- [ ] Verify admin dashboard loads
- [ ] Check one real order detail page
- [ ] **DO NOT test refunds** in production initially

### Post-Deployment
- [ ] Monitor error logs for 24 hours
- [ ] Check Sentry/logging for admin errors
- [ ] Verify webhook events are processing
- [ ] Test with real customer data
- [ ] Document any issues found

## 🚨 Red Flags to Watch For

### During Testing
1. **"Admin access required" errors** = RLS policy issue
2. **Empty order lists** = Database connection or RLS issue
3. **Stripe API errors** = Key mismatch or API version issue
4. **payment_method_id still showing "card"** = Webhook fix didn't work
5. **CSV export timeout** = Too many orders, need pagination

### In Production
1. **Non-admins accessing admin routes** = Auth bypass
2. **Slow page loads** = Database query optimization needed
3. **Failed refunds** = Stripe integration issue
4. **Missing order data** = Webhook not firing or RLS blocking

## 📝 Next Immediate Steps

1. **Execute SQL script in Supabase** (scripts/set-admin.sql)
2. **Set environment variables** for test credentials
3. **Run Phase 1: Database Validation**
4. **Run Phase 2: Manual Testing** (15-20 minutes)
5. **Run Phase 3: E2E Tests** and fix any failures
6. **Document all issues found**
7. **Fix critical issues**
8. **Re-test**
9. **Deploy to production** only when all tests pass

## 🎯 Success Criteria

### Minimum Viable Product (MVP)
- ✅ Admin can login
- ✅ Admin can view order list
- ✅ Admin can view order details
- ✅ Admin can export CSV
- ✅ Non-admins cannot access admin routes
- ✅ No critical errors in production

### Nice to Have (Post-MVP)
- Loading states on all pages
- Error boundaries
- Pagination
- Advanced filtering
- Audit logging
- Real-time updates
- Dashboard analytics charts

## 📞 Support & Troubleshooting

### Common Issues

**Issue:** "Admin access required"
**Solution:** Check `is_admin` flag in profiles table, verify RLS policies

**Issue:** No orders showing
**Solution:** Check RLS policies, verify service role client usage

**Issue:** Refund fails
**Solution:** Verify Stripe keys, check payment intent status

**Issue:** CSV export fails
**Solution:** Add pagination, reduce query limit

### Getting Help
- Check Supabase logs: Dashboard > Logs
- Check Vercel logs: Dashboard > Functions
- Check Stripe events: Dashboard > Developers > Events
- Review browser console for client-side errors

---

**Last Updated:** 2025-11-14
**Status:** TESTING PHASE - NOT PRODUCTION READY
