import { Metadata } from 'next';
import { EmailTemplateManager } from '@/components/admin/email/EmailTemplateManager';

export const metadata: Metadata = {
  title: 'Email Templates | Admin',
  description: 'Manage email templates',
};

export default function EmailTemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Templates</h1>
        <p className="text-gray-600 mt-2">
          Manage database-driven email templates with draft/publish workflow
        </p>
      </div>

      <EmailTemplateManager />
    </div>
  );
}
