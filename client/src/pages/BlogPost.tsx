import { Link, useParams } from "wouter";
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

// Inject product links into content: first mid-article, second at end
function injectProductLinks(content: string): string {
  const paragraphs = content.split("\n\n");
  const midIndex = Math.floor(paragraphs.length / 2);
  const productLink = `\n\n> **If you need a faster route to deep sleep**, the [7-Night Deep Sleep Reset Protocol](/order) gives you a science-backed, step-by-step system for just $4.\n\n`;
  paragraphs.splice(midIndex, 0, productLink);
  return paragraphs.join("\n\n");
}

function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.+)$/gm, '<h3 style="font-size:18px;font-weight:700;margin:24px 0 10px;color:oklch(0.90 0.02 265)">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:22px;font-weight:800;margin:32px 0 12px;color:oklch(0.90 0.02 265)">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:28px;font-weight:900;margin:0 0 20px;color:oklch(0.90 0.02 265)">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:oklch(0.90 0.02 265);font-weight:700">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:oklch(0.78 0.12 75);text-decoration:underline">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid oklch(0.78 0.12 75);padding:12px 16px;margin:20px 0;background:oklch(0.11 0.025 265);border-radius:0 8px 8px 0;color:oklch(0.80 0.04 265)">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li style="margin:6px 0;padding-left:8px;color:oklch(0.80 0.04 265)">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="padding-left:20px;margin:16px 0">$&</ul>')
    .replace(/\n\n/g, '</p><p style="margin:16px 0;line-height:1.8;color:oklch(0.80 0.04 265)">')
    .replace(/^/, '<p style="margin:16px 0;line-height:1.8;color:oklch(0.80 0.04 265)">')
    .replace(/$/, '</p>');
}

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  const { data: post, isLoading, error } = trpc.blog.getBySlug.useQuery(
    { slug },
    { enabled: !!slug, retry: false }
  );

  useEffect(() => {
    if (post) {
      document.title = `${post.title} — Deep Sleep Reset Blog`;
    }
  }, [post]);

  if (isLoading) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: C.textMuted }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}></div>
          <p>Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "48px", marginBottom: "16px" }}>😴</p>
          <h1 style={{ color: C.text, marginBottom: "12px" }}>Article not found</h1>
          <Link href="/blog" style={{ color: C.gold }}>← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const contentWithLinks = injectProductLinks(post.content);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ color: C.gold, textDecoration: "none", fontWeight: 700, fontSize: "18px" }}>
          Deep Sleep Reset
        </Link>
        <Link href="/order" style={{ background: C.gold, color: "#0a0810", padding: "8px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "14px" }}>
          Get the Protocol — $4
        </Link>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: "24px", fontSize: "14px", color: C.textMuted }}>
          <Link href="/blog" style={{ color: C.textMuted, textDecoration: "none" }}>Blog</Link>
          <span style={{ margin: "0 8px" }}>›</span>
          <span>{post.title}</span>
        </div>

        {/* Article Header */}
        {post.seoKeyword && (
          <div style={{ display: "inline-block", background: `${C.purple}22`, border: `1px solid ${C.purple}33`, borderRadius: "12px", padding: "4px 12px", fontSize: "12px", color: C.purple, marginBottom: "16px" }}>
            {post.seoKeyword}
          </div>
        )}
        <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, lineHeight: 1.3, marginBottom: "16px" }}>
          {post.title}
        </h1>
        {post.excerpt && (
          <p style={{ color: C.textMuted, fontSize: "17px", lineHeight: 1.7, marginBottom: "24px", borderLeft: `3px solid ${C.gold}`, paddingLeft: "16px" }}>
            {post.excerpt}
          </p>
        )}
        <div style={{ color: C.textMuted, fontSize: "13px", marginBottom: "40px", paddingBottom: "24px", borderBottom: `1px solid ${C.border}` }}>
          Published {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · Deep Sleep Reset
        </div>

        {/* Article Content */}
        <div
          style={{ fontSize: "16px", lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(contentWithLinks) }}
        />

        {/* Bottom CTA Box — V2-2 */}
        <div style={{ marginTop: "48px", background: `linear-gradient(135deg, oklch(0.13 0.04 265), oklch(0.15 0.06 290))`, border: `1px solid ${C.gold}55`, borderRadius: "20px", padding: "32px", textAlign: "center" }}>
          <p style={{ fontSize: "24px", marginBottom: "8px" }}></p>
          <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "10px" }}>
            Stop Struggling with Sleep. Start the Protocol.
          </h3>
          <p style={{ color: C.textMuted, fontSize: "15px", marginBottom: "20px", maxWidth: "440px", margin: "0 auto 20px" }}>
            The 7-Night Deep Sleep Reset gives you a science-backed, step-by-step system personalized to your chronotype. For less than a coffee.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "12px" }}>
            <Link href="/order" style={{ background: C.gold, color: "#0a0810", padding: "14px 28px", borderRadius: "10px", textDecoration: "none", fontWeight: 800, fontSize: "16px" }}>
              Get the Protocol — $4 →
            </Link>
            <Link href="/quiz-funnel" style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.text, padding: "14px 24px", borderRadius: "10px", textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>
              Take Free Quiz First
            </Link>
          </div>
          <p style={{ color: C.textMuted, fontSize: "12px" }}>Instant download · 30-day money-back guarantee</p>
        </div>

        {/* Back to blog */}
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <Link href="/blog" style={{ color: C.textMuted, textDecoration: "none", fontSize: "14px" }}>
            ← Back to Sleep Science Blog
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "24px", textAlign: "center", color: C.textMuted, fontSize: "13px" }}>
        <p>© 2025 Deep Sleep Reset · <Link href="/privacy" style={{ color: C.textMuted }}>Privacy</Link> · <Link href="/terms" style={{ color: C.textMuted }}>Terms</Link></p>
      </div>
    </div>
  );
}
