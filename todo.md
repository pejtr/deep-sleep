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

## Advanced Analytics & AI Optimization (Apr 23)
- [ ] Fix feedbacks DB migration (apply SQL to DB)
- [ ] Fix language switcher dropdown (position:fixed, solid background)
- [ ] Extend behavior tracking: scroll depth, time on page, rage clicks, exit intent, UTM params, device type
- [ ] Add ai_insights table to DB for storing nightly optimization results
- [ ] Proactive Luna chatbot: 60s trigger, exit intent popup, feedback collection, suggestions
- [ ] Luna admin mode: access to stats, insights, campaign data
- [ ] Midnight cron job: analyze behavior data, generate AI recommendations, notify admin
- [ ] Master Admin Dashboard: all data synthesis, funnel visualization, AI insights panel, heatmap
- [ ] CSV export of feedback in admin
- [ ] Real-time notifications for new orders and high-value feedback

## UI Fixes (User Requests)
- [ ] Sticky bar: přidat Quiz tlačítko do prázdného prostoru
- [ ] Pomalejší smooth scroll na celém webu
- [ ] Luna Affiliate mód na /affiliates stránce (ne ADMIN mód)
- [ ] Email kontaktní formulář směrovat na petr.matej@gmail.com
- [ ] Zjistit možnost emailu na deepsleep.quest doméně
- [x] Gumroad URL: pevná cena $5 (opraveno z ?price=500 na ?price=5 — Gumroad zobrazuje v dolarech, ne centech)
- [ ] Luna ADMIN mód: zobrazovat POUZE na /admin stránce, na landing page vždy prodejní persona
- [ ] Personalizované chatbot persony: Luna (empatická), Petra (vědecká), Lucie (přímá) — random výběr per session
- [ ] Admin Dashboard: kruhové grafy (device, language, funnel)
- [ ] Admin Dashboard: sloupcové grafy (revenue/day, events/day)
- [ ] Admin Dashboard: porovnávací grafy (conversion rate over time)
- [ ] Admin Dashboard: časové filtry (dnes, 7d, 30d, vše)
- [ ] Admin Dashboard: AI insights panel s tlačítkem "Apply" pro každé doporučení
- [ ] Admin Dashboard: možnost potvrdit/aplikovat AI doporučení (uloží do DB jako applied=true)

## Reddit Ads API Integration
- [ ] Uložit REDDIT_ADS_CLIENT_ID a REDDIT_ADS_CLIENT_SECRET jako secrets
- [ ] Implementovat OAuth2 token flow (script type - username/password grant)
- [ ] tRPC procedure: reddit.getCampaigns - seznam kampaní
- [ ] tRPC procedure: reddit.getReports - impressions, clicks, CTR, spend
- [ ] Admin Dashboard: Reddit Ads tab s grafy a live daty
- [ ] Auto-refresh každých 30 minut

## TikTok Ads Integration (Apr 23)
- [ ] TikTok Ads API backend (OAuth2 client credentials + campaigns + spend report)
- [ ] TikTok Ads tRPC endpoints (account, campaigns, report, campaignPerformance)
- [ ] TikTok Ads tab v AdminDashboard s KPI kartami a grafy
- [ ] TikTok data v admin Luně (system prompt + adminData payload)
- [ ] Vitest testy pro TikTok Ads API
- [ ] Uložit TikTok Ads credentials jako secrets (TIKTOK_ADS_APP_ID, TIKTOK_ADS_SECRET, TIKTOK_ADS_ACCESS_TOKEN, TIKTOK_ADS_ADVERTISER_ID)

## Currency Switcher (Apr 23)
- [ ] Backend tRPC endpoint: currency.getRates — live kurzy z exchangerate API
- [ ] Backend: geo-detekce měny podle Accept-Language / IP
- [ ] Frontend CurrencyContext + useCurrency hook
- [ ] CurrencySwitcher komponenta (dropdown vedle language switcheru)
- [ ] Integrace do Home.tsx CTA tlačítek — zobrazit cenu v lokální měně
- [ ] Integrace do Order.tsx, FloatingSocialProofBar.tsx, sticky bar
- [ ] Podporované měny: USD, EUR, GBP, CZK, CAD, AUD, PLN, HUF, RON, INR, BRL, MXN
- [ ] Auto-detekce měny při prvním načtení (podle jazyka/IP)
- [ ] Vitest test pro currency endpoint

## Nativní Stripe Checkout (Apr 23)
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
- [ ] AI Optimization suggestions — Apply tlačítko funkční (aktuálně placeholder)
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
