import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

const C = {
  bg: "oklch(0.08 0.02 265)",
  card: "oklch(0.11 0.025 265)",
  border: "oklch(0.20 0.03 265)",
  gold: "oklch(0.78 0.12 75)",
  text: "oklch(0.90 0.02 265)",
  textMuted: "oklch(0.55 0.04 265)",
  purple: "oklch(0.60 0.18 290)",
};

export default function BlogList() {
  const { data: posts, isLoading } = trpc.blog.list.useQuery({ limit: 20, offset: 0 });

  return (
    <>
      <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ color: C.gold, textDecoration: "none", fontWeight: 700, fontSize: "18px" }}>
            🌙 Deep Sleep Reset
          </Link>
          <Link href="/order" style={{ background: C.gold, color: "#0a0810", padding: "8px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "14px" }}>
            Get the Protocol — $5
          </Link>
        </div>

        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px" }}>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ display: "inline-block", background: `${C.purple}22`, border: `1px solid ${C.purple}44`, borderRadius: "20px", padding: "6px 16px", fontSize: "13px", color: C.purple, marginBottom: "16px" }}>
              Sleep Science Blog
            </div>
            <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, lineHeight: 1.2, marginBottom: "16px" }}>
              Science-Backed Sleep Insights
            </h1>
            <p style={{ color: C.textMuted, fontSize: "17px", maxWidth: "540px", margin: "0 auto" }}>
              Evidence-based guides to help you fall asleep faster, sleep deeper, and wake up energized — based on your chronotype.
            </p>
          </div>

          {/* CTA Banner */}
          <div style={{ background: `linear-gradient(135deg, oklch(0.13 0.04 265), oklch(0.15 0.05 290))`, border: `1px solid ${C.gold}44`, borderRadius: "16px", padding: "24px 32px", marginBottom: "48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>🧬 Discover Your Chronotype</p>
              <p style={{ color: C.textMuted, fontSize: "14px" }}>Take the free 60-second quiz and get your personalized sleep protocol.</p>
            </div>
            <Link href="/quiz-funnel" style={{ background: C.gold, color: "#0a0810", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "14px", whiteSpace: "nowrap" }}>
              Take Free Quiz →
            </Link>
          </div>

          {/* Posts Grid */}
          {isLoading ? (
            <div style={{ display: "grid", gap: "24px", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ background: C.card, borderRadius: "16px", padding: "24px", border: `1px solid ${C.border}`, animation: "pulse 1.5s infinite" }}>
                  <div style={{ height: "20px", background: C.border, borderRadius: "4px", marginBottom: "12px" }} />
                  <div style={{ height: "60px", background: C.border, borderRadius: "4px", marginBottom: "16px" }} />
                  <div style={{ height: "14px", background: C.border, borderRadius: "4px", width: "60%" }} />
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div style={{ display: "grid", gap: "24px", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {posts.map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                  <article style={{ background: C.card, borderRadius: "16px", padding: "24px", border: `1px solid ${C.border}`, cursor: "pointer", transition: "border-color 0.2s, transform 0.2s", height: "100%" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.gold + "66"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
                    {post.seoKeyword && (
                      <div style={{ display: "inline-block", background: `${C.purple}22`, border: `1px solid ${C.purple}33`, borderRadius: "12px", padding: "3px 10px", fontSize: "11px", color: C.purple, marginBottom: "12px" }}>
                        {post.seoKeyword}
                      </div>
                    )}
                    <h2 style={{ fontSize: "17px", fontWeight: 700, lineHeight: 1.4, marginBottom: "10px", color: C.text }}>
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p style={{ color: C.textMuted, fontSize: "14px", lineHeight: 1.6, marginBottom: "16px" }}>
                        {post.excerpt}
                      </p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: C.textMuted, fontSize: "12px" }}>
                        {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span style={{ color: C.gold, fontSize: "13px", fontWeight: 600 }}>Read more →</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "64px 24px" }}>
              <p style={{ fontSize: "48px", marginBottom: "16px" }}>🌙</p>
              <p style={{ color: C.textMuted, fontSize: "16px", marginBottom: "24px" }}>
                Sleep science articles are being generated. Check back soon!
              </p>
              <Link href="/quiz-funnel" style={{ background: C.gold, color: "#0a0810", padding: "14px 28px", borderRadius: "10px", textDecoration: "none", fontWeight: 700 }}>
                Take the Sleep Quiz Instead →
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "24px", textAlign: "center", color: C.textMuted, fontSize: "13px" }}>
          <p>© 2025 Deep Sleep Reset · <Link href="/privacy" style={{ color: C.textMuted }}>Privacy</Link> · <Link href="/terms" style={{ color: C.textMuted }}>Terms</Link></p>
        </div>
      </div>
    </>
  );
}
