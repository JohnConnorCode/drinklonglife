import Link from 'next/link';
import { FadeIn } from '@/components/animations';

interface MoodCard {
  mood: string;
  tagline: string;
  ingredients: string;
  purpose: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  slug: string;
}

const moods: MoodCard[] = [
  {
    mood: 'RESET',
    tagline: 'Circulate. Awaken. Power up.',
    ingredients: 'Beet, Strawberry, Carrot, Papaya, Red Apple',
    purpose: 'Natural energy + circulation support',
    color: '#ef4444',
    gradientFrom: 'from-red-500/20',
    gradientTo: 'to-red-600/5',
    slug: 'red-bomb',
  },
  {
    mood: 'CLEANSE',
    tagline: 'Flush out. Hydrate. Rebuild your gut.',
    ingredients: 'Spinach, Cucumber, Celery, Romaine, Green Apple',
    purpose: 'Detox, hydration, gut health',
    color: '#22c55e',
    gradientFrom: 'from-green-500/20',
    gradientTo: 'to-green-600/5',
    slug: 'green-bomb',
  },
  {
    mood: 'RISE',
    tagline: 'Uplift. Strengthen. Light up your day.',
    ingredients: 'Mango, Orange, Ginger, Guava, Pineapple',
    purpose: 'Immunity + mood elevation',
    color: '#eab308',
    gradientFrom: 'from-yellow-500/20',
    gradientTo: 'to-yellow-600/5',
    slug: 'yellow-bomb',
  },
  {
    mood: 'BALANCE',
    tagline: 'Stabilize. Center. Stay steady.',
    ingredients: 'Nopal, Spinach, Cucumber, Aloe Vera, Asparagus',
    purpose: 'Blood sugar balance + metabolic stability',
    color: '#3b82f6',
    gradientFrom: 'from-blue-500/20',
    gradientTo: 'to-blue-600/5',
    slug: 'blue-bomb',
  },
];

export function MoodGrid() {
  return (
    <section className="bg-black py-6 sm:py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {moods.map((mood, idx) => (
            <FadeIn key={mood.mood} direction="up" delay={0.4 + idx * 0.08} duration={0.6}>
              <Link
                href={`/blends/${mood.slug}`}
                className="group relative block rounded-2xl sm:rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
              >
                {/* Card background with gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${mood.gradientFrom} ${mood.gradientTo}`} />
                <div className="absolute inset-0 bg-gray-900/80" />

                {/* Colored top border */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 sm:h-1.5"
                  style={{ backgroundColor: mood.color }}
                />

                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${mood.color}15 0%, transparent 60%)`
                  }}
                />

                {/* Content */}
                <div className="relative z-10 p-4 sm:p-5 md:p-6">
                  {/* Mood name - prominent */}
                  <h2
                    className="font-heading text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-1.5 sm:mb-2"
                    style={{ color: mood.color }}
                  >
                    {mood.mood}
                  </h2>

                  {/* Tagline */}
                  <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2">
                    {mood.tagline}
                  </p>

                  {/* Divider */}
                  <div className="w-full h-px bg-white/10 mb-3 sm:mb-4" />

                  {/* Details - compact on mobile */}
                  <div className="space-y-2.5 sm:space-y-3">
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-1">
                        Key Ingredients
                      </span>
                      <p className="text-white/60 text-[11px] sm:text-xs leading-relaxed line-clamp-2">
                        {mood.ingredients}
                      </p>
                    </div>

                    <div className="hidden sm:block">
                      <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-1">
                        Benefits
                      </span>
                      <p className="text-white/60 text-[11px] sm:text-xs">
                        {mood.purpose}
                      </p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 sm:mt-5 flex items-center justify-between">
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wide group-hover:gap-2.5 transition-all duration-300"
                      style={{ color: mood.color }}
                    >
                      Reserve
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                    <div
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity"
                      style={{ backgroundColor: mood.color }}
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>

        {/* Bottom CTA */}
        <FadeIn direction="up" delay={0.8} duration={0.6}>
          <div className="text-center mt-8 sm:mt-12">
            <Link
              href="/blends"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              View All Blends
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
