# Deep Sleep Reset — Permanent Web App TODO

## Database & Backend
- [x] DB schema: quiz_results, orders, email_leads, ab_impressions, behavior_events tables
- [x] DB migration applied
- [x] tRPC router: quiz.submit, quiz.getResult
- [x] tRPC router: orders.create, orders.upsell
- [x] tRPC router: leads.capture
- [x] tRPC router: abTest.track, abTest.getVariant, abTest.markConverted
- [x] tRPC router: behavior.track
- [x] REST endpoint: POST /api/behavior/track
- [x] Vitest tests for backend routers (15 tests, all passing)

## Shared Components
- [x] Dark cosmic CSS design system (oklch palette, glass-card, orbs, animations)
- [x] LiveSalesNotification (12+ global locations, FOMO engine)
- [x] TrustBar (12,847+ users, 4.9★)
- [x] TestimonialsCarousel (chronotype-specific, auto-rotating)
- [x] CountdownTimer (session-persistent, shared between Result + Order)
- [x] StickyMobileCTA
- [x] ProgressBar (quiz — CSS in index.css)
- [x] useSession hook (sessionId, chronotype, A/B variant)

## Funnel Pages
- [x] Home page (hero + quiz entry, 5 A/B headline variants, FOMO, social proof)
- [x] Quiz page (5 questions, progress bar, Lion/Bear/Wolf/Dolphin result)
- [x] QuizResult page (countdown, email capture, live viewers, testimonials, loss aversion)
- [x] Order page ($5, FOMO indicators, sticky mobile CTA, trust badges, payment methods)
- [x] Upsell1 page ($7, urgency, chronotype personalization, tracking)
- [x] Upsell2 page ($17, urgency, chronotype personalization, tracking)
- [x] Upsell3 page ($27, urgency, chronotype personalization, tracking)
- [x] ThankYou page (review prompt, premium upsell $9.99/mo, referral + social share)

## Routing & Integration
- [x] App.tsx routes wired for all funnel pages
- [x] Session storage for countdown timer shared between Result + Order
- [x] Behavior tracking wired on all pages
- [x] A/B variant assignment wired on Home page

## Deployment
- [x] TypeScript check passes (0 errors)
- [x] Production build passes (4.84s)
- [x] Vitest tests written (15 tests, all passing)
- [x] Checkpoint saved (version: daeb2cca)
- [ ] Published to deep-sleep.manus.space (user action required — click Publish button)

## Gumroad Optimization
- [x] Upload optimized product description copy to all 4 Gumroad products
- [x] Publish all 4 products on Gumroad (all Published, prices verified)
- [ ] Test complete purchase flow (quiz → result → checkout → payment)

## Gumroad Storefront Branding
- [x] Publisher name changed to DEEPSLEEP
- [x] Bio updated with quiz CTA → deepsleep.quest
- [x] Profile colors: Background #0B1120, Highlight #C9A84C
- [x] Dark cosmic logo/avatar uploaded
- [x] Branded thumbnails uploaded for all 4 products
- [x] Audio Pack price corrected from $12 to $17

## Domain Setup
- [ ] Configure deepsleep.quest as primary domain (DNS setup pending — user action)
- [x] deepsleep.mom domain connected
- [x] deepsleep.manus.space domain active

## Promotion & Launch
- [ ] Test complete purchase flow (quiz → result → checkout → payment)
- [ ] Prepare and launch promotional campaigns (Meta Ads + organic)
- [ ] Generate Luna Voss AI influencer content for deepsleep.mom

