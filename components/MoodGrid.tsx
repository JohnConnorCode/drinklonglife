import Link from 'next/link';
import { FadeIn } from '@/components/animations';

interface MoodCard {
  mood: string;
  tagline: string;
  ingredients: string;
  purpose: string;
  color: string;
  borderColor: string;
  slug: string;
}

const moods: MoodCard[] = [
  {
    mood: 'RESET',
    tagline: 'Circulate. Awaken. Power up.',
    ingredients: 'Beet, Strawberry, Carrot, Papaya, Red Apple',
    purpose: 'Natural energy + circulation support',
    color: '#ef4444',
    borderColor: 'hover:border-red-500/60',
    slug: 'red-bomb',
  },
  {
    mood: 'CLEANSE',
    tagline: 'Flush out. Hydrate. Rebuild your gut.',
    ingredients: 'Spinach, Cucumber, Celery, Romaine, Green Apple',
    purpose: 'Detox, hydration, gut health',
    color: '#22c55e',
    borderColor: 'hover:border-green-500/60',
    slug: 'green-bomb',
  },
  {
    mood: 'RISE',
    tagline: 'Uplift. Strengthen. Light up your day.',
    ingredients: 'Mango, Orange, Ginger, Guava, Pineapple',
    purpose: 'Immunity + mood elevation',
    color: '#eab308',
    borderColor: 'hover:border-yellow-500/60',
    slug: 'yellow-bomb',
  },
  {
    mood: 'BALANCE',
    tagline: 'Stabilize. Center. Stay steady.',
    ingredients: 'Nopal, Spinach, Cucumber, Aloe Vera, Asparagus',
    purpose: 'Blood sugar balance + metabolic stability',
    color: '#3b82f6',
    borderColor: 'hover:border-blue-500/60',
    slug: 'blue-bomb',
  },
];

export function MoodGrid() {
  return (
    <section className="bg-black pb-20 md:pb-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {moods.map((mood, idx) => (
            <FadeIn key={mood.mood} direction="up" delay={0.5 + idx * 0.1} duration={0.7}>
              <Link
                href={`/blends/${mood.slug}`}
                className={`group relative block rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm ${mood.borderColor} transition-all duration-500 hover:bg-white/[0.04]`}
              >
              {/* Accent line at top */}
              <div
                className="absolute top-0 left-6 right-6 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ backgroundColor: mood.color }}
              />

              {/* Content */}
              <div className="p-6 md:p-7">
                {/* Mood indicator */}
                <div className="flex items-center gap-2.5 mb-5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: mood.color }}
                  />
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">
                    Mood
                  </span>
                </div>

                {/* Mood name */}
                <h2
                  className="font-heading text-2xl md:text-[1.75rem] font-bold tracking-tight mb-2 transition-colors duration-300"
                  style={{ color: mood.color }}
                >
                  {mood.mood}
                </h2>

                {/* Tagline */}
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  {mood.tagline}
                </p>

                {/* Divider */}
                <div className="w-8 h-[1px] bg-white/10 mb-5" />

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-white/25 block mb-1.5">
                      Ingredients
                    </span>
                    <p className="text-white/50 text-xs leading-relaxed">
                      {mood.ingredients}
                    </p>
                  </div>

                  <div>
                    <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-white/25 block mb-1.5">
                      Purpose
                    </span>
                    <p className="text-white/50 text-xs">
                      {mood.purpose}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-6 pt-5 border-t border-white/[0.06]">
                  <span
                    className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider opacity-60 group-hover:opacity-100 group-hover:gap-3 transition-all duration-300"
                    style={{ color: mood.color }}
                  >
                    Reserve
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
