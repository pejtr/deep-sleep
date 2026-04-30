import { Moon, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pb-16" style={{ background: "oklch(0.07 0.025 255)" }}>
      <div className="orb orb-blue w-96 h-96 opacity-10" style={{ top: "-10%", right: "-10%" }} />

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
            Privacy Policy
          </h1>
          <p className="text-sm mb-8" style={{ color: "oklch(0.45 0.04 265)" }}>Last updated: April 30, 2026</p>

          {[
            {
              title: "1. Data Controller",
              body: `The data controller for your personal data is Petr Matěj (IČO: 02558220), operating as Deep Sleep Reset, with registered address at Mládeže 12, Prague 6, 169 00, Czech Republic. Contact: support@deep-sleep-reset.com.`
            },
            {
              title: "2. Information We Collect",
              body: `We collect information you provide directly to us, such as your email address when you make a purchase, take our sleep quiz, or sign up for updates. When you make a purchase, Stripe (our payment processor) collects your payment information — we never store your full card number, CVV, or card expiration date on our servers. We also automatically collect certain information about your device and how you interact with our website, including IP address, browser type, pages visited, time spent on pages, and referring URL. We use cookies and similar tracking technologies to enhance your experience and analyze website traffic.`
            },
            {
              title: "3. Legal Basis for Processing (GDPR)",
              body: `We process your personal data on the following legal bases: (a) Contract performance — to deliver purchased products and services; (b) Legitimate interest — to improve our website, prevent fraud, and send relevant communications; (c) Consent — for marketing emails and non-essential cookies (you can withdraw consent at any time); (d) Legal obligation — to comply with tax, accounting, and other legal requirements.`
            },
            {
              title: "4. How We Use Your Information",
              body: `We use the information we collect to: process your orders and deliver your purchased digital products; send you transactional emails (order confirmations, download links, subscription updates); send you marketing communications if you have opted in; improve our website, products, and user experience; analyze usage patterns to optimize our service; detect and prevent fraud; and comply with legal obligations.`
            },
            {
              title: "5. Information Sharing",
              body: `We may share your information with the following trusted third-party service providers: Stripe, Inc. (payment processing — subject to Stripe's Privacy Policy at stripe.com/privacy); Brevo (email delivery and marketing automation); Google Analytics (website analytics); Reddit Ads and other advertising platforms (conversion tracking with anonymized data). These parties are obligated to keep your information confidential and use it only for the purposes we specify. We do not sell your personal information to third parties.`
            },
            {
              title: "6. International Data Transfers",
              body: `Your data may be transferred to and processed in countries outside the European Economic Area (EEA), including the United States (where Stripe and other service providers operate). Such transfers are protected by Standard Contractual Clauses (SCCs) approved by the European Commission, or other appropriate safeguards as required by GDPR.`
            },
            {
              title: "7. Data Retention",
              body: `We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Purchase records and invoices are retained for 10 years for accounting and tax purposes as required by Czech law. Email addresses are retained until you unsubscribe or request deletion. Quiz results and behavioral data are retained for up to 2 years for analytics purposes.`
            },
            {
              title: "8. Your Rights (GDPR)",
              body: `Under the General Data Protection Regulation, you have the right to: access your personal data; rectify inaccurate data; erase your data ("right to be forgotten"); restrict processing; data portability; object to processing based on legitimate interest; withdraw consent at any time; and lodge a complaint with a supervisory authority (in the Czech Republic: Úřad pro ochranu osobních údajů, www.uoou.cz). To exercise your rights, contact us at support@deep-sleep-reset.com. We will respond within 30 days.`
            },
            {
              title: "9. Cookies",
              body: `We use the following types of cookies: Essential cookies — required for website functionality and payment processing; Analytics cookies — Google Analytics to understand how visitors use our site; Advertising cookies — Reddit Pixel and similar tools for conversion tracking and retargeting. You can control cookie settings through your browser preferences. Disabling essential cookies may affect some functionality of our website.`
            },
            {
              title: "10. Security",
              body: `We implement industry-standard security measures to protect your personal information, including: SSL/TLS encryption for all data transmission; PCI-DSS compliant payment processing through Stripe; secure server infrastructure; regular security updates. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`
            },
            {
              title: "11. Children's Privacy",
              body: `Our services are not directed to children under 16 years of age. We do not knowingly collect personal information from children under 16. If you believe we have inadvertently collected such information, please contact us immediately and we will delete it.`
            },
            {
              title: "12. Changes to This Policy",
              body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date. Your continued use of our services after changes constitutes acceptance of the updated policy.`
            },
            {
              title: "13. Contact Us",
              body: `If you have questions about this Privacy Policy or wish to exercise your data protection rights, please contact us at: support@deep-sleep-reset.com or write to: Petr Matěj, Mládeže 12, Prague 6, 169 00, Czech Republic.`
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
