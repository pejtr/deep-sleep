/**
 * Outbound Webhook Dispatcher
 * Sends signed events to configured external URLs (LeadOS, Zapier, etc.)
 * Events: new_order | new_lead | quiz_completed
 * Signing: HMAC-SHA256 with webhook secret
 */
import crypto from "crypto";
import { getDb } from "./db";
import { outboundWebhooks } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export type WebhookEventType = "new_order" | "new_lead" | "quiz_completed";

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
}

function signPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

async function deliverWebhook(
  webhookId: number,
  url: string,
  secret: string | null,
  payload: WebhookPayload
): Promise<{ status: number; ok: boolean }> {
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "DeepSleepReset-Webhook/1.0",
    "X-DSR-Event": payload.event,
    "X-DSR-Timestamp": payload.timestamp,
  };

  if (secret) {
    headers["X-DSR-Signature"] = `sha256=${signPayload(body, secret)}`;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(10_000), // 10s timeout
    });

    // Update lastTriggeredAt and lastStatus
    const db = await getDb();
    if (db) {
      await db
        .update(outboundWebhooks)
        .set({ lastTriggeredAt: new Date(), lastStatus: response.status })
        .where(eq(outboundWebhooks.id, webhookId));
    }

    return { status: response.status, ok: response.ok };
  } catch (err) {
    console.error(`[WebhookDispatcher] Delivery failed for webhook ${webhookId}:`, err);

    // Update with error status
    const db = await getDb();
    if (db) {
      await db
        .update(outboundWebhooks)
        .set({ lastTriggeredAt: new Date(), lastStatus: 0 })
        .where(eq(outboundWebhooks.id, webhookId));
    }

    return { status: 0, ok: false };
  }
}

/**
 * Dispatch an event to all active webhooks that subscribe to it.
 * Fire-and-forget — does not block the calling request.
 */
export async function dispatchWebhookEvent(
  eventType: WebhookEventType,
  data: Record<string, unknown>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const activeWebhooks = await db
    .select()
    .from(outboundWebhooks)
    .where(eq(outboundWebhooks.active, true));

  if (activeWebhooks.length === 0) return;

  const payload: WebhookPayload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    data,
  };

  // Dispatch to all matching webhooks concurrently (fire-and-forget)
  const dispatches = activeWebhooks
    .filter((wh) => {
      try {
        const events: string[] = JSON.parse(wh.events || "[]");
        return events.includes(eventType) || events.includes("*");
      } catch {
        return false;
      }
    })
    .map((wh) => {
      console.log(`[WebhookDispatcher] Sending '${eventType}' to ${wh.name} (${wh.url})`);
      return deliverWebhook(wh.id, wh.url, wh.secret, payload);
    });

  // Don't await — fire and forget to avoid blocking request
  Promise.allSettled(dispatches).then((results) => {
    results.forEach((r, i) => {
      if (r.status === "fulfilled") {
        console.log(`[WebhookDispatcher] Webhook ${i} → status ${r.value.status}`);
      } else {
        console.error(`[WebhookDispatcher] Webhook ${i} failed:`, r.reason);
      }
    });
  });
}
