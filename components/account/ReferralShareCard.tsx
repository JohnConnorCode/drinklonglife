'use client';

import { useState } from 'react';
import { ReferralStats } from '@/lib/referral-utils';

interface ReferralShareCardProps {
  referralCode: string;
  stats: ReferralStats;
}

export function ReferralShareCard({ referralCode, stats }: ReferralShareCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/referral/${referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = `${window.location.origin}/referral/${referralCode}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=Check out Long Life! Get 20% off with my code: ${referralCode}&url=${shareUrl}`;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            Your Referral Program
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Share your code and earn rewards
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Your Code</p>
          <code className="px-3 py-1 bg-white rounded-lg font-mono font-semibold text-sm">
            {referralCode}
          </code>
        </div>
      </div>

      {/* Referral Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalReferrals}
          </div>
          <div className="text-xs text-gray-600">Total Referrals</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.completedPurchases}
          </div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.issuedRewards}
          </div>
          <div className="text-xs text-gray-600">Rewards Earned</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {stats.conversionRate}%
          </div>
          <div className="text-xs text-gray-600">Conversion</div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCopyLink}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
        >
          {copied ? '✓ Copied!' : '📋 Copy Link'}
        </button>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm text-center"
        >
          🐦 Share on X
        </a>
      </div>
    </div>
  );
}
