import { Metadata } from 'next';
import Link from 'next/link';
import { ApplyReferralForm } from './ApplyReferralForm';
import { ReferralStats } from './ReferralStats';

export const metadata: Metadata = {
  title: 'Referral Management | Admin',
  description: 'Manage referrals and discount codes',
};

export default async function ReferralsAdminPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">
          Referral Management
        </h1>
        <p className="text-gray-600">
          Manually apply referrals, view stats, and manage discount codes
        </p>
      </div>

      {/* Referral Stats */}
      <ReferralStats />

      {/* Manual Referral Application */}
      <div>
        <h2 className="font-heading text-xl font-bold text-gray-900 mb-4">
          Apply Discount Code
        </h2>
        <div className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
          <p className="text-sm text-gray-600 mb-6">
            Manually add a discount code to a user's account. This is useful for special promotions,
            customer service issues, or manual referral rewards.
          </p>
          <ApplyReferralForm />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">How to Apply Discounts</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Use the User ID (UUID) from the user management page</li>
              <li>Enter the Stripe coupon code (e.g., "SAVE20")</li>
              <li>Specify the source for tracking (e.g., "admin_manual", "customer_service")</li>
              <li>Set expiration days (default: 30 days)</li>
              <li>Discount will appear in user's "Perks & Rewards" page</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="font-heading text-xl font-bold text-gray-900 mb-4">
          Related Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/users"
            className="bg-white rounded-lg shadow p-4 border-2 border-gray-200 hover:border-blue-500 transition-colors flex items-center gap-3"
          >
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900">User Management</h3>
              <p className="text-sm text-gray-600">Find user IDs and profiles</p>
            </div>
          </Link>

          <Link
            href="/admin/discounts"
            className="bg-white rounded-lg shadow p-4 border-2 border-gray-200 hover:border-green-500 transition-colors flex items-center gap-3"
          >
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900">View All Discounts</h3>
              <p className="text-sm text-gray-600">See active discount codes</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
