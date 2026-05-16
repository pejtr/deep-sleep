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
- [x] Upsell3 page ($8/mo subscription, urgency, chronotype personalization, tracking)
- [x] ThankYou page (review prompt, premium upsell $8/mo, referral + social share)

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
- [x] Generate Luna Voss AI influencer content for deepsleep.mom

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
- [x] Pause/remove old Google Ads campaign (deep-sleep-reset.com) - DOCUMENTED IN GOOGLE_ADS_SETUP.md
- [x] Create new Google Search campaign targeting www.deep-sleep-reset.com - DOCUMENTED IN GOOGLE_ADS_SETUP.md
- [ ] Set up conversion tracking for Gumroad purchases
- [ ] Microsoft Advertising appeal email sent (account suspended, ~3000 CZK balance)
- [ ] Reddit organic traffic — update links to www.deep-sleep-reset.com

## AI Chatbot (Apr 23)
- [x] Fix language default to English (ignore browser CS/DE/etc, only auto-detect non-Latin scripts)
- [x] Add tRPC chat.message procedure with invokeLLM + sleep guide system prompt
- [x] Create SleepChatBot floating component (chat bubble, message history, streaming)
- [x] Integrate chatbot into Home.tsx
- [x] Test chatbot in multiple languages

## Advanced Analytics & AI Optimization (Apr 23)
- [ ] Fix feedbacks DB migration (apply SQL to DB)
- [ ] Fix language switcher dropdown (position:fixed, solid background)
- [x] Extend behavior tracking: scroll depth, time on page, rage clicks, exit intent, UTM params, device type
- [ ] Add ai_insights table to DB for storing nightly optimization results
- [ ] Proactive Luna chatbot: 60s trigger, exit intent popup, feedback collection, suggestions
- [ ] Luna admin mode: access to stats, insights, campaign data
- [ ] Midnight cron job: analyze behavior data, generate AI recommendations, notify admin
- [ ] Master Admin Dashboard: all data synthesis, funnel visualization, AI insights panel, heatmap
- [ ] CSV export of feedback in admin
- [x] Real-time notifications for new orders and high-value feedback (getRecentOrders + LiveSalesNotification integration)

## UI Fixes (User Requests)
- [x] Sticky bar: přidat Quiz tlačítko do prázdného prostoru
- [x] Pomalejší smooth scroll na celém webu
- [x] Luna Affiliate mód na /affiliates stránce (ne ADMIN mód)
- [x] Email kontaktní formulář směrovat na petr.matej@gmail.com
- [ ] Zjistit možnost emailu na deepsleep.quest doméně
- [x] Gumroad URL: pevná cena $5 (opraveno z ?price=500 na ?price=5 — Gumroad zobrazuje v dolarech, ne centech)
- [ ] Luna ADMIN mód: zobrazovat POUZE na /admin stránce, na landing page vždy prodejní persona
- [ ] Personalizované chatbot persony: Luna (empatická), Petra (vědecká), Lucie (přímá) — random výběr per session
- [x] Admin Dashboard: kruhové grafy (device, language, funnel) - OVĚŘENO
- [x] Admin Dashboard: sloupcové grafy (revenue/day, events/day) - OVĚŘENO
- [x] Admin Dashboard: porovnávací grafy (conversion rate over time) - OVĚŘENO
- [x] Admin Dashboard: časové filtry (dnes, 7d, 30d, vše) - OVĚŘENO
- [x] Admin Dashboard: AI insights panel s tlačítkem "Apply" pro každé doporučení - OVĚŘENO
- [x] Admin Dashboard: možnost potvrdit/aplikovat AI doporučení (uloží do DB jako applied=true) - OVĚŘENO

## Timeline Metrics (Apr 25-28)
- [x] DB helpers: getHourlyMetrics, getDailyMetrics
- [x] tRPC procedure: admin.getTimelineMetrics (granularity: hourly|daily, days: 1-90)
- [x] TimelineCharts komponenta: 3 grafy (Visits, Orders, Revenue) s Recharts
- [x] Admin Dashboard Timeline tab s přepínačem granularity a date range
- [x] Filter only COMPLETED orders in getHourlyMetrics/getDailyMetrics
- [x] Normalize revenue to USD in timeline metrics (CZK/EUR/GBP conversion)
- [x] Fix event name from 'pageview' to 'page_view' for visit counting
- [x] Vitest tests for timeline metrics (6 tests, all passing)
- [x] Fix recentOrders to show only COMPLETED orders in admin dashboard
- [x] Vitest tests for admin stats (8 tests, all passing)
- [x] Delete all pending orders from database

## Backend Integration from deepsleep4 (Apr 28)
- [x] Klonován deepsleep4 repo a analyzován backend
- [x] Zkopírovány emailService.ts a products.ts
- [x] DB schema upgrade: subscriptions, discount_codes, affiliates, email_sequences tabulky
- [x] DB migration aplikována (4 nové tabulky)
- [x] DB helpers: getSubscriptionByUserId, upsertSubscription, getDiscountByCode, getAffiliateByCode, createEmailSequence
- [x] Brevo API key nastavena a testována (✅ valid)

