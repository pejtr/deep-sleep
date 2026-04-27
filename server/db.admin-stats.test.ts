import { describe, expect, it } from "vitest";
import { getAdminStats } from "./db";

describe("getAdminStats", () => {
  it("returns correct structure with all required fields", async () => {
    const stats = await getAdminStats();
    
    expect(stats).toHaveProperty("quizCount");
    expect(stats).toHaveProperty("orderCount");
    expect(stats).toHaveProperty("completedOrderCount");
    expect(stats).toHaveProperty("leadCount");
    expect(stats).toHaveProperty("revenue");
    expect(stats).toHaveProperty("feedbackCount");
    expect(stats).toHaveProperty("avgRating");
    expect(stats).toHaveProperty("behaviorCount");
    expect(stats).toHaveProperty("recentOrders");
    expect(stats).toHaveProperty("recentFeedbacks");
    expect(stats).toHaveProperty("quizStarts");
    expect(stats).toHaveProperty("checkoutClicks");
    expect(stats).toHaveProperty("uniqueBuyers");
    expect(stats).toHaveProperty("duplicateAttempts");
    expect(stats).toHaveProperty("referrerBreakdown");
    expect(stats).toHaveProperty("orderTimeline");
    expect(stats).toHaveProperty("deviceBreakdown");
    expect(stats).toHaveProperty("avgTimeToCheckout");
  });

  it("recentOrders contains only completed orders", async () => {
    const stats = await getAdminStats();
    
    // All recent orders should have status 'completed'
    stats.recentOrders.forEach(order => {
      expect(order.status).toBe("completed");
    });
  });

  it("recentOrders is limited to 10 items", async () => {
    const stats = await getAdminStats();
    
    expect(stats.recentOrders.length).toBeLessThanOrEqual(10);
  });

  it("revenue is a non-negative number", async () => {
    const stats = await getAdminStats();
    
    expect(typeof stats.revenue).toBe("number");
    expect(stats.revenue).toBeGreaterThanOrEqual(0);
  });

  it("completedOrderCount is less than or equal to orderCount", async () => {
    const stats = await getAdminStats();
    
    expect(stats.completedOrderCount).toBeLessThanOrEqual(stats.orderCount);
  });

  it("avgRating is between 0 and 5", async () => {
    const stats = await getAdminStats();
    
    expect(stats.avgRating).toBeGreaterThanOrEqual(0);
    expect(stats.avgRating).toBeLessThanOrEqual(5);
  });

  it("uniqueBuyers is less than or equal to orderCount", async () => {
    const stats = await getAdminStats();
    
    expect(stats.uniqueBuyers).toBeLessThanOrEqual(stats.orderCount);
  });

  it("duplicateAttempts equals orderCount minus uniqueBuyers", async () => {
    const stats = await getAdminStats();
    
    expect(stats.duplicateAttempts).toBe(stats.orderCount - stats.uniqueBuyers);
  });
});
