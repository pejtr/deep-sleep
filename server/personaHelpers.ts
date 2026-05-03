import { getDb } from "./db";
import { personaAssignments } from "../drizzle/schema";
import { getAllPersonaIds, getPersonaById } from "../shared/personas";
import { eq, and } from "drizzle-orm";

/**
 * Assign a random persona to a session
 */
export async function assignPersonaToSession(
  sessionId: string,
  page: string,
  chronotype?: string
): Promise<{
  personaId: string;
  personaName: string;
  personaDescription?: string;
}> {
  const personaIds = getAllPersonaIds();
  const randomPersonaId = personaIds[Math.floor(Math.random() * personaIds.length)];
  const persona = getPersonaById(randomPersonaId);

  if (!persona) {
    throw new Error(`Persona ${randomPersonaId} not found`);
  }

  // Insert into DB
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.insert(personaAssignments).values([
    {
      sessionId,
      personaId: persona.id,
      personaName: persona.name,
      personaDescription: persona.description,
      page,
      chronotype: chronotype || null,
      shown: true,
      converted: false,
      revenue: "0",
    },
  ]);

  return {
    personaId: persona.id,
    personaName: persona.name,
    personaDescription: persona.description,
  };
}

/**
 * Get assigned persona for a session on a specific page
 */
export async function getPersonaForSession(
  sessionId: string,
  page: string
): Promise<{
  personaId: string;
  personaName: string;
  systemPrompt: string;
} | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(personaAssignments)
    .where(and(eq(personaAssignments.sessionId, sessionId), eq(personaAssignments.page, page)))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const assignment = result[0];
  const persona = getPersonaById(assignment.personaId);

  if (!persona) {
    return null;
  }

  return {
    personaId: persona.id,
    personaName: persona.name,
    systemPrompt: persona.systemPrompt,
  };
}

/**
 * Mark persona as converted (purchase made)
 */
export async function markPersonaConverted(
  sessionId: string,
  page: string,
  revenue: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db
    .update(personaAssignments)
    .set({
      converted: true,
      revenue: revenue.toString(),
    })
    .where(and(eq(personaAssignments.sessionId, sessionId), eq(personaAssignments.page, page)));
}

/**
 * Get persona performance metrics
 */
export async function getPersonaPerformance(page?: string): Promise<
  Array<{
    personaId: string;
    personaName: string;
    impressions: number;
    conversions: number;
    conversionRate: number;
    totalRevenue: number;
    avgRevenue: number;
  }>
> {
  const db = await getDb();
  if (!db) return [];
  
  const allResults = await db.select().from(personaAssignments);
  const results = page ? allResults.filter((r) => r.page === page) : allResults;

  // Group by persona
  const grouped = new Map<
    string,
    {
      personaId: string;
      personaName: string;
      impressions: number;
      conversions: number;
      totalRevenue: number;
    }
  >();

  for (const result of results) {
    const key = result.personaId;
    if (!grouped.has(key)) {
      grouped.set(key, {
        personaId: result.personaId,
        personaName: result.personaName,
        impressions: 0,
        conversions: 0,
        totalRevenue: 0,
      });
    }

    const entry = grouped.get(key)!;
    entry.impressions++;
    if (result.converted) {
      entry.conversions++;
      entry.totalRevenue += Number(result.revenue) || 0;
    }
  }

  // Calculate rates
  return Array.from(grouped.values()).map((entry) => ({
    ...entry,
    conversionRate: entry.impressions > 0 ? (entry.conversions / entry.impressions) * 100 : 0,
    avgRevenue: entry.conversions > 0 ? entry.totalRevenue / entry.conversions : 0,
  }));
}

/**
 * Get all persona assignments for a session
 */
export async function getSessionPersonaAssignments(sessionId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(personaAssignments).where(eq(personaAssignments.sessionId, sessionId));
}