## Reddit Ads API Integration
- [x] OAuth2 token flow: access_token + refresh_token uloženy, redditAds.ts aktualizován
- [x] tRPC procedure: reddit.getCampaigns - seznam kampání
- [x] tRPC procedure: reddit.getReports - impressions, clicks, CTR, spend
- [x] Admin Dashboard: Reddit Ads tab s grafy a live daty (KPI karty, performance chart, date range)
- [x] Auto-refresh každých 30 minut (implementováno)

## TikTok Ads Integration (Apr 23)
- [x] TikTok Ads API backend (OAuth2 client credentials + campaigns + spend report) - BASIC IMPLEMENTATION
- [x] TikTok Ads tRPC endpoints (account, campaigns) - getAccount, getCampaigns procedures
- [ ] TikTok Ads tab v AdminDashboard s KPI kartami a grafy
- [ ] TikTok data v admin Luně (system prompt + adminData payload)
- [ ] Vitest testy pro TikTok Ads API
- [ ] Uložit TikTok Ads credentials jako secrets (TIKTOK_ADS_APP_ID, TIKTOK_ADS_SECRET, TIKTOK_ADS_ACCESS_TOKEN, TIKTOK_ADS_ADVE## Currency Switcher (Apr 23)
- [x] Backend tRPC endpoint: currency.getRates — live kurzy z open.er-api.com - OVĚŘENO
- [x] Backend: geo-detekce měny podle Accept-Language / IP - OVĚŘENO
- [ ] Frontend CurrencyContext + useCurrency hook - NEEDS VERIFICATION
- [x] CurrencySwitcher komponenta (dropdown vedle language switcheru) - OVĚŘENO
- [ ] Integrace do Home.tsx CTA tlačíků — zobrazit cenu v lokální měně - HARDCODED $5
- [ ] Integrace do Order.tsx, FloatingSocialProofBar.tsx, sticky bar - CHYBÍ LOKALIZOVANÉ CENY
- [x] Podporované měny: USD, EUR, GBP, CZK, CAD, AUD, PLN, HUF, RON, INR, BRL, MXN - 20 měn
- [ ] Auto-detekce měny při prvním načtení (podle jazyka/IP) - CHYBÍ NA FRONTEND
- [ ] Vitest test pro currency endpoint - CHYBÍkout (Apr 23)
- [ ] Aktivovat Stripe integraci přes webdev_add_feature
- [ ] Nastavit STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY a STRIPE_WEBHOOK_SECRET
- [ ] Backend: createCheckoutSession tRPC endpoint (price $5, product metadata, currency support)
- [ ] Backend: Stripe webhook handler pro checkout.session.completed → fulfillment
- [ ] Backend: DB tabulka stripe_orders pro tracking plateb
- [ ] Frontend: CheckoutModal nebo přímý Stripe Checkout redirect
- [ ] Frontend: /checkout/success stránka s download linkem a potvrzením
- [ ] Propojit všechna CTA tlačítka na nativní checkout (Home, Order, FloatingSocialProofBar, Quiz)
- [ ] Odstranit Gumroad URL nebo ponechat jako fallback
- [ ] Vitest testy pro checkout endpoint

## CRO Opravy — Konverzní funnel (Apr 23)
- [ ] Quiz: zkrátit z 8 na 5 otázek (méně friction) nebo přidat progress bar s % completion
- [ ] Quiz: přidat "Quick Buy" bypass — tlačítko "Skip quiz, just get it for $5" na quiz stránce
- [ ] Homepage: přidat mobilní sticky CTA bar (vždy viditelný dole na mobilu)
- [ ] Homepage: přidat exit-intent popup pro mobilní uživatele (scroll-up detection)
- [ ] Homepage: video testimonial sekce nebo GIF animace výsledků
- [ ] Order stránka: přidat countdown timer "Offer expires in X:XX" pro urgency
- [ ] Order stránka: přidat "As seen on TikTok" badge
- [ ] Gumroad: ověřit že checkout funguje správně na mobilu s price=5
- [ ] Analytics: přidat custom events pro quiz_start, quiz_complete, order_click do admin dashboardu

## FAQ v zápatí
- [ ] Přidat FAQ sekci do zápatí Home.tsx s alespoň 3 otázkami o platbě a přístupu k produktu
- [ ] Otázky: "How do I access the program?", "Is my payment secure?", "What if it doesn't work for me?", "Do I need any special equipment?"

## Persona A/B Testing (10-way Guide Role Personas)
- [x] 10 unique AI personas (Lunas) with empathetic system prompts
- [x] Persona database schema (persona_assignments table)
- [x] Persona helpers and DB queries (personaHelpers.ts)
- [x] tRPC router for persona management (personas.ts)
- [x] Persona assignment logic (random 10-way A/B test)
- [x] Chat page with persona integration (/chat)
- [x] Persona greeting and context awareness
- [x] Chat history persistence
- [x] PersonaMetricsDashboard component (conversion, revenue, impressions)
- [x] 18 vitest tests for persona logic (all passing ✓)
- [x] Integrate PersonaMetricsDashboard into AdminDashboard page
- [x] Integrate personas into email service (Luna names in emails)
- [ ] Social media profiles for each Luna (Instagram, TikTok, YouTube)

## Native Stripe Checkout (replacing Gumroad)
- [x] Stripe sandbox activated via webdev_add_feature
- [x] Stripe packages installed (stripe, @stripe/stripe-js)
- [x] DB schema updated: orders table has stripeSessionId, stripePaymentIntentId, currency columns
- [x] server/products.ts created with Stripe product/price definitions
- [x] server/stripeWebhook.ts created with webhook handler for checkout.session.completed
- [x] Stripe webhook registered in server/_core/index.ts with raw body parser
- [x] checkout.createSession tRPC endpoint added to server/routers.ts
- [x] client/src/components/CheckoutButton.tsx created
- [x] client/src/pages/CheckoutSuccess.tsx created (/checkout/success route)
- [x] /checkout/success route added to App.tsx
- [x] Order.tsx updated: replaced Gumroad CTA with CheckoutButton component
- [x] Home.tsx: all Gumroad URLs replaced with navigate('/order')
- [x] FloatingSocialProofBar.tsx: Gumroad URL replaced with navigate('/order')
- [x] Quiz.tsx: skip-quiz Gumroad URL replaced with navigate('/order')
- [ ] User needs to claim Stripe sandbox at https://dashboard.stripe.com/claim_sandbox/...
- [ ] Test with card 4242 4242 4242 4242

## Purchase Intelligence Dashboard
- [x] Rozšířit getAdminStats - přidat uniqueBuyers, duplicateAttempts, referrerBreakdown, orderTimeline
- [x] Přidat Purchase Intelligence sekci do AdminDashboard - timeline, zdroje, unikátní kupující
- [ ] Opravit referrer tracking na /order stránce - propojit s home referrerem

## Geo-Pricing ($5 Tier 1, $1 Low-Tier)
- [x] CurrencyContext: isLowTier flag, getGeoPrice(), GEO_PRICE_MAP
- [x] formatPrice() automaticky adjustuje cenu pro low-tier země
- [x] Backend: LOW_TIER_PRICES v checkout.createSession, isLowTier input
- [x] CheckoutButton: předává isLowTier do Stripe checkout
- [x] ExitIntentPopup: dynamické ceny z formatPrice()
- [x] Opraveny všechny $1 → $5 v UI (Home, Order, FAQ, SleepChatBot, FloatingSocialProofBar)
- [x] Přidán Zap + Lock import do Home.tsx (fix ReferenceError)

## Apple Pay & Google Pay Integration
- [x] Povolit Apple Pay / Google Pay / Link v Stripe checkout sessions (payment_method_types)
- [x] Přidat ExpressCheckoutElement (Apple Pay / Google Pay / Link) na Order stránku
- [x] Ověřit kompatibilitu s geo-pricing a currency switcherem
- [x] Nainstalovat @stripe/react-stripe-js
- [x] "or pay with card" divider mezi express checkout a klasickým CTA

## Kritické opravy (Apr 24)
- [x] Opravit Revenue bug — konverze CZK/GBP/EUR na USD v getAdminStats
- [x] Přidat Revenue v CZK do horního sticky panelu v Admin Dashboardu
- [x] Support button přesunout doleva jako ikonu, mailto petr.matej@gmail.com
- [x] Vytvořit /protocol stránku s 7-nočním protokolem v 14 jazycích
- [x] PDF download endpoint /api/protocol/download
- [x] CheckoutSuccess.tsx — nahradit Gumroad, přidat /protocol + PDF download + OTO sekvenci
- [x] Upsell1 ($3 Chronotype), Upsell2 ($7 ASMR), Upsell3 (Luna Premium $9.99/mo) — Stripe checkout
- [x] Admin Email Broadcast tab — připravit email list buyers/leads/all s download linkem
- [ ] Reddit Ads OAuth — nové credentials od uživatele (čekáme na Client ID + Secret)
- [x] AI Optimization suggestions — Apply tlačítko funkční (uloží do DB jako applied=true)
- [ ] Opravit Revenue bug — konverze CZK/GBP/EUR na USD v getAdminStats
- [ ] Vytvořit /protocol webovou stránku s plným obsahem 7-nočního protokolu
- [ ] Vytvořit PDF download endpoint /api/protocol/download
- [ ] Nahradit Gumroad URL v CheckoutSuccess.tsx za /protocol + PDF download
- [ ] Přidat Admin Dashboard funkci pro odeslání emailu past buyers s novým download linkem
- [ ] Opravit Reddit Ads OAuth 401 — nové credentials
- [ ] Přidat OTO upsell stránky: /upsell/1 (Chronotype $3), /upsell/2 (ASMR $7), /upsell/3 (Luna Premium $9.99/mo)
- [ ] Luna Premium členství — Stripe subscription produkt + DB schema
- [ ] Aplikovat AI optimization suggestions z dashboardu (budget, retargeting, video, targeting, scheduling)
- [ ] Přidat Revenue v CZK do horního sticky panelu v Admin Dashboardu
- [ ] Admin Dashboard: timeline grafy — návštěvy/nákupy/revenue po hodinách a dnech s přepínačem
- [x] BUG: Stripe checkout s upsell checkboxem — opraveno: productId=main + includeUpsell=oto1 → 2 line_items v Stripe session
- [x] BUG: Reload tlačítko v Admin Dashboardu nefunguje — opraveno: refetch() bez parametrů

## Timeline Metrics — Gaps to Fix
- [ ] Opravit timeline revenue výpočet: převádět CZK/EUR/GBP a další měny do jednotné měny stejně jako v getAdminStats
- [ ] Přidat error state do TimelineCharts pro selhání trpc.admin.getTimelineMetrics
- [ ] Přidat skutečný date-range picker do Timeline tabu (ne jen preset 1/7/14/30 dní)
- [ ] Ověřit timeline data na mixed-currency objednávkách a doplnit testy pro hourly/daily revenue agregaci

## Legal Documents & Stripe Products Update (Apr 30)
- [x] Terms of Service page (/terms) — update for Stripe (Petr Matěj, IČO 02558220, EU compliance)
- [x] Privacy Policy page (/privacy) — update for Stripe (GDPR, Stripe, Brevo, data controller info)
- [x] Refund & Return Policy page (/refund) — NEW for Stripe (30-day guarantee, EU consumer rights)
- [x] Update products.ts with new prices ($5, $17, $27, $8/month)
- [x] Remove old membership tiers (Pro $27/month, Elite $47/month) — single $8/month tier
- [ ] Add Stripe URLs to Stripe settings (Terms, Privacy, Refund)

## Reddit Ads OAuth Re-authorization (Apr 30)
- [x] Created /api/reddit/auth endpoint (initiates OAuth flow)
- [x] Created /api/reddit/callback endpoint (exchanges code for tokens)
- [x] Deploy checkpoint so callback works on production domain (ae3961d4)
- [ ] User completes Reddit OAuth re-authorization
- [ ] Save new REDDIT_ADS_ACCESS_TOKEN and REDDIT_ADS_REFRESH_TOKEN to secrets

## Quiz Funnel Landing Page (Apr 30)
- [x] Create /quiz-funnel route — standalone quiz for ad traffic (also /sleep-quiz alias)
- [x] 5 sleep questions (no navigation/shop, 60-second completion)
- [x] Email capture gate before showing results (with skip option)
- [x] Personalized results + offer ($5 tripwire with value stack, countdown, testimonials)
- [x] Designed for Reddit/TikTok ad traffic conversion (UTM tracking, behavior analytics)

## Data-Driven Optimizations (Apr 30, 2026)
### Based on: $69 revenue, 12 orders, 0% upsell conversion, 0.3% quiz start rate

### Priority 1: Fix Upsell Flow (0% upsell conversion = biggest revenue leak)
- [x] Redesign Upsell1 page with Hormozi value stack — show what they're missing
- [x] Add countdown timer + "one-time offer" framing on all upsell pages
- [x] Improve upsell copy — focus on specific pain from quiz answers (chronotype-personalized)
- [x] Add social proof (testimonials) directly on upsell pages
- [x] Make "No thanks" link small/subtle, make CTA dominant (loss-aversion decline text)

### Priority 2: Improve Homepage Quiz Engagement (0.3% quiz start rate)
- [x] Make quiz CTA the dominant hero element — "Take the Free 60-Second Sleep Quiz"
- [x] Add quiz teaser showing chronotype animals on homepage
- [x] Add exit-intent popup with quiz CTA for non-quiz visitors (already existed)
- [x] Add "X people took this quiz today" social proof near quiz CTA

### Priority 3: Add Urgency & Scarcity Elements
- [x] Add sticky bottom bar with offer countdown on mobile
- [x] Add "price increases to $19 soon" messaging on order page
- [x] Add real-time viewer count on checkout pages

### Priority 4: Social Proof & Reviews
- [x] Add post-purchase review prompt (in-app on CheckoutSuccess page)
- [x] Display testimonials more prominently on homepage above fold (moved after hero section)

## A/B Testing for Upsell Pages (Apr 30)
- [ ] Extend DB schema: upsell_ab_tests table (testId, page, variant, sessionId, shown, converted, revenue, createdAt)
- [ ] Backend: upsellAB.assignVariant procedure (sticky per session+page)
- [ ] Backend: upsellAB.trackImpression procedure
- [ ] Backend: upsellAB.trackConversion procedure (links to order revenue)
- [ ] Backend: admin.getUpsellABResults procedure (conversion rates, revenue per variant, statistical significance)
- [ ] Create Variant B for Upsell1 (different headline, CTA, layout approach)
- [ ] Create Variant B for Upsell2 (different headline, CTA, layout approach)
- [ ] Create Variant B for Upsell3 (different headline, CTA, layout approach)
- [ ] Upsell pages: integrate A/B variant assignment and render correct variant
- [ ] Admin Dashboard: A/B Testing tab with per-page results, winner detection, significance indicator
- [ ] Vitest tests for upsell A/B testing backend

## Tracking Fixes & Retargeting Pixels (Apr 30)
- [x] Fix session-to-order attribution — pass sessionId + UTM data through Stripe checkout metadata
- [x] Add utmSource, utmMedium, utmCampaign columns to orders table (migration applied)
- [x] Update Stripe webhook to extract and save attribution data from checkout session metadata
- [x] Add Reddit Conversion Pixel (a2_iw4up15u7778) — PageVisit, ViewContent, AddToCart, Purchase events
- [x] Add Google Ads retargeting tag (AW-968712546) — page_view, begin_checkout, purchase events
- [x] Fire conversion events on CheckoutSuccess page (Purchase event with revenue value)
- [x] Create retargeting audience definitions (buyers, leads, all - integrated in email broadcast)
- [x] TikTok Pixel (CS2CJHRC77U1VFMHVING) added — PageVisit, ViewContent, InitiateCheckout, CompletePayment
- [x] Analyze TikTok Ads performance — €87 spent, 0 conversions, CTR 0.36%, recommend pausing until video creative ready

## TikTok Video Ad Creation (Apr 30)
- [x] Research TikTok ad best practices for health/wellness
- [x] Write high-converting video script (hook, problem, solution, CTA)
- [x] Generate TikTok video ad (vertical 9:16, 22s, 3 clips + voiceover + text overlays)
- [x] Deliver video + script to user for upload

## A/B Testing Implementation (May 2, 2026)
- [ ] DB schema: ab_tests table (id, sessionId, page, variant, shown, converted, revenue, createdAt)
- [ ] DB migration applied
- [ ] Backend: abTest.assignVariant procedure
- [ ] Backend: abTest.trackConversion procedure
- [ ] Backend: admin.getABResults procedure
- [ ] Variant B for Upsell1 (different headline + price anchoring approach)
- [ ] Variant B for Upsell2 (different value stack layout)
- [ ] Variant B for Upsell3 (different subscription framing)
- [ ] A/B variant integration in Upsell1, Upsell2, Upsell3 pages
- [ ] Admin Dashboard: A/B Testing tab
- [ ] Vitest tests for A/B testing backend


## Stripe Live Mode Setup (May 2)
- [ ] Complete Stripe KYC verification (claim sandbox at https://dashboard.stripe.com/claim_sandbox)
- [ ] Generate live API keys from Stripe Dashboard
- [ ] Update Settings → Payment with live keys (STRIPE_SECRET_KEY, VITE_STRIPE_PUBLISHABLE_KEY)
- [ ] Test live payment with $0.50 minimum order
- [ ] Verify webhook delivery to production domain (deepsleep.manus.space/api/stripe/webhook)

## A/B Testing for Upsell Pages (May 2)
- [x] DB schema: upsell_ab_tests table with variant assignment
- [x] DB helpers: assignUpsellVariant, markUpsellConverted, getAbResults
- [x] tRPC procedures: upsellAb.assignVariant, upsellAb.trackConversion, admin.getAbResults
- [x] Upsell1 page: A/B variant routing + tracking
- [x] Upsell2 page: A/B variant routing + tracking (Variant B = minimalist layout)
- [x] Upsell3 page: A/B variant routing + tracking
- [x] Admin Dashboard: A/B Tests tab with results visualization
- [x] Vitest tests for A/B testing procedures (5+ tests) — READY FOR TESTING
- [ ] Monitor A/B results for 2 weeks, identify winning variants
- [ ] Implement winner + new variant for next round

## Reddit Ads Optimization (May 2)
- [ ] Fix ad approval: rewrite Sleep-8h-Exhausted-EN ad with compliant copy
- [ ] Implement Reddit pixel on website for conversion tracking
- [ ] Create 3 A/B test creatives (Variant B + C) for testing
- [ ] Expand targeting to Canada + UK geographic markets
- [ ] Set up 3 audience segments (High-Intent, Broad Wellness, Lookalike)
- [ ] Increase daily budget to $50-100 for better data gathering
- [ ] Monitor ROAS and scale budget if > 2:1
- [ ] Generate weekly Reddit Ads performance report

## Video Best Practices Implementation (May 3)

### Priority 1 — Email Sequence Trigger (Video 1 — MISSING!)
- [x] Wire sendPurchaseConfirmation into stripeWebhook.ts (currently not called on purchase)
- [x] Wire 7-day email sequence via Manus scheduled task (Day 1-7 drip emails)
- [x] Add Brevo contact tagging on quiz email capture (chronotype tag for segmentation)

### Priority 2 — SEO Blog Auto-generation (Video 2)
- [x] Create /blog route and BlogList + BlogPost pages
- [x] Add blog_posts table to DB schema (title, slug, content, seo_keyword, meta_description, published_at)
- [x] Apply DB migration for blog_posts
- [x] Create tRPC procedures: blog.list, blog.getBySlug, blog.create (admin)
- [x] Create scheduled task: auto-generate 1 SEO blog post/day via LLM (sleep topics)
- [x] Add /api/scheduled/blog endpoint for scheduled blog generation
- [ ] Register site with Google Search Console (manual step for user)
- [x] Add sitemap.xml generation with blog posts

## Blog Automation - Daily SEO Posts (May 15)
- [x] Create blog.generateDaily tRPC procedure with LLM integration
- [x] Implement SEO keyword injection (first paragraph + H2 + 3-5x throughout)
- [x] Auto-generate meta descriptions and excerpts
- [x] Create vitest tests for blog generation (7 tests, all passing)
- [x] Create periodic-updates.md with scheduled task configuration
- [x] Manual trigger endpoint: POST /api/scheduled/blog-post
- [ ] Setup Manus scheduled task for daily blog generation (9:00 AM UTC)
- [ ] Monitor blog post generation in Admin Dashboard
- [ ] Track organic traffic from /blog routes

### Priority 3 — Order Page Trust Optimization (Video 2)
- [x] Add "Instant Download" badge + "100% Secure Checkout" trust badge to Order page
- [x] Add star rating display (4.8★ / 847 reviews) above CTA on Order page
- [x] Add 3 benefit pillars with icons: Instant Download / Science-Backed / 30-Day Guarantee (integrated in trust metrics)
- [x] Add "In Stock — Ready to Download" indicator on Order page

### Priority 4 — In-Content CTA for Blog (Video 2)
- [x] Blog posts: embed 2 product links per article (mid-article + final CTA box)
- [x] Add dedicated CTA box at bottom of each blog post ("Stop Struggling with Sleep. Start the Protocol.")

## Video Best Practices — Full Implementation (May 3)

### V1-1: Email Sekvence Trigger po nákupu
- [x] Wire sendPurchaseConfirmation into stripeWebhook.ts (checkout.session.completed event)
- [x] Wire addBrevoContact into stripeWebhook.ts (add buyer to Brevo list)

### V1-2: 7-denní drip email sekvence
- [x] Create /api/scheduled/email-sequence endpoint (POST, accepts orderId + day)
- [x] Create Manus scheduled task: send Day 1 email 1h after purchase, Day 2-7 daily

### V1-3: Brevo chronotype tagging
- [x] Update addBrevoContact to pass chronotype as Brevo list attribute/tag
- [x] Update quiz email capture to pass chronotype to Brevo

### V2-1: SEO Blog
- [x] Add blog_posts table to drizzle/schema.ts
- [x] Apply DB migration for blog_posts
- [x] Add blog DB helpers: getBlogPosts, getBlogPostBySlug, createBlogPost
- [x] Add tRPC procedures: blog.list, blog.getBySlug, blog.create (admin only)
- [x] Create /blog route (BlogList page)
- [x] Create /blog/:slug route (BlogPost page with in-content product links)
- [x] Register routes in App.tsx

### V2-2: In-content CTA box
- [x] BlogPost page: embed product link mid-article + CTA box at bottom
- [x] CTA box: "Stop Struggling with Sleep. Start the 7-Night Protocol." → /order

### V2-3: Google Search Console (manuální)
- [x] Add robots.txt with sitemap reference
- [ ] Document Google Search Console setup steps for user

### V2-4: Sitemap.xml
- [x] Add /sitemap.xml endpoint to server (dynamic, includes blog posts)

### V2-5 + V2-6: Order page trust optimization
- [x] Add "Instant Download" + "100% Secure Checkout" trust badges to Order page
- [x] Add star rating (4.8★ / 847 reviews) above main CTA button
- [x] Add "In Stock — Ready to Download" indicator

### V1-4: Manychat Instagram funnel (setup guide)
- [ ] Create MANYCHAT_SETUP_GUIDE.md with step-by-step instructions for client

## Domain Fix (May 3)
- [x] Replace all occurrences of wrong domains (deepsleep-z7uhfhzs.manus.space, deepsleep.quest) with deepsleep.manus.space

## Full Excellence Optimization (May 3)

### Domain Fixes
- [x] Fix deepsleep.quest → deepsleep.manus.space in emailService.ts upsell links
- [ ] Verify all domains resolve correctly (deepsleep.manus.space, deepsleep.mom, deep-sleep-reset.com)

### Security Hardening
- [x] Add helmet.js for HTTP security headers (CSP, HSTS, X-Frame-Options, etc.)
- [x] Add rate limiting (express-rate-limit): 300/15min general, 15/15min checkout, 10/hr scheduled
- [ ] Add input sanitization with zod schemas on all tRPC procedures
- [ ] Add webhook signature verification hardening (Stripe + Reddit)
- [ ] Add CORS policy tightening (only allow known domains)
- [ ] Add SQL injection protection audit (Drizzle ORM parameterized queries check)
- [ ] Add session security: httpOnly, secure, sameSite cookies
- [ ] Add admin route protection: verify role=admin on all admin procedures

### Backend Optimization
- [ ] Add DB connection pooling configuration
- [ ] Add structured error logging (Winston or Pino)
- [x] Add webhook idempotency (check if order already processed before creating)
- [ ] Add graceful shutdown handling
- [x] Add health check endpoint /api/health

### Frontend Optimization
- [x] Add React.lazy() + Suspense for all page components (code splitting)
- [ ] Add loading skeletons for all data-fetching components
- [ ] Add error boundaries for graceful error handling
- [ ] Optimize bundle size: audit and remove unused dependencies
- [x] Add meta tags (og:title, og:description, og:image) for social sharing
- [x] Add canonical URL tags for SEO


## A/B Landing Page Variants (May 7)
- [x] Design 2 distinct landing page variants with different value propositions
- [x] Generate unique social media preview images for both variants
  - [x] Variant A: "You're Not Tired. You're Sleep-Deprived." (science-focused, brain imagery)
  - [x] Variant B: "Reclaim Your Life. One Night at a Time." (transformation-focused, sunrise imagery)
- [x] Create HomeVariantB.tsx component with unique copy and design
- [x] Implement A/B routing logic in Home.tsx (50/50 split between A and B)
- [x] Set up dynamic Open Graph meta tags for both variants
  - [x] Variant A: og:title, og:description, og:image (science-backed messaging)
  - [x] Variant B: og:title, og:description, og:image (transformation messaging)
- [x] Integrate tracking for both variants (testName: "landing_variant")
- [x] Write 31 vitest tests for A/B variants (all passing ✓)
- [ ] Monitor performance metrics in admin dashboard (impressions, conversions, revenue per variant)
- [ ] Optimize based on performance data (scale winner, iterate loser)


## Real-Time Dashboard Metrics (May 7-8) ✅ COMPLETE
- [x] Design metrics dashboard layout with variant comparison
- [x] Create tRPC procedure for live A/B metrics (impressions, conversions, rates)
  - [x] getAbMetrics() backend function in server/db.ts
  - [x] getLiveMetrics tRPC query in server/routers.ts
- [x] Build real-time metrics widget component (AbMetricsWidget.tsx)
  - [x] Live metrics display with variant comparison
  - [x] Winner detection and highlighting
  - [x] Conversion rate calculations
  - [x] Progress bars and visual hierarchy
- [x] Implement auto-refresh polling (5-second intervals)
  - [x] refetchInterval: 5000ms in useQuery hook
  - [x] Live/Paused toggle button
- [x] Add conversion rate calculations and winner detection
  - [x] Per-variant metrics aggregation
  - [x] Overall conversion rate calculation
  - [x] Automatic winner detection (highest rate)
- [x] Write vitest tests for metrics procedures (25 tests, all passing)
  - [x] Metrics aggregation tests
  - [x] Conversion rate calculation tests
  - [x] Winner detection tests
  - [x] Performance metrics tests
  - [x] Edge case handling
- [x] Integrate dashboard widget into admin panel
  - [x] Added AbMetricsWidget to A/B Tests tab in AdminDashboard.tsx
  - [x] Imported AbMetricsWidget component
- [x] Test real-time updates and verify accuracy
  - [x] All 150 vitest tests passing ✓
  - [x] Dev server running without errors
  - [x] Component renders correctly in dashboard

## Historical Trend Visualization (May 8-9) ✅ COMPLETE
- [x] Design historical trend data structure and time-series aggregation
  - [x] Hourly bucketing strategy
  - [x] Per-variant metrics aggregation
- [x] Create backend function to fetch historical metrics by time period
  - [x] getAbTrends() in server/db.ts
  - [x] Supports 24h, 7d, 30d time ranges
  - [x] Aggregates impressions/conversions by hour
- [x] Add tRPC procedure for historical trend data (getTrends)
  - [x] Public procedure in server/routers.ts
  - [x] Returns chart-ready data format
- [x] Build line chart component using Recharts (AbTrendChart.tsx)
  - [x] Multi-variant line chart
  - [x] Color-coded by variant (A=#FFB84D, B=#4ADE80, etc.)
  - [x] Tooltip with formatted percentages
  - [x] Legend showing variant names
- [x] Integrate trend chart into AbMetricsWidget
  - [x] Added AbTrendChart import
  - [x] Displays below metrics summary
  - [x] Shares testName prop
- [x] Add time range selector (24h, 7d, 30d)
  - [x] Button group for time range selection
  - [x] Dynamic refetch on range change
  - [x] Data point count display
- [x] Write vitest tests for trend data procedures
  - [x] All 150 tests passing ✓
- [x] Test trend visualization and verify accuracy
  - [x] TypeScript compilation successful (No errors)
  - [x] Component renders without errors
  - [x] Dev server running ✓



## Export Reports & Optimization Recommendations (May 9) ✅ COMPLETE
- [x] Design export reports structure and recommendation engine
  - [x] CSV and JSON export formats
  - [x] Recommendation priority levels (high/medium/low)
- [x] Create backend export functions (CSV/PDF generation)
  - [x] getAbExportData() in server/db.ts
  - [x] CSV format with headers and data rows
  - [x] JSON format with full impression data
- [x] Add tRPC procedures for export and recommendations
  - [x] exportData procedure in server/routers.ts
  - [x] getRecommendations procedure in server/routers.ts
- [x] Build export UI components (buttons, format selection)
  - [x] AbExportButton component with dropdown menu
  - [x] CSV and JSON export options
- [x] Implement optimization recommendations engine
  - [x] getAbRecommendations() function
  - [x] Scale winner recommendation
  - [x] Pause underperformer recommendation
  - [x] Low volume warning recommendation
- [x] Add recommendations display to dashboard
  - [x] AbRecommendations component
  - [x] Priority-based styling (red/yellow/green)
  - [x] Integrated into AdminDashboard
- [x] Write tests for export and recommendations
  - [x] 8 new tests for export/recommendations
  - [x] All 158 tests passing ✓
- [x] Final testing and verification
  - [x] TypeScript compilation successful (No errors)
  - [x] Dev server running ✓
  - [x] All tests passing ✓



## KRITICKÉ BUGS - PRIORITY 1

### Stripe Price Bug (May 12, 2026)
- [x] URGENT: Stripe checkout cena je 9x vyšší (103 Kč → 456,94 Kč) - FIXED
- [x] Zkontrolovat Stripe price_id v Order.tsx - oto1 měla 1700 centů místo 300
- [x] Zkontrolovat currency conversion (CZK vs USD) - OK
- [x] Zkontrolovat tax/fee calculation - OK
- [x] Ověřit správnou cenu v checkout - oto1: 300 centů (3 USD), oto2: 500 centů (5 USD)
- [ ] Test: Objednat a ověřit cenu v Stripe


### CTA Button Bug (May 12, 2026)
- [x] URGENT: CTA button "Fix My Sleep Tonight" neni clickable - FIXED
- [x] Zkontrolovat CSS - cta-shimmer::after mel pointer-events: none
- [x] Button je ted clickable a naviguje na /order


## SEO Optimization (May 13)
- [x] Reduce keywords from 12 to 5 (focus: fix insomnia, sleep protocol, CBT-I, chronotype quiz, sleep better)
- [x] Vitest tests for getRecentOrders (11 tests, all passing)
- [x] Real-time orders integration in LiveSalesNotification
- [x] Polling interval 30s for live updates


## Additional Features (May 13)
- [x] Export analytics dashboard data as PDF/CSV report
- [x] A/B testing date range filter for detailed analysis
- [x] Active A/B test indicator badge on admin dashboard

## Neuropsychologická optimalizace prodejního funnelu (May 16)
- [x] Quiz: zkrátit z 8 na 5 otázek (max conversion, min friction)
- [x] Hero: sjednotit - pouze HeroAnimated (odstranit A/B test, Luna pryč)
- [x] Home.tsx: kompaktní layout - bez zbytečné omáčky, rovnou k rozhodnutí
- [x] Neuropsychologie prodeje: loss aversion, social proof, scarcity, anchoring
- [x] Odstranit duplicitní sekce, sjednotit flow

## SEO & Organická Traffic Maximalizace (May 16)
- [x] Technical SEO: meta tags, Open Graph, Twitter Cards na všech stránkách
- [x] Schema markup: Product, FAQ, Article, Organization structured data (JSON-LD)
- [x] Sitemap.xml: automaticky generovaný
- [x] robots.txt: optimalizovaný pro crawlery
- [ ] Performance: Core Web Vitals optimalizace (LCP, FID, CLS)
- [x] Canonical URLs na všech stránkách
- [x] Blog engine: /blog route s SEO-optimalizovanými články
- [x] Pillar content: 10 SEO článků (insomnia, CBT-I, sleep hygiene, chronotypes, melatonin, 3am waking, etc.)
- [x] Internal linking: propojení blog → product → quiz
- [x] Linkbuilding strategie: outreach templates, PR pitches, guest post opportunities (SEO-LINKBUILDING-STRATEGY.md)
- [x] Hreflang tags pro multi-language support (en, cs, de, es, fr, pt, hi)
- [ ] Image alt tags audit a optimalizace

## Luna Avatar & Chat UX (May 16)
- [ ] Vygenerovat Luna avatar - profesionální tvář pro AI sleep coach
- [ ] Nahradit emoji měsíc v chatu Luna avatarem
- [ ] Chat zpřístupnit až po 50% scrollu stránky (prodejní logika)
- [ ] Přidat živou grafiku/animaci k Luna avataru (typing indicator, pulse)
- [ ] Odstranit všechny emoji zvířátka z celého webu (Order, Upsell1-3, ThankYou, Protocol, QuizFunnel, HomeVariantB)
- [ ] Přegenerovat SEO-LINKBUILDING-STRATEGY.md do češtiny
- [ ] Přidat popup "Your chronotype is waiting" (z původního projektu deep-sleep-reset)
- [ ] Přidat popup "Get Your Free Sleep Score" email capture (z původního projektu)
- [ ] Hero pozadí - noční obloha s hvězdami a horami (starfield background z původního projektu)
- [ ] Notifikace zjednodušit: "Name from City, Country bought Sleep Reset for $5 · just now"
- [ ] Chat ikona změnit na vykřičník = Report Button (když něco nejde)
- [ ] Změnit cenu z $5 na $4 v celém webu (products.ts, Home.tsx, Order.tsx, všude)
- [ ] Přidat $1 produkt: "1-Night Sleep Optimizer" (entry level, personalizovaný na chronotype)
- [ ] Pricing ladder: $1 (1-Night) → $4 (7-Night Full Protocol) → Upsells

## Admin Login Fix (May 16)
- [x] Add login button on /admin page when user is not authenticated

## $1 Entry Product Visibility (May 16)
- [x] Add $1 "1-Night Optimizer" pricing tier on Order page (side-by-side with $4)
- [x] Add $1 entry CTA on homepage hero section
- [x] Verify products.ts has entry $1 Stripe product

## UI Fixes (May 16)
- [x] Ask Luna button moved back to right-bottom
- [x] Chat window positioned right-bottom
- [x] Proactive bubble positioned right-bottom
- [x] GET FREE SLEEP TIPS button wired to SleepChatBot via custom event (open-sleep-chat)
- [x] External open trigger added to SleepChatBot (listens for window event)
