import { createServerClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = [
  'john@acceleratewith.us',
  'mikemontoya@montoyacapital.org',
  'jt.connor88@gmail.com',
];

/**
 * Check if a user is an admin based on their email
 */
export async function isUserAdmin(email?: string): Promise<boolean> {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Get the currently authenticated user and check if they're an admin
 */
export async function getCurrentAdminUser() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const isAdmin = await isUserAdmin(user.email);
  if (!isAdmin) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    isAdmin: true,
  };
}

/**
 * Verify admin access and return user, or throw error
 */
export async function requireAdminUser() {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
  return admin;
}
