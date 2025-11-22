/**
 * Email Template Service
 *
 * CRUD operations for email templates with draft/publish workflow
 */

import { createServiceRoleClient } from '@/lib/supabase/server';

export interface EmailTemplate {
  id: string;
  template_name: string;
  version_type: 'draft' | 'published';
  subject_template: string;
  html_template: string;
  text_template?: string;
  preheader?: string;
  data_schema: Record<string, any>;
  category?: string;
  description?: string;
  created_by?: string;
  published_by?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateInput {
  template_name: string;
  subject_template: string;
  html_template: string;
  text_template?: string;
  preheader?: string;
  data_schema?: Record<string, any>;
  category?: string;
  description?: string;
}

/**
 * Get all templates (both draft and published)
 */
export async function getAllTemplates(): Promise<EmailTemplate[]> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('email_template_versions')
    .select('*')
    .order('template_name', { ascending: true })
    .order('version_type', { ascending: true }); // draft before published

  if (error) {
    console.error('Error fetching templates:', error);
    throw new Error('Failed to fetch email templates');
  }

  return data || [];
}

/**
 * Get a specific template by name and version type
 */
export async function getTemplate(
  templateName: string,
  versionType: 'draft' | 'published' = 'published'
): Promise<EmailTemplate | null> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('email_template_versions')
    .select('*')
    .eq('template_name', templateName)
    .eq('version_type', versionType)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Error fetching template:', error);
    throw new Error('Failed to fetch email template');
  }

  return data;
}

/**
 * Create or update a draft template
 */
export async function saveTemplateDraft(
  input: CreateTemplateInput,
  userId: string
): Promise<EmailTemplate> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('email_template_versions')
    .upsert(
      {
        template_name: input.template_name,
        version_type: 'draft',
        subject_template: input.subject_template,
        html_template: input.html_template,
        text_template: input.text_template,
        preheader: input.preheader,
        data_schema: input.data_schema || {},
        category: input.category,
        description: input.description,
        created_by: userId,
      },
      {
        onConflict: 'template_name,version_type',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error saving draft:', error);
    throw new Error('Failed to save draft');
  }

  return data;
}

/**
 * Publish a draft template (replaces published version)
 */
export async function publishTemplate(
  templateName: string,
  userId: string
): Promise<EmailTemplate> {
  const supabase = createServiceRoleClient();

  // 1. Get the draft version
  const draft = await getTemplate(templateName, 'draft');
  if (!draft) {
    throw new Error('No draft version found to publish');
  }

  // 2. Delete existing published version if it exists
  await supabase
    .from('email_template_versions')
    .delete()
    .eq('template_name', templateName)
    .eq('version_type', 'published');

  // 3. Create published version from draft
  const { data, error } = await supabase
    .from('email_template_versions')
    .insert({
      template_name: draft.template_name,
      version_type: 'published',
      subject_template: draft.subject_template,
      html_template: draft.html_template,
      text_template: draft.text_template,
      preheader: draft.preheader,
      data_schema: draft.data_schema,
      category: draft.category,
      description: draft.description,
      created_by: draft.created_by,
      published_by: userId,
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error publishing template:', error);
    throw new Error('Failed to publish template');
  }

  // 4. Delete the draft version
  await supabase
    .from('email_template_versions')
    .delete()
    .eq('template_name', templateName)
    .eq('version_type', 'draft');

  return data;
}

/**
 * Delete a template (draft or published)
 */
export async function deleteTemplate(
  templateName: string,
  versionType: 'draft' | 'published'
): Promise<void> {
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from('email_template_versions')
    .delete()
    .eq('template_name', templateName)
    .eq('version_type', versionType);

  if (error) {
    console.error('Error deleting template:', error);
    throw new Error('Failed to delete template');
  }
}

/**
 * Get templates by category
 */
export async function getTemplatesByCategory(category: string): Promise<EmailTemplate[]> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('email_template_versions')
    .select('*')
    .eq('category', category)
    .eq('version_type', 'published')
    .order('template_name', { ascending: true });

  if (error) {
    console.error('Error fetching templates by category:', error);
    throw new Error('Failed to fetch templates by category');
  }

  return data || [];
}

/**
 * Get all unique categories
 */
export async function getCategories(): Promise<string[]> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('email_template_versions')
    .select('category')
    .not('category', 'is', null);

  if (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }

  // Get unique categories
  const categories = [...new Set(data.map((row: any) => row.category))].filter(Boolean);
  return categories as string[];
}
