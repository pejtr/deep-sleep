/**
 * Persona Sync Utility
 * Ensures HeroWithLuna and SleepChatBot use the same persona
 */

const PERSONA_STORAGE_KEY = "deep_sleep_persona_id";

/**
 * Get or create a stable persona for the session
 * Maps 10 personas to the 3 chatbot personas (luna, petra, lucie)
 */
export function getStablePersona(): string {
  // Check if already stored
  const stored = sessionStorage.getItem(PERSONA_STORAGE_KEY);
  if (stored) {
    return stored;
  }

  // Create new persona assignment (10-way A/B test)
  const allPersonas = [
    "compassionate",
    "scientific",
    "practical",
    "curious",
    "motivational",
    "holistic",
    "storyteller",
    "structured",
    "adaptive",
    "empowering",
  ];

  const randomPersona = allPersonas[Math.floor(Math.random() * allPersonas.length)];
  sessionStorage.setItem(PERSONA_STORAGE_KEY, randomPersona);

  return randomPersona;
}

/**
 * Map 10 personas to 3 chatbot personas
 */
export function mapToChatPersona(persona: string): "luna" | "petra" | "lucie" {
  const mapping: Record<string, "luna" | "petra" | "lucie"> = {
    compassionate: "luna",
    scientific: "petra",
    practical: "lucie",
    curious: "luna",
    motivational: "luna",
    holistic: "luna",
    storyteller: "luna",
    structured: "petra",
    adaptive: "lucie",
    empowering: "luna",
  };

  return mapping[persona] || "luna";
}

/**
 * Get persona name for display
 */
export function getPersonaName(persona: string): string {
  const names: Record<string, string> = {
    compassionate: "Luna Compassionate",
    scientific: "Luna Scientific",
    practical: "Luna Practical",
    curious: "Luna Curious",
    motivational: "Luna Motivational",
    holistic: "Luna Holistic",
    storyteller: "Luna Storyteller",
    structured: "Luna Structured",
    adaptive: "Luna Adaptive",
    empowering: "Luna Empowering",
  };

  return names[persona] || "Luna";
}
