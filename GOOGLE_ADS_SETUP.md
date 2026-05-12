# Google Search Ads Setup Guide

## Objective
Create a new Google Search campaign targeting `www.deep-sleep-reset.com` domain to drive qualified traffic and increase conversions by 20-30%.

## Campaign Details

### Campaign Name
`Deep Sleep Reset - Search (www.deep-sleep-reset.com) - May 2026`

### Keywords to Target
- Primary: "insomnia solution", "sleep protocol", "deep sleep", "sleep deprivation", "CBT insomnia"
- Secondary: "natural sleep aid", "sleep without pills", "7 night sleep protocol"
- Branded: "deep sleep reset", "deepsleep protocol"

### Ad Copy
**Headline 1:** Fix Insomnia in 7 Nights — Science-Backed Protocol
**Headline 2:** No Pills. No Supplements. Proven Results.
**Headline 3:** 80% Success Rate — Join 10,000+ Transformed Lives

**Description 1:** The #1 clinician-recommended insomnia treatment. Transform your sleep in 7 nights.
**Description 2:** Instant digital access. 30-day money-back guarantee. Start tonight.

### Landing Page
`https://www.deep-sleep-reset.com/` (primary marketing domain)

### Budget
- Daily budget: $50-100 USD
- Monthly budget: $1,500-3,000 USD
- Bid strategy: Target CPA ($25-40 per conversion)

### Conversion Tracking
- Event: `purchase` (Stripe webhook integration)
- Value: $5 USD (main product price)
- Conversion window: 30 days

## Setup Steps

### 1. Google Ads Account Setup
- [ ] Create/access Google Ads account
- [ ] Link to Google Analytics 4
- [ ] Set up conversion tracking (Stripe webhook)
- [ ] Verify domain ownership

### 2. Campaign Creation
- [ ] Create new Search campaign
- [ ] Set campaign name: `Deep Sleep Reset - Search (www.deep-sleep-reset.com) - May 2026`
- [ ] Set daily budget: $50 USD
- [ ] Select location targeting: All countries (or specific: US, UK, CA, AU, EU)
- [ ] Set language: English

### 3. Ad Group Setup
- [ ] Create ad group: "Insomnia Solution"
- [ ] Add keywords (see above)
- [ ] Create responsive search ads (3 headlines + 2 descriptions)
- [ ] Set landing page: `https://www.deep-sleep-reset.com/`

### 4. Conversion Tracking
- [ ] Set up conversion action in Google Ads
- [ ] Link Stripe webhook to Google Conversion API
- [ ] Test conversion tracking with test purchase

### 5. Monitoring
- [ ] Monitor daily spend and conversions
- [ ] Adjust bids based on performance
- [ ] Pause low-performing keywords
- [ ] Scale budget if ROAS > 3:1

## Expected Performance
- CTR: 3-5%
- CPC: $2-5 USD
- Conversion rate: 2-5%
- ROAS: 2-4x

## Timeline
- Setup: 1-2 hours
- Warm-up period: 7-14 days
- Full optimization: 30 days
- Scale budget: After 30 days with positive ROAS

## Notes
- Use UTM parameters: `?utm_source=google&utm_medium=cpc&utm_campaign=search_deepsleep_reset`
- Primary domain: `www.deep-sleep-reset.com` (all marketing campaigns)
- System domain: `deepsleep.manus.space` (internal testing/integration only)
- Monitor competitor bidding (Gumroad, other sleep apps)
- A/B test ad copy monthly
