/**
 * Telegram Webhook — receives incoming messages from Luna bot
 */
import type { Express, Request, Response } from "express";
import { handleTelegramCommand, setTelegramWebhook } from "./telegramLuna";

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: { id: number; username?: string; first_name?: string };
    chat: { id: number; type: string };
    text?: string;
    date: number;
  };
}

export function registerTelegramWebhook(app: Express): void {
  // Webhook endpoint — Telegram sends POST here on every message
  app.post("/api/telegram/webhook", async (req: Request, res: Response) => {
    try {
      const update = req.body as TelegramUpdate;
      const message = update?.message;

      if (!message?.text) {
        return res.json({ ok: true });
      }

      const chatId = String(message.chat.id);
      const text = message.text;

      // Process command async — respond to Telegram immediately (within 5s timeout)
      handleTelegramCommand(text, chatId).catch(console.error);

      return res.json({ ok: true });
    } catch (err) {
      console.error("[TelegramWebhook] Error:", err);
      return res.status(500).json({ ok: false });
    }
  });

  // Setup webhook URL after server starts
  console.log("[TelegramWebhook] Route registered at /api/telegram/webhook");
}

// Call this after server is listening to register webhook URL with Telegram
export async function initTelegramWebhook(serverUrl: string): Promise<void> {
  const webhookUrl = `${serverUrl}/api/telegram/webhook`;
  const ok = await setTelegramWebhook(webhookUrl);
  if (ok) {
    console.log(`[TelegramWebhook] Webhook registered: ${webhookUrl}`);
  } else {
    console.warn("[TelegramWebhook] Failed to register webhook — bot will not receive messages");
  }
}
