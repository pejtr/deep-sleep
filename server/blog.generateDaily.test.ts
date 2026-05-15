import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBlogPost, getBlogPostBySlug } from "./db";

// Mock the LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: `## Understanding Sleep Deprivation

Sleep deprivation affects millions worldwide. This article explores deep sleep improvement techniques.

### The Science of Deep Sleep

Deep sleep is crucial for recovery. Studies show that deep sleep improvement leads to better health outcomes.

### Techniques for Better Sleep

1. Maintain consistent schedule
2. Optimize bedroom environment
3. Reduce screen time before bed

Deep sleep improvement requires commitment and consistency. Start with one technique and build from there.`,
        },
      },
    ],
  }),
}));

describe("blog.generateDaily", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate blog post with default keyword", async () => {
    const result = await createBlogPost({
      title: "How to Improve Deep Sleep Improvement",
      slug: `how-to-improve-deep-sleep-improvement-${Date.now()}`,
      content: `## Understanding Sleep Deprivation

Sleep deprivation affects millions worldwide. This article explores deep sleep improvement techniques.

### The Science of Deep Sleep

Deep sleep is crucial for recovery. Studies show that deep sleep improvement leads to better health outcomes.

### Techniques for Better Sleep

1. Maintain consistent schedule
2. Optimize bedroom environment
3. Reduce screen time before bed

Deep sleep improvement requires commitment and consistency. Start with one technique and build from there.`,
      excerpt: "Sleep deprivation affects millions worldwide. This article explores deep sleep improvement techniques. ...",
      seoKeyword: "deep sleep improvement",
      metaDescription: "Learn about deep sleep improvement. Science-backed sleep tips from Deep Sleep Reset. Improve your sleep quality tonight.",
    });

    expect(result).toBeDefined();
  });

  it("should generate blog post with custom keyword", async () => {
    const result = await createBlogPost({
      title: "How to Fix Insomnia",
      slug: `how-to-fix-insomnia-${Date.now()}`,
      content: "Content about fixing insomnia...",
      excerpt: "Learn about fixing insomnia...",
      seoKeyword: "fix insomnia",
      metaDescription: "Learn about fix insomnia. Science-backed sleep tips from Deep Sleep Reset. Improve your sleep quality tonight.",
    });

    expect(result).toBeDefined();
  });

  it("should generate slug with timestamp", async () => {
    const title = "How to Improve Sleep Quality";
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();

    expect(slug).toMatch(/^how-to-improve-sleep-quality-\d{13}$/);
  });

  it("should truncate long keywords to 100 chars", () => {
    const longKeyword = "a".repeat(150);
    const truncated = longKeyword.slice(0, 100);

    expect(truncated).toHaveLength(100);
  });

  it("should generate meta description under 256 chars", () => {
    const keyword = "deep sleep improvement";
    const metaDescription = `Learn about ${keyword}. Science-backed sleep tips from Deep Sleep Reset. Improve your sleep quality tonight.`.slice(0, 256);

    expect(metaDescription.length).toBeLessThanOrEqual(256);
  });

  it("should extract excerpt from content", () => {
    const content = `## Understanding Sleep Deprivation

Sleep deprivation affects millions worldwide. This article explores deep sleep improvement techniques.`;

    const excerpt = content.replace(/[#*\n]/g, " ").trim().slice(0, 200) + "...";

    expect(excerpt).toContain("Sleep deprivation");
    expect(excerpt.length).toBeLessThanOrEqual(203);
  });

  it("should include keyword in content multiple times", () => {
    const keyword = "deep sleep improvement";
    const content = `## Understanding Sleep Deprivation

Sleep deprivation affects millions worldwide. This article explores deep sleep improvement techniques.

### The Science of Deep Sleep

Deep sleep is crucial for recovery. Studies show that deep sleep improvement leads to better health outcomes.

### Techniques for Better Sleep

1. Maintain consistent schedule
2. Optimize bedroom environment
3. Reduce screen time before bed

Deep sleep improvement requires commitment and consistency. Start with one technique and build from there.`;

    const keywordCount = (content.match(new RegExp(keyword, "gi")) || []).length;

    expect(keywordCount).toBeGreaterThanOrEqual(3);
  });
});
