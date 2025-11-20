import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { isCurrentUserAdmin } from '@/lib/admin';

export async function GET() {
  try {
    // Check admin access
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const supabase = createServiceRoleClient();

    // Fetch all subscribers
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscribers:', error);
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    // Generate CSV
    const headers = ['Email', 'Status', 'Source', 'Subscribed At', 'Unsubscribed At', 'Created At'];
    const rows = subscribers.map(sub => [
      sub.email,
      sub.subscribed ? 'Active' : 'Unsubscribed',
      sub.source || '',
      sub.subscribed_at || '',
      sub.unsubscribed_at || '',
      sub.created_at || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting subscribers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
