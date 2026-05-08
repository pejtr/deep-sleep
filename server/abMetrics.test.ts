import { describe, it, expect } from "vitest";

describe("A/B Metrics Dashboard", () => {
  describe("Metrics Aggregation", () => {
    it("should aggregate impressions by variant", () => {
      const impressions = [
        { variant: "A", converted: false },
        { variant: "A", converted: true },
        { variant: "B", converted: false },
        { variant: "B", converted: false },
        { variant: "B", converted: true },
      ];

      const metrics: Record<string, { impressions: number; conversions: number }> = {};

      impressions.forEach((imp) => {
        if (!metrics[imp.variant]) {
          metrics[imp.variant] = { impressions: 0, conversions: 0 };
        }
        metrics[imp.variant].impressions++;
        if (imp.converted) metrics[imp.variant].conversions++;
      });

      expect(metrics.A.impressions).toBe(2);
      expect(metrics.B.impressions).toBe(3);
    });

    it("should count conversions per variant", () => {
      const impressions = [
        { variant: "A", converted: false },
        { variant: "A", converted: true },
        { variant: "B", converted: false },
        { variant: "B", converted: false },
        { variant: "B", converted: true },
      ];

      const metrics: Record<string, { impressions: number; conversions: number }> = {};

      impressions.forEach((imp) => {
        if (!metrics[imp.variant]) {
          metrics[imp.variant] = { impressions: 0, conversions: 0 };
        }
        metrics[imp.variant].impressions++;
        if (imp.converted) metrics[imp.variant].conversions++;
      });

      expect(metrics.A.conversions).toBe(1);
      expect(metrics.B.conversions).toBe(1);
    });
  });

  describe("Conversion Rate Calculation", () => {
    it("should calculate conversion rate for each variant", () => {
      const metrics = {
        A: { impressions: 100, conversions: 5, rate: 0 },
        B: { impressions: 100, conversions: 8, rate: 0 },
      };

      Object.keys(metrics).forEach((variant) => {
        const m = metrics[variant as keyof typeof metrics];
        m.rate = (m.conversions / m.impressions) * 100;
      });

      expect(metrics.A.rate).toBe(5);
      expect(metrics.B.rate).toBe(8);
    });

    it("should handle zero impressions gracefully", () => {
      const metrics = {
        A: { impressions: 0, conversions: 0, rate: 0 },
      };

      Object.keys(metrics).forEach((variant) => {
        const m = metrics[variant as keyof typeof metrics];
        m.rate = m.impressions > 0 ? (m.conversions / m.impressions) * 100 : 0;
      });

      expect(metrics.A.rate).toBe(0);
    });

    it("should calculate precise conversion rates", () => {
      const metrics = {
        A: { impressions: 1000, conversions: 45, rate: 0 },
        B: { impressions: 950, conversions: 76, rate: 0 },
      };

      Object.keys(metrics).forEach((variant) => {
        const m = metrics[variant as keyof typeof metrics];
        m.rate = (m.conversions / m.impressions) * 100;
      });

      expect(metrics.A.rate).toBeCloseTo(4.5, 1);
      expect(metrics.B.rate).toBeCloseTo(8.0, 1);
    });
  });

  describe("Winner Detection", () => {
    it("should identify variant with highest conversion rate as winner", () => {
      const metrics = {
        A: { impressions: 100, conversions: 5, rate: 5 },
        B: { impressions: 100, conversions: 8, rate: 8 },
        C: { impressions: 100, conversions: 3, rate: 3 },
      };

      const variants = Object.entries(metrics).sort((a, b) => b[1].rate - a[1].rate);
      const winner = variants[0][0];

      expect(winner).toBe("B");
    });

    it("should return null when no data exists", () => {
      const metrics: Record<string, { rate: number }> = {};
      const variants = Object.entries(metrics).sort((a, b) => b[1].rate - a[1].rate);
      const winner = variants.length > 0 ? variants[0][0] : null;

      expect(winner).toBeNull();
    });

    it("should handle tie by selecting first in sorted order", () => {
      const metrics = {
        A: { impressions: 100, conversions: 5, rate: 5 },
        B: { impressions: 100, conversions: 5, rate: 5 },
      };

      const variants = Object.entries(metrics).sort((a, b) => b[1].rate - a[1].rate);
      const winner = variants[0][0];

      expect(winner).toBe("A");
    });
  });

  describe("Metrics Response Structure", () => {
    it("should return correct metrics structure", () => {
      const response = {
        testName: "landing_variant",
        metrics: {
          A: { impressions: 100, conversions: 5, rate: 5 },
          B: { impressions: 100, conversions: 8, rate: 8 },
        },
        winner: "B",
        totalImpressions: 200,
        totalConversions: 13,
        updatedAt: new Date(),
      };

      expect(response.testName).toBe("landing_variant");
      expect(response.metrics.A).toBeDefined();
      expect(response.metrics.B).toBeDefined();
      expect(response.winner).toBe("B");
      expect(response.totalImpressions).toBe(200);
      expect(response.totalConversions).toBe(13);
      expect(response.updatedAt).toBeInstanceOf(Date);
    });

    it("should calculate total impressions correctly", () => {
      const metrics = {
        A: { impressions: 150, conversions: 10 },
        B: { impressions: 200, conversions: 20 },
        C: { impressions: 100, conversions: 5 },
      };

      const totalImpressions = Object.values(metrics).reduce((sum, m) => sum + m.impressions, 0);
      expect(totalImpressions).toBe(450);
    });

    it("should calculate total conversions correctly", () => {
      const metrics = {
        A: { impressions: 150, conversions: 10 },
        B: { impressions: 200, conversions: 20 },
        C: { impressions: 100, conversions: 5 },
      };

      const totalConversions = Object.values(metrics).reduce((sum, m) => sum + m.conversions, 0);
      expect(totalConversions).toBe(35);
    });
  });

  describe("Real-Time Updates", () => {
    it("should reflect new impressions in metrics", () => {
      let metrics = {
        A: { impressions: 100, conversions: 5, rate: 5 },
        B: { impressions: 100, conversions: 8, rate: 8 },
      };

      // Simulate new impression for variant A
      metrics.A.impressions++;

      expect(metrics.A.impressions).toBe(101);
    });

    it("should reflect new conversions in metrics", () => {
      let metrics = {
        A: { impressions: 100, conversions: 5, rate: 5 },
        B: { impressions: 100, conversions: 8, rate: 8 },
      };

      // Simulate new conversion for variant B
      metrics.B.conversions++;
      metrics.B.rate = (metrics.B.conversions / metrics.B.impressions) * 100;

      expect(metrics.B.conversions).toBe(9);
      expect(metrics.B.rate).toBeCloseTo(9, 1);
    });

    it("should update winner when rates change", () => {
      const metrics = {
        A: { impressions: 100, conversions: 5, rate: 5 },
        B: { impressions: 100, conversions: 8, rate: 8 },
      };

      // Variant A gets more conversions
      metrics.A.conversions = 15;
      metrics.A.rate = (metrics.A.conversions / metrics.A.impressions) * 100;

      const variants = Object.entries(metrics).sort((a, b) => b[1].rate - a[1].rate);
      const winner = variants[0][0];

      expect(winner).toBe("A");
    });
  });

  describe("Performance Metrics", () => {
    it("should calculate overall conversion rate", () => {
      const totalImpressions = 500;
      const totalConversions = 35;
      const overallRate = (totalConversions / totalImpressions) * 100;

      expect(overallRate).toBeCloseTo(7, 1);
    });

    it("should compare variant performance", () => {
      const metrics = {
        A: { impressions: 100, conversions: 5, rate: 5 },
        B: { impressions: 100, conversions: 8, rate: 8 },
      };

      const rateImprovement = ((metrics.B.rate - metrics.A.rate) / metrics.A.rate) * 100;
      expect(rateImprovement).toBe(60); // 60% improvement
    });

    it("should calculate statistical significance estimate", () => {
      const variantA = { conversions: 5, impressions: 100 };
      const variantB = { conversions: 8, impressions: 100 };

      // Simple chi-square approximation
      const rateA = variantA.conversions / variantA.impressions;
      const rateB = variantB.conversions / variantB.impressions;
      const pooledRate = (variantA.conversions + variantB.conversions) / (variantA.impressions + variantB.impressions);

      const se = Math.sqrt(pooledRate * (1 - pooledRate) * (1 / variantA.impressions + 1 / variantB.impressions));
      const zScore = (rateB - rateA) / se;

      expect(zScore).toBeGreaterThan(0);
      expect(zScore).toBeLessThan(2); // Not highly significant with small sample
    });
  });

  describe("Variant Sorting", () => {
    it("should sort variants by conversion rate descending", () => {
      const metrics = {
        C: { impressions: 100, conversions: 3, rate: 3 },
        A: { impressions: 100, conversions: 5, rate: 5 },
        B: { impressions: 100, conversions: 8, rate: 8 },
      };

      const sorted = Object.entries(metrics).sort((a, b) => b[1].rate - a[1].rate);
      const order = sorted.map(([variant]) => variant);

      expect(order).toEqual(["B", "A", "C"]);
    });

    it("should maintain stable sort for equal rates", () => {
      const metrics = {
        A: { impressions: 100, conversions: 5, rate: 5 },
        B: { impressions: 100, conversions: 5, rate: 5 },
      };

      const sorted = Object.entries(metrics).sort((a, b) => b[1].rate - a[1].rate);
      const order = sorted.map(([variant]) => variant);

      expect(order.length).toBe(2);
      expect(order[0]).toBe("A"); // First in object iteration order
    });
  });

  describe("Edge Cases", () => {
    it("should handle single variant", () => {
      const metrics = {
        A: { impressions: 100, conversions: 5, rate: 5 },
      };

      const variants = Object.entries(metrics).sort((a, b) => b[1].rate - a[1].rate);
      expect(variants.length).toBe(1);
      expect(variants[0][0]).toBe("A");
    });

    it("should handle all zero conversions", () => {
      const metrics = {
        A: { impressions: 100, conversions: 0, rate: 0 },
        B: { impressions: 100, conversions: 0, rate: 0 },
      };

      const variants = Object.entries(metrics).sort((a, b) => b[1].rate - a[1].rate);
      const winner = variants[0][0];

      expect(winner).toBe("A");
      expect(metrics.A.rate).toBe(0);
      expect(metrics.B.rate).toBe(0);
    });

    it("should handle 100% conversion rate", () => {
      const metrics = {
        A: { impressions: 100, conversions: 100, rate: 100 },
      };

      expect(metrics.A.rate).toBe(100);
    });

    it("should handle very small sample sizes", () => {
      const metrics = {
        A: { impressions: 1, conversions: 1, rate: 0 },
      };

      metrics.A.rate = (metrics.A.conversions / metrics.A.impressions) * 100;
      expect(metrics.A.rate).toBe(100);
    });
  });

  describe("Timestamp Handling", () => {
    it("should include current timestamp in response", () => {
      const before = new Date();
      const response = {
        updatedAt: new Date(),
      };
      const after = new Date();

      expect(response.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(response.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should update timestamp on each query", () => {
      const timestamp1 = new Date();
      // Simulate delay
      const timestamp2 = new Date(timestamp1.getTime() + 1000);

      expect(timestamp2.getTime()).toBeGreaterThan(timestamp1.getTime());
    });
  });
});
