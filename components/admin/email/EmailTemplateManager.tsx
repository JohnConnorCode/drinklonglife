'use client';

import { useState, useEffect } from 'react';
import { getEmailTemplates } from '@/lib/actions/emailTemplate';
import { EmailTemplate } from '@/lib/services/emailTemplateService';

export function EmailTemplateManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    setError(null);

    const result = await getEmailTemplates();

    if (result.success && result.data) {
      setTemplates(result.data);
    } else {
      setError(result.error || 'Failed to load templates');
    }

    setLoading(false);
  }

  // Group templates by name (draft + published versions)
  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.template_name]) {
      acc[template.template_name] = { draft: null, published: null };
    }

    if (template.version_type === 'draft') {
      acc[template.template_name].draft = template;
    } else {
      acc[template.template_name].published = template;
    }

    return acc;
  }, {} as Record<string, { draft: EmailTemplate | null; published: EmailTemplate | null }>);

  // Get unique categories
  const categories = ['all', ...new Set(
    templates
      .map(t => t.category)
      .filter(Boolean)
  )] as string[];

  // Filter by category
  const filteredTemplateNames = Object.keys(groupedTemplates).filter(name => {
    if (selectedCategory === 'all') return true;

    const group = groupedTemplates[name];
    const template = group.published || group.draft;

    return template?.category === selectedCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={loadTemplates}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category === 'all' ? 'All Templates' : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Templates List */}
      <div className="grid gap-4">
        {filteredTemplateNames.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No templates found</p>
          </div>
        ) : (
          filteredTemplateNames.map(templateName => {
            const group = groupedTemplates[templateName];
            const displayTemplate = group.published || group.draft!;

            return (
              <div
                key={templateName}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {displayTemplate.description || templateName}
                      </h3>

                      {/* Status Badges */}
                      <div className="flex gap-2">
                        {group.published && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            Published
                          </span>
                        )}
                        {group.draft && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                            Draft
                          </span>
                        )}
                      </div>

                      {displayTemplate.category && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          {displayTemplate.category}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mt-1">
                      <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                        {templateName}
                      </code>
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                      Subject: {displayTemplate.subject_template}
                    </p>

                    {displayTemplate.published_at && (
                      <p className="text-xs text-gray-400 mt-2">
                        Published {new Date(displayTemplate.published_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        // TODO: Open editor modal
                        alert(`Edit functionality coming soon for: ${templateName}`);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        // TODO: Open preview modal
                        alert(`Preview functionality coming soon for: ${templateName}`);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Preview
                    </button>

                    <button
                      onClick={() => {
                        // TODO: Open test email modal
                        alert(`Test email functionality coming soon for: ${templateName}`);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      Send Test
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">📧 Email System Status</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ Database-driven templates active</li>
          <li>✅ {templates.filter(t => t.version_type === 'published').length} templates published</li>
          <li>✅ Edge function deployed for email sending</li>
          <li>⚠️  Admin UI in development (edit/preview/test coming soon)</li>
        </ul>
      </div>
    </div>
  );
}
