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
 * Navigate to cart and proceed to checkout
 */
export async function proceedToCheckoutFromCart(page: Page): Promise<void> {
  // Navigate to cart page
  await page.goto('/cart');
  await page.waitForLoadState('domcontentloaded');

  // Wait for "Proceed to Checkout" button to be visible
  const checkoutButton = page.locator('button:has-text("Proceed to Checkout")');
  await expect(checkoutButton).toBeVisible({ timeout: 10000 });

  // Set up the navigation promise BEFORE clicking (to avoid race condition)
  const navigationPromise = page.waitForURL('**/checkout.stripe.com/**', { timeout: 30000 });

  // Click the checkout button
  await checkoutButton.click();

  // Wait for redirect to Stripe Checkout
  await navigationPromise;

  // Wait for the Stripe checkout form to be ready
  // Use the textbox role with "Email" accessible name (from the label)
  const emailInput = page.getByRole('textbox', { name: /email/i });
  await emailInput.waitFor({ state: 'visible', timeout: 30000 });
}

/**
 * Wait for Stripe Checkout to load
 */
export async function waitForStripeCheckout(page: Page, timeoutMs: number = 30000): Promise<void> {
  // Wait for redirect to Stripe Checkout (full page, not iframe)
  await page.waitForURL('**/checkout.stripe.com/**', { timeout: timeoutMs });

  // Wait for email input to be visible on the page
  const emailInput = page.getByRole('textbox', { name: /email/i });
  await emailInput.waitFor({ state: 'visible', timeout: timeoutMs });
}

/**
 * Fill in guest checkout details
 */
export async function fillGuestCheckout(page: Page, details: CheckoutDetails): Promise<void> {
  // Fill email
  if (details.email) {
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(details.email);
  }

  // Fill full name
  if (details.name) {
    const nameInput = page.getByRole('textbox', { name: /full name/i });
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await nameInput.fill(details.name);
  }

  // Fill card information
  if (details.card) {
    const cardInput = page.getByRole('textbox', { name: /card number/i });
    await cardInput.waitFor({ state: 'visible', timeout: 10000 });
    await cardInput.fill(details.card.number);

    const expInput = page.getByRole('textbox', { name: /expiration/i });
    await expInput.waitFor({ state: 'visible', timeout: 10000 });
    await expInput.fill(`${details.card.expMonth}/${details.card.expYear}`);

    const cvcInput = page.getByRole('textbox', { name: /cvc/i });
    await cvcInput.waitFor({ state: 'visible', timeout: 10000 });
    await cvcInput.fill(details.card.cvc);
  }

  // Fill billing address if provided
  if (details.address) {
    const line1Input = page.getByRole('textbox', { name: /address line 1/i });
    await line1Input.waitFor({ state: 'visible', timeout: 10000 });
    await line1Input.fill(details.address.line1);

    const cityInput = page.getByRole('textbox', { name: /city/i });
    await cityInput.waitFor({ state: 'visible', timeout: 10000 });
    await cityInput.fill(details.address.city);

    const zipInput = page.getByRole('textbox', { name: /zip/i });
    await zipInput.waitFor({ state: 'visible', timeout: 10000 });
    await zipInput.fill(details.address.postalCode);

    const stateInput = page.getByRole('combobox', { name: /state/i });
    await stateInput.waitFor({ state: 'visible', timeout: 10000 });
    await stateInput.selectOption(details.address.state);
  }
}

/**
 * Complete checkout with test card
 * Note: Assumes item(s) already added to cart via "Add to Cart" button
 */
export async function completeCheckoutWithTestCard(
  page: Page,
  cardType: keyof typeof STRIPE_TEST_CARDS = 'VISA',
  email?: string
): Promise<void> {
  // First, navigate to cart and click "Proceed to Checkout"
  await proceedToCheckoutFromCart(page);

  // Now we're on Stripe checkout page, fill in payment details
  const card = STRIPE_TEST_CARDS[cardType];
  const checkoutDetails: CheckoutDetails = {
    email: email || `test-${Date.now()}@example.com`,
    name: 'Test User',
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
  const payButton = page.locator('button:has-text("Pay"), button[type="submit"]').first();
  await payButton.click();

  // Wait for redirect to success page
  // Note: Stripe test API can be slow (observed 20+ seconds), so use generous timeout
  await page.waitForURL(/\/checkout\/success/, { timeout: 45000 });
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
export function getCheckoutSessionId(page: Page): string | null {
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
