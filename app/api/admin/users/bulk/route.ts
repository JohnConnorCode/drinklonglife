import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdminApi } from '@/lib/admin';
import { logger } from '@/lib/logger';

// PATCH - Bulk update users
export async function PATCH(request: NextRequest) {
  try {
    await requireAdminApi(request);
    const supabase = createServiceRoleClient();

    const { ids, updates } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No user IDs provided' }, { status: 400 });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    // Allowed fields for bulk update
    const allowedFields = ['partnership_tier', 'subscription_status'];
    const filteredUpdates: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value;
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    // Update users
    const { data, error } = await supabase
      .from('profiles')
      .update(filteredUpdates)
      .in('id', ids)
      .select('id');

    if (error) {
      logger.error('Bulk update users error:', error);
      return NextResponse.json({ error: 'Failed to update users' }, { status: 500 });
    }

    logger.info(`Bulk updated ${data?.length || 0} users`, { updates: filteredUpdates });

    return NextResponse.json({
      success: true,
      updated: data?.length || 0,
    });
  } catch (error) {
    logger.error('Bulk update users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Bulk delete users
export async function DELETE(request: NextRequest) {
  try {
    await requireAdminApi(request);
    const supabase = createServiceRoleClient();

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No user IDs provided' }, { status: 400 });
    }

    // Safety check: Don't allow deleting more than 100 users at once
    if (ids.length > 100) {
      return NextResponse.json({
        error: 'Cannot delete more than 100 users at once for safety'
      }, { status: 400 });
    }

    // Get user info before deletion for logging
    const { data: usersToDelete } = await supabase
      .from('profiles')
      .select('id, email, is_admin')
      .in('id', ids);

    // Safety: Don't delete admin users
    const adminUsers = usersToDelete?.filter(u => u.is_admin) || [];
    if (adminUsers.length > 0) {
      return NextResponse.json({
        error: `Cannot delete ${adminUsers.length} admin user(s). Remove admin status first.`,
        adminEmails: adminUsers.map(u => u.email),
      }, { status: 400 });
    }

    // Delete related data first (cascade may not be set up for all tables)
    const deletePromises = [
      // Delete referrals where user is referrer or referred
      supabase.from('referrals').delete().in('referrer_id', ids),
      supabase.from('referrals').delete().in('referred_user_id', ids),
      // Delete subscriptions
      supabase.from('subscriptions').delete().in('user_id', ids),
      // Delete orders
      supabase.from('orders').delete().in('user_id', ids),
      // Delete email preferences
      supabase.from('email_preferences').delete().in('user_id', ids),
    ];

    await Promise.all(deletePromises);

    // Delete from profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .in('id', ids);

    if (profileError) {
      logger.error('Bulk delete profiles error:', profileError);
      return NextResponse.json({ error: 'Failed to delete user profiles' }, { status: 500 });
    }

    // Delete from Supabase Auth (requires service role)
    const authDeletePromises = ids.map(id =>
      supabase.auth.admin.deleteUser(id).catch(err => {
        logger.warn(`Failed to delete auth user ${id}:`, err);
        return null;
      })
    );

    await Promise.all(authDeletePromises);

    logger.info(`Bulk deleted ${ids.length} users`, {
      emails: usersToDelete?.map(u => u.email),
    });

    return NextResponse.json({
      success: true,
      deleted: ids.length,
    });
  } catch (error) {
    logger.error('Bulk delete users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
