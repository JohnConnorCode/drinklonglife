import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/admin';
import { logger } from '@/lib/logger';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/admin/stripe-settings
 * Get current Stripe mode setting from Supabase
 * Public endpoint - anyone can check the mode
 */
export async function GET() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/stripe_settings?select=*&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        cache: 'no-store', // Always get fresh data
      }
    );

    if (!response.ok) {
      logger.error('Failed to fetch from Supabase:', await response.text());
      return NextResponse.json({
        mode: 'test',
        message: 'No Stripe settings configured, defaulting to test mode',
      });
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return NextResponse.json({
        mode: 'test',
        message: 'No Stripe settings configured, defaulting to test mode',
      });
    }

    const settings = data[0];

    return NextResponse.json({
      mode: settings.mode,
      lastModified: settings.last_modified,
      modifiedBy: settings.modified_by,
    });
  } catch (error) {
    logger.error('Error fetching Stripe settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Stripe settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/stripe-settings
 * Update Stripe mode (admin only)
 * Request body: { mode: 'test' | 'production' }
 */
export async function PUT(req: NextRequest) {
  try {
    // Verify admin access
    const admin = await requireAdminUser();

    const { mode } = await req.json();

    // Validate mode
    if (mode !== 'test' && mode !== 'production') {
      return NextResponse.json(
        { error: 'Invalid mode. Must be "test" or "production"' },
        { status: 400 }
      );
    }

    // Warn if switching to production
    if (mode === 'production') {
      logger.warn(
        `⚠️ PRODUCTION MODE ENABLED by ${admin.email} at ${new Date().toISOString()}`
      );
    } else {
      logger.info(
        `✅ TEST MODE ENABLED by ${admin.email} at ${new Date().toISOString()}`
      );
    }

    // First, get the existing record
    const getResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/stripe_settings?select=id&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    let recordId: string | null = null;

    if (getResponse.ok) {
      const existing = await getResponse.json();
      if (existing && existing.length > 0) {
        recordId = existing[0].id;
      }
    }

    // Update or insert
    let updateResponse;

    if (recordId) {
      // Update existing record
      updateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/stripe_settings?id=eq.${recordId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            mode,
            last_modified: new Date().toISOString(),
            modified_by: admin.email,
            updated_at: new Date().toISOString(),
          }),
        }
      );
    } else {
      // Insert new record
      updateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/stripe_settings`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            mode,
            modified_by: admin.email,
            last_modified: new Date().toISOString(),
          }),
        }
      );
    }

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      logger.error('Failed to update Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to update Stripe settings' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        mode,
        message: `Switched to ${mode} mode`,
        changedBy: admin.email,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    logger.error('Error updating Stripe settings:', error);
    return NextResponse.json(
      { error: 'Failed to update Stripe settings' },
      { status: 500 }
    );
  }
}
