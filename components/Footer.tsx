'use client';

import Link from 'next/link';
import { Section } from './Section';
import { AnimatedLogo } from './AnimatedLogo';
import { FadeIn, StaggerContainer } from './animations';

interface FooterProps {
  siteSettings?: any;
  navigation?: any;
}

export function Footer({ siteSettings, navigation }: FooterProps) {
  const footerLinks = navigation?.footerLinks || [];
  const legalLinks = navigation?.legalLinks || [];
  const social = siteSettings?.social || {};

  return (
    <footer className="bg-accent-green/20 border-t border-gray-200">
      <Section className="py-16 sm:py-24">
        <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <AnimatedLogo
                size="sm"
                variant="footer"
                logoUrl={siteSettings?.logo?.asset?.url}
                showText={true}
              />
            </div>
            <p className="text-sm text-muted mb-6">
              {siteSettings?.tagline || 'Real juice. Real people.'}
            </p>
            <div className="flex gap-4">
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg border-2 border-gray-200 hover:border-accent-primary hover:bg-accent-primary"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.646.069 4.85 0 3.204-.012 3.584-.07 4.85-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.251-.149-4.766-1.693-4.913-4.919-.058-1.266-.07-1.646-.07-4.85 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
                  </svg>
                </a>
              )}
              {social.tiktok && (
                <a
                  href={social.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg border-2 border-gray-200 hover:border-accent-primary hover:bg-accent-primary"
                  aria-label="TikTok"
                >
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.08 1.61 2.88 2.88 0 0 1 4.07-4.77v-3.4a6.45 6.45 0 0 0-6.59 6.44c0 3.61 2.91 6.52 6.44 6.52a6.47 6.47 0 0 0 6.59-6.59V9.71a8.19 8.19 0 0 0 3.86 1.04v-3.49a4.46 4.46 0 0 1-.38-.04z" />
                  </svg>
                </a>
              )}
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg border-2 border-gray-200 hover:border-accent-primary hover:bg-accent-primary"
                  aria-label="YouTube"
                >
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Footer Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Explore</h4>
            <ul className="space-y-2">
              {footerLinks.map((link: any) => (
                <li key={link.title}>
                  <Link
                    href={
                      link.reference?.slug?.current
                        ? `/${link.reference.slug.current}`
                        : link.externalUrl || '#'
                    }
                    className="group text-sm text-muted hover:text-black transition-colors relative inline-block"
                  >
                    {link.title}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-primary group-hover:w-full transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Contact</h4>
            {siteSettings?.contactEmail && (
              <p className="text-sm text-muted mb-2">
                <a
                  href={`mailto:${siteSettings.contactEmail}`}
                  className="group hover:text-black transition-colors relative inline-block"
                >
                  {siteSettings.contactEmail}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-primary group-hover:w-full transition-all duration-300" />
                </a>
              </p>
            )}
            {siteSettings?.address && (
              <p className="text-sm text-muted whitespace-pre-wrap">
                {siteSettings.address}
              </p>
            )}
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link: any) => (
                <li key={link.title}>
                  <Link
                    href={
                      link.reference?.slug?.current
                        ? `/${link.reference.slug.current}`
                        : link.externalUrl || '#'
                    }
                    className="group text-sm text-muted hover:text-black transition-colors relative inline-block"
                  >
                    {link.title}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-primary group-hover:w-full transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </StaggerContainer>

        {/* Copyright */}
        <FadeIn direction="up" delay={0.6}>
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-muted">
            <p>
              © {new Date().getFullYear()} {siteSettings?.title || 'Long Life'}. All rights reserved.
            </p>
          </div>
        </FadeIn>
      </Section>
    </footer>
  );
}
