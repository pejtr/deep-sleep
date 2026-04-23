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
          <p className="text-sm mb-8" style={{ color: "oklch(0.45 0.04 265)" }}>Last updated: April 23, 2026</p>

          {[
            {
              title: "1. Information We Collect",
              body: `We collect information you provide directly to us, such as your email address when you make a purchase or sign up for updates. We also automatically collect certain information about your device and how you interact with our website, including IP address, browser type, pages visited, and time spent on pages. We use cookies and similar tracking technologies to enhance your experience and analyze website traffic.`
            },
            {
              title: "2. How We Use Your Information",
              body: `We use the information we collect to process your orders and deliver your purchased products, send you transactional emails (order confirmations, download links), send you marketing communications if you have opted in, improve our website and products, analyze usage patterns to optimize our funnel, and comply with legal obligations. We do not sell your personal information to third parties.`
            },
            {
              title: "3. Information Sharing",
              body: `We may share your information with trusted third-party service providers who assist us in operating our website and conducting our business, including Gumroad (payment processing and digital delivery), email service providers, and analytics platforms. These parties are obligated to keep your information confidential and use it only for the purposes we specify.`
            },
            {
              title: "4. Data Retention",
              body: `We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Purchase records are retained for 7 years for accounting purposes. Email addresses are retained until you unsubscribe or request deletion.`
            },
            {
              title: "5. Your Rights",
              body: `You have the right to access, correct, or delete your personal information. You may opt out of marketing emails at any time by clicking the unsubscribe link in any email. To exercise your rights or request data deletion, contact us at privacy@deepsleepquest.com. We will respond within 30 days.`
            },
            {
              title: "6. Cookies",
              body: `We use essential cookies to maintain your session and preferences. We also use analytics cookies (such as Google Analytics) to understand how visitors use our site. You can control cookie settings through your browser preferences. Disabling cookies may affect some functionality of our website.`
            },
            {
              title: "7. Security",
              body: `We implement industry-standard security measures to protect your personal information, including SSL encryption for all data transmission. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`
            },
            {
              title: "8. Children's Privacy",
              body: `Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.`
            },
            {
              title: "9. Changes to This Policy",
              body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date. Your continued use of our services after changes constitutes acceptance of the updated policy.`
            },
            {
              title: "10. Contact Us",
              body: `If you have questions about this Privacy Policy, please contact us at privacy@deepsleepquest.com or write to us at Deep Sleep Reset, support@deepsleepquest.com.`
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
