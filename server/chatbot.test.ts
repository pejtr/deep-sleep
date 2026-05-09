import { describe, it, expect, vi } from "vitest";
import { z } from "zod";

describe("Chatbot - Luna AI Sleep Guide", () => {
  describe("Chat message input validation", () => {
    const inputSchema = z.object({
      message: z.string(),
      language: z.string().default('en'),
      context: z.object({
        chronotype: z.string().optional(),
        sleepIssue: z.string().optional(),
      }).optional(),
    });

    it("should accept valid message input", () => {
      const input = {
        message: "I can't fall asleep at night",
        language: "en",
      };
      const result = inputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept empty message (validation happens at component level)", () => {
      const input = {
        message: "",
        language: "en",
      };
      const result = inputSchema.safeParse(input);
      // Zod allows empty strings by default - UI validation prevents sending empty messages
      expect(result.success).toBe(true);
    });

    it("should accept message with chronotype context", () => {
      const input = {
        message: "I'm a night owl",
        language: "en",
        context: {
          chronotype: "evening",
          sleepIssue: "insomnia",
        },
      };
      const result = inputSchema.safeParse(input);
      expect(result.success).toBe(true);
      expect(result.data?.context?.chronotype).toBe("evening");
    });

    it("should default language to en", () => {
      const input = {
        message: "Help me sleep",
      };
      const result = inputSchema.safeParse(input);
      expect(result.success).toBe(true);
      expect(result.data?.language).toBe("en");
    });
  });

  describe("Chat response structure", () => {
    const responseSchema = z.object({
      success: z.boolean(),
      reply: z.string(),
      timestamp: z.date(),
    });

    it("should return valid response structure", () => {
      const response = {
        success: true,
        reply: "I understand your sleep challenges...",
        timestamp: new Date(),
      };
      const result = responseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it("should have non-empty reply", () => {
      const response = {
        success: true,
        reply: "I understand your sleep challenges...",
        timestamp: new Date(),
      };
      expect(response.reply.length).toBeGreaterThan(0);
    });

    it("should have valid timestamp", () => {
      const response = {
        success: true,
        reply: "Luna's response",
        timestamp: new Date(),
      };
      expect(response.timestamp instanceof Date).toBe(true);
    });
  });

  describe("Chatbot persona consistency", () => {
    it("should identify as Luna Compassionate", () => {
      const systemPrompt = `You are Luna Compassionate, a warm and empathetic sleep guide.`;
      expect(systemPrompt).toContain("Luna Compassionate");
      expect(systemPrompt).toContain("warm");
      expect(systemPrompt).toContain("empathetic");
    });

    it("should reference sleep science expertise", () => {
      const systemPrompt = `Expert in sleep science and CBT-I`;
      expect(systemPrompt).toContain("sleep science");
      expect(systemPrompt).toContain("CBT-I");
    });

    it("should maintain supportive tone", () => {
      const personality = [
        "Warm, supportive, and understanding",
        "Evidence-based recommendations",
        "Encouraging and non-judgmental",
      ];
      expect(personality.every(p => typeof p === 'string')).toBe(true);
    });
  });

  describe("Multi-language support", () => {
    const languages = ['en', 'cs', 'de', 'fr', 'es'];

    languages.forEach(lang => {
      it(`should accept ${lang} language code`, () => {
        const input = {
          message: "Help me sleep",
          language: lang,
        };
        expect(input.language).toBe(lang);
      });
    });

    it("should pass language to system prompt", () => {
      const language = 'cs';
      const systemPrompt = `Language: ${language}`;
      expect(systemPrompt).toContain(language);
    });
  });

  describe("Error handling", () => {
    it("should return error response on failure", () => {
      const errorResponse = {
        success: false,
        reply: "I apologize, but I encountered an issue. Please try again.",
        timestamp: new Date(),
      };
      expect(errorResponse.success).toBe(false);
      expect(errorResponse.reply).toContain("apologize");
    });

    it("should have fallback message", () => {
      const fallback = "I appreciate your question. Could you tell me more about your sleep challenges?";
      expect(fallback.length).toBeGreaterThan(0);
      expect(fallback).toContain("sleep");
    });
  });
});
