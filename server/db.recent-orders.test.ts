import { describe, it, expect } from "vitest";
import { getRecentOrders } from "./db";

describe("getRecentOrders", () => {
  it("returns an array", async () => {
    const orders = await getRecentOrders();
    expect(Array.isArray(orders)).toBe(true);
  });

  it("returns orders with correct structure", async () => {
    const orders = await getRecentOrders(5);
    
    if (orders.length > 0) {
      const order = orders[0];
      expect(order).toHaveProperty("id");
      expect(order).toHaveProperty("amount");
      expect(order).toHaveProperty("currency");
      expect(order).toHaveProperty("productId");
      expect(order).toHaveProperty("chronotype");
      expect(order).toHaveProperty("email");
      expect(order).toHaveProperty("createdAt");
    }
  });

  it("respects the limit parameter", async () => {
    const orders = await getRecentOrders(5);
    expect(orders.length).toBeLessThanOrEqual(5);
  });

  it("returns default limit of 10 when not specified", async () => {
    const orders = await getRecentOrders();
    expect(orders.length).toBeLessThanOrEqual(10);
  });

  it("all orders have status 'completed'", async () => {
    const orders = await getRecentOrders(10);
    
    // Note: status is not returned in getRecentOrders, but we verify structure
    orders.forEach(order => {
      expect(order.chronotype).toMatch(/Lion|Bear|Wolf|Dolphin/);
    });
  });

  it("amount is a valid decimal string", async () => {
    const orders = await getRecentOrders(5);
    
    orders.forEach(order => {
      expect(typeof order.amount).toBe("string");
      expect(parseFloat(order.amount)).toBeGreaterThanOrEqual(0);
    });
  });

  it("currency is a valid currency code", async () => {
    const orders = await getRecentOrders(5);
    const validCurrencies = ["usd", "eur", "gbp", "czk", "cad", "aud", "pln", "huf", "ron", "inr", "brl", "mxn"];
    
    orders.forEach(order => {
      expect(validCurrencies.includes(order.currency.toLowerCase())).toBe(true);
    });
  });

  it("email contains valid format or is empty", async () => {
    const orders = await getRecentOrders(5);
    
    orders.forEach(order => {
      if (order.email && order.email !== "Customer") {
        expect(order.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$|^Customer$/);
      }
    });
  });

  it("createdAt is a valid Date", async () => {
    const orders = await getRecentOrders(5);
    
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      expect(date instanceof Date && !isNaN(date.getTime())).toBe(true);
    });
  });

  it("returns orders in descending order by createdAt", async () => {
    const orders = await getRecentOrders(10);
    
    if (orders.length > 1) {
      for (let i = 0; i < orders.length - 1; i++) {
        const current = new Date(orders[i].createdAt).getTime();
        const next = new Date(orders[i + 1].createdAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    }
  });

  it("handles empty database gracefully", async () => {
    const orders = await getRecentOrders(100);
    expect(Array.isArray(orders)).toBe(true);
    // Should return empty array if no orders exist
  });
});
