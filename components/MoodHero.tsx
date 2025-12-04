import { FadeIn } from '@/components/animations';

export function MoodHero() {
  return (
    <section className="relative bg-black pt-20 pb-8 md:pt-28 md:pb-12">
      {/* Subtle gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-black to-black" />

      {/* Refined accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-white/[0.02] rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Elegant eyebrow text */}
        <FadeIn direction="up" delay={0.1} duration={0.8}>
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.3em] text-white/40 mb-4">
            Choose Your State
          </p>
        </FadeIn>

        <FadeIn direction="up" delay={0.25} duration={0.8}>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.1] tracking-tight">
            What Mood Are You Feeling?
          </h1>
        </FadeIn>

        <FadeIn direction="up" delay={0.4} duration={0.8}>
          <p className="text-sm sm:text-base md:text-lg text-white/50 leading-relaxed max-w-xl mx-auto">
            Each Bomb is engineered to activate a different version of you.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
