'use client';

import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { urlFor, getImageDimensions } from '@/lib/image';

const RichTextComponents = {
  types: {
    image: ({ value }: any) => {
      const { width, height } = getImageDimensions(value);
      return (
        <figure className="my-6">
          <Image
            src={urlFor(value).url()}
            alt={value.alt || 'Image'}
            width={width}
            height={height}
            className="w-full h-auto rounded-lg"
          />
          {value.caption && (
            <figcaption className="text-sm text-muted mt-2">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  marks: {
    link: ({ children, value }: any) => (
      <a
        href={value.href}
        className="text-accent-primary hover:underline"
        target={value.href?.startsWith('http') ? '_blank' : undefined}
        rel={value.href?.startsWith('http') ? 'noreferrer' : undefined}
      >
        {children}
      </a>
    ),
  },
};

export function RichText({ value }: { value: any }) {
  return (
    <div className="prose prose-sm max-w-none">
      <PortableText value={value} components={RichTextComponents} />
    </div>
  );
}
