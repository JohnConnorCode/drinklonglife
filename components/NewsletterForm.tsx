'use client';

import { useEffect } from 'react';

interface KlaviyoFormProps {
  formId?: string;
  className?: string;
}

export function NewsletterForm({ formId = 'StpCUy', className = '' }: KlaviyoFormProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('[Klaviyo Debug] Checking Klaviyo SDK status...');
    console.log('[Klaviyo Debug] Form ID:', formId);
    console.log('[Klaviyo Debug] window.klaviyo exists:', !!window.klaviyo);
    console.log('[Klaviyo Debug] window._klOnsite exists:', !!window._klOnsite);

    // Check for form div in DOM
    const formDiv = document.querySelector(`.klaviyo-form-${formId}`);
    console.log('[Klaviyo Debug] Form div found in DOM:', !!formDiv);

    if (formDiv) {
      console.log('[Klaviyo Debug] Form div innerHTML:', formDiv.innerHTML || '(empty)');
      console.log('[Klaviyo Debug] Form div children count:', formDiv.children.length);
    }

    // Wait for Klaviyo SDK to fully load and inject form
    const checkInterval = setInterval(() => {
      const formDiv = document.querySelector(`.klaviyo-form-${formId}`);
      if (formDiv && formDiv.children.length > 0) {
        console.log('[Klaviyo Debug] ✓ Form successfully injected by Klaviyo SDK');
        clearInterval(checkInterval);
      }
    }, 500);

    // Stop checking after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      const formDiv = document.querySelector(`.klaviyo-form-${formId}`);
      if (!formDiv || formDiv.children.length === 0) {
        console.error('[Klaviyo Debug] ✗ Form failed to load after 10 seconds');
        console.error('[Klaviyo Debug] Possible issues:');
        console.error('  1. Form ID "' + formId + '" does not exist in Klaviyo dashboard');
        console.error('  2. Form is not published/live in Klaviyo');
        console.error('  3. Form targeting settings prevent display on this domain');
        console.error('  4. Company ID mismatch (check NEXT_PUBLIC_KLAVIYO_COMPANY_ID)');
      }
    }, 10000);

    return () => clearInterval(checkInterval);
  }, [formId]);

  return (
    <div className={`klaviyo-form-embed ${className}`}>
      {/* Klaviyo will inject the form here based on your Klaviyo dashboard settings */}
      <div className={`klaviyo-form-${formId}`} />
    </div>
  );
}

// Type declaration for Klaviyo
declare global {
  interface Window {
    klaviyo: any;
    _klOnsite: any[];
  }
}
