# 🎛️ Admin Console - Operator Guide

## Overview

The Admin Console is a restricted-access interface for managing users, viewing system health, and performing administrative operations. This guide explains how to use it effectively.

---

## Getting Admin Access

### Step 1: Run the Migration

First, apply the admin access migration:

```sql
-- In Supabase SQL Editor, run:
-- supabase/migrations/003_add_admin_access.sql
```

This adds the `is_admin` column to the profiles table.

### Step 2: Grant Admin Access

To make a user an admin, run this SQL in Supabase:

```sql
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'your-email@example.com';
```

**Important:** Be very careful who you grant admin access to. Admins can view and modify all user data.

### Step 3: Verify Access

1. Log out and log back in
2. Visit `https://your-site.com/admin`
3. You should see the Admin Dashboard

If you see "Access Denied", check:
- The `is_admin` column is `TRUE` for your user
- You're logged in with the correct account
- The migration ran successfully

---

## Admin Console Features

### Dashboard (`/admin`)

**Purpose:** System health overview and quick stats

**Features:**
- **Total Users** - Count of all registered accounts
- **With Stripe ID** - Users who have made a purchase
- **Active Subs** - Users with active or trialing subscriptions
- **Partnership Tiers** - Breakdown by tier (none, affiliate, partner, vip)

**When to use:**
- Daily health check
- Before/after marketing campaigns
- Troubleshooting system issues

---

### User Management (`/admin/users`)

**Purpose:** Search, view, and manage user accounts

#### Searching Users

1. Enter email or name in the search box
2. Click "Search"
3. Results show matching users
4. Click "Clear" to reset

**Tips:**
- Search is case-insensitive
- Partial matches work (e.g., "john" finds "john@example.com")
- Use full email for exact match

#### User List Columns

- **User** - Name and email
- **Tier** - Partnership level (Standard, Affiliate, Partner, VIP)
- **Status** - Subscription status (active, canceled, none, etc.)
- **Stripe** - Whether connected to Stripe
- **Actions** - "Manage →" link to user detail

#### User Detail Page (`/admin/users/[id]`)

**Sections:**

1. **Profile Information**
   - User ID
   - Email
   - Full Name
   - Stripe Customer ID
   - Subscription Status
   - Current Plan
   - Partnership Tier
   - Is Admin

2. **Stats Cards**
   - Active Subscriptions count
   - Total Purchases count
   - Total Spent (lifetime value)

3. **Admin Actions**
   - Update Partnership Tier
   - Re-sync from Stripe

4. **Active Discounts**
   - Lists discount codes applied to this user
   - Shows source and expiration

5. **Active Subscriptions**
   - Details of current subscriptions
   - Renewal/expiration dates

---

## Common Operations

### 1. Upgrade a User's Partnership Tier

**Use case:** User signs partner agreement, you want to grant them partner perks

**Steps:**
1. Go to `/admin/users`
2. Search for the user by email
3. Click "Manage →"
4. In "Partnership Tier" dropdown, select the new tier
5. Click "Update Tier"
6. Confirm success message
7. User now sees perks for their new tier in `/account/perks`

**Tiers explained:**
- **Standard (none)** - Default, no special perks
- **Affiliate** - Basic partnership, referral perks
- **Partner** - Full partnership, all affiliate perks + partner perks
- **VIP** - Highest tier, all perks unlocked

**Tier hierarchy:** VIP has access to all perks. Partner has access to Affiliate + Partner perks. Affiliate only has Affiliate perks.

### 2. Re-sync User from Stripe

**Use case:** Webhook failed, user's subscription status is out of sync

**When to use:**
- User reports their subscription shows wrong status
- After Stripe outage or webhook failure
- When investigating billing issues

**Steps:**
1. Go to `/admin/users`
2. Find the user
3. Click "Manage →"
4. Scroll to "Re-sync from Stripe" section
5. Click "Sync Now"
6. Wait for confirmation
7. Page refreshes with updated data

**What it does:**
- Fetches latest subscription data from Stripe
- Updates `subscription_status` (active, canceled, past_due, etc.)
- Updates `current_plan` based on subscription metadata
- Does NOT create or cancel subscriptions in Stripe
- Read-only operation, safe to use anytime

**Troubleshooting:**
- If "Sync Now" is disabled, user doesn't have a Stripe customer ID yet
- If sync fails, check Stripe API key in environment variables
- Check Stripe Dashboard to verify subscription status

### 3. Check System Health

**Use case:** Daily monitoring, investigating issues

**Steps:**
1. Visit `/admin`
2. Review stats cards:
   - Are total users growing?
   - What % have Stripe IDs?
   - How many active subscriptions?
3. Check partnership tier breakdown
4. Compare to yesterday's numbers (keep a log)

**Red flags:**
- Active subs decreasing significantly
- Many users without Stripe IDs (checkout issues?)
- High "past_due" count (payment failures)

### 4. Verify a User's Purchase

**Use case:** Customer service inquiry about a purchase

**Steps:**
1. Search for user by email
2. Click "Manage →"
3. Check stats:
   - "Total Purchases" shows purchase count
   - "Total Spent" shows lifetime value
4. Scroll to "Active Subscriptions" section
5. Verify subscription details match user's claim

