import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("Conversion Tracking Implementation", () => {
  const indexHtml = readFileSync(resolve(__dirname, "../client/index.html"), "utf-8");
  const trackingModule = readFileSync(resolve(__dirname, "../client/src/lib/conversionTracking.ts"), "utf-8");
  const checkoutButton = readFileSync(resolve(__dirname, "../client/src/components/CheckoutButton.tsx"), "utf-8");
  const checkoutSuccess = readFileSync(resolve(__dirname, "../client/src/pages/CheckoutSuccess.tsx"), "utf-8");
  const orderPage = readFileSync(resolve(__dirname, "../client/src/pages/Order.tsx"), "utf-8");
  const quizResult = readFileSync(resolve(__dirname, "../client/src/pages/QuizResult.tsx"), "utf-8");

  describe("Pixel Scripts in index.html", () => {
    it("has Reddit Pixel script with correct ID", () => {
      expect(indexHtml).toContain("rdt('init','a2_iw4up15u7778')");
      expect(indexHtml).toContain("rdt('track', 'PageVisit')");
      expect(indexHtml).toContain("redditstatic.com/ads/pixel.js");
    });

    it("has TikTok Pixel script with correct ID", () => {
      expect(indexHtml).toContain("ttq.load('CS2CJHRC77U1VFMHVING')");
      expect(indexHtml).toContain("analytics.tiktok.com");
      expect(indexHtml).toContain("ttq.page()");
    });

    it("has Google Ads tag with correct ID", () => {
      expect(indexHtml).toContain("AW-968712546");
      expect(indexHtml).toContain("googletagmanager.com/gtag/js");
      expect(indexHtml).toContain("gtag('config', 'AW-968712546')");
    });
  });

  describe("Conversion Tracking Module", () => {
    it("exports trackPurchase function", () => {
      expect(trackingModule).toContain("export function trackPurchase");
    });

    it("exports trackInitiateCheckout function", () => {
      expect(trackingModule).toContain("export function trackInitiateCheckout");
    });

    it("exports trackLead function", () => {
      expect(trackingModule).toContain("export function trackLead");
    });

    it("exports trackQuizComplete function", () => {
      expect(trackingModule).toContain("export function trackQuizComplete");
    });

    it("exports trackViewContent function", () => {
      expect(trackingModule).toContain("export function trackViewContent");
    });

    it("fires Reddit Purchase event with value and transactionId", () => {
      expect(trackingModule).toContain("rdt('track', 'Purchase'");
      expect(trackingModule).toContain("transactionId: orderId");
    });

    it("fires TikTok CompletePayment event with content_id", () => {
      expect(trackingModule).toContain("ttq.track('CompletePayment'");
      expect(trackingModule).toContain("content_id: productId");
    });

    it("fires Google Ads conversion event with send_to", () => {
      expect(trackingModule).toContain("gtag('event', 'conversion'");
      expect(trackingModule).toContain("send_to: 'AW-968712546/purchase'");
    });
  });

  describe("Tracking Integration in Pages", () => {
    it("CheckoutButton imports and calls trackInitiateCheckout", () => {
      expect(checkoutButton).toContain("import { trackInitiateCheckout } from");
      expect(checkoutButton).toContain("trackInitiateCheckout(");
    });

    it("CheckoutSuccess imports and calls trackPurchase", () => {
      expect(checkoutSuccess).toContain("import { trackPurchase } from");
      expect(checkoutSuccess).toContain("trackPurchase(");
    });

    it("Order page imports and calls trackViewContent", () => {
      expect(orderPage).toContain("import { trackViewContent } from");
      expect(orderPage).toContain("trackViewContent(");
    });

    it("QuizResult imports and calls trackQuizComplete and trackLead", () => {
      expect(quizResult).toContain("import { trackQuizComplete, trackLead, trackViewContent } from");
      expect(quizResult).toContain("trackQuizComplete(chronotype)");
      expect(quizResult).toContain("trackLead({ email })");
    });
  });

  describe("UTM Attribution in Checkout", () => {
    const routersContent = readFileSync(resolve(__dirname, "./routers.ts"), "utf-8");
    const schemaContent = readFileSync(resolve(__dirname, "../drizzle/schema.ts"), "utf-8");

    it("orders table has utmSource column", () => {
      expect(schemaContent).toContain("utmSource");
    });

    it("orders table has utmCampaign column", () => {
      expect(schemaContent).toContain("utmCampaign");
    });

    it("orders table has utmMedium column", () => {
      expect(schemaContent).toContain("utmMedium");
    });

    it("checkout.createSession accepts UTM parameters", () => {
      expect(routersContent).toContain("utmSource");
      expect(routersContent).toContain("utmCampaign");
    });
  });
});
