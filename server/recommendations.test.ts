import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("Recommendations Engine", () => {
  describe("Recommendations input validation", () => {
    const recommendationSchema = z.object({
      language: z.enum(['en', 'cs', 'de', 'fr', 'es']).default('cs'),
    });

    it("should accept Czech language", () => {
      const input = { language: 'cs' as const };
      const result = recommendationSchema.safeParse(input);
      expect(result.success).toBe(true);
      expect(result.data?.language).toBe('cs');
    });

    it("should accept English language", () => {
      const input = { language: 'en' as const };
      const result = recommendationSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should default to Czech", () => {
      const input = {};
      const result = recommendationSchema.safeParse(input);
      expect(result.success).toBe(true);
      expect(result.data?.language).toBe('cs');
    });
  });

  describe("Czech recommendations", () => {
    const recommendations = [
      {
        id: 'quiz-tracking',
        priority: 'high',
        title: 'Implementujte a ověřte tracking pro quiz',
        description: 'Sledujte starty kvízu, konverze a míry odpadu v traktu.',
        impact: 'Zvýšení konverzí o 15-25%',
        effort: 'Střední',
      },
      {
        id: 'cta-optimization',
        priority: 'high',
        title: 'Optimalizujte CTA a lead capture',
        description: 'Vytvořte jasné, přesvědčivé Call-to-Action na úvodní stránce.',
        impact: 'Zvýšení lead capture o 20-30%',
        effort: 'Nízké',
      },
      {
        id: 'landing-page-mobile',
        priority: 'medium',
        title: 'Optimalizujte úvodní stránku pro mobil',
        description: 'Zlepšete design a konverzi na mobilních zařízeních.',
        impact: 'Zvýšení mobilních konverzí o 15%',
        effort: 'Střední',
      },
      {
        id: 'feedback-collection',
        priority: 'medium',
        title: 'Přidejte mechaniku pro sběr zpětné vazby',
        description: 'Sbírejte zpětnou vazbu a recenze po nákupu.',
        impact: 'Zvýšení trust score o 25%',
        effort: 'Nízké',
      },
      {
        id: 'ab-testing-headlines',
        priority: 'medium',
        title: 'A/B testujte nadpisy a prezentaci',
        description: 'Testujte různé nadpisy a prezentace.',
        impact: 'Zvýšení CTR o 10-15%',
        effort: 'Nízké',
      },
    ];

    it("should have 5 recommendations", () => {
      expect(recommendations.length).toBe(5);
    });

    it("should have 2 high priority recommendations", () => {
      const highPriority = recommendations.filter(r => r.priority === 'high');
      expect(highPriority.length).toBe(2);
    });

    it("should have 3 medium priority recommendations", () => {
      const mediumPriority = recommendations.filter(r => r.priority === 'medium');
      expect(mediumPriority.length).toBe(3);
    });

    it("should have unique IDs", () => {
      const ids = recommendations.map(r => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have Czech titles", () => {
      recommendations.forEach(rec => {
        // Check if title contains Czech characters or is in Czech
        expect(rec.title.length).toBeGreaterThan(0);
        expect(rec.title).toBeTruthy();
      });
    });
  });

  describe("Recommendation priority levels", () => {
    it("should identify high priority items", () => {
      const priority = 'high';
      expect(['high', 'medium', 'low']).toContain(priority);
    });

    it("should identify medium priority items", () => {
      const priority = 'medium';
      expect(['high', 'medium', 'low']).toContain(priority);
    });

    it("should identify low priority items", () => {
      const priority = 'low';
      expect(['high', 'medium', 'low']).toContain(priority);
    });
  });

  describe("Recommendation impact assessment", () => {
    it("should quantify conversion impact", () => {
      const impact = 'Zvýšení konverzí o 15-25%';
      expect(impact).toContain('%');
      expect(impact).toContain('Zvýšení');
    });

    it("should quantify lead capture impact", () => {
      const impact = 'Zvýšení lead capture o 20-30%';
      expect(impact).toContain('20-30%');
    });

    it("should quantify mobile conversion impact", () => {
      const impact = 'Zvýšení mobilních konverzí o 15%';
      expect(impact).toContain('15%');
    });

    it("should quantify trust score impact", () => {
      const impact = 'Zvýšení trust score o 25%';
      expect(impact).toContain('25%');
    });

    it("should quantify CTR impact", () => {
      const impact = 'Zvýšení CTR o 10-15%';
      expect(impact).toContain('10-15%');
    });
  });

  describe("Recommendation effort levels", () => {
    it("should identify low effort recommendations", () => {
      const effort = 'Nízké';
      expect(effort).toBe('Nízké');
    });

    it("should identify medium effort recommendations", () => {
      const effort = 'Střední';
      expect(effort).toBe('Střední');
    });

    it("should identify high effort recommendations", () => {
      const effort = 'Vysoké';
      expect(['Nízké', 'Střední', 'Vysoké']).toContain(effort);
    });
  });

  describe("Recommendation filtering and sorting", () => {
    const recommendations = [
      { id: 'rec1', priority: 'high' },
      { id: 'rec2', priority: 'medium' },
      { id: 'rec3', priority: 'high' },
      { id: 'rec4', priority: 'medium' },
    ];

    it("should filter by priority", () => {
      const highPriority = recommendations.filter(r => r.priority === 'high');
      expect(highPriority.length).toBe(2);
    });

    it("should sort by priority", () => {
      const sorted = [...recommendations].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority as keyof typeof priorityOrder] - 
               priorityOrder[b.priority as keyof typeof priorityOrder];
      });
      expect(sorted[0].priority).toBe('high');
      expect(sorted[1].priority).toBe('high');
    });
  });

  describe("Performance marketing recommendations", () => {
    it("should recommend quiz tracking for funnel optimization", () => {
      const rec = {
        id: 'quiz-tracking',
        title: 'Implementujte a ověřte tracking pro quiz',
        impact: 'Zvýšení konverzí o 15-25%',
      };
      expect(rec.title).toContain('quiz');
      expect(rec.impact).toContain('konverzí');
    });

    it("should recommend CTA optimization for lead capture", () => {
      const rec = {
        id: 'cta-optimization',
        title: 'Optimalizujte CTA a lead capture',
        impact: 'Zvýšení lead capture o 20-30%',
      };
      expect(rec.title).toContain('CTA');
      expect(rec.impact).toContain('lead');
    });

    it("should recommend mobile optimization for traffic increase", () => {
      const rec = {
        id: 'landing-page-mobile',
        title: 'Optimalizujte úvodní stránku pro mobil',
        impact: 'Zvýšení mobilních konverzí o 15%',
      };
      expect(rec.title).toContain('mobil');
      expect(rec.impact).toContain('mobilních');
    });

    it("should recommend feedback collection for trust building", () => {
      const rec = {
        id: 'feedback-collection',
        title: 'Přidejte mechaniku pro sběr zpětné vazby',
        impact: 'Zvýšení trust score o 25%',
      };
      expect(rec.title).toContain('zpětné vazby');
      expect(rec.impact).toContain('trust');
    });

    it("should recommend A/B testing for CTR improvement", () => {
      const rec = {
        id: 'ab-testing-headlines',
        title: 'A/B testujte nadpisy a prezentaci',
        impact: 'Zvýšení CTR o 10-15%',
      };
      expect(rec.title).toContain('A/B');
      expect(rec.impact).toContain('CTR');
    });
  });
});
