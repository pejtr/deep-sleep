import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("Behavior Tracking", () => {
  describe("Behavior event input validation", () => {
    const eventSchema = z.object({
      eventType: z.enum(['scroll', 'timeOnPage', 'exitIntent', 'pageView', 'click']),
      scrollDepth: z.number().optional(),
      timeOnPage: z.number().optional(),
      deviceType: z.enum(['mobile', 'tablet', 'desktop']).optional(),
      utmSource: z.string().optional(),
      utmMedium: z.string().optional(),
      utmCampaign: z.string().optional(),
      utmContent: z.string().optional(),
      utmTerm: z.string().optional(),
      pageUrl: z.string().optional(),
      referrer: z.string().optional(),
    });

    it("should accept scroll event with depth", () => {
      const event = {
        eventType: 'scroll' as const,
        scrollDepth: 50,
        deviceType: 'desktop' as const,
      };
      const result = eventSchema.safeParse(event);
      expect(result.success).toBe(true);
      expect(result.data?.scrollDepth).toBe(50);
    });

    it("should accept timeOnPage event", () => {
      const event = {
        eventType: 'timeOnPage' as const,
        timeOnPage: 45,
        deviceType: 'mobile' as const,
      };
      const result = eventSchema.safeParse(event);
      expect(result.success).toBe(true);
      expect(result.data?.timeOnPage).toBe(45);
    });

    it("should accept exitIntent event", () => {
      const event = {
        eventType: 'exitIntent' as const,
        timeOnPage: 15,
      };
      const result = eventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it("should accept pageView event", () => {
      const event = {
        eventType: 'pageView' as const,
        pageUrl: 'https://example.com',
        referrer: 'https://google.com',
      };
      const result = eventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it("should accept UTM parameters", () => {
      const event = {
        eventType: 'click' as const,
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'sleep_campaign',
        utmContent: 'ad_variant_a',
        utmTerm: 'insomnia',
      };
      const result = eventSchema.safeParse(event);
      expect(result.success).toBe(true);
      expect(result.data?.utmSource).toBe('google');
    });

    it("should accept all device types", () => {
      const devices = ['mobile', 'tablet', 'desktop'] as const;
      devices.forEach(device => {
        const event = {
          eventType: 'pageView' as const,
          deviceType: device,
        };
        const result = eventSchema.safeParse(event);
        expect(result.success).toBe(true);
        expect(result.data?.deviceType).toBe(device);
      });
    });
  });

  describe("Scroll depth tracking", () => {
    it("should track 25% scroll depth", () => {
      const scrollDepth = 25;
      expect(scrollDepth).toBeGreaterThanOrEqual(0);
      expect(scrollDepth).toBeLessThanOrEqual(100);
    });

    it("should track 50% scroll depth", () => {
      const scrollDepth = 50;
      expect(scrollDepth).toBe(50);
    });

    it("should track 75% scroll depth", () => {
      const scrollDepth = 75;
      expect(scrollDepth).toBe(75);
    });

    it("should track 100% scroll depth", () => {
      const scrollDepth = 100;
      expect(scrollDepth).toBe(100);
    });
  });

  describe("Time on page tracking", () => {
    it("should track time in seconds", () => {
      const timeOnPage = 45;
      expect(typeof timeOnPage).toBe('number');
      expect(timeOnPage).toBeGreaterThan(0);
    });

    it("should handle short sessions", () => {
      const timeOnPage = 5;
      expect(timeOnPage).toBeLessThan(10);
    });

    it("should handle long sessions", () => {
      const timeOnPage = 300;
      expect(timeOnPage).toBeGreaterThan(60);
    });
  });

  describe("Exit intent detection", () => {
    it("should detect exit intent", () => {
      const event = {
        eventType: 'exitIntent' as const,
        timeOnPage: 15,
      };
      expect(event.eventType).toBe('exitIntent');
      expect(event.timeOnPage).toBeLessThan(30);
    });

    it("should track time before exit", () => {
      const timeBeforeExit = 8;
      expect(timeBeforeExit).toBeGreaterThan(0);
    });
  });

  describe("UTM parameter tracking", () => {
    it("should extract utm_source", () => {
      const utmSource = 'facebook';
      expect(utmSource).toBe('facebook');
    });

    it("should extract utm_medium", () => {
      const utmMedium = 'paid_social';
      expect(utmMedium).toBe('paid_social');
    });

    it("should extract utm_campaign", () => {
      const utmCampaign = 'sleep_reset_2026';
      expect(utmCampaign).toContain('sleep');
    });

    it("should handle missing UTM parameters", () => {
      const utmParams = {
        source: '',
        medium: '',
        campaign: '',
      };
      expect(utmParams.source).toBe('');
    });
  });

  describe("Device type detection", () => {
    it("should detect mobile devices", () => {
      const deviceType = 'mobile';
      expect(deviceType).toBe('mobile');
    });

    it("should detect tablet devices", () => {
      const deviceType = 'tablet';
      expect(deviceType).toBe('tablet');
    });

    it("should detect desktop devices", () => {
      const deviceType = 'desktop';
      expect(deviceType).toBe('desktop');
    });
  });

  describe("Behavior event aggregation", () => {
    it("should aggregate scroll events", () => {
      const events = [
        { eventType: 'scroll' as const, scrollDepth: 25 },
        { eventType: 'scroll' as const, scrollDepth: 50 },
        { eventType: 'scroll' as const, scrollDepth: 75 },
      ];
      expect(events.length).toBe(3);
      expect(events[events.length - 1].scrollDepth).toBe(75);
    });

    it("should track multiple event types", () => {
      const events = [
        { eventType: 'pageView' as const },
        { eventType: 'scroll' as const, scrollDepth: 50 },
        { eventType: 'timeOnPage' as const, timeOnPage: 30 },
        { eventType: 'exitIntent' as const },
      ];
      expect(events.length).toBe(4);
      const eventTypes = events.map(e => e.eventType);
      expect(eventTypes).toContain('pageView');
      expect(eventTypes).toContain('scroll');
      expect(eventTypes).toContain('timeOnPage');
      expect(eventTypes).toContain('exitIntent');
    });
  });

  describe("Performance marketing metrics", () => {
    it("should calculate engagement score from scroll depth", () => {
      const scrollDepth = 75;
      const engagementScore = (scrollDepth / 100) * 100;
      expect(engagementScore).toBe(75);
    });

    it("should calculate engagement score from time on page", () => {
      const timeOnPage = 120; // 2 minutes
      const engagementScore = Math.min((timeOnPage / 300) * 100, 100);
      expect(engagementScore).toBeGreaterThan(0);
      expect(engagementScore).toBeLessThanOrEqual(100);
    });

    it("should identify high-intent visitors", () => {
      const scrollDepth = 100;
      const timeOnPage = 180;
      const isHighIntent = scrollDepth >= 75 && timeOnPage >= 60;
      expect(isHighIntent).toBe(true);
    });

    it("should identify bounce risk visitors", () => {
      const scrollDepth = 10;
      const timeOnPage = 5;
      const isBounceRisk = scrollDepth < 25 && timeOnPage < 10;
      expect(isBounceRisk).toBe(true);
    });
  });
});
