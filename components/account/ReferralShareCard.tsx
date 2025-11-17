'use client';

import { useState } from 'react';
import Link from 'next/link';
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
    <div className="relative bg-gradient-to-br from-accent-primary via-accent-secondary to-accent-yellow rounded-2xl shadow-xl overflow-hidden border-2 border-accent-yellow/30">
      {/* Animated Background Orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-yellow/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-green/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="relative p-8">
        {/* Header with Badge */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full mb-3 shadow-sm">
              <svg className="w-4 h-4 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">Ambassador</span>
            </div>
            <h3 className="font-heading text-3xl font-bold text-white mb-2 drop-shadow-lg">
              Share & Earn Rewards
            </h3>
            <p className="text-white/90 text-base drop-shadow">
              Spread the wellness, earn exclusive benefits
            </p>
          </div>
          <div className="text-center bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg">
            <p className="text-xs font-medium text-gray-600 mb-1">Your Code</p>
            <code className="font-mono font-bold text-xl text-accent-primary">
              {referralCode}
            </code>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:scale-105 transition-transform">
            <div className="text-3xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
              {stats.totalReferrals}
            </div>
            <div className="text-xs font-medium text-gray-600 mt-1">Total Referrals</div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:scale-105 transition-transform">
            <div className="text-3xl font-bold bg-gradient-to-r from-accent-secondary to-accent-yellow bg-clip-text text-transparent">
              {stats.completedPurchases}
            </div>
            <div className="text-xs font-medium text-gray-600 mt-1">Completed</div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:scale-105 transition-transform">
            <div className="text-3xl font-bold bg-gradient-to-r from-accent-green to-accent-yellow bg-clip-text text-transparent">
              {stats.issuedRewards}
            </div>
            <div className="text-xs font-medium text-gray-600 mt-1">Rewards Earned</div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:scale-105 transition-transform">
            <div className="text-3xl font-bold bg-gradient-to-r from-accent-yellow to-accent-primary bg-clip-text text-transparent">
              {stats.conversionRate}%
            </div>
            <div className="text-xs font-medium text-gray-600 mt-1">Conversion</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-accent-primary rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-sm"
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </>
            )}
          </button>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1DA1F2] text-white rounded-xl font-semibold hover:bg-[#1a8cd8] transition-all shadow-lg hover:shadow-xl hover:scale-105 text-sm"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </a>
        </div>

        {/* CTA to Become Ambassador */}
        <Link
          href="/referral"
          className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white drop-shadow">Become an Ambassador</p>
              <p className="text-sm text-white/80 drop-shadow">Learn about our program & unlock more benefits</p>
            </div>
          </div>
          <svg className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
