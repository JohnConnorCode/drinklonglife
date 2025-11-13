import { Page, expect } from '@playwright/test';
import { STRIPE_TEST_CARDS, STRIPE_TEST_EXPIRY, STRIPE_TEST_CVC } from './stripe';

/**
 * Checkout flow helpers for E2E testing
 */

export interface CheckoutDetails {
  email?: string;
  name?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  card?: {
    number: string;
    expMonth: string;
    expYear: string;
    cvc: string;
  };
}

/**
 * Navigate to blends page
 */
export async function goToBlends(page: Page): Promise<void> {
  await page.goto('/blends');
  await expect(page.locator('h1')).toBeVisible();
}

/**
 * Find and click a blend by name
 */
export async function selectBlend(page: Page, blendName: string): Promise<void> {
  const blendLink = page.locator(`a:has-text("${blendName}")`).first();
  await expect(blendLink).toBeVisible();
  await blendLink.click();
  await page.waitForURL(/\/blends\//, { timeout: 10000 });
}

/**
 * Click "Reserve Now" button for a specific size
 */
export async function selectSize(page: Page, sizeName: string): Promise<void> {
  const sizeCard = page.locator(`[role="article"]:has-text("${sizeName}")`);
  await expect(sizeCard).toBeVisible();

  const reserveButton = sizeCard.locator('button:has-text("Reserve Now")');
  await expect(reserveButton).toBeVisible();
  await reserveButton.click();
}

/**
 * Wait for Stripe Checkout to load
 */
export async function waitForStripeCheckout(page: Page, timeoutMs: number = 30000): Promise<void> {
  // Wait for redirect to Stripe Checkout (full page, not iframe)
  await page.waitForURL('**/checkout.stripe.com/**', { timeout: timeoutMs });

  // Wait for email input to be visible on the page
  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.waitFor({ timeout: timeoutMs });
}

/**
 * Fill in guest checkout details
 */
export async function fillGuestCheckout(page: Page, details: CheckoutDetails): Promise<void> {
  // Fill email
  if (details.email) {
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill(details.email);
  }

  // Fill card information
  if (details.card) {
    const cardInput = page.locator('input[placeholder*="card" i]').first();
    await cardInput.fill(details.card.number);

    const expInput = page.locator('input[placeholder*="expiration" i], input[placeholder*="MM" i]').first();
    await expInput.fill(`${details.card.expMonth}/${details.card.expYear}`);

    const cvcInput = page.locator('input[placeholder*="CVC" i], input[placeholder*="CVV" i]').first();
    await cvcInput.fill(details.card.cvc);
  }

  // Fill billing address if provided
  if (details.address) {
    const line1Input = page.locator('input[placeholder*="address" i]').first();
    await line1Input.fill(details.address.line1);

    const cityInput = page.locator('input[placeholder*="city" i]').first();
    await cityInput.fill(details.address.city);

    const stateInput = page.locator('input[placeholder*="state" i], select[aria-label*="state" i]').first();
    await stateInput.fill(details.address.state);

    const zipInput = page.locator('input[placeholder*="zip" i], input[placeholder*="postal" i]').first();
    await zipInput.fill(details.address.postalCode);
  }
}

/**
 * Complete checkout with test card
 */
export async function completeCheckoutWithTestCard(
  page: Page,
  cardType: keyof typeof STRIPE_TEST_CARDS = 'VISA',
  email?: string
): Promise<void> {
  await waitForStripeCheckout(page);

  const card = STRIPE_TEST_CARDS[cardType];
  const checkoutDetails: CheckoutDetails = {
    email: email || `test-${Date.now()}@example.com`,
    card: {
      number: card,
      expMonth: STRIPE_TEST_EXPIRY.VALID.month,
      expYear: STRIPE_TEST_EXPIRY.VALID.year,
      cvc: STRIPE_TEST_CVC.VALID,
    },
    address: {
      line1: '510 Townsend St',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94103',
      country: 'US',
    },
  };

  await fillGuestCheckout(page, checkoutDetails);

  // Click Pay button
  const stripeFrame = page.frameLocator('iframe[src*="stripe"]').first();
  const payButton = stripeFrame.locator('button:has-text("Pay"), button[type="submit"]').first();
  await payButton.click();

  // Wait for redirect to success page
  await page.waitForURL(/\/checkout\/success/, { timeout: 15000 });
}

/**
 * Complete checkout with a card that should decline
 */
export async function completeCheckoutWithDeclinedCard(page: Page, email?: string): Promise<void> {
  await completeCheckoutWithTestCard(page, 'DECLINED', email);
}

/**
 * Check if checkout was successful
 */
export async function isCheckoutSuccessful(page: Page): Promise<boolean> {
  try {
    // Look for success indicators
    const successMessage = page.locator('h1:has-text("success"), h1:has-text("Thank you")');
    return await successMessage.isVisible({ timeout: 5000 });
  } catch {
    return false;
  }
}

/**
 * Get order/session ID from success page
 */
export async function getCheckoutSessionId(page: Page): Promise<string | null> {
  try {
    const url = page.url();
    const params = new URLSearchParams(url.split('?')[1]);
    return params.get('session_id') || null;
  } catch {
    return null;
  }
}

/**
 * Navigate directly to checkout for a specific price
 */
export async function goToCheckoutForPrice(page: Page, priceId: string): Promise<void> {
  // Use the checkout API directly
  const response = await page.request.post('/api/checkout', {
    data: {
      priceId,
      mode: 'payment',
      successPath: '/checkout/success',
      cancelPath: '/blends',
    },
  });

  const data = await response.json() as { url?: string; error?: string };

  if (data.url) {
    await page.goto(data.url);
  } else {
    throw new Error(`Checkout failed: ${data.error}`);
  }
}

/**
 * Navigate directly to checkout for subscription
 */
export async function goToSubscriptionCheckout(page: Page, priceId: string): Promise<void> {
  const response = await page.request.post('/api/checkout', {
    data: {
      priceId,
      mode: 'subscription',
      successPath: '/account/subscriptions',
      cancelPath: '/plans',
    },
  });

  const data = await response.json() as { url?: string; error?: string };

  if (data.url) {
    await page.goto(data.url);
  } else {
    throw new Error(`Subscription checkout failed: ${data.error}`);
  }
}

/**
 * Apply a coupon code at checkout
 */
export async function applyCouponAtCheckout(page: Page, couponCode: string): Promise<void> {
  const stripeFrame = page.frameLocator('iframe[src*="stripe"]').first();

  // Look for coupon input or promo code field
  const couponInput = stripeFrame.locator('input[placeholder*="coupon" i], input[placeholder*="promo" i]').first();

  if (await couponInput.isVisible({ timeout: 5000 })) {
    await couponInput.fill(couponCode);
    await couponInput.press('Enter');
  }
}

/**
 * Verify error message appears at checkout
 */
export async function expectCheckoutError(page: Page, errorText: string): Promise<void> {
  const stripeFrame = page.frameLocator('iframe[src*="stripe"]').first();
  const errorMessage = stripeFrame.locator(`text=${errorText}`);

  await expect(errorMessage).toBeVisible({ timeout: 10000 });
}
