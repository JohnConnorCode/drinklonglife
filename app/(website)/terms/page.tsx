import { Metadata } from 'next';
import Image from 'next/image';
import { Section } from '@/components/Section';
import { FadeIn } from '@/components/animations';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Long Life',
  description: 'Read our terms and conditions for using Long Life services, purchasing products, and subscriptions.',
};

export default function TermsPage() {
  return (
    <>
      {/* Hero */}
      <Section className="py-24 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Desktop Image */}
          <Image
            src="/slider-desktop-3.png"
            alt="Terms and Conditions"
            fill
            className="object-cover hidden md:block scale-110 animate-ken-burns"
            priority
            quality={90}
            sizes="100vw"
          />
          {/* Mobile Image */}
          <Image
            src="/slider-mobile-3.png"
            alt="Terms and Conditions"
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
              Terms & Conditions
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.4}>
            <p className="text-xl text-gray-700 leading-relaxed">
              Last Updated: January 2025
            </p>
          </FadeIn>
        </div>
      </Section>

      {/* Terms Content */}
      <Section className="bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeIn direction="up">
            <div className="prose prose-lg prose-headings:font-heading prose-headings:font-bold prose-h2:text-3xl prose-h3:text-xl prose-p:text-gray-700 prose-p:leading-relaxed max-w-none">

              <div className="bg-gradient-to-br from-accent-yellow/10 to-accent-green/10 p-8 rounded-2xl mb-12 border-2 border-accent-yellow/30">
                <p className="text-lg mb-0">
                  Welcome to Long Life. By accessing our website, ordering our products, or using our services, you agree to be bound by these Terms and Conditions. Please read them carefully.
                </p>
              </div>

              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using the Long Life website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>

              <h2>2. Products and Services</h2>
              <h3>2.1 Product Descriptions</h3>
              <p>
                We make every effort to display our products as accurately as possible. However, we cannot guarantee that your device's display of colors, textures, or product details accurately reflects the actual products.
              </p>

              <h3>2.2 Availability</h3>
              <p>
                All products are subject to availability. We produce limited batches weekly to ensure freshness. Products are made available on a first-come, first-served basis.
              </p>

              <h3>2.3 Pricing</h3>
              <p>
                All prices are listed in USD and are subject to change without notice. We reserve the right to modify prices at any time. Prices do not include applicable taxes or delivery fees unless otherwise specified.
              </p>

              <h2>3. Orders and Payment</h2>
              <h3>3.1 Order Acceptance</h3>
              <p>
                Your receipt of an electronic or email order confirmation does not signify our acceptance of your order. We reserve the right to accept or decline your order for any reason.
              </p>

              <h3>3.2 Payment Methods</h3>
              <p>
                We accept major credit cards, debit cards, and other payment methods as displayed on our website. Payment is required at the time of order.
              </p>

              <h3>3.3 Failed Payments</h3>
              <p>
                If payment cannot be processed, your order may be cancelled. For subscription services, repeated payment failures may result in suspension of your account.
              </p>

              <h2>4. Subscriptions</h2>
              <h3>4.1 Subscription Terms</h3>
              <p>
                Subscription services are billed on a recurring basis according to the plan you select. By subscribing, you authorize us to charge your payment method on a recurring basis.
              </p>

              <h3>4.2 Cancellation</h3>
              <p>
                You may cancel your subscription at any time through your account settings or by contacting us. Cancellations take effect at the end of the current billing cycle. No refunds will be provided for partial subscription periods.
              </p>

              <h3>4.3 Modifications</h3>
              <p>
                We reserve the right to modify subscription plans, pricing, and benefits with 30 days notice to subscribers.
              </p>

              <h2>5. Delivery</h2>
              <h3>5.1 Delivery Areas</h3>
              <p>
                We currently deliver to select areas only. Delivery availability can be verified during checkout.
              </p>

              <h3>5.2 Delivery Times</h3>
              <p>
                We strive to deliver products within the specified timeframe. However, delivery times are estimates and not guarantees. We are not liable for delays outside our control.
              </p>

              <h3>5.3 Failed Deliveries</h3>
              <p>
                If delivery cannot be completed due to incorrect address information or recipient unavailability, additional delivery fees may apply for re-delivery attempts.
              </p>

              <h2>6. Returns and Refunds</h2>
              <h3>6.1 Perishable Products</h3>
              <p>
                Due to the perishable nature of our cold-pressed juices, we cannot accept returns of opened or consumed products except in cases of product defect or quality issues.
              </p>

              <h3>6.2 Quality Issues</h3>
              <p>
                If you receive a damaged or defective product, please contact us within 24 hours of delivery with photos of the issue. We will provide a replacement or refund at our discretion.
              </p>

              <h3>6.3 Refund Processing</h3>
              <p>
                Approved refunds will be processed within 5-10 business days to your original payment method.
              </p>

              <h2>7. Health and Safety</h2>
              <h3>7.1 Allergen Information</h3>
              <p>
                Our products may contain or come into contact with common allergens. Please review product descriptions and ingredient lists carefully. If you have allergies or dietary restrictions, consult with a healthcare professional before consuming our products.
              </p>

              <h3>7.2 Medical Disclaimer</h3>
              <p>
                Our products are not intended to diagnose, treat, cure, or prevent any disease. The information provided on our website is for educational purposes only and should not be considered medical advice. Always consult with a qualified healthcare provider before making changes to your diet or health routine.
              </p>

              <h3>7.3 Food Safety</h3>
              <p>
                Our products are made fresh and have limited shelf life. Please refrigerate immediately upon receipt and consume by the date indicated on the bottle.
              </p>

              <h2>8. Intellectual Property</h2>
              <p>
                All content on this website, including text, graphics, logos, images, and software, is the property of Long Life and protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>

              <h2>9. User Conduct</h2>
              <p>
                You agree not to use our website or services for any unlawful purpose or in any way that could damage, disable, or impair our services. You agree not to attempt to gain unauthorized access to any portion of our website or systems.
              </p>

              <h2>10. Privacy</h2>
              <p>
                Your use of our services is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding the collection and use of your personal information.
              </p>

              <h2>11. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Long Life shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
              </p>
              <ul>
                <li>Your use or inability to use our services</li>
                <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
                <li>Any interruption or cessation of transmission to or from our services</li>
                <li>Any bugs, viruses, or the like that may be transmitted through our services by any third party</li>
              </ul>

              <h2>12. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless Long Life and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with your access to or use of our services or your violation of these Terms.
              </p>

              <h2>13. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Long Life operates, without regard to its conflict of law provisions.
              </p>

              <h2>14. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to our website. Your continued use of our services after changes are posted constitutes your acceptance of the modified Terms.
              </p>

              <h2>15. Severability</h2>
              <p>
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
              </p>

              <h2>16. Contact Information</h2>
              <p>
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <div className="bg-gradient-to-br from-accent-primary/10 to-accent-green/10 p-6 rounded-xl my-6 not-prose">
                <p className="mb-2">
                  <strong className="text-gray-900">Email:</strong>{' '}
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
                <p className="text-sm text-gray-600 leading-relaxed italic mb-0">
                  By using our website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                </p>
              </div>

            </div>
          </FadeIn>
        </div>
      </Section>
    </>
  );
}
