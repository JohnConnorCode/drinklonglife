'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface BlendCardProps {
  blend: any;
}

const labelColorMap = {
  yellow: 'bg-accent-yellow',
  red: 'bg-accent-primary',
  green: 'bg-accent-green',
};

export function BlendCard({ blend }: BlendCardProps) {
  const slug = typeof blend.slug === 'string' ? blend.slug : blend.slug?.current;
  const imageUrl = blend.image_url || blend.image?.asset?.url;

  return (
    <Link href={`/blends/${slug}`}>
      <motion.div
        className="group cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
      >
        <motion.div
          className="relative overflow-hidden rounded-lg bg-gray-100 mb-4 shadow-md"
          whileHover={{ boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
        >
          {imageUrl ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <Image
                src={imageUrl}
                alt={blend.image_alt || blend.name}
                width={800}
                height={600}
                className="w-full h-64 object-cover"
              />
            </motion.div>
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-accent-yellow/20 via-accent-primary/20 to-accent-green/20">
              <span className="font-heading text-4xl font-bold text-gray-400">{blend.name}</span>
            </div>
          )}
          {(blend.label_color || blend.labelColor) && (
            <motion.div
              className={clsx(
                'absolute top-3 right-3 w-8 h-8 rounded-full',
                labelColorMap[(blend.label_color || blend.labelColor) as keyof typeof labelColorMap]
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            />
          )}
        </motion.div>
        <h3 className="font-heading text-lg font-bold mb-1">{blend.name}</h3>
        <p className="text-sm text-muted mb-3">{blend.tagline}</p>
        {(blend.function_list || blend.functionList) && (blend.function_list || blend.functionList).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(blend.function_list || blend.functionList).slice(0, 3).map((func: string, idx: number) => (
              <motion.span
                key={func}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700"
              >
                {func}
              </motion.span>
            ))}
          </div>
        )}
      </motion.div>
    </Link>
  );
}
