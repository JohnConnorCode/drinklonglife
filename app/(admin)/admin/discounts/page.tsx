import { requireAdmin } from '@/lib/admin';
import { getStripeClient } from '@/lib/stripe/config';
import { PromotionCodesManager } from './PromotionCodesManager';

export const metadata = {
  title: 'Discount Codes | Admin',
  description: 'Create and manage discount codes',
};

export const dynamic = 'force-dynamic';

interface PromotionCode {
  id: string;
  code: string;
  couponId: string;
  active: boolean;
  percentOff: number | null;
  amountOff: number | null;
  currency: string | null;
  duration: string;
  durationInMonths: number | null;
  firstTimeTransaction: boolean;
  minimumAmount: number | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
  expiresAt: number | null;
  createdAt: number;
}

async function getPromotionCodes(): Promise<PromotionCode[]> {
  try {
    const stripe = await getStripeClient();
    const promoCodes = await stripe.promotionCodes.list({
      limit: 100,
      expand: ['data.coupon'],
    });

    return promoCodes.data.map((stripePromo: any) => {
      // Coupon is expanded, so it's an object not a string
      const coupon = stripePromo.coupon;

      return {
        id: stripePromo.id,
        code: stripePromo.code,
        couponId: coupon.id,
        active: stripePromo.active,
        percentOff: coupon.percent_off,
        amountOff: coupon.amount_off,
        currency: coupon.currency,
        duration: coupon.duration,
        durationInMonths: coupon.duration_in_months,
        firstTimeTransaction: stripePromo.restrictions?.first_time_transaction ?? false,
        minimumAmount: stripePromo.restrictions?.minimum_amount ?? null,
        maxRedemptions: stripePromo.max_redemptions,
        timesRedeemed: stripePromo.times_redeemed,
        expiresAt: stripePromo.expires_at,
        createdAt: stripePromo.created,
      };
    });
  } catch (error) {
    console.error('Error fetching promotion codes:', error);
    return [];
  }
}

export default async function DiscountsPage() {
  await requireAdmin();
  const codes = await getPromotionCodes();

  const activeCount = codes.filter((c) => c.active).length;
  const totalRedemptions = codes.reduce((sum, c) => sum + c.timesRedeemed, 0);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discount Codes</h1>
        <p className="text-gray-600 mt-1">
          Create reusable codes with restrictions. Auto-synced with Stripe.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Codes</div>
          <div className="text-2xl font-bold">{codes.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-500">Total Redemptions</div>
          <div className="text-2xl font-bold text-blue-600">{totalRedemptions}</div>
        </div>
      </div>

      {/* Main Manager Component */}
      <PromotionCodesManager initialCodes={codes} />
    </div>
  );
}
