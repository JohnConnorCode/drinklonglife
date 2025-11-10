import { Metadata } from 'next';
import { Section } from '@/components/Section';

export const metadata: Metadata = {
  title: 'How We Make It | Long Life',
  description: 'Cold-pressed, same-day bottled, no shortcuts. Learn about our process and commitment to quality.',
};

export default function HowWeMakeItPage() {
  return (
    <>
      {/* Hero */}
      <Section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-heading text-5xl sm:text-6xl font-bold mb-6">
            How We Make It
          </h1>
          <p className="text-xl text-muted leading-relaxed">
            Cold-pressed, same-day bottled, no shortcuts.
          </p>
        </div>
      </Section>

      {/* Process Steps */}
      <Section>
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Step 1 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-accent-yellow rounded-full text-sm font-bold mb-4">
                STEP 1
              </div>
              <h2 className="font-heading text-3xl font-bold mb-4">
                Cold-pressed
              </h2>
              <p className="text-lg text-muted leading-relaxed mb-4">
                Hydraulic pressure extracts juice without high heat. That helps keep
                flavors bright and preserves what nature put there.
              </p>
              <p className="text-muted leading-relaxed">
                Unlike centrifugal juicers that generate heat and oxidation,
                cold-pressing applies thousands of pounds of gentle pressure to extract
                maximum juice while maintaining nutrient integrity and enzyme activity.
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center text-muted">
              [Cold-press hydraulic press image]
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <div className="inline-block px-4 py-2 bg-accent-primary text-white rounded-full text-sm font-bold mb-4">
                STEP 2
              </div>
              <h2 className="font-heading text-3xl font-bold mb-4">
                Immediate chill
              </h2>
              <p className="text-lg text-muted leading-relaxed mb-4">
                We press, chill, and bottle the same day for maximum freshness.
              </p>
              <p className="text-muted leading-relaxed">
                Once pressed, juice is immediately chilled to slow natural degradation.
                From produce to bottle happens in hours, not days. This is small-batch
                integrity—we make what we can handle fresh, then start the next batch.
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center text-muted md:order-1">
              [Chilling/bottling process image]
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-accent-green rounded-full text-sm font-bold mb-4">
                STEP 3
              </div>
              <h2 className="font-heading text-3xl font-bold mb-4">
                Simple filters
              </h2>
              <p className="text-lg text-muted leading-relaxed mb-4">
                Just enough filtering to keep texture smooth while leaving character in
                the bottle.
              </p>
              <p className="text-muted leading-relaxed">
                We don't strip juice down to water. A little pulp, a little texture—that's
                real juice. We use minimal filtration to remove large particles while
                keeping beneficial plant fibers and natural characteristics intact.
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center text-muted">
              [Filtration/texture image]
            </div>
          </div>

          {/* Step 4 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <div className="inline-block px-4 py-2 bg-black text-white rounded-full text-sm font-bold mb-4">
                STEP 4
              </div>
              <h2 className="font-heading text-3xl font-bold mb-4">
                No shortcuts
              </h2>
              <p className="text-lg text-muted leading-relaxed mb-4">
                No added sugar. No artificial anything.
              </p>
              <p className="text-muted leading-relaxed">
                What you see on the ingredient list is what went into the press. No
                concentrates. No "natural flavors" (which aren't always natural). No
                preservatives beyond cold storage. If an ingredient doesn't meet our
                standard, we pause the batch or find a better source.
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center text-muted md:order-1">
              [Ingredient quality/transparency image]
            </div>
          </div>
        </div>
      </Section>

      {/* Why It Matters */}
      <Section className="bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl font-bold mb-8 text-center">
            Why Our Process Matters
          </h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">
                Flavor that tastes like food, not science
              </h3>
              <p className="text-muted">
                Cold-pressing without heat keeps the bright, natural flavors of fresh
                produce. You can taste the difference between real fruit and reconstituted
                concentrate.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">
                Nutrients your body recognizes
              </h3>
              <p className="text-muted">
                High heat and oxidation degrade vitamins, enzymes, and phytonutrients.
                Our method preserves more of what makes whole plants valuable.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">
                Transparency you can trust
              </h3>
              <p className="text-muted">
                Every batch is dated. Every ingredient is tracked. We're building a brand
                on honesty, not hype. If you have questions about what you're drinking,
                we have answers.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Batch Commitment */}
      <Section>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl font-bold mb-6">
            Small-batch integrity
          </h2>
          <p className="text-lg text-muted leading-relaxed mb-8">
            We could make more. We could cut corners. We don't. Long Life grows by making
            the same thing, better, week after week. That's the craft.
          </p>
          <div className="inline-block px-6 py-3 bg-black text-white rounded-full font-semibold">
            Made in limited runs. First come, first served.
          </div>
        </div>
      </Section>

      {/* Responsible Language */}
      <Section className="bg-accent-yellow/10">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-muted leading-relaxed">
            <strong>Responsible Language:</strong> We make juice, not medical claims.
            Everyone is different. If you have a condition, talk to your practitioner.
            Our commitment is clean inputs and honest process.
          </p>
        </div>
      </Section>
    </>
  );
}
