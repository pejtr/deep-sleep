import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  assignPersonaToSession,
  getPersonaForSession,
  getPersonaPerformance,
  markPersonaConverted,
} from "../personaHelpers";
import { getPersonaById } from "../../shared/personas";

export const personasRouter = router({
  /**
   * Assign a random persona to a session
   */
  assignPersona: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        page: z.string(), // landing, chatbot, upsell1, upsell2, upsell3
        chronotype: z.enum(["Lion", "Bear", "Wolf", "Dolphin"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const assignment = await assignPersonaToSession(input.sessionId, input.page, input.chronotype);
      const persona = getPersonaById(assignment.personaId);

      return {
        personaId: assignment.personaId,
        personaName: assignment.personaName,
        personaDescription: assignment.personaDescription,
        systemPrompt: persona?.systemPrompt,
      };
    }),

  /**
   * Get assigned persona for a session
   */
  getPersona: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        page: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await getPersonaForSession(input.sessionId, input.page);
    }),

  /**
   * Mark persona conversion
   */
  markConversion: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        page: z.string(),
        revenue: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await markPersonaConverted(input.sessionId, input.page, input.revenue);
      return { success: true };
    }),

  /**
   * Get persona performance metrics (admin only)
   */
  getPerformance: protectedProcedure
    .input(
      z.object({
        page: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return await getPersonaPerformance(input.page);
    }),
});
