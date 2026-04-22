import type { Express } from "express";
import { trackBehaviorEvent } from "./db";

/**
 * Registers the POST /api/behavior/track REST endpoint.
 * This is a lightweight fire-and-forget endpoint used by all funnel pages
 * to log user interactions for A/B analysis and funnel optimization.
 */
export function registerBehaviorRoutes(app: Express) {
  app.post("/api/behavior/track", async (req, res) => {
    try {
      const { sessionId, event, page, element, value, chronotype } = req.body ?? {};

      if (!sessionId || !event) {
        res.status(400).json({ success: false, error: "sessionId and event are required" });
        return;
      }

      await trackBehaviorEvent({
        sessionId: String(sessionId),
        event: String(event),
        page: page ? String(page) : undefined,
        element: element ? String(element) : undefined,
        value: value ? (typeof value === "string" ? value : JSON.stringify(value)) : undefined,
        chronotype: ["Lion", "Bear", "Wolf", "Dolphin"].includes(chronotype) ? chronotype : undefined,
      });

      res.json({ success: true });
    } catch (err) {
      console.error("[BehaviorTrack] Error:", err);
      // Always return 200 to not block the funnel
      res.json({ success: false });
    }
  });
}
