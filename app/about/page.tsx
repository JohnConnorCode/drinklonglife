import { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/Section';

export const metadata: Metadata = {
  title: 'About | Long Life',
  description: 'Return to nature in a world of machines. Learn about our mission to bring people back to real nourishment and clear minds.',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <Section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-5xl sm:text-6xl font-bold mb-8 leading-tight">
            Return to nature in a world of machines.
          </h1>
          <p className="text-xl text-muted leading-relaxed">
            Modern life is efficient but empty. Long Life exists to bring people back to
            real nourishment and clear minds.
          </p>
        </div>
      </Section>

      {/* Story */}
      <Section>
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted leading-relaxed mb-6">
              We make fresh, functional blends in small batches, serve a committed
              community, then refine based on real feedback. We are starting local and
              building something worthy of global attention.
            </p>

            <h2 className="font-heading text-3xl font-bold mb-6 mt-12">
              Why we started Long Life
            </h2>

            <p className="text-muted leading-relaxed mb-6">
              The modern food system prioritizes scale over substance. Grocery store
              "juice" is often concentrate mixed with water and artificial flavor.
              Supplements come in pills engineered in labs. Wellness has been
              industrialized, and somewhere along the way, we forgot what real food
              tastes like.
            </p>

            <p className="text-muted leading-relaxed mb-6">
              Long Life started in a small Indiana kitchen with a simple question:{' '}
              <em>What if we made juice the way it should be made?</em> Cold-pressed
              whole plants. No filler. No hype. Just clean inputs, honest process, and
              respect for the people drinking it.
            </p>

            <h2 className="font-heading text-3xl font-bold mb-6 mt-12">
              How we work
            </h2>

            <p className="text-muted leading-relaxed mb-6">
              We press in small batches. Limited runs mean we can control quality, source
              better ingredients, and respond to feedback faster than a factory ever
              could.
            </p>

            <p className="text-muted leading-relaxed mb-6">
              We serve a community first—local pickup, real conversations, word-of-mouth
              growth. We're not chasing viral moments or scale-at-all-costs fundraising.
              We're building trust bottle by bottle.
            </p>

            <p className="text-muted leading-relaxed mb-6">
              We refine constantly. Customer feedback shapes our recipes. Seasonal
              harvests dictate what we press. We adjust, improve, and stay honest about
              what works and what doesn't.
            </p>

            <h2 className="font-heading text-3xl font-bold mb-6 mt-12">
              Our promise
            </h2>

            <div className="bg-gray-50 p-8 rounded-lg my-8">
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-accent-primary text-2xl">✓</span>
                  <span>
                    <strong>Clarity over hype.</strong> We won't make medical claims or
                    promise magic. We make juice with real ingredients and tell you
                    exactly what's in it.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent-primary text-2xl">✓</span>
                  <span>
                    <strong>Craft over shortcuts.</strong> Cold-pressed, same-day
                    bottled, small-batch integrity. We could make more if we compromised.
                    We won't.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent-primary text-2xl">✓</span>
                  <span>
                    <strong>Ingredients you can point to.</strong> Every bottle is
                    batch-dated. Every ingredient is tracked. If you want to know where
                    something came from, just ask.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* Vision */}
      <Section className="bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl font-bold mb-6">
            Where we're going
          </h2>
          <p className="text-lg text-muted leading-relaxed mb-8">
            We're starting small. Indiana first. Local partnerships with farms, gyms,
            cafés, and people who value real food. As we grow, we'll expand—but only if
            we can maintain the same standards.
          </p>
          <p className="text-lg text-muted leading-relaxed">
            Our goal isn't to be the biggest juice brand. It's to be the most honest one.
            A brand that people trust because we show up consistently and never cut
            corners. From a small Indiana kitchen to wherever this goes—Long Life is
            about building something that lasts.
          </p>
        </div>
      </Section>

      {/* Team (Optional - can be filled in later) */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl font-bold mb-12 text-center">
            The team
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-muted">
                [Photo]
              </div>
              <h3 className="font-heading text-xl font-bold mb-2">Founder Name</h3>
              <p className="text-sm text-muted mb-4">Founder & Head of Operations</p>
              <p className="text-sm text-muted leading-relaxed">
                Background, values, why they started Long Life.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-muted">
                [Photo]
              </div>
              <h3 className="font-heading text-xl font-bold mb-2">Team Member Name</h3>
              <p className="text-sm text-muted mb-4">Role</p>
              <p className="text-sm text-muted leading-relaxed">
                Brief background and what they bring to Long Life.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Values */}
      <Section className="bg-accent-yellow/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl font-bold mb-12 text-center">
            What we stand for
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="font-heading text-lg font-bold mb-3">Real Ingredients</h3>
              <p className="text-sm text-muted">
                Whole plants. No concentrates. No artificial anything.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="font-heading text-lg font-bold mb-3">Community First</h3>
              <p className="text-sm text-muted">
                We grow by word of mouth, not paid ads. Trust is earned.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="font-heading text-lg font-bold mb-3">Full Transparency</h3>
              <p className="text-sm text-muted">
                Every ingredient tracked. Every batch dated. Zero secrets.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl font-bold mb-6">
            Join the movement
          </h2>
          <p className="text-lg text-muted leading-relaxed mb-8">
            We're building a community that values real nourishment over shortcuts.
            Start with a bottle. Stay for the craft.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/blends"
              className="px-6 py-3 bg-accent-primary text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Shop Weekly Batches
            </Link>
            <Link
              href="#newsletter"
              className="px-6 py-3 border-2 border-black text-black rounded-full font-semibold hover:bg-black hover:text-white transition-colors"
            >
              Join the List
            </Link>
          </div>
        </div>
      </Section>

      {/* Responsible Language */}
      <Section className="bg-gray-50">
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
