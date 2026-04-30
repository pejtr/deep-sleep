import { Moon, ArrowLeft, Shield, Clock, Mail, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen pb-16" style={{ background: "oklch(0.07 0.025 255)" }}>
      <div className="orb orb-gold w-96 h-96 opacity-10" style={{ top: "-10%", left: "-10%" }} />

      {/* Header */}
      <div className="relative z-10 container py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Moon className="w-5 h-5" style={{ color: "oklch(0.82 0.16 65)" }} />
          <span className="font-display font-bold text-base" style={{ color: "oklch(0.82 0.16 65)" }}>
            Deep Sleep Reset
          </span>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
          style={{ color: "oklch(0.55 0.04 265)" }}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="relative z-10 container max-w-3xl mx-auto py-10">
        <div className="glass-card rounded-3xl p-8 md:p-12">
          <h1 className="font-display font-black text-3xl md:text-4xl mb-2" style={{ color: "oklch(0.95 0.01 265)" }}>
            Refund &amp; Return Policy
          </h1>
          <p className="text-sm mb-8" style={{ color: "oklch(0.45 0.04 265)" }}>Last updated: April 30, 2026</p>

          {/* Guarantee Badge */}
          <div className="flex items-center gap-4 p-5 rounded-2xl mb-10" style={{ background: "oklch(0.15 0.04 130 / 0.3)", border: "1px solid oklch(0.45 0.12 130 / 0.3)" }}>
            <Shield className="w-10 h-10 flex-shrink-0" style={{ color: "oklch(0.72 0.16 130)" }} />
            <div>
              <p className="font-bold text-base" style={{ color: "oklch(0.85 0.08 130)" }}>30-Day Money-Back Guarantee</p>
              <p className="text-sm" style={{ color: "oklch(0.60 0.04 265)" }}>
                We stand behind our products. If you are not satisfied for any reason, we will refund your purchase — no questions asked.
              </p>
            </div>
          </div>

          {[
            {
              title: "1. Our Commitment",
              body: `At Deep Sleep Reset, your satisfaction is our priority. We are confident that our sleep protocols will help you achieve better sleep. However, if for any reason you are not satisfied with your purchase, we offer a straightforward refund process.`
            },
            {
              title: "2. One-Time Purchases (Digital Products)",
              body: `All one-time digital product purchases — including the 7-Night Deep Sleep Reset ($5), 30-Day Sleep Transformation ($17), and Deep Sleep Toolkit ($27) — are covered by our 30-day money-back guarantee. If you are not satisfied with your purchase for any reason, simply contact us within 30 days of the purchase date and we will issue a full refund. No questions asked. No forms to fill out. No hoops to jump through.`
            },
            {
              title: "3. Subscription Products",
              body: `The Sleep Optimizer Membership ($8/month) can be cancelled at any time. When you cancel, you will retain access until the end of your current billing period. No refunds are issued for partial months of subscription service. If you cancel within the first 30 days of your initial subscription, we will issue a full refund of the first month's payment.`
            },
            {
              title: "4. How to Request a Refund",
              body: `To request a refund, simply send an email to support@deep-sleep-reset.com with the subject line "Refund Request" and include: your name, the email address used for the purchase, and the date of purchase. That is all we need. We do not require you to explain why, return any materials, or fill out any forms.`
            },
            {
              title: "5. Refund Processing",
              body: `Once we receive your refund request, we will process it within 2 business days. The refund will be issued to the original payment method (credit card, debit card, Apple Pay, Google Pay, etc.) used for the purchase. Depending on your bank or card issuer, the refund may take 5-10 business days to appear on your statement. All refunds are processed through Stripe, our payment processor.`
            },
            {
              title: "6. EU Consumer Rights",
              body: `If you are a consumer in the European Union, you have the right to withdraw from a purchase within 14 days under the EU Consumer Rights Directive. For digital products, by completing a purchase you consent to immediate delivery and acknowledge that you waive your 14-day withdrawal right. However, our 30-day money-back guarantee exceeds this statutory requirement, so you are always covered.`
            },
            {
              title: "7. Chargebacks",
              body: `We kindly ask that you contact us directly at support@deep-sleep-reset.com before initiating a chargeback with your bank or credit card company. We process all legitimate refund requests quickly and without hassle. Chargebacks incur processing fees and may delay the resolution of your request.`
            },
            {
              title: "8. Contact",
              body: `For refund requests or questions about this policy, contact us at: support@deep-sleep-reset.com. Business: Petr Matěj, IČO: 02558220, Mládeže 12, Prague 6, 169 00, Czech Republic. We typically respond within 24 hours on business days.`
            },
          ].map((section, i) => (
            <div key={i} className="mb-7">
              <h2 className="font-bold text-lg mb-2" style={{ color: "oklch(0.82 0.16 65)" }}>{section.title}</h2>
              <p className="text-sm leading-relaxed" style={{ color: "oklch(0.60 0.04 265)" }}>{section.body}</p>
            </div>
          ))}

          {/* Quick Reference Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
            <div className="p-4 rounded-xl text-center" style={{ background: "oklch(0.12 0.02 265 / 0.5)" }}>
              <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: "oklch(0.82 0.16 65)" }} />
              <p className="font-bold text-sm" style={{ color: "oklch(0.85 0.02 265)" }}>30-Day Window</p>
              <p className="text-xs mt-1" style={{ color: "oklch(0.50 0.04 265)" }}>Full refund within 30 days of purchase</p>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ background: "oklch(0.12 0.02 265 / 0.5)" }}>
              <Mail className="w-6 h-6 mx-auto mb-2" style={{ color: "oklch(0.82 0.16 65)" }} />
              <p className="font-bold text-sm" style={{ color: "oklch(0.85 0.02 265)" }}>Easy Process</p>
              <p className="text-xs mt-1" style={{ color: "oklch(0.50 0.04 265)" }}>Just email us — no forms or explanations needed</p>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ background: "oklch(0.12 0.02 265 / 0.5)" }}>
              <CreditCard className="w-6 h-6 mx-auto mb-2" style={{ color: "oklch(0.82 0.16 65)" }} />
              <p className="font-bold text-sm" style={{ color: "oklch(0.85 0.02 265)" }}>Fast Refund</p>
              <p className="text-xs mt-1" style={{ color: "oklch(0.50 0.04 265)" }}>Processed within 2 business days via Stripe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
