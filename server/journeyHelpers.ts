import { getDb } from "./db";
import { userJourneyEvents } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export type JourneyStep = 
  | "quiz_start"
  | "quiz_complete"
  | "chat_open"
  | "chat_message"
  | "checkout_view"
  | "purchase"
  | "email_opened"
  | "email_clicked";

export interface JourneyEventInput {
  sessionId: string;
  personaId: string;
  personaName: string;
  step: JourneyStep;
  stepNumber: number;
  duration?: number;
  metadata?: Record<string, any>;
  chronotype?: string;
}

/**
 * Track a user journey event for a persona
 */
export async function trackJourneyEvent(input: JourneyEventInput): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Journey] Database not available");
    return;
  }
  
  try {
    await db.insert(userJourneyEvents).values({
      sessionId: input.sessionId,
      personaId: input.personaId,
      personaName: input.personaName,
      step: input.step,
      stepNumber: input.stepNumber,
      duration: input.duration || null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      chronotype: input.chronotype || null,
    });
    
    console.log(`[Journey] Tracked: ${input.personaName} - ${input.step}`);
  } catch (err) {
    console.error("[Journey] Error tracking event:", err);
  }
}

/**
 * Get journey funnel for a specific persona
 * Returns: quiz_start → quiz_complete → chat_open → checkout_view → purchase
 */
export async function getPersonaJourneyFunnel(personaId: string) {
  const db = await getDb();
  if (!db) return [];
  
  const journeySteps: JourneyStep[] = [
    "quiz_start",
    "quiz_complete",
    "chat_open",
    "checkout_view",
    "purchase",
  ];

  const funnel = await Promise.all(
    journeySteps.map(async (step) => {
      const result = await db
        .select()
        .from(userJourneyEvents)
        .where(
          and(
            eq(userJourneyEvents.personaId, personaId),
            eq(userJourneyEvents.step, step)
          )
        );
      
      return {
        step,
        count: result.length,
      };
    })
  );

  // Calculate conversion rates
  const startCount = funnel[0]?.count || 1;
  return funnel.map((f) => ({
    ...f,
    conversionRate: ((f.count / startCount) * 100).toFixed(1),
  }));
}

/**
 * Get average duration per step for a persona
 */
export async function getPersonaJourneyDurations(personaId: string) {
  const db = await getDb();
  if (!db) return [];
  
  const journeySteps: JourneyStep[] = [
    "quiz_start",
    "quiz_complete",
    "chat_open",
    "checkout_view",
    "purchase",
  ];

  const durations = await Promise.all(
    journeySteps.map(async (step) => {
      const result = await db
        .select()
        .from(userJourneyEvents)
        .where(
          and(
            eq(userJourneyEvents.personaId, personaId),
            eq(userJourneyEvents.step, step)
          )
        );
      
      const validDurations = result
        .map((r) => r.duration)
        .filter((d) => d !== null && d !== undefined) as number[];
      
      const sum = validDurations.reduce((a: number, b: number) => a + b, 0);
      const avgDuration = validDurations.length > 0
        ? Math.round(sum / validDurations.length)
        : 0;

      return {
        step,
        avgDuration,
        avgDurationSec: (avgDuration / 1000).toFixed(1),
        count: result.length,
      };
    })
  );

  return durations;
}

/**
 * Get all personas' journey comparison
 */
export async function getAllPersonasJourneyComparison() {
  const db = await getDb();
  if (!db) return [];
  
  const personaIds = [
    "luna1",
    "luna2",
    "luna3",
    "luna4",
    "luna5",
    "luna6",
    "luna7",
    "luna8",
    "luna9",
    "luna10",
  ];

  const comparison = await Promise.all(
    personaIds.map(async (personaId) => {
      const funnel = await getPersonaJourneyFunnel(personaId);
      const durations = await getPersonaJourneyDurations(personaId);
      
      const purchaseStep = funnel.find((f) => f.step === "purchase");
      const purchaseCount = purchaseStep?.count || 0;
      
      return {
        personaId,
        funnel,
        durations,
        purchaseCount,
      };
    })
  );

  return comparison;
}

/**
 * Get journey events for a specific session
 */
export async function getSessionJourney(sessionId: string) {
  const db = await getDb();
  if (!db) return [];
  
  const events = await db
    .select()
    .from(userJourneyEvents)
    .where(eq(userJourneyEvents.sessionId, sessionId))
    .orderBy(userJourneyEvents.createdAt);

  return events;
}
