import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const KLAVIYO_API_KEY = process.env.KLAVIYO_PRIVATE_API_KEY;
const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID || 'VFxqc9';
const KLAVIYO_API_VERSION = '2024-10-15';

export async function GET(_req: NextRequest) {
  // Check if user is authenticated
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if Klaviyo API key is configured
  if (!KLAVIYO_API_KEY) {
    console.error('KLAVIYO_PRIVATE_API_KEY not configured');
    return NextResponse.json({
      subscribed: false,
      message: 'Klaviyo not configured',
    });
  }

  try {
    const email = user.email;

    if (!email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Step 1: Get profile ID from Klaviyo by email
    const searchResponse = await fetch(
      `https://a.klaviyo.com/api/profiles/?filter=equals(email,"${encodeURIComponent(email)}")`,
      {
        headers: {
          'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
          'revision': KLAVIYO_API_VERSION,
        },
      }
    );

    if (!searchResponse.ok) {
      console.error('Failed to search for Klaviyo profile');
      throw new Error('Failed to find profile');
    }

    const searchData = await searchResponse.json();
    const profileId = searchData.data?.[0]?.id;

    if (!profileId) {
      // Profile doesn't exist in Klaviyo
      return NextResponse.json({
        subscribed: false,
        email,
      });
    }

    // Step 2: Check if profile is in the list
    const listResponse = await fetch(
      `https://a.klaviyo.com/api/lists/${KLAVIYO_LIST_ID}/relationships/profiles/`,
      {
        headers: {
          'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
          'revision': KLAVIYO_API_VERSION,
        },
      }
    );

    if (!listResponse.ok) {
      console.error('Failed to get list profiles');
      throw new Error('Failed to check subscription status');
    }

    const listData = await listResponse.json();
    const profiles = listData.data || [];

    // Check if the profile is in the list
    const isSubscribed = profiles.some((profile: any) => profile.id === profileId);

    return NextResponse.json({
      subscribed: isSubscribed,
      email,
      profileId,
    });
  } catch (error) {
    console.error('Klaviyo status check error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check subscription status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