## Premium Redesign (matching deep-sleep-reset.com)
- [x] Update global CSS design system: dark cinematic theme, gold/amber accents (#C9A84C), serif typography (Playfair Display)
- [x] Rebuild Hero section: night sky background, "You're Not Tired. You're Sleep-Deprived." headline, gold CTA
- [x] Add sticky top bar: "Don't close — Start your sleep transformation" with progress indicator
- [x] Add Problem Agitation section: 3:17 AM photo, failed solutions list with X marks
- [x] Add brainwave visualization section
- [x] Add Sleep Score quiz CTA section
- [x] Add "The 7-Night Deep Sleep Reset" product introduction section
- [x] Add "What Happens Each Night" (Night 1-7 journey) section
- [x] Add "This was made for you if:" checklist section
- [x] Add premium testimonials section: 3-card layout with names/locations, 5-star ratings
- [x] Add value stack pricing section: "Your Complete System — Everything Included" with crossed-out total
- [x] Add "Sleep Better or Pay Nothing" guarantee section with shield icon
- [x] Add Chronotype quiz CTA section with animal emojis
- [x] Add FAQ accordion section: "Questions & Honest Answers"
- [x] Add final CTA section: "One Coffee. Seven Nights. A Different Life."
- [x] Add floating social proof bar: live counter + rotating testimonials + "Try for $5" CTA
- [x] Add floating Support button (bottom-left)
- [x] Add live purchase notifications (toast popups)
- [x] Add SCROLL indicator with animated arrows in hero
- [x] Connect all CTA buttons to Gumroad checkout (https://deepsleepreset.gumroad.com/l/fdtifc)
- [x] Update quiz to 8 questions (sends first 5 to server)
- [x] Fix Gumroad URLs from petrmatej to deepsleepreset across all routes

## Hormozi Techniques Integration
- [x] Apply Grand Slam Offer framework: Dream Outcome + Perceived Likelihood + Time Delay + Effort/Sacrifice
- [x] Value stack with anchored pricing ($119 value → $5 price = 24x value)
- [x] Risk reversal: "Sleep Better or Pay Nothing" 30-day guarantee
- [x] Urgency: limited spots, live purchase counter, countdown elements
- [x] Problem agitation: paint the pain vividly before presenting solution
- [x] Social proof: specific names, locations, before/after transformations
- [x] Scarcity: "9 people purchased in the last hour"
- [x] Dream outcome framing: "One Coffee. Seven Nights. A Different Life."

## Bug Fixes
- [x] Fix Support button overlapping with FloatingSocialProofBar and LiveSalesNotification
- [x] Fix all Gumroad fallback URLs in Upsell1, Upsell2, Upsell3, ThankYou (petrmatej → deepsleepreset)

## New Features (Apr 23)
- [x] Fix footer broken links (Privacy Policy, Terms of Service, Affiliates, Contact) — create real pages
- [x] Add feedback system with automatic rewards (discount coupon, 1-month premium free, community access)
- [x] Add ASMR section on Home page + ASMR upsell (premium audio pack)
- [x] Add language switcher (CS, DE, ES, FR, PT, HI) with translations
- [x] Test bonus downloads from Gumroad (PDF, audio files)
- [x] Add feedback router in server/routers.ts (submitFeedback mutation with reward generation)
- [x] Create Privacy Policy page (/privacy)
- [x] Create Terms of Service page (/terms)
- [x] Create Affiliates page (/affiliates)
- [x] Create Contact page (/contact)
- [x] Add i18n context/hook for language switching
- [x] Add ASMR audio player component with sleep sounds

## Multilingual Expansion (Apr 23)
- [x] Add 7 low-tier country languages: Indonesian (ID), Filipino/Tagalog (PH), Bengali (BD), Urdu (PK), Vietnamese (VN), Yoruba (NG), Swahili (KE)
- [x] Total 14 languages in language switcher
- [x] Auto-detect browser language for all 14 supported languages
- [x] Language switcher reordered: low-tier first, Tier 1 last

## Google Ads & Traffic (Apr 23)
- [ ] Pause/remove old Google Ads campaign (deep-sleep-reset.com)
- [ ] Create new Google Search campaign targeting deepsleep.mom
- [ ] Set up conversion tracking for Gumroad purchases
- [ ] Microsoft Advertising appeal email sent (account suspended, ~3000 CZK balance)
- [ ] Reddit organic traffic — update links from deep-sleep-reset.com to deepsleep.mom

## AI Chatbot (Apr 23)
- [x] Fix language default to English (ignore browser CS/DE/etc, only auto-detect non-Latin scripts)
- [ ] Add tRPC chat.message procedure with invokeLLM + sleep guide system prompt
- [ ] Create SleepChatBot floating component (chat bubble, message history, streaming)
- [ ] Integrate chatbot into Home.tsx
- [ ] Test chatbot in multiple languages
