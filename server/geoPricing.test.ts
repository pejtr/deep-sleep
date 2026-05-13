import { describe, it, expect } from "vitest";
import { getGeoPricingFromIp, getGeoPricingFromCountry } from "./geoPricing";

describe("Geo-Pricing System", () => {
  describe("getGeoPricingFromCountry", () => {
    it("should return correct pricing for US (high tier)", () => {
      const result = getGeoPricingFromCountry("US");
      expect(result.country).toBe("US");
      expect(result.tier).toBe("high");
      expect(result.currency).toBe("USD");
      expect(result.prices.main.geoAdjustedCents).toBe(500); // $5.00
    });

    it("should return correct pricing for India (low tier)", () => {
      const result = getGeoPricingFromCountry("IN");
      expect(result.country).toBe("IN");
      expect(result.tier).toBe("low");
      expect(result.currency).toBe("INR");
      expect(result.prices.main.geoAdjustedCents).toBe(200); // 40% of $5 = $2
    });

    it("should return correct pricing for Czech Republic (mid tier)", () => {
      const result = getGeoPricingFromCountry("CZ");
      expect(result.country).toBe("CZ");
      expect(result.tier).toBe("mid");
      expect(result.currency).toBe("CZK");
      expect(result.prices.main.geoAdjustedCents).toBe(500); // Full price
    });

    it("should have all three product tiers", () => {
      const result = getGeoPricingFromCountry("US");
      expect(result.prices.main).toBeDefined();
      expect(result.prices.oto1).toBeDefined();
      expect(result.prices.oto2).toBeDefined();
    });

    it("should have correct display prices", () => {
      const result = getGeoPricingFromCountry("US");
      expect(result.prices.main.geoAdjustedDisplay).toMatch(/^\$/);
      expect(result.prices.oto1.geoAdjustedDisplay).toMatch(/^\$/);
      expect(result.prices.oto2.geoAdjustedDisplay).toMatch(/^\$/);
    });

    it("should have original prices for comparison", () => {
      const result = getGeoPricingFromCountry("US");
      expect(result.prices.main.originalPrice).toBe("$47");
      expect(result.prices.oto1.originalPrice).toBe("$97");
      expect(result.prices.oto2.originalPrice).toBe("$127");
    });

    it("should apply 40% discount for low-tier countries", () => {
      const result = getGeoPricingFromCountry("IN");
      expect(result.prices.main.geoAdjustedCents).toBe(200); // 40% of 500
      expect(result.prices.oto1.geoAdjustedCents).toBe(680); // 40% of 1700
      expect(result.prices.oto2.geoAdjustedCents).toBe(1080); // 40% of 2700
    });

    it("should return correct structure", () => {
      const result = getGeoPricingFromCountry("US");
      expect(result).toHaveProperty("country");
      expect(result).toHaveProperty("countryName");
      expect(result).toHaveProperty("tier");
      expect(result).toHaveProperty("currency");
      expect(result).toHaveProperty("prices");
    });

    it("should handle unknown countries with default (high tier)", () => {
      const result = getGeoPricingFromCountry("XX");
      expect(result.tier).toBe("high");
      expect(result.currency).toBe("USD");
    });

    it("should support all major currencies", () => {
      const countries = ["US", "DE", "GB", "JP", "BR", "IN", "AU"];
      const results = countries.map((c) => getGeoPricingFromCountry(c));
      results.forEach((r) => {
        expect(r.currency).toBeTruthy();
        expect(r.currency.length).toBe(3);
      });
    });
  });

  describe("getGeoPricingFromIp", () => {
    it("should return a valid result for localhost", () => {
      const result = getGeoPricingFromIp("127.0.0.1");
      expect(result).toHaveProperty("country");
      expect(result).toHaveProperty("tier");
      expect(result).toHaveProperty("currency");
      expect(result).toHaveProperty("prices");
    });

    it("should return a valid result for any IP", () => {
      const result = getGeoPricingFromIp("8.8.8.8");
      expect(result.country).toBeTruthy();
      expect(result.tier).toMatch(/^(low|mid|high)$/);
    });

    it("should have consistent structure with country-based pricing", () => {
      const ipResult = getGeoPricingFromIp("127.0.0.1");
      const countryResult = getGeoPricingFromCountry(ipResult.country);

      expect(ipResult.tier).toBe(countryResult.tier);
      expect(ipResult.currency).toBe(countryResult.currency);
    });
  });

  describe("Pricing Consistency", () => {
    it("should maintain price hierarchy: main < oto1 < oto2", () => {
      const result = getGeoPricingFromCountry("US");
      expect(result.prices.main.basePriceCents).toBeLessThan(
        result.prices.oto1.basePriceCents
      );
      expect(result.prices.oto1.basePriceCents).toBeLessThan(
        result.prices.oto2.basePriceCents
      );
    });

    it("should apply discount consistently across all products", () => {
      const result = getGeoPricingFromCountry("IN");
      const mainDiscount = result.prices.main.geoAdjustedCents / result.prices.main.basePriceCents;
      const oto1Discount = result.prices.oto1.geoAdjustedCents / result.prices.oto1.basePriceCents;
      const oto2Discount = result.prices.oto2.geoAdjustedCents / result.prices.oto2.basePriceCents;

      expect(mainDiscount).toBeCloseTo(0.4, 1);
      expect(oto1Discount).toBeCloseTo(0.4, 1);
      expect(oto2Discount).toBeCloseTo(0.4, 1);
    });

    it("should have positive prices for all tiers", () => {
      const result = getGeoPricingFromCountry("US");
      expect(result.prices.main.geoAdjustedCents).toBeGreaterThan(0);
      expect(result.prices.oto1.geoAdjustedCents).toBeGreaterThan(0);
      expect(result.prices.oto2.geoAdjustedCents).toBeGreaterThan(0);
    });
  });
});
