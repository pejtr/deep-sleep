import { describe, it, expect } from "vitest";

// Import personas using relative path
import { PERSONAS, getRandomPersona, getPersonaById, getAllPersonaIds } from "../shared/personas";

describe("Personas", () => {
  describe("getRandomPersona", () => {
    it("should return a valid persona", () => {
      const persona = getRandomPersona();
      expect(persona).toBeDefined();
      expect(persona.id).toBeDefined();
      expect(persona.name).toBeDefined();
      expect(persona.systemPrompt).toBeDefined();
    });

    it("should return different personas on multiple calls", () => {
      const personas = new Set();
      for (let i = 0; i < 50; i++) {
        const persona = getRandomPersona();
        personas.add(persona.id);
      }
      // With 10 personas and 50 calls, we should get at least 5 different ones
      expect(personas.size).toBeGreaterThanOrEqual(5);
    });

    it("should only return personas from the PERSONAS object", () => {
      const validIds = Object.keys(PERSONAS);
      for (let i = 0; i < 20; i++) {
        const persona = getRandomPersona();
        expect(validIds).toContain(persona.id);
      }
    });
  });

  describe("getPersonaById", () => {
    it("should return the correct persona by ID", () => {
      const persona = getPersonaById("luna1");
      expect(persona).toBeDefined();
      expect(persona?.id).toBe("luna1");
      expect(persona?.name).toBe("Luna Compassionate");
    });

    it("should return undefined for invalid ID", () => {
      const persona = getPersonaById("invalid-id");
      expect(persona).toBeUndefined();
    });

    it("should return all 10 personas", () => {
      const lunaIds = ["luna1", "luna2", "luna3", "luna4", "luna5", "luna6", "luna7", "luna8", "luna9", "luna10"];
      for (const id of lunaIds) {
        const persona = getPersonaById(id);
        expect(persona).toBeDefined();
        expect(persona?.id).toBe(id);
      }
    });
  });

  describe("getAllPersonaIds", () => {
    it("should return all 10 persona IDs", () => {
      const ids = getAllPersonaIds();
      expect(ids).toHaveLength(10);
    });

    it("should return correct persona IDs", () => {
      const ids = getAllPersonaIds();
      const expectedIds = ["luna1", "luna2", "luna3", "luna4", "luna5", "luna6", "luna7", "luna8", "luna9", "luna10"];
      expect(ids.sort()).toEqual(expectedIds.sort());
    });
  });

  describe("Persona structure", () => {
    it("should have all required fields for each persona", () => {
      for (const [id, persona] of Object.entries(PERSONAS)) {
        expect(persona.id).toBeDefined();
        expect(persona.name).toBeDefined();
        expect(persona.description).toBeDefined();
        expect(persona.systemPrompt).toBeDefined();
        expect(persona.tone).toBeDefined();
        expect(persona.strength).toBeDefined();

        // Validate types
        expect(typeof persona.id).toBe("string");
        expect(typeof persona.name).toBe("string");
        expect(typeof persona.description).toBe("string");
        expect(typeof persona.systemPrompt).toBe("string");
        expect(typeof persona.tone).toBe("string");
        expect(typeof persona.strength).toBe("string");

        // Validate content length
        expect(persona.name.length).toBeGreaterThan(0);
        expect(persona.systemPrompt.length).toBeGreaterThan(100); // System prompts should be substantial
      }
    });

    it("should have unique names for each persona", () => {
      const names = new Set();
      for (const persona of Object.values(PERSONAS)) {
        names.add(persona.name);
      }
      expect(names.size).toBe(10);
    });

    it("should have unique IDs for each persona", () => {
      const ids = new Set();
      for (const persona of Object.values(PERSONAS)) {
        ids.add(persona.id);
      }
      expect(ids.size).toBe(10);
    });

    it("should have empathetic language in system prompts", () => {
      const empathyKeywords = [
        "empathetic",
        "care",
        "understand",
        "support",
        "compassion",
        "emotional",
        "feeling",
        "guide",
        "healing",
        "safe",
      ];

      for (const persona of Object.values(PERSONAS)) {
        const promptLower = persona.systemPrompt.toLowerCase();
        const hasEmpathy = empathyKeywords.some((keyword) => promptLower.includes(keyword));
        expect(hasEmpathy).toBe(true);
      }
    });

    it("should mention 'Guide' role in all personas", () => {
      for (const persona of Object.values(PERSONAS)) {
        expect(persona.systemPrompt).toContain("Guide");
      }
    });
  });

  describe("Persona diversity", () => {
    it("should have diverse tones across personas", () => {
      const tones = new Set();
      for (const persona of Object.values(PERSONAS)) {
        tones.add(persona.tone);
      }
      expect(tones.size).toBeGreaterThanOrEqual(8); // At least 8 different tones
    });

    it("should have diverse strengths across personas", () => {
      const strengths = new Set();
      for (const persona of Object.values(PERSONAS)) {
        strengths.add(persona.strength);
      }
      expect(strengths.size).toBeGreaterThanOrEqual(8); // At least 8 different strengths
    });

    it("should have distinct approaches in system prompts", () => {
      const prompts = Object.values(PERSONAS).map((p) => p.systemPrompt);
      const uniquePrompts = new Set(prompts);
      expect(uniquePrompts.size).toBe(10); // All prompts should be unique
    });
  });

  describe("Persona names", () => {
    it("should all start with 'Luna'", () => {
      for (const persona of Object.values(PERSONAS)) {
        expect(persona.name).toMatch(/^Luna\s+/);
      }
    });

    it("should have descriptive second names", () => {
      const secondNames = Object.values(PERSONAS).map((p) => p.name.split(" ")[1]);
      const uniqueNames = new Set(secondNames);
      expect(uniqueNames.size).toBe(10);

      // Verify they're meaningful adjectives
      const meaningfulNames = [
        "Compassionate",
        "Scientific",
        "Practical",
        "Curious",
        "Motivational",
        "Holistic",
        "Storyteller",
        "Structured",
        "Adaptive",
        "Empowering",
      ];
      for (const name of secondNames) {
        expect(meaningfulNames).toContain(name);
      }
    });
  });
});
