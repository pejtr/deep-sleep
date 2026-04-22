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
- [ ] Checkpoint saved
- [ ] Published to deep-sleep.manus.space
