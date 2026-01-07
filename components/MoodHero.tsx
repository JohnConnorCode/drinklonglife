import { FadeIn } from '@/components/animations';

export function MoodHero() {
  return (
    <section className="relative bg-gradient-to-b from-gray-900 via-gray-950 to-black pt-16 pb-10 sm:pt-20 sm:pb-12 md:pt-28 md:pb-16 overflow-hidden">
      {/* Ambient gradient orbs for depth */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-red-500/10 via-transparent to-transparent rounded-full blur-3xl" />
      <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-gradient-to-bl from-green-500/10 via-transparent to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-yellow-500/5 via-transparent to-transparent rounded-full blur-3xl" />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 text-center">
        <FadeIn direction="up" delay={0.1} duration={0.8}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 sm:mb-8">
            <div className="flex -space-x-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <span className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.2em] text-white/50">
              Choose Your State
            </span>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.2} duration={0.8}>
          <h1 className="font-heading text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-5 leading-[1.15] tracking-tight">
            What Mood Are
            <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text"> You Feeling?</span>
          </h1>
        </FadeIn>

        <FadeIn direction="up" delay={0.35} duration={0.8}>
          <p className="text-sm sm:text-base md:text-lg text-white/60 leading-relaxed max-w-lg mx-auto px-2">
            Each Bomb is precision-crafted to unlock a different version of you.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
