# Periodic Updates & Scheduled Tasks

## Daily Blog Post Generation

**Purpose:** Automatically generate SEO-optimized blog posts daily for organic traffic growth

**Trigger:** Daily at 9:00 AM UTC

**Endpoint:** `POST /api/scheduled/blog-post`

**Payload:**
```json
{
  "keyword": "sleep deprivation",
  "title": "How to Overcome Sleep Deprivation"
}
```

**Implementation:**
- Uses `blog.generateDaily` tRPC procedure
- Calls `invokeLLM` with sleep science expert system prompt
- Auto-generates SEO keyword placement (first paragraph + H2 + 3-5x throughout)
- Creates blog post with excerpt + meta description
- Stores in `blog_posts` table

**Keywords Rotation (7-day cycle):**
1. Day 1: "sleep deprivation"
2. Day 2: "insomnia treatment"
3. Day 3: "sleep quality improvement"
4. Day 4: "chronotype sleep schedule"
5. Day 5: "REM sleep benefits"
6. Day 6: "deep sleep stages"
7. Day 7: "sleep hygiene tips"

**Expected Output:**
- 1 blog post per day
- 600-900 words per post
- SEO-optimized with target keyword
- Auto-published to `/blog/:slug`
- Indexed by Google Search Console

**Monitoring:**
- Check `/admin` dashboard → Blog tab for generation status
- Monitor blog post count in database
- Track organic traffic from `/blog` routes

**Manual Trigger:**
```bash
curl -X POST https://deepsleep.manus.space/api/scheduled/blog-post \
  -H "x-scheduled-task: true" \
  -H "Content-Type: application/json" \
  -d '{"keyword": "sleep deprivation", "title": "How to Overcome Sleep Deprivation"}'
```

## Email Sequence Automation (Existing)

**Purpose:** 7-day post-purchase email drip sequence

**Trigger:** Immediately after Stripe checkout completion

**Implementation:** Wired in `stripeWebhook.ts` → `sendPurchaseConfirmation`

**Sequence:**
- Day 0: Welcome email + download link
- Day 1: Chronotype-personalized tips
- Day 2: Protocol overview
- Day 3: First week success tips
- Day 4: Audio pack upsell
- Day 5: Premium membership offer
- Day 6: Testimonials + social proof
- Day 7: Final reminder + review request

## Nightly AI Optimization (Planned)

**Purpose:** Analyze behavior data and generate optimization recommendations

**Trigger:** Daily at 2:00 AM UTC

**Implementation:**
- Analyze behavior events, quiz responses, conversion funnels
- Generate AI recommendations for copy, pricing, targeting
- Store in `ai_insights` table
- Display in Admin Dashboard with "Apply" button

---

**Last Updated:** May 15, 2026
**Status:** Daily blog generation ACTIVE
