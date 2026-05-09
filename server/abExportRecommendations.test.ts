import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getAbExportData, getAbRecommendations, getAbMetrics } from "./db";
import { getDb } from "./db";
import { abImpressions } from "../drizzle/schema";

describe("A/B Export & Recommendations", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  describe("getAbExportData", () => {
    it("should export data as CSV format", async () => {
      const csv = await getAbExportData("landing_variant", "csv");
      expect(typeof csv).toBe("string");
      expect(csv).toContain("Timestamp");
      expect(csv).toContain("Variant");
    });

    it("should export data as JSON format", async () => {
      const json = await getAbExportData("landing_variant", "json");
      expect(typeof json).toBe("string");
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it("should return empty CSV for non-existent test", async () => {
      const csv = await getAbExportData("non_existent_test", "csv");
      expect(typeof csv).toBe("string");
      expect(csv).toContain("Timestamp");
    });
  });

  describe("getAbRecommendations", () => {
    it("should return empty array for non-existent test", async () => {
      const recommendations = await getAbRecommendations("non_existent_test");
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBe(0);
    });

    it("should return recommendations with correct structure", async () => {
      const recommendations = await getAbRecommendations("landing_variant");
      expect(Array.isArray(recommendations)).toBe(true);
      
      if (recommendations.length > 0) {
        recommendations.forEach((rec) => {
          expect(rec).toHaveProperty("priority");
          expect(rec).toHaveProperty("title");
          expect(rec).toHaveProperty("description");
          expect(["high", "medium", "low"]).toContain(rec.priority);
          expect(typeof rec.title).toBe("string");
          expect(typeof rec.description).toBe("string");
        });
      }
    });

    it("should recommend scaling winner variant", async () => {
      const recommendations = await getAbRecommendations("landing_variant");
      const scaleRec = recommendations.find((r) => r.title.includes("Scale Variant"));
      
      if (scaleRec) {
        expect(scaleRec.priority).toBe("high");
        expect(scaleRec.description).toContain("conversion rate");
      }
    });

    it("should recommend pausing underperformer", async () => {
      const recommendations = await getAbRecommendations("landing_variant");
      const pauseRec = recommendations.find((r) => r.title.includes("Pause Variant"));
      
      if (pauseRec) {
        expect(pauseRec.priority).toBe("high");
        expect(pauseRec.description).toContain("Underperforming");
      }
    });

    it("should warn about low volume", async () => {
      const recommendations = await getAbRecommendations("landing_variant");
      const volumeRec = recommendations.find((r) => r.title.includes("Traffic Volume"));
      
      if (volumeRec) {
        expect(volumeRec.priority).toBe("medium");
        expect(volumeRec.description).toContain("impressions");
      }
    });
  });
});
