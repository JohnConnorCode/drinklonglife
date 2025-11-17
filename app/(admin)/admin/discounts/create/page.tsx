import { requireAdmin } from '@/lib/admin';
import { CreateDiscountForm } from './CreateDiscountForm';
import Link from 'next/link';

export const metadata = {
  title: 'Create Discount | Admin',
  description: 'Create a new discount code',
};

export default async function CreateDiscountPage() {
  await requireAdmin();

  return (
    <div className="max-w-2xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/discounts"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1 mb-4"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Discounts
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create Discount Code</h1>
        <p className="text-gray-600 mt-1">
          Create a custom discount code for a user
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">How it works</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• The discount code must match a coupon created in Stripe</li>
              <li>• The user will see this discount in their account page</li>
              <li>• Discount is applied automatically at checkout if active</li>
              <li>• Set an expiration date or leave blank for no expiration</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <CreateDiscountForm />
      </div>
    </div>
  );
}
