/**
 * Conversion Tracking Utility
 * Fires purchase/conversion events on Reddit Pixel, TikTok Pixel, and Google Ads
 */

declare global {
  interface Window {
    rdt?: (...args: any[]) => void;
    ttq?: {
      track: (event: string, params?: Record<string, any>) => void;
      identify: (params: Record<string, any>) => void;
    };
    gtag?: (...args: any[]) => void;
  }
}

export interface ConversionData {
  value: number;
  currency?: string;
  orderId?: string;
  productId?: string;
  productName?: string;
  email?: string;
}

/**
 * Track a purchase conversion across all platforms
 */
export function trackPurchase(data: ConversionData): void {
  const { value, currency = 'USD', orderId, productId, productName, email } = data;

  // Reddit Pixel - Purchase event
  if (window.rdt) {
    try {
      window.rdt('track', 'Purchase', {
        value,
        currency,
        itemCount: 1,
        transactionId: orderId,
      });
      console.log('[Tracking] Reddit Purchase event fired:', { value, orderId });
    } catch (e) {
      console.warn('[Tracking] Reddit pixel error:', e);
    }
  }

  // TikTok Pixel - CompletePayment event
  if (window.ttq) {
    try {
      window.ttq.track('CompletePayment', {
        value,
        currency,
        content_id: productId,
        content_name: productName,
        content_type: 'product',
        quantity: 1,
      });
      console.log('[Tracking] TikTok CompletePayment event fired:', { value, productId });
    } catch (e) {
      console.warn('[Tracking] TikTok pixel error:', e);
    }
  }

  // Google Ads - Conversion event
  if (window.gtag) {
    try {
      window.gtag('event', 'conversion', {
        send_to: 'AW-968712546/purchase',
        value,
        currency,
        transaction_id: orderId,
      });
      console.log('[Tracking] Google Ads conversion event fired:', { value, orderId });
    } catch (e) {
      console.warn('[Tracking] Google Ads error:', e);
    }
  }
}

/**
 * Track Add to Cart / Initiate Checkout
 */
export function trackInitiateCheckout(data: ConversionData): void {
  const { value, currency = 'USD', productId, productName } = data;

  if (window.rdt) {
    try {
      window.rdt('track', 'AddToCart', { value, currency, itemCount: 1 });
    } catch (e) { /* silent */ }
  }

  if (window.ttq) {
    try {
      window.ttq.track('InitiateCheckout', {
        value,
        currency,
        content_id: productId,
        content_name: productName,
        content_type: 'product',
        quantity: 1,
      });
    } catch (e) { /* silent */ }
  }

  if (window.gtag) {
    try {
      window.gtag('event', 'begin_checkout', {
        value,
        currency,
        items: [{ item_id: productId, item_name: productName, price: value }],
      });
    } catch (e) { /* silent */ }
  }
}

/**
 * Track Lead / Email signup
 */
export function trackLead(data?: { email?: string }): void {
  if (window.rdt) {
    try {
      window.rdt('track', 'Lead');
    } catch (e) { /* silent */ }
  }

  if (window.ttq) {
    try {
      if (data?.email) {
        window.ttq.identify({ email: data.email });
      }
      window.ttq.track('SubmitForm');
    } catch (e) { /* silent */ }
  }

  if (window.gtag) {
    try {
      window.gtag('event', 'generate_lead', { value: 1, currency: 'USD' });
    } catch (e) { /* silent */ }
  }
}

/**
 * Track quiz completion as a custom event
 */
export function trackQuizComplete(chronotype: string): void {
  if (window.rdt) {
    try {
      window.rdt('track', 'Custom', { customEventName: 'QuizComplete', chronotype });
    } catch (e) { /* silent */ }
  }

  if (window.ttq) {
    try {
      window.ttq.track('CompleteRegistration', { content_name: `chronotype_${chronotype}` });
    } catch (e) { /* silent */ }
  }

  if (window.gtag) {
    try {
      window.gtag('event', 'quiz_complete', { chronotype });
    } catch (e) { /* silent */ }
  }
}

/**
 * Track page view for specific high-value pages (order page, upsells)
 */
export function trackViewContent(data: { productId?: string; productName?: string; value?: number }): void {
  if (window.rdt) {
    try {
      window.rdt('track', 'ViewContent');
    } catch (e) { /* silent */ }
  }

  if (window.ttq) {
    try {
      window.ttq.track('ViewContent', {
        content_id: data.productId,
        content_name: data.productName,
        value: data.value,
        currency: 'USD',
      });
    } catch (e) { /* silent */ }
  }

  if (window.gtag) {
    try {
      window.gtag('event', 'view_item', {
        items: [{ item_id: data.productId, item_name: data.productName, price: data.value }],
      });
    } catch (e) { /* silent */ }
  }
}
