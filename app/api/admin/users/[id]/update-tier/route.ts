import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { isCurrentUserAdmin } from '@/lib/admin';

const VALID_TIERS = ['none', 'affiliate', 'partner', 'vip'];

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin access
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { tier } = await req.json();

    // Validate tier
    if (!VALID_TIERS.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier value' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Update user's partnership tier
    const { error } = await supabase
      .from('profiles')
      .update({
        partnership_tier: tier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) {
      logger.error('Error updating tier:', error);
      return NextResponse.json(
        { error: 'Failed to update tier' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Tier updated to ${tier}`,
    });
  } catch (error) {
    logger.error('Update tier error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
