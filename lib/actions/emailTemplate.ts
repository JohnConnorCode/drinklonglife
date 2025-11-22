'use server';

/**
 * Server Actions for Email Template Management
 *
 * These actions are called from the admin UI to manage email templates.
 * All actions require admin authentication.
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  getAllTemplates,
  getTemplate,
  saveTemplateDraft,
  publishTemplate as publishTemplateService,
  deleteTemplate as deleteTemplateService,
  getCategories,
  CreateTemplateInput,
} from '@/lib/services/emailTemplateService';
import { sendTestEmail as sendTestEmailUtil } from '@/lib/email/send-template';

/**
 * Verify user is admin
 */
async function verifyAdmin(): Promise<{ userId: string; isAdmin: boolean }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error('Not authorized - admin access required');
  }

  return { userId: user.id, isAdmin: true };
}

/**
 * Get all email templates
 */
export async function getEmailTemplates() {
  await verifyAdmin();

  try {
    const templates = await getAllTemplates();
    return { success: true, data: templates };
  } catch (error) {
    console.error('Error fetching templates:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch templates',
    };
  }
}

/**
 * Get a specific template
 */
export async function getEmailTemplate(templateName: string, versionType: 'draft' | 'published' = 'published') {
  await verifyAdmin();

  try {
    const template = await getTemplate(templateName, versionType);
    return { success: true, data: template };
  } catch (error) {
    console.error('Error fetching template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch template',
    };
  }
}

/**
 * Save a draft template
 */
export async function saveEmailTemplateDraft(input: CreateTemplateInput) {
  const { userId } = await verifyAdmin();

  try {
    const template = await saveTemplateDraft(input, userId);
    revalidatePath('/admin/email-templates');
    return { success: true, data: template };
  } catch (error) {
    console.error('Error saving draft:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save draft',
    };
  }
}

/**
 * Publish a template (draft → published)
 */
export async function publishEmailTemplate(templateName: string) {
  const { userId } = await verifyAdmin();

  try {
    const template = await publishTemplateService(templateName, userId);
    revalidatePath('/admin/email-templates');
    return { success: true, data: template };
  } catch (error) {
    console.error('Error publishing template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish template',
    };
  }
}

/**
 * Delete a template
 */
export async function deleteEmailTemplate(templateName: string, versionType: 'draft' | 'published') {
  await verifyAdmin();

  try {
    await deleteTemplateService(templateName, versionType);
    revalidatePath('/admin/email-templates');
    return { success: true };
  } catch (error) {
    console.error('Error deleting template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete template',
    };
  }
}

/**
 * Get all template categories
 */
export async function getEmailTemplateCategories() {
  await verifyAdmin();

  try {
    const categories = await getCategories();
    return { success: true, data: categories };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch categories',
    };
  }
}

/**
 * Send a test email
 */
export async function sendTestEmail(
  to: string,
  templateName: string,
  testData: Record<string, any>
) {
  await verifyAdmin();

  try {
    const result = await sendTestEmailUtil(to, templateName, testData);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to send test email',
      };
    }

    return {
      success: true,
      data: { id: result.id, notificationId: result.notificationId },
    };
  } catch (error) {
    console.error('Error sending test email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send test email',
    };
  }
}
