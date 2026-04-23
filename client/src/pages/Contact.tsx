import { Moon, ArrowLeft, Mail, Clock, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "general", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\n${form.message}`;
    window.location.href = `mailto:support@deepsleepquest.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

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

      <div className="relative z-10 container max-w-2xl mx-auto py-10">
        <div className="text-center mb-10">
          <h1 className="font-display font-black text-4xl mb-3" style={{ color: "oklch(0.95 0.01 265)" }}>
            Get in Touch
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.55 0.04 265)" }}>
            We're real humans who care about your sleep. We respond to every message.
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Mail className="w-5 h-5" />, title: "Email", value: "support@deepsleepquest.com" },
            { icon: <Clock className="w-5 h-5" />, title: "Response Time", value: "Within 24 hours" },
            { icon: <MessageCircle className="w-5 h-5" />, title: "Refunds", value: "30-day guarantee, no questions" },
          ].map((item, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 text-center">
              <div className="flex justify-center mb-2" style={{ color: "oklch(0.82 0.16 65)" }}>{item.icon}</div>
              <p className="text-xs font-semibold mb-1" style={{ color: "oklch(0.70 0.04 265)" }}>{item.title}</p>
              <p className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Contact form */}
        {sent ? (
          <div className="glass-card rounded-3xl p-10 text-center" style={{ border: "1px solid oklch(0.55 0.18 145 / 0.3)" }}>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="font-display font-bold text-2xl mb-2" style={{ color: "oklch(0.95 0.01 265)" }}>Message Sent!</h2>
            <p className="text-sm" style={{ color: "oklch(0.55 0.04 265)" }}>
              Your email client should have opened. We'll reply within 24 hours.
            </p>
            <Link href="/"
              className="inline-block mt-6 rounded-xl px-6 py-3 text-sm font-semibold"
              style={{ background: "oklch(0.78 0.18 65 / 0.15)", border: "1px solid oklch(0.78 0.18 65 / 0.3)", color: "oklch(0.82 0.16 65)" }}>
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.70 0.04 265)" }}>Name</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ background: "oklch(0.10 0.025 255)", border: "1px solid oklch(0.25 0.04 265)", color: "oklch(0.90 0.02 265)" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.70 0.04 265)" }}>Email</label>
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ background: "oklch(0.10 0.025 255)", border: "1px solid oklch(0.25 0.04 265)", color: "oklch(0.90 0.02 265)" }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.70 0.04 265)" }}>Subject</label>
                <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: "oklch(0.10 0.025 255)", border: "1px solid oklch(0.25 0.04 265)", color: "oklch(0.90 0.02 265)" }}>
                  <option value="general">General Question</option>
                  <option value="refund">Refund Request</option>
                  <option value="download">Download / Access Issue</option>
                  <option value="affiliate">Affiliate Program</option>
                  <option value="feedback">Feedback / Suggestion</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.70 0.04 265)" }}>Message</label>
                <textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="How can we help you?"
                  rows={5}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  style={{ background: "oklch(0.10 0.025 255)", border: "1px solid oklch(0.25 0.04 265)", color: "oklch(0.90 0.02 265)" }} />
              </div>
              <button type="submit"
                className="w-full cta-gold cta-shimmer rounded-xl py-3.5 text-sm font-bold">
                Send Message →
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
