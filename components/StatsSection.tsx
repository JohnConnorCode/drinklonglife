'use client';

import { FadeIn } from './animations';
import { CountUp } from './animations/CountUp';

interface Stat {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

interface StatsSectionProps {
  stats: Stat[];
  className?: string;
  lightText?: boolean;
}

export function StatsSection({ stats, className = '', lightText = false }: StatsSectionProps) {
  if (!stats || stats.length === 0) return null;

  const numberColor = lightText ? 'text-accent-yellow' : 'text-accent-primary';
  const labelColor = lightText ? 'text-white/90' : 'text-muted';

  return (
    <FadeIn direction="up" className={className}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`text-4xl sm:text-5xl font-bold font-heading ${numberColor} mb-2`}>
              <CountUp
                value={stat.value}
                duration={2.5}
                prefix={stat.prefix}
                suffix={stat.suffix}
              />
            </div>
            <p className={`text-sm sm:text-base ${labelColor} font-medium`}>{stat.label}</p>
          </div>
        ))}
      </div>
    </FadeIn>
  );
}
