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

    // Fetch all inquiries
    const { data: inquiries, error } = await supabase
      .from('wholesale_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inquiries:', error);
      return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
    }

    // Generate CSV
    const headers = [
      'Company',
      'Name',
      'Email',
      'Location',
      'Expected Volume',
      'Message',
      'Status',
      'Created At',
      'Updated At'
    ];

    const rows = inquiries.map(inquiry => [
      inquiry.company,
      inquiry.name,
      inquiry.email,
      inquiry.location,
      inquiry.expected_volume,
      inquiry.message || '',
      inquiry.status,
      inquiry.created_at || '',
      inquiry.updated_at || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="wholesale-inquiries-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting inquiries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
