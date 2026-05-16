import { Moon, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          <p className="text-sm mb-8" style={{ color: "oklch(0.45 0.04 265)" }}>Last updated: April 30, 2026</p>

          {[
            {
              title: "1. Service Provider",
              body: `Deep Sleep Reset is operated by Petr Matěj, a sole proprietor (OSVČ) registered under Czech law. Business identification number (IČO): 02558220. Registered address: Mládeže 12, Prague 6, 169 00, Czech Republic. Contact: support@deep-sleep-reset.com.`
            },
            {
              title: "2. Acceptance of Terms",
              body: `By accessing or using Deep Sleep Reset ("the Service") at www.deep-sleep-reset.com, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. These terms apply to all visitors, users, and customers.`
            },
            {
              title: "3. Products and Digital Delivery",
              body: `Deep Sleep Reset sells digital products including sleep protocols, audio guides, and related materials. Our product lineup includes: 7-Night Deep Sleep Reset ($4), 30-Day Sleep Transformation ($17), Deep Sleep Toolkit ($27), and Sleep Optimizer Membership ($8/month subscription). Upon successful payment through Stripe, you will receive immediate access to your purchased digital products. Digital products are delivered electronically via our website and email.`
            },
            {
              title: "4. Payments and Billing",
              body: `All payments are processed securely through Stripe, Inc. We accept major credit and debit cards, Apple Pay, Google Pay, and Stripe Link. Prices are displayed in USD by default and may be shown in your local currency based on your location. For subscription products ($8/month Sleep Optimizer Membership), your card will be charged automatically each month until you cancel. You may cancel your subscription at any time through your account or by contacting support@deep-sleep-reset.com.`
            },
            {
              title: "5. Refund Policy",
              body: `We offer a 30-day money-back guarantee on all one-time purchases. If you are not satisfied with your purchase for any reason, contact us at support@deep-sleep-reset.com within 30 days of purchase. We will issue a full refund with no questions asked. Refunds are processed within 5-10 business days to the original payment method. For subscription products, you may cancel at any time and will not be charged for the next billing period. No refunds are issued for partial months of subscription service. See our full Refund Policy at /refund for more details.`
            },
            {
              title: "6. Intellectual Property",
              body: `All content, including but not limited to text, graphics, logos, audio files, and digital protocols, is the exclusive property of Deep Sleep Reset / Petr Matěj and is protected by copyright law. You may not reproduce, distribute, modify, or create derivative works without our express written permission. Your purchase grants you a personal, non-transferable license to use the purchased materials for your own personal use only.`
            },
            {
              title: "7. Medical Disclaimer",
              body: `The information provided in our products is for educational purposes only and is not intended as medical advice. Our sleep protocols are based on Cognitive Behavioral Therapy for Insomnia (CBT-I) principles and general sleep science. They are not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before starting any new sleep program, especially if you have a medical condition. Deep Sleep Reset does not diagnose, treat, cure, or prevent any disease or medical condition.`
            },
            {
              title: "8. Limitation of Liability",
              body: `To the maximum extent permitted by law, Deep Sleep Reset / Petr Matěj shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services or products. Our total liability for any claim shall not exceed the amount you paid for the specific product giving rise to the claim.`
            },
            {
              title: "9. User Conduct",
              body: `You agree not to: use our services for any unlawful purpose; share purchased materials with others without authorization; attempt to reverse-engineer or copy our proprietary content; use automated systems to access our services; or engage in any activity that could harm our business or other users.`
            },
            {
              title: "10. Affiliate Program",
              body: `We offer an affiliate program that allows you to earn commissions by referring customers to our products. Affiliate terms are governed by a separate Affiliate Agreement. Commissions are paid on verified sales only. We reserve the right to modify or terminate the affiliate program at any time.`
            },
            {
              title: "11. Governing Law",
              body: `These Terms of Service shall be governed by and construed in accordance with the laws of the Czech Republic. Any disputes arising from these terms shall be resolved by the competent courts of the Czech Republic. For EU consumers: you retain the right to bring proceedings in your country of residence in accordance with applicable EU consumer protection regulations.`
            },
            {
              title: "12. EU Consumer Rights",
              body: `If you are a consumer in the European Union, you have the right to withdraw from a purchase of digital content within 14 days of purchase, unless you have explicitly consented to the immediate delivery of digital content and acknowledged that you thereby waive your right of withdrawal. By completing a purchase on our website, you consent to immediate delivery and acknowledge the waiver of your withdrawal right for digital products.`
            },
            {
              title: "13. Changes to Terms",
              body: `We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated terms on our website with a new "Last updated" date. Your continued use of our services after changes constitutes acceptance of the new terms.`
            },
            {
              title: "14. Contact",
              body: `For questions about these Terms, contact us at support@deep-sleep-reset.com or write to: Petr Matěj, Mládeže 12, Prague 6, 169 00, Czech Republic.`
            },
          ].map((section, i) => (
            <div key={i} className="mb-7">
              <h2 className="font-bold text-lg mb-2" style={{ color: "oklch(0.82 0.16 65)" }}>{section.title}</h2>
              <p className="text-sm leading-relaxed" style={{ color: "oklch(0.60 0.04 265)" }}>{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
