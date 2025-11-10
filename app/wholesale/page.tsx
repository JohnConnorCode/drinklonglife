import { Metadata } from 'next';
import { Section } from '@/components/Section';

export const metadata: Metadata = {
  title: 'Wholesale & Teams | Long Life',
  description: 'Partner with Long Life for wholesale juice programs. Retail bottles, bulk jugs, team wellness fridges, and event bars.',
};

export default function WholesalePage() {
  return (
    <>
      {/* Hero */}
      <Section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-heading text-5xl sm:text-6xl font-bold mb-6">
            Wholesale & Teams
          </h1>
          <p className="text-xl text-muted mb-8">
            Real juice for real businesses.
          </p>
          <p className="text-lg text-muted leading-relaxed">
            We partner with select cafés, gyms, and offices that value real ingredients
            and want to offer something better to their communities.
          </p>
        </div>
      </Section>

      {/* Who We Work With */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl font-bold mb-12 text-center">
            Who We Work With
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">☕</div>
              <h3 className="font-heading text-xl font-bold mb-3">
                Cafés & Markets
              </h3>
              <p className="text-muted">
                Stock our bottles and shots in your cooler. Give customers a premium
                alternative to commodity juice.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">💪</div>
              <h3 className="font-heading text-xl font-bold mb-3">
                Gyms & Studios
              </h3>
              <p className="text-muted">
                Fuel members before and after workouts with clean, functional blends.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="font-heading text-xl font-bold mb-3">
                Offices & Teams
              </h3>
              <p className="text-muted">
                Upgrade your wellness program with weekly juice fridges or event bars.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Programs */}
      <Section className="bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl font-bold mb-12 text-center">
            Wholesale Programs
          </h2>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-lg">
              <h3 className="font-heading text-2xl font-bold mb-4">
                Retail Bottles & Shots
              </h3>
              <p className="text-muted mb-6">
                Stock our signature blends in retail-ready bottles. Individual portions
                or shots for grab-and-go customers. Weekly or bi-weekly delivery.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded p-4">
                  <p className="font-semibold mb-1">16oz Bottles</p>
                  <p className="text-sm text-muted">Wholesale pricing available</p>
                </div>
                <div className="border border-gray-200 rounded p-4">
                  <p className="font-semibold mb-1">2oz Shots</p>
                  <p className="text-sm text-muted">Perfect for countertop displays</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg">
              <h3 className="font-heading text-2xl font-bold mb-4">
                Refillable Bulk Jugs
              </h3>
              <p className="text-muted mb-6">
                Large-format jugs for high-volume locations. We deliver, you serve.
                Ideal for juice bars, smoothie shops, and event catering.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded p-4">
                  <p className="font-semibold mb-1">1-Gallon Jugs</p>
                  <p className="text-sm text-muted">Serve 16 cups per jug</p>
                </div>
                <div className="border border-gray-200 rounded p-4">
                  <p className="font-semibold mb-1">2.5-Gallon Jugs</p>
                  <p className="text-sm text-muted">For events and high-traffic days</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg">
              <h3 className="font-heading text-2xl font-bold mb-4">
                Team Wellness Fridges
              </h3>
              <p className="text-muted mb-6">
                Keep your office or team stocked with fresh juice. We set up a weekly
                delivery schedule and handle invoicing. You choose the blend mix and
                quantities.
              </p>
              <div className="border-l-4 border-accent-green pl-4">
                <p className="text-sm font-semibold mb-1">Custom Programs</p>
                <p className="text-sm text-muted">
                  Pricing scales with team size. Minimum 12 bottles per delivery.
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg">
              <h3 className="font-heading text-2xl font-bold mb-4">
                Event Bars & Pop-Ups
              </h3>
              <p className="text-muted mb-6">
                Bring Long Life to your event, retreat, or conference. We can provide
                pre-packaged bottles or a full juice bar setup with on-site service.
              </p>
              <div className="border-l-4 border-accent-yellow pl-4">
                <p className="text-sm font-semibold mb-1">Booking Required</p>
                <p className="text-sm text-muted">
                  Minimum 48-hour notice. Pricing varies by event size and service level.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Why Partner With Us */}
      <Section>
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl font-bold mb-8 text-center">
            Why Partner With Long Life
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="text-accent-red text-2xl">✓</div>
              <div>
                <h3 className="font-semibold mb-1">Real Ingredients</h3>
                <p className="text-muted">
                  No concentrates, no fillers, no artificial anything. Just cold-pressed
                  whole fruits, roots, and greens.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-accent-red text-2xl">✓</div>
              <div>
                <h3 className="font-semibold mb-1">Small-Batch Quality</h3>
                <p className="text-muted">
                  We press, chill, and bottle the same day. Maximum freshness, zero
                  compromise.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-accent-red text-2xl">✓</div>
              <div>
                <h3 className="font-semibold mb-1">Local & Transparent</h3>
                <p className="text-muted">
                  Made in Indiana. We know our farms, track our lots, and batch-date
                  every bottle.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-accent-red text-2xl">✓</div>
              <div>
                <h3 className="font-semibold mb-1">Reliable Partner</h3>
                <p className="text-muted">
                  Consistent delivery schedules. Responsive communication. We show up for
                  our partners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Application CTA */}
      <Section className="bg-accent-yellow/10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Ready to Partner?
          </h2>
          <p className="text-lg text-muted mb-8">
            We're selective about who we work with. Tell us about your business and
            how you'd serve Long Life to your community.
          </p>
          <form className="space-y-4 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Business Name"
                className="px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                required
              />
              <input
                type="text"
                placeholder="Contact Name"
                className="px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Email"
                className="px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                className="px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                required
              />
            </div>
            <select
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-yellow"
              required
            >
              <option value="">Select Program Type</option>
              <option value="retail">Retail Bottles & Shots</option>
              <option value="bulk">Refillable Bulk Jugs</option>
              <option value="wellness">Team Wellness Fridge</option>
              <option value="events">Event Bars & Pop-Ups</option>
            </select>
            <textarea
              placeholder="Tell us about your business and how you'd serve Long Life..."
              rows={4}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-yellow"
              required
            />
            <button
              type="submit"
              className="w-full px-6 py-3 bg-accent-red text-white rounded-md font-semibold hover:opacity-90 transition-opacity"
            >
              Apply for Wholesale
            </button>
          </form>
          <p className="text-sm text-muted">
            We typically respond within 2-3 business days.
          </p>
        </div>
      </Section>
    </>
  );
}
