'use client';

import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import { urlFor, getImageDimensions } from '@/lib/image';

interface BlendCardProps {
  blend: any;
}

const labelColorMap = {
  yellow: 'bg-accent-yellow',
  red: 'bg-accent-primary',
  green: 'bg-accent-green',
};

export function BlendCard({ blend }: BlendCardProps) {
  const dimensions = getImageDimensions(blend.image);

  return (
    <Link href={`/blends/${blend.slug.current}`}>
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-lg bg-gray-100 mb-4">
          {blend.image && (
            <Image
              src={urlFor(blend.image).url()}
              alt={blend.name}
              width={dimensions.width}
              height={dimensions.height}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          {blend.labelColor && (
            <div
              className={clsx(
                'absolute top-3 right-3 w-8 h-8 rounded-full',
                labelColorMap[blend.labelColor as keyof typeof labelColorMap]
              )}
            />
          )}
        </div>
        <h3 className="font-heading text-lg font-bold mb-1">{blend.name}</h3>
        <p className="text-sm text-muted mb-3">{blend.tagline}</p>
        {blend.functionList && blend.functionList.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {blend.functionList.slice(0, 3).map((func: string) => (
              <span
                key={func}
                className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700"
              >
                {func}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
