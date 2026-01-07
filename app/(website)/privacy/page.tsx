import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { FadeIn } from '@/components/animations';

export const metadata: Metadata = {
  title: 'Privacy Policy | Long Life',
  description: 'Learn how Long Life collects, uses, and protects your personal information when you use our website and services.',
};

export default function PrivacyPage() {
  return (
    <>
      {/* Hero */}
      <Section className="py-24 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Desktop Image */}
          <Image
            src="/slider-desktop-3.png"
            alt="Privacy Policy"
            fill
            className="object-cover hidden md:block scale-110 animate-ken-burns"
            priority
            quality={90}
            sizes="100vw"
          />
          {/* Mobile Image */}
          <Image
            src="/slider-mobile-3.png"
            alt="Privacy Policy"
            fill
            className="object-cover md:hidden scale-110 animate-ken-burns"
            priority
            quality={90}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-accent-cream/90 via-accent-yellow/70 to-accent-green/70" />
        </div>

        {/* Organic background shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-yellow/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-[1]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-green/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 z-[1]" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn direction="up" delay={0.2}>
            <h1 className="font-heading text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              Privacy Policy
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.4}>
            <p className="text-xl text-gray-700 leading-relaxed">
              Last Updated: December 2025
            </p>
          </FadeIn>
        </div>
      </Section>

      {/* Privacy Content */}
      <Section className="bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeIn direction="up">
            <div className="prose prose-lg prose-headings:font-heading prose-headings:font-bold prose-h2:text-3xl prose-h3:text-xl prose-p:text-gray-700 prose-p:leading-relaxed max-w-none">

              <div className="bg-gradient-to-br from-accent-yellow/10 to-accent-green/10 p-8 rounded-2xl mb-12 border-2 border-accent-yellow/30">
                <p className="text-lg mb-0">
                  At Long Life, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.
                </p>
              </div>

              <h2>1. Information We Collect</h2>

              <h3>1.1 Personal Information</h3>
              <p>
                We collect information you provide directly to us, including:
              </p>
              <ul>
                <li><strong>Account Information:</strong> Name, email address, password, phone number</li>
                <li><strong>Billing Information:</strong> Payment card details (processed securely by Stripe), billing address</li>
                <li><strong>Shipping Information:</strong> Delivery address, delivery instructions</li>
                <li><strong>Communication Data:</strong> Messages you send us, customer service interactions</li>
                <li><strong>Preferences:</strong> Product preferences, dietary restrictions, email preferences</li>
              </ul>

              <h3>1.2 Automatically Collected Information</h3>
              <p>
                When you visit our website, we automatically collect certain information, including:
              </p>
              <ul>
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent on pages, click patterns</li>
                <li><strong>Cookies:</strong> See our Cookie Policy section below</li>
                <li><strong>Referral Data:</strong> How you arrived at our website</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>
                We use the information we collect to:
              </p>
              <ul>
                <li>Process and fulfill your orders</li>
                <li>Manage your account and subscriptions</li>
                <li>Send order confirmations, shipping updates, and delivery notifications</li>
                <li>Process payments securely through our payment processor (Stripe)</li>
                <li>Respond to your questions and provide customer support</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Improve our website, products, and services</li>
                <li>Detect and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2>3. Information Sharing</h2>
              <p>
                We do not sell your personal information. We may share your information with:
              </p>

              <h3>3.1 Service Providers</h3>
              <ul>
                <li><strong>Stripe:</strong> For secure payment processing</li>
                <li><strong>Delivery Partners:</strong> To fulfill and deliver your orders</li>
                <li><strong>Email Services:</strong> To send transactional and marketing emails</li>
                <li><strong>Analytics Providers:</strong> To help us understand website usage</li>
                <li><strong>Cloud Hosting:</strong> To store and process data securely</li>
              </ul>

              <h3>3.2 Legal Requirements</h3>
              <p>
                We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., court orders, government agencies).
              </p>

              <h3>3.3 Business Transfers</h3>
              <p>
                If Long Life is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
              </p>

              <h2>4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information, including:
              </p>
              <ul>
                <li>Encryption of data in transit (HTTPS/TLS)</li>
                <li>Secure payment processing through PCI-compliant providers</li>
                <li>Regular security assessments and monitoring</li>
                <li>Access controls limiting who can view your data</li>
                <li>Secure data storage with encrypted databases</li>
              </ul>
              <p>
                However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>

              <h2>5. Your Privacy Rights</h2>

              <h3>5.1 All Users</h3>
              <p>You have the right to:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                <li><strong>Account Closure:</strong> Request closure of your account</li>
              </ul>

              <h3>5.2 California Residents (CCPA)</h3>
              <p>
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul>
                <li>Right to know what personal information is collected, used, shared, or sold</li>
                <li>Right to delete personal information held by businesses</li>
                <li>Right to opt-out of the sale of personal information (we do not sell your data)</li>
                <li>Right to non-discrimination for exercising your CCPA rights</li>
              </ul>

              <h3>5.3 European Users (GDPR)</h3>
              <p>
                If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul>
                <li>Right to data portability</li>
                <li>Right to restrict processing</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent at any time</li>
                <li>Right to lodge a complaint with a supervisory authority</li>
              </ul>

              <h2>6. Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to:
              </p>
              <ul>
                <li>Keep you logged into your account</li>
                <li>Remember your cart contents</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Personalize your experience</li>
              </ul>

              <h3>Types of Cookies We Use</h3>
              <ul>
                <li><strong>Essential Cookies:</strong> Required for basic website functionality (authentication, cart)</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p>
                You can control cookies through your browser settings. Note that disabling cookies may affect website functionality.
              </p>

              <h2>7. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to:
              </p>
              <ul>
                <li>Provide our services to you</li>
                <li>Comply with legal obligations (e.g., tax records)</li>
                <li>Resolve disputes and enforce agreements</li>
              </ul>
              <p>
                Order and transaction data is retained for 7 years for tax and legal purposes. You may request deletion of your account at any time, though some information may be retained as required by law.
              </p>

              <h2>8. Children&apos;s Privacy</h2>
              <p>
                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child, we will take steps to delete that information.
              </p>

              <h2>9. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>

              <h2>10. Email Communications</h2>
              <p>
                We send the following types of emails:
              </p>
              <ul>
                <li><strong>Transactional Emails:</strong> Order confirmations, shipping updates, password resets (cannot be unsubscribed)</li>
                <li><strong>Marketing Emails:</strong> Promotions, newsletters, product updates (can be unsubscribed)</li>
              </ul>
              <p>
                You can manage your email preferences in your account settings or by clicking the unsubscribe link in any marketing email.
              </p>

              <h2>11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. We encourage you to review this Privacy Policy periodically.
              </p>

              <h2>12. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, or if you wish to exercise your privacy rights, please contact us:
              </p>
              <div className="bg-gradient-to-br from-accent-primary/10 to-accent-green/10 p-6 rounded-xl my-6 not-prose">
                <p className="mb-2">
                  <strong className="text-gray-900">Email:</strong>{' '}
                  <a href="mailto:privacy@drinklonglife.com" className="text-accent-primary hover:underline">
                    privacy@drinklonglife.com
                  </a>
                </p>
                <p className="mb-2">
                  <strong className="text-gray-900">General Inquiries:</strong>{' '}
                  <a href="mailto:hello@drinklonglife.com" className="text-accent-primary hover:underline">
                    hello@drinklonglife.com
                  </a>
                </p>
                <p className="mb-0">
                  <strong className="text-gray-900">Phone:</strong>{' '}
                  <a href="tel:+1234567890" className="text-accent-primary hover:underline">
                    (123) 456-7890
                  </a>
                </p>
              </div>

              <div className="bg-white border-l-4 border-accent-primary p-6 rounded-r-lg shadow-sm mt-12">
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  By using our website and services, you acknowledge that you have read and understood this Privacy Policy.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mb-0">
                  See also our <Link href="/terms" className="text-accent-primary hover:underline">Terms & Conditions</Link> for additional information about using our services.
                </p>
              </div>

            </div>
          </FadeIn>
        </div>
      </Section>
    </>
  );
}
