import { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/Section';

export const metadata: Metadata = {
  title: 'Subscriptions | Long Life',
  description: 'Subscribe to weekly or bi-weekly juice drops. Priority access to limited runs and seasonal blends.',
};

export default function SubscriptionsPage() {
  return (
    <>
      {/* Hero */}
      <Section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-heading text-5xl sm:text-6xl font-bold mb-6">
            Subscriptions
          </h1>
          <p className="text-xl text-muted mb-8">
            Your body likes rhythm.
          </p>
          <p className="text-lg text-muted leading-relaxed">
            Subscribe to a weekly or bi-weekly drop. You choose your blend mix and size.
            Skip or pause anytime.
          </p>
        </div>
      </Section>

      {/* How It Works */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl font-bold mb-8 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-yellow rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-heading text-xl font-bold mb-3">
                Choose Your Blends
              </h3>
              <p className="text-muted">
                Select from Yellow, Red, or Green Bomb. Mix and match based on your goals.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-red rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 text-white">
                2
              </div>
              <h3 className="font-heading text-xl font-bold mb-3">
                Set Your Frequency
              </h3>
              <p className="text-muted">
                Weekly or bi-weekly delivery. Pause, skip, or adjust anytime.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-green rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-heading text-xl font-bold mb-3">
                Get Priority Access
              </h3>
              <p className="text-muted">
                Guaranteed inventory. First notice on seasonal drops and new blends.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Member Perks */}
      <Section className="bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl font-bold mb-8 text-center">
            Member Perks
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-6 bg-white rounded-lg">
              <div className="text-accent-red text-2xl">✓</div>
              <div>
                <h3 className="font-semibold mb-1">Priority Access</h3>
                <p className="text-muted">
                  Guaranteed inventory on limited runs. Never miss a batch.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white rounded-lg">
              <div className="text-accent-red text-2xl">✓</div>
              <div>
                <h3 className="font-semibold mb-1">Early Tasting Invites</h3>
                <p className="text-muted">
                  Be the first to try new formulas and seasonal blends before they launch.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white rounded-lg">
              <div className="text-accent-red text-2xl">✓</div>
              <div>
                <h3 className="font-semibold mb-1">Flexible Plans</h3>
                <p className="text-muted">
                  Customize your mix. Change sizes. Skip weeks. Cancel anytime.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white rounded-lg">
              <div className="text-accent-red text-2xl">✓</div>
              <div>
                <h3 className="font-semibold mb-1">Community Connection</h3>
                <p className="text-muted">
                  Join pickup days, share feedback, and help shape what we make next.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Pricing */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl font-bold mb-8 text-center">
            Subscription Plans
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-2 border-gray-200 rounded-lg p-8">
              <h3 className="font-heading text-2xl font-bold mb-4">Weekly</h3>
              <p className="text-muted mb-6">
                Fresh juice every week. Build a consistent routine.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>1-Gallon</span>
                  <span className="font-bold">$50/week</span>
                </div>
                <div className="flex justify-between">
                  <span>½-Gallon</span>
                  <span className="font-bold">$35/week</span>
                </div>
                <div className="flex justify-between">
                  <span>Shots (4-pack)</span>
                  <span className="font-bold">$18/week</span>
                </div>
              </div>
              <button className="w-full px-6 py-3 bg-black text-white rounded-md font-semibold hover:opacity-90 transition-opacity">
                Start Weekly Plan
              </button>
            </div>

            <div className="border-2 border-accent-red rounded-lg p-8">
              <div className="inline-block px-3 py-1 bg-accent-red text-white text-xs font-bold rounded-full mb-2">
                POPULAR
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4">Bi-Weekly</h3>
              <p className="text-muted mb-6">
                Every other week. Perfect for lighter routines or smaller households.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>1-Gallon</span>
                  <span className="font-bold">$50/delivery</span>
                </div>
                <div className="flex justify-between">
                  <span>½-Gallon</span>
                  <span className="font-bold">$35/delivery</span>
                </div>
                <div className="flex justify-between">
                  <span>Shots (4-pack)</span>
                  <span className="font-bold">$18/delivery</span>
                </div>
              </div>
              <button className="w-full px-6 py-3 bg-accent-red text-white rounded-md font-semibold hover:opacity-90 transition-opacity">
                Start Bi-Weekly Plan
              </button>
            </div>
          </div>
          <p className="text-center text-muted mt-8">
            All plans include free local pickup. Delivery options coming soon.
          </p>
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-accent-yellow/10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Ready to Start?
          </h2>
          <p className="text-lg text-muted mb-8">
            Join the community. Lock in your weekly or bi-weekly drops.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/blends"
              className="px-6 py-3 bg-accent-red text-white rounded-md font-semibold hover:opacity-90 transition-opacity"
            >
              View Our Blends
            </Link>
            <Link
              href="#newsletter"
              className="px-6 py-3 border-2 border-black text-black rounded-md font-semibold hover:bg-black hover:text-white transition-colors"
            >
              Get Notified
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
