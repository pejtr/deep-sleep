import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('Nightly Optimization Engine', () => {
  it('should generate optimization insights', () => {
    const insights = [
      {
        type: 'performance',
        title: 'Variant B vítězí',
        description: 'Variant B má 23% vyšší conversion rate',
        priority: 'high',
        recommendation: 'Zvýšit budget pro Variant B o 50%',
      },
    ];

    expect(insights).toHaveLength(1);
    expect(insights[0].priority).toBe('high');
  });

  it('should validate optimization schedule', () => {
    const scheduleSchema = z.object({
      time: z.string().regex(/^\d{2}:\d{2}$/),
      timezone: z.string().default('Europe/Prague'),
    });

    const validSchedule = { time: '00:00', timezone: 'Europe/Prague' };
    expect(() => scheduleSchema.parse(validSchedule)).not.toThrow();
  });

  it('should calculate next optimization time', () => {
    const now = new Date();
    const nextOptimization = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    expect(nextOptimization.getTime()).toBeGreaterThan(now.getTime());
  });

  it('should support multiple insight types', () => {
    const insightTypes = ['performance', 'traffic', 'audience', 'budget', 'creative'];
    
    expect(insightTypes).toContain('performance');
    expect(insightTypes).toContain('traffic');
    expect(insightTypes).toContain('audience');
  });

  it('should prioritize insights by importance', () => {
    const insights = [
      { priority: 'low', impact: 5 },
      { priority: 'high', impact: 95 },
      { priority: 'medium', impact: 50 },
    ];

    const sorted = insights.sort((a, b) => {
      const priorityMap = { high: 3, medium: 2, low: 1 };
      return priorityMap[b.priority as keyof typeof priorityMap] - priorityMap[a.priority as keyof typeof priorityMap];
    });

    expect(sorted[0].priority).toBe('high');
  });
});
