'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/lib/image';

interface Slide {
  heading: string;
  subheading: string;
  ctaText?: string;
  ctaLink?: string;
  image?: any;
  desktopImage?: any;
  mobileImage?: any;
}

interface HeroSliderProps {
  slides: Slide[];
}

interface NavigationButtonProps {
  direction: 'prev' | 'next';
  onClick: () => void;
  ariaLabel: string;
}

function NavigationButton({ direction, onClick, ariaLabel }: NavigationButtonProps) {
  const isPrev = direction === 'prev';
  const positionClasses = isPrev
    ? 'left-3 sm:left-4 md:left-8'
    : 'right-3 sm:right-4 md:right-8';
  const arrowPath = isPrev
    ? 'M15 19l-7-7 7-7'
    : 'M9 5l7 7-7 7';

  return (
    <button
      onClick={onClick}
      className={`absolute ${positionClasses} bottom-24 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 flex items-center justify-center group touch-manipulation`}
      aria-label={ariaLabel}
    >
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 group-hover:text-white group-hover:scale-110 transition-all"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={arrowPath} />
      </svg>
    </button>
  );
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Trigger animation after mount with slight delay for initial load
    const timer = setTimeout(() => setIsInitialLoad(false), 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length]);

  // Helper function to get image URL (handles both old 'image' and new 'desktop/mobile' structure)
  const getImageSrc = (imageField: any) => {
    if (!imageField) return null;
    // Check if it's a static image (has asset.url pointing to /public)
    if (imageField.asset?.url && typeof imageField.asset.url === 'string') {
      return imageField.asset.url;
    }
    // Otherwise it's a Sanity image reference, use urlFor
    try {
      return urlFor(imageField).url();
    } catch {
      return null;
    }
  };

  // Helper function to generate animation classes
  const getAnimationClasses = (delayClass: string) => {
    const isActive = !isInitialLoad;
    const baseClasses = 'transition-all duration-1000';
    const animationState = isActive
      ? `translate-y-0 opacity-100 ${delayClass}`
      : 'translate-y-10 opacity-0';
    return `${baseClasses} ${animationState}`;
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        // Ken Burns effect: scale-100 on mount, then scale-110 after initial load
        const kenBurnsScale = isActive && !isInitialLoad ? 'scale-110' : 'scale-100';

        return (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image with Ken Burns zoom-in effect */}
            <div className="absolute inset-0 overflow-hidden">
              {(() => {
                const desktopSrc = getImageSrc(slide.desktopImage || slide.image);
                const mobileSrc = getImageSrc(slide.mobileImage || slide.image);

                if (!desktopSrc && !mobileSrc) {
                  return <div className={`w-full h-full bg-gradient-to-br from-accent-yellow/20 via-accent-primary/20 to-accent-green/20 transition-transform duration-[20000ms] ease-out ${kenBurnsScale}`} />;
                }

                return (
                  <>
                    {/* Desktop Image - hidden on mobile, shown on md+ */}
                    {desktopSrc && (
                      <Image
                        src={desktopSrc}
                        alt={slide.heading}
                        fill
                        className={`object-cover hidden md:block transition-transform duration-[20000ms] ease-out ${kenBurnsScale}`}
                        priority={true}
                        quality={90}
                        sizes="100vw"
                      />
                    )}
                    {/* Mobile Image - shown on mobile, hidden on md+ */}
                    {mobileSrc && (
                      <Image
                        src={mobileSrc}
                        alt={slide.heading}
                        fill
                        className={`object-cover md:hidden transition-transform duration-[20000ms] ease-out ${kenBurnsScale}`}
                        priority={true}
                        quality={90}
                        sizes="100vw"
                      />
                    )}
                  </>
                );
              })()}
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content */}
            <div className="relative z-20 h-full flex items-start pt-36 sm:pt-44 md:items-center md:pt-0">
              <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
                <div className="max-w-4xl">
                  {/* Heading */}
                  <h1
                    className={`font-heading text-5xl sm:text-6xl md:text-6xl lg:text-[6.5rem] font-bold text-white mb-4 sm:mb-6 md:mb-6 leading-[1.1] ${
                      isActive ? getAnimationClasses('delay-100') : getAnimationClasses('')
                    }`}
                  >
                    {slide.heading}
                  </h1>
                  {/* Subheading */}
                  <p
                    className={`text-lg sm:text-xl md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-3xl ${
                      isActive ? getAnimationClasses('delay-300') : getAnimationClasses('')
                    }`}
                  >
                    {slide.subheading}
                  </p>
                  {/* CTA */}
                  {slide.ctaText && slide.ctaLink && (
                    <div className={isActive ? getAnimationClasses('delay-500') : getAnimationClasses('')}>
                      <Link
                        href={slide.ctaLink}
                        className="inline-block px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 bg-accent-primary text-white text-sm sm:text-base md:text-lg font-semibold rounded-full hover:bg-accent-primary/90 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-accent-primary/50"
                      >
                        {slide.ctaText}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows - Minimal on mobile, positioned lower to avoid text */}
      <NavigationButton
        direction="prev"
        onClick={prevSlide}
        ariaLabel="Previous slide"
      />
      <NavigationButton
        direction="next"
        onClick={nextSlide}
        ariaLabel="Next slide"
      />

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-12 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 animate-bounce hidden sm:block">
        <svg
          className="w-6 h-6 text-white/75"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </div>
  );
}
