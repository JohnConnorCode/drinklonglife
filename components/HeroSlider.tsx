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
}

interface HeroSliderProps {
  slides: Slide[];
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
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image with Ken Burns zoom-in effect */}
          <div className="absolute inset-0 overflow-hidden">
            {slide.image ? (
              <Image
                src={urlFor(slide.image).width(1920).height(1080).url()}
                alt={slide.heading}
                fill
                className={`object-cover transition-transform duration-[20000ms] ease-out ${
                  index === currentSlide ? 'scale-110' : 'scale-100'
                }`}
                priority={index === 0}
                quality={90}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br from-accent-yellow/20 via-accent-primary/20 to-accent-green/20 transition-transform duration-[20000ms] ease-out ${
                index === currentSlide ? 'scale-110' : 'scale-100'
              }`} />
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Content */}
          <div className="relative z-20 h-full flex items-start pt-36 sm:pt-44 md:items-center md:pt-0">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
              <div className="max-w-4xl">
                {/* Heading */}
                <h1
                  className={`font-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white mb-6 sm:mb-8 md:mb-10 leading-[1.1] transition-all duration-1000 ${
                    index === currentSlide && !isInitialLoad
                      ? 'translate-y-0 opacity-100 delay-100'
                      : 'translate-y-10 opacity-0'
                  }`}
                >
                  {slide.heading}
                </h1>
                {/* Subheading */}
                <p
                  className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white/90 mb-8 sm:mb-10 md:mb-12 leading-relaxed max-w-3xl transition-all duration-1000 ${
                    index === currentSlide && !isInitialLoad
                      ? 'translate-y-0 opacity-100 delay-300'
                      : 'translate-y-10 opacity-0'
                  }`}
                >
                  {slide.subheading}
                </p>
                {/* CTA */}
                {slide.ctaText && slide.ctaLink && (
                  <div
                    className={`transition-all duration-1000 ${
                      index === currentSlide && !isInitialLoad
                        ? 'translate-y-0 opacity-100 delay-500'
                        : 'translate-y-10 opacity-0'
                    }`}
                  >
                    <Link
                      href={slide.ctaLink}
                      className="inline-block px-8 py-4 sm:px-10 sm:py-5 md:px-12 md:py-6 bg-accent-primary text-white text-base sm:text-lg md:text-xl font-semibold rounded-full hover:bg-accent-primary/90 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-accent-primary/50"
                    >
                      {slide.ctaText}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows - Minimal on mobile, positioned lower to avoid text */}
      <button
        onClick={prevSlide}
        className="absolute left-3 sm:left-4 md:left-8 bottom-24 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 flex items-center justify-center group touch-manipulation"
        aria-label="Previous slide"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 group-hover:text-white group-hover:scale-110 transition-all"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 sm:right-4 md:right-8 bottom-24 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 flex items-center justify-center group touch-manipulation"
        aria-label="Next slide"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 group-hover:text-white group-hover:scale-110 transition-all"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

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
