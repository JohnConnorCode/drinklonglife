import { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/Section';

export const metadata: Metadata = {
  title: 'Ingredients & Sourcing | Long Life',
  description: 'Transparent sourcing from trusted growers. Organic-first, seasonal rotation, batch-dated quality.',
};

export default function IngredientsSourcingPage() {
  return (
    <>
      {/* Hero */}
      <Section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-heading text-5xl sm:text-6xl font-bold mb-6">
            Ingredients & Sourcing
          </h1>
          <p className="text-xl text-muted leading-relaxed">
            We source from trusted growers who share our standards. Seasonal rotation is
            part of the craft.
          </p>
        </div>
      </Section>

      {/* Philosophy */}
      <Section>
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl font-bold mb-6 text-center">
            Our Sourcing Philosophy
          </h2>
          <p className="text-lg text-muted leading-relaxed mb-8 text-center">
            When an ingredient peaks, we buy it. When it's off-season, we pause or adjust
            the recipe. This is how food should work.
          </p>
          <div className="prose prose-lg max-w-none text-muted">
            <p>
              Industrial juice is designed for year-round consistency—same flavor, same
              color, same everything. That requires concentrates, flavor additives, and
              ingredients shipped from wherever they're cheapest.
            </p>
            <p>
              Long Life is different. We work with seasonal harvest windows and regional
              farms. If a strawberry crop comes in strong, we lean into it. If a
              supplier's practices don't meet our bar, we find another or pause until we
              do.
            </p>
          </div>
        </div>
      </Section>

      {/* Our Standards */}
      <Section className="bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl font-bold mb-12 text-center">
            Our Standards
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg border-l-4 border-accent-yellow">
              <h3 className="font-heading text-xl font-bold mb-4">
                Prioritize organic and spray-free inputs
              </h3>
              <p className="text-muted leading-relaxed">
                We prefer certified organic. When that's not available or cost-prohibitive,
                we work with farms that use equivalent practices—no synthetic pesticides,
                no harmful sprays. If we can't verify clean inputs, we don't buy.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border-l-4 border-accent-red">
              <h3 className="font-heading text-xl font-bold mb-4">
                Verify farm practices and harvest windows
              </h3>
              <p className="text-muted leading-relaxed">
                We visit farms when possible. We ask about soil health, pest management,
                and harvest timing. Peak ripeness matters—underripe or overripe produce
                doesn't taste right and doesn't deliver the nutrients we're after.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border-l-4 border-accent-green">
              <h3 className="font-heading text-xl font-bold mb-4">
                Track lot codes for every batch
              </h3>
              <p className="text-muted leading-relaxed">
                Every ingredient is logged with supplier info and lot number. If there's
                ever a quality issue, we can trace it back. This is basic food safety and
                accountability that many brands skip.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border-l-4 border-black">
              <h3 className="font-heading text-xl font-bold mb-4">
                Batch-date every bottle
              </h3>
              <p className="text-muted leading-relaxed">
                You'll see a date on every bottle showing when it was pressed. Fresh juice
                degrades over time. We don't hide behind long shelf life—we tell you when
                it was made so you can drink it at peak quality.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Ingredient Spotlight */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl font-bold mb-12 text-center">
            What Goes Into Our Blends
          </h2>

          <div className="space-y-12">
            {/* Fruits */}
            <div>
              <h3 className="font-heading text-2xl font-bold mb-6 text-accent-yellow">
                Fruits
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  'Guava',
                  'Orange',
                  'Mango',
                  'Pineapple',
                  'Papaya',
                  'Strawberry',
                  'Raspberry',
                  'Red Apple',
                  'Green Apple',
                  'Pear',
                ].map((fruit) => (
                  <div
                    key={fruit}
                    className="border border-gray-200 rounded-lg p-4 text-center hover:border-accent-yellow transition-colors"
                  >
                    <p className="font-semibold">{fruit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Vegetables & Greens */}
            <div>
              <h3 className="font-heading text-2xl font-bold mb-6 text-accent-green">
                Vegetables & Greens
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  'Spinach',
                  'Cucumber',
                  'Beet',
                  'Carrot',
                  'Red Cabbage',
                  'Celery',
                  'Romaine',
                ].map((veggie) => (
                  <div
                    key={veggie}
                    className="border border-gray-200 rounded-lg p-4 text-center hover:border-accent-green transition-colors"
                  >
                    <p className="font-semibold">{veggie}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Herbs & Roots */}
            <div>
              <h3 className="font-heading text-2xl font-bold mb-6 text-accent-red">
                Herbs & Roots
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {['Ginger', 'Mint', 'Parsley'].map((herb) => (
                  <div
                    key={herb}
                    className="border border-gray-200 rounded-lg p-4 text-center hover:border-accent-red transition-colors"
                  >
                    <p className="font-semibold">{herb}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-muted">
              <strong>That's it.</strong> No concentrates. No "natural flavors." No
              fillers. Just whole plants, pressed fresh.
            </p>
          </div>
        </div>
      </Section>

      {/* Farm Partners */}
      <Section className="bg-accent-yellow/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl font-bold mb-6">
            Grow With Us
          </h2>
          <p className="text-lg text-muted leading-relaxed mb-8">
            We're building a network of farm partners who share our values. If you grow
            high-quality produce and want to work with a brand that respects your craft,
            let's talk.
          </p>
          <form className="space-y-4 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Farm Name"
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
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-yellow"
              required
            />
            <input
              type="text"
              placeholder="What do you grow?"
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-yellow"
              required
            />
            <textarea
              placeholder="Tell us about your farm, practices, and growing season..."
              rows={4}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-yellow"
              required
            />
            <button
              type="submit"
              className="w-full px-6 py-3 bg-accent-red text-white rounded-md font-semibold hover:opacity-90 transition-opacity"
            >
              Introduce Your Farm
            </button>
          </form>
          <p className="text-sm text-muted">
            We partner with farms in and around Indiana first, then expand as we grow.
          </p>
        </div>
      </Section>

      {/* Transparency Note */}
      <Section>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-2xl font-bold mb-4">
            Transparency is our standard
          </h2>
          <p className="text-muted leading-relaxed">
            Have questions about where an ingredient came from, how it was grown, or why
            we chose it? Ask. We'll tell you. This level of traceability is rare in the
            juice industry—we think it should be the norm.
          </p>
          <div className="mt-8">
            <Link
              href="mailto:hello@longlife.com"
              className="px-6 py-3 bg-black text-white rounded-md font-semibold hover:opacity-90 transition-opacity inline-block"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
