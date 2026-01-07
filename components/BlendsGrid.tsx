'use client';

import { useState, useMemo } from 'react';
import { BlendCard } from './BlendCard';
import { FadeIn } from './animations';

interface BlendsGridProps {
  blends: any[];
  showFilters?: boolean;
  maxColumns?: 2 | 3;
  maxItems?: number;
}

export function BlendsGrid({ blends, showFilters = true, maxColumns = 3, maxItems }: BlendsGridProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Extract all unique functions from all blends
  const allFunctions = useMemo(() => {
    const functionsSet = new Set<string>();
    blends.forEach((blend) => {
      if (blend.function_list) {
        blend.function_list.forEach((func: string) => functionsSet.add(func));
      }
    });
    return Array.from(functionsSet).sort();
  }, [blends]);

  // Filter blends based on selected function
  const filteredBlends = useMemo(() => {
    let result = blends;
    if (selectedFilter !== 'all') {
      result = blends.filter((blend) =>
        blend.function_list?.includes(selectedFilter)
      );
    }
    // Apply maxItems limit if specified
    if (maxItems && result.length > maxItems) {
      result = result.slice(0, maxItems);
    }
    return result;
  }, [blends, selectedFilter, maxItems]);

  return (
    <>
      {/* Filter Section */}
      {showFilters && allFunctions.length > 0 && (
        <FadeIn direction="up" className="mb-12">
          <div className="flex flex-col items-center gap-4">
            <h2 className="font-heading text-2xl font-bold text-gray-900">
              Filter by function
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                  selectedFilter === 'all'
                    ? 'bg-accent-primary text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                All Blends
              </button>
              {allFunctions.map((func) => (
                <button
                  key={func}
                  onClick={() => setSelectedFilter(func)}
                  className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                    selectedFilter === func
                      ? 'bg-accent-primary text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  {func}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {filteredBlends.length} blend{filteredBlends.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </FadeIn>
      )}

      {/* Blends Grid */}
      {filteredBlends.length > 0 ? (
        <div className={`grid gap-8 ${
          maxColumns === 2
            ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
            : 'md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredBlends.map((blend: any) => (
            <BlendCard key={blend.id} blend={blend} />
          ))}
        </div>
      ) : (
        <FadeIn direction="up" className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-yellow/20 to-accent-green/20 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-xl text-gray-600 mb-2">No blends found</p>
            <p className="text-sm text-gray-500">
              {selectedFilter !== 'all'
                ? `No blends match the "${selectedFilter}" function. Try a different filter.`
                : 'No blends available at the moment. Check back soon!'}
            </p>
          </div>
        </FadeIn>
      )}
    </>
  );
}