**Common questions:**
- "Did my payment go through?" → Check Total Spent > $0
- "Is my subscription active?" → Check Status card
- "When does my subscription renew?" → Check Active Subscriptions section

---

## Security & Best Practices

### Admin Access Control

**Who should be admin:**
- ✅ Company owner/founder
- ✅ Head of customer success (if needed)
- ✅ Technical lead/CTO
- ❌ Regular customer service reps (use Stripe Dashboard instead)
- ❌ Contractors or temporary help

**Why:** Admins can view all user data including emails, purchase history, and personal information. This is sensitive data that should be restricted.

### Audit Trail

**Currently:** Admin actions are not logged to a separate audit table.

**Best practice for production:**
1. Create an `admin_actions` table
2. Log every tier update, sync, etc.
3. Include: admin user ID, action type, target user ID, timestamp

**Manual logging (temporary):**
- Keep a spreadsheet of admin actions
- Note: Date, Admin Email, Action, User Email, Result

### Data Privacy

**Remember:**
- You're viewing sensitive user data
- Never share user emails or purchase info publicly
- Follow GDPR/privacy laws in your jurisdiction
- Users have right to request data deletion

---

## Troubleshooting

### "Access Denied" when visiting /admin

**Possible causes:**
1. User is not marked as admin in database
2. Not logged in
3. Migration didn't run

**Solution:**
```sql
-- Check if user is admin
SELECT email, is_admin FROM profiles WHERE email = 'your-email@example.com';

-- If is_admin is false or null:
UPDATE profiles SET is_admin = TRUE WHERE email = 'your-email@example.com';

-- If column doesn't exist:
-- Run migration 003_add_admin_access.sql
```

### "Failed to update tier" error

**Possible causes:**
1. Database connection issue
2. Invalid tier value
3. User doesn't exist

**Solution:**
- Refresh the page and try again
- Check browser console for errors
- Verify user still exists in database
- Check Supabase logs

### "Failed to sync from Stripe" error

**Possible causes:**
1. Stripe API key invalid or expired
2. Network timeout
3. Customer ID doesn't exist in Stripe

**Solution:**
- Verify `STRIPE_SECRET_KEY` in environment variables
- Check Stripe Dashboard → API Keys
- Verify customer exists: Visit Stripe Dashboard → search for customer ID
- Try again in a few minutes (could be temporary Stripe issue)

### User list shows no results

**Possible causes:**
1. No users in database yet
2. Search filter too restrictive
3. Database query error

**Solution:**
- Click "Clear" to reset search
- Check Supabase Table Editor → profiles table
- Check browser console for errors

---

## Advanced Features (Future)

### Planned Enhancements

1. **Discount Management**
   - Assign discounts from admin console
   - View which users have which discounts
   - Bulk assign discount codes

2. **Bulk Actions**
   - Update tier for multiple users at once
   - Export user list to CSV
   - Bulk email users by tier

3. **Audit Log**
   - Track all admin actions
   - View who changed what and when
   - Compliance reporting

4. **Analytics**
   - Revenue charts
   - Churn analysis
   - Cohort reports

### Current Limitations

- No bulk operations (must update users one by one)
- No audit trail of admin actions
- No CSV export
- Can't assign discounts from admin console (must use SQL)
- Can't send emails to users from console

---

## FAQ

**Q: Can I demote myself from admin?**
A: Yes, but be careful! Run: `UPDATE profiles SET is_admin = FALSE WHERE id = 'your-id'`
Make sure another admin exists first.

**Q: Can admins see user passwords?**
A: No. Passwords are hashed by Supabase Auth and never visible to anyone.

**Q: What happens if I update a tier by mistake?**
A: Just update it back to the previous tier. Tier changes are not destructive.

**Q: Can I delete a user from admin console?**
A: Not currently. Use Supabase Dashboard → Auth → Users to delete accounts.

**Q: How often should I sync users from Stripe?**
A: Only when needed. Webhooks handle automatic syncing. Use manual sync only for troubleshooting.

**Q: Can I access admin console on mobile?**
A: Yes, but it's optimized for desktop. Some tables may require horizontal scrolling.

---

## Quick Reference

### Environment Variables Needed

```env
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Stripe (existing)
STRIPE_SECRET_KEY=...
```

### Database Migrations

```sql
-- 003_add_admin_access.sql
-- Adds is_admin column and helper functions
```

### Key URLs

- Admin Dashboard: `/admin`
- User Management: `/admin/users`
- User Detail: `/admin/users/[user-id]`

### Key SQL Queries

```sql
-- Grant admin access
UPDATE profiles SET is_admin = TRUE WHERE email = 'email@example.com';

-- Revoke admin access
UPDATE profiles SET is_admin = FALSE WHERE email = 'email@example.com';

-- List all admins
SELECT email, full_name FROM profiles WHERE is_admin = TRUE;

-- Count users by tier
SELECT partnership_tier, COUNT(*) FROM profiles GROUP BY partnership_tier;
```

---

## Support

For technical issues with the admin console:
- Check application logs
- Review Supabase logs in dashboard
- Check browser console for JavaScript errors

For feature requests or bugs:
- Document the issue with screenshots
- Note steps to reproduce
- Include user ID or email (if applicable)

---

**Last Updated:** 2025-11-13
**Version:** 1.0.0
