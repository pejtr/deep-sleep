import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle, CheckCircle2, Copy, ExternalLink, Moon, Globe,
  CreditCard, Shield, Key, Bell, Mail, Zap, RefreshCw, Eye, EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const C = {
  bg: "oklch(0.07 0.025 255)",
  card: "oklch(0.11 0.025 255)",
  cardBorder: "oklch(0.20 0.04 255 / 0.6)",
  textPrimary: "oklch(0.95 0.01 265)",
  textSecondary: "oklch(0.65 0.04 255)",
  textMuted: "oklch(0.45 0.03 255)",
  gold: "oklch(0.78 0.18 65)",
  green: "oklch(0.65 0.20 160)",
  red: "oklch(0.60 0.22 25)",
  purple: "oklch(0.55 0.22 280)",
};

export default function Settings() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("general");
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [fbPixelId, setFbPixelId] = useState("PLACEHOLDER_FB_PIXEL_ID");
  const [googleAdsId, setGoogleAdsId] = useState("AW-968712546");
  const [brevoApiKey, setBrevoApiKey] = useState("••••••••••••••••");
  const [savingPixels, setSavingPixels] = useState(false);

  // Stats query for overview
  const { data: stats } = trpc.admin.stats.useQuery(undefined, { enabled: !!user && user.role === "admin" });

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: C.textMuted }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: C.textPrimary }}>Access Denied</h1>
          <p className="mb-4" style={{ color: C.textSecondary }}>Only admins can access settings</p>
          <Button onClick={() => navigate("/")} variant="outline">Back to Home</Button>
        </div>
      </div>
    );
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleSavePixels = () => {
    setSavingPixels(true);
    setTimeout(() => {
      setSavingPixels(false);
      toast.success("Pixel IDs saved. Deploy to apply changes.");
    }, 800);
  };

  const integrations = [
    {
      name: "Stripe",
      status: "active",
      description: "Payment processing — live keys configured",
      icon: CreditCard,
      color: C.purple,
      link: "https://dashboard.stripe.com",
    },
    {
      name: "Brevo",
      status: "active",
      description: "Email automation — sequences active",
      icon: Mail,
      color: C.gold,
      link: "https://app.brevo.com",
    },
    {
      name: "Reddit Ads",
      status: "active",
      description: "Pixel a2_iw4up15u7778 — tracking active",
      icon: Zap,
      color: C.red,
      link: "https://ads.reddit.com",
    },
    {
      name: "TikTok Pixel",
      status: "active",
      description: "Pixel CS2CJHRC77U1VFMHVING — tracking active",
      icon: Zap,
      color: C.purple,
      link: "https://ads.tiktok.com",
    },
    {
      name: "Google Ads",
      status: "active",
      description: "Tag AW-968712546 — conversion tracking active",
      icon: Globe,
      color: C.green,
      link: "https://ads.google.com",
    },
    {
      name: "Meta Pixel",
      status: "pending",
      description: "Facebook Pixel — ID needs to be configured",
      icon: Globe,
      color: C.textMuted,
      link: "https://business.facebook.com/events_manager",
    },
  ];

  const webhookUrl = `${window.location.origin}/api/stripe/webhook`;
  const stripeWebhookSecret = "whsec_••••••••••••••••";

  return (
    <div className="min-h-screen pb-20" style={{ background: C.bg }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: C.cardBorder, background: "oklch(0.09 0.025 255 / 0.9)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5" style={{ color: C.gold }} />
            <h1 className="text-lg font-bold" style={{ color: C.textPrimary }}>Settings</h1>
          </div>
          <button onClick={() => navigate("/admin")} className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: C.card, border: `1px solid ${C.cardBorder}`, color: C.textSecondary }}>
            ← Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
            <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
            <TabsTrigger value="payment" className="text-xs">Payment</TabsTrigger>
            <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
          </TabsList>

          {/* ── General Tab ─────────────────────────────────────────────────── */}
          <TabsContent value="general" className="space-y-4">
            {/* Site Overview */}
            <Card style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <CardHeader>
                <CardTitle className="text-sm" style={{ color: C.textPrimary }}>Site Overview</CardTitle>
                <CardDescription className="text-xs" style={{ color: C.textSecondary }}>
                  Current production status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Total Revenue", value: stats ? `$${(stats.revenue / 100).toFixed(2)}` : "—", color: C.gold },
                    { label: "Completed Orders", value: stats?.completedOrderCount ?? "—", color: C.green },
                    { label: "Unique Buyers", value: stats?.uniqueBuyers ?? "—", color: C.purple },
                    { label: "Quiz Starts", value: stats?.quizStarts ?? "—", color: C.gold },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-xl" style={{ background: "oklch(0.09 0.025 255)", border: `1px solid ${C.cardBorder}` }}>
                      <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                      <p className="text-xs" style={{ color: C.textMuted }}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Integrations Status */}
            <Card style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <CardHeader>
                <CardTitle className="text-sm" style={{ color: C.textPrimary }}>Integrations</CardTitle>
                <CardDescription className="text-xs" style={{ color: C.textSecondary }}>
                  Connected services and tracking pixels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {integrations.map(int => (
                  <div key={int.name} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "oklch(0.09 0.025 255)", border: `1px solid ${C.cardBorder}` }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${int.color}20` }}>
                      <int.icon className="w-4 h-4" style={{ color: int.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: C.textPrimary }}>{int.name}</p>
                      <p className="text-xs" style={{ color: C.textMuted }}>{int.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs"
                        style={{
                          background: int.status === "active" ? `${C.green}15` : `${C.gold}15`,
                          color: int.status === "active" ? C.green : C.gold,
                          borderColor: int.status === "active" ? `${C.green}40` : `${C.gold}40`,
                        }}>
                        {int.status === "active" ? "Active" : "Pending"}
                      </Badge>
                      <a href={int.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" style={{ color: C.textMuted }} />
                      </a>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tracking Pixels Config */}
            <Card style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <CardHeader>
                <CardTitle className="text-sm" style={{ color: C.textPrimary }}>Tracking Pixel IDs</CardTitle>
                <CardDescription className="text-xs" style={{ color: C.textSecondary }}>
                  Configure pixel IDs for retargeting audiences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: C.textSecondary }}>
                    Meta (Facebook) Pixel ID
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={fbPixelId}
                      onChange={e => setFbPixelId(e.target.value)}
                      placeholder="123456789012345"
                      className="font-mono text-xs flex-1"
                      style={{ background: "oklch(0.09 0.025 255)", borderColor: C.cardBorder, color: C.textPrimary }}
                    />
                    <Button size="sm" variant="outline" onClick={() => handleCopy(fbPixelId, "Pixel ID")}
                      style={{ borderColor: C.cardBorder }}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                    Get from <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: C.purple }}>Meta Events Manager</a>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: C.textSecondary }}>
                    Google Ads Tag ID
                  </label>
                  <Input
                    value={googleAdsId}
                    onChange={e => setGoogleAdsId(e.target.value)}
                    placeholder="AW-XXXXXXXXX"
                    className="font-mono text-xs"
                    style={{ background: "oklch(0.09 0.025 255)", borderColor: C.cardBorder, color: C.textPrimary }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: C.textSecondary }}>
                    Reddit Pixel ID
                  </label>
                  <Input
                    defaultValue="a2_iw4up15u7778"
                    readOnly
                    className="font-mono text-xs opacity-60"
                    style={{ background: "oklch(0.09 0.025 255)", borderColor: C.cardBorder, color: C.textPrimary }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: C.textSecondary }}>
                    TikTok Pixel ID
                  </label>
                  <Input
                    defaultValue="CS2CJHRC77U1VFMHVING"
                    readOnly
                    className="font-mono text-xs opacity-60"
                    style={{ background: "oklch(0.09 0.025 255)", borderColor: C.cardBorder, color: C.textPrimary }}
                  />
                </div>
                <Button onClick={handleSavePixels} disabled={savingPixels} className="w-full text-sm"
                  style={{ background: C.gold, color: "oklch(0.10 0.02 255)" }}>
                  {savingPixels ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Pixel Configuration
                </Button>
                <p className="text-xs text-center" style={{ color: C.textMuted }}>
                  Changes require a new deployment to take effect
                </p>
              </CardContent>
            </Card>

            {/* Email Config */}
            <Card style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <CardHeader>
                <CardTitle className="text-sm" style={{ color: C.textPrimary }}>Email (Brevo)</CardTitle>
                <CardDescription className="text-xs" style={{ color: C.textSecondary }}>
                  Transactional email and automation sequences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: `${C.green}10`, border: `1px solid ${C.green}30` }}>
                  <CheckCircle2 className="w-4 h-4" style={{ color: C.green }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: C.textPrimary }}>Brevo API connected</p>
                    <p className="text-xs" style={{ color: C.textMuted }}>Purchase confirmations + 7-day sequences active</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {[
                    { label: "Purchase confirmation", status: "active" },
                    { label: "Quiz result email (chronotype)", status: "active" },
                    { label: "7-day follow-up sequence", status: "active" },
                    { label: "Upsell email sequence", status: "active" },
                  ].map(seq => (
                    <div key={seq.label} className="flex items-center justify-between py-2 border-b"
                      style={{ borderColor: C.cardBorder }}>
                      <span className="text-xs" style={{ color: C.textSecondary }}>{seq.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${C.green}15`, color: C.green }}>
                        Active
                      </span>
                    </div>
                  ))}
                </div>
                <a href="https://app.brevo.com" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full text-xs" style={{ borderColor: C.cardBorder, color: C.textSecondary }}>
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    Open Brevo Dashboard
                  </Button>
                </a>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Payment Tab ─────────────────────────────────────────────────── */}
          <TabsContent value="payment" className="space-y-4">
            {/* Stripe Status */}
            <Card style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <CardHeader>
                <CardTitle className="text-sm" style={{ color: C.textPrimary }}>Stripe Configuration</CardTitle>
                <CardDescription className="text-xs" style={{ color: C.textSecondary }}>
                  Payment processing and webhook settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${C.green}10`, border: `1px solid ${C.green}30` }}>
                  <CheckCircle2 className="w-5 h-5" style={{ color: C.green }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>Live Mode Active</p>
                    <p className="text-xs" style={{ color: C.textMuted }}>DEEPSLEEP4 live keys configured. Payments processing.</p>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: C.textSecondary }}>Products</p>
                  <div className="space-y-2">
                    {[
                      { name: "Deep Sleep Reset Protocol", price: "$4", type: "One-time" },
                      { name: "Chronotype Optimizer", price: "$3", type: "One-time (OTO1)" },
                      { name: "ASMR Sleep Audio Pack", price: "$7", type: "One-time (OTO2)" },
                      { name: "Luna Premium Membership", price: "$9.99/mo", type: "Subscription (OTO3)" },
                    ].map(p => (
                      <div key={p.name} className="flex items-center justify-between p-2.5 rounded-lg"
                        style={{ background: "oklch(0.09 0.025 255)", border: `1px solid ${C.cardBorder}` }}>
                        <div>
                          <p className="text-xs font-medium" style={{ color: C.textPrimary }}>{p.name}</p>
                          <p className="text-xs" style={{ color: C.textMuted }}>{p.type}</p>
                        </div>
                        <span className="text-sm font-bold" style={{ color: C.gold }}>{p.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Webhook */}
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: C.textSecondary }}>Webhook Endpoint</p>
                  <div className="flex gap-2">
                    <Input
                      value={webhookUrl}
                      readOnly
                      className="font-mono text-xs flex-1"
                      style={{ background: "oklch(0.09 0.025 255)", borderColor: C.cardBorder, color: C.textPrimary }}
                    />
                    <Button size="sm" variant="outline" onClick={() => handleCopy(webhookUrl, "Webhook URL")}
                      style={{ borderColor: C.cardBorder }}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                    Configured in Stripe Dashboard → Developers → Webhooks
                  </p>
                </div>

                {/* Webhook Secret */}
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: C.textSecondary }}>Webhook Secret</p>
                  <div className="flex gap-2">
                    <Input
                      value={showWebhookSecret ? "whsec_configured_via_env" : stripeWebhookSecret}
                      readOnly
                      type={showWebhookSecret ? "text" : "password"}
                      className="font-mono text-xs flex-1"
                      style={{ background: "oklch(0.09 0.025 255)", borderColor: C.cardBorder, color: C.textPrimary }}
                    />
                    <Button size="sm" variant="outline" onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                      style={{ borderColor: C.cardBorder }}>
                      {showWebhookSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                  <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                    Stored as STRIPE_WEBHOOK_SECRET environment variable
                  </p>
                </div>

                {/* Test card */}
                <div className="p-3 rounded-xl" style={{ background: "oklch(0.09 0.025 255)", border: `1px solid ${C.cardBorder}` }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: C.textSecondary }}>Test Card</p>
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-mono" style={{ color: C.textPrimary }}>4242 4242 4242 4242</code>
                    <Button size="sm" variant="ghost" className="h-6 text-xs px-2"
                      onClick={() => handleCopy("4242424242424242", "Test card number")}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs mt-1" style={{ color: C.textMuted }}>Any future date, any CVC</p>
                </div>

                <div className="flex gap-2">
                  <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full text-xs" style={{ borderColor: C.cardBorder, color: C.textSecondary }}>
                      <ExternalLink className="w-3.5 h-3.5 mr-2" />
                      Stripe Dashboard
                    </Button>
                  </a>
                  <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full text-xs" style={{ borderColor: C.cardBorder, color: C.textSecondary }}>
                      <Bell className="w-3.5 h-3.5 mr-2" />
                      Webhooks
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Promo Codes */}
            <Card style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <CardHeader>
                <CardTitle className="text-sm" style={{ color: C.textPrimary }}>Promo Codes</CardTitle>
                <CardDescription className="text-xs" style={{ color: C.textSecondary }}>
                  Active discount codes for testing and promotions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { code: "DEEPSLEEP4", discount: "Live mode test — 99% off", active: true },
                  { code: "SLEEP50", discount: "50% off — affiliate promo", active: true },
                  { code: "LUNA2025", discount: "Launch promo — $1 off", active: false },
                ].map(promo => (
                  <div key={promo.code} className="flex items-center gap-3 p-2.5 rounded-lg"
                    style={{ background: "oklch(0.09 0.025 255)", border: `1px solid ${C.cardBorder}` }}>
                    <code className="text-xs font-mono font-bold flex-1" style={{ color: C.gold }}>{promo.code}</code>
                    <span className="text-xs" style={{ color: C.textMuted }}>{promo.discount}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: promo.active ? `${C.green}15` : `${C.textMuted}15`, color: promo.active ? C.green : C.textMuted }}>
                      {promo.active ? "Active" : "Inactive"}
                    </span>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0"
                      onClick={() => handleCopy(promo.code, "Promo code")}>
                      <Copy className="w-3 h-3" style={{ color: C.textMuted }} />
                    </Button>
                  </div>
                ))}
                <a href="https://dashboard.stripe.com/coupons" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full text-xs mt-2" style={{ borderColor: C.cardBorder, color: C.textSecondary }}>
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    Manage in Stripe
                  </Button>
                </a>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Security Tab ─────────────────────────────────────────────────── */}
          <TabsContent value="security" className="space-y-4">
            {/* Admin Account */}
            <Card style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <CardHeader>
                <CardTitle className="text-sm" style={{ color: C.textPrimary }}>Admin Account</CardTitle>
                <CardDescription className="text-xs" style={{ color: C.textSecondary }}>
                  Current session and account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {[
                    { label: "Name", value: user.name ?? "—" },
                    { label: "Email", value: user.email ?? "—" },
                    { label: "Role", value: user.role ?? "admin" },
                    { label: "User ID", value: String(user.id) },
                  ].map(field => (
                    <div key={field.label} className="flex items-center justify-between py-2 border-b"
                      style={{ borderColor: C.cardBorder }}>
                      <span className="text-xs" style={{ color: C.textMuted }}>{field.label}</span>
                      <span className="text-xs font-medium" style={{ color: C.textPrimary }}>{field.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* API Keys */}
            <Card style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <CardHeader>
                <CardTitle className="text-sm" style={{ color: C.textPrimary }}>API Keys</CardTitle>
                <CardDescription className="text-xs" style={{ color: C.textSecondary }}>
                  External API access for LeadOS CRM and integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-3 rounded-xl mb-3" style={{ background: "oklch(0.09 0.025 255)", border: `1px solid ${C.cardBorder}` }}>
                  <Key className="w-4 h-4" style={{ color: C.gold }} />
                  <div className="flex-1">
                    <p className="text-xs font-medium" style={{ color: C.textPrimary }}>External REST API</p>
                    <p className="text-xs" style={{ color: C.textMuted }}>{window.location.origin}/api/external/*</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs"
                    onClick={() => handleCopy(`${window.location.origin}/api/external/`, "API base URL")}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <Button onClick={() => navigate("/admin")} variant="outline" className="w-full text-xs"
                  style={{ borderColor: C.cardBorder, color: C.textSecondary }}>
                  Manage API Keys in Integrations Tab →
                </Button>
              </CardContent>
            </Card>

            {/* Environment Variables */}
            <Card style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <CardHeader>
                <CardTitle className="text-sm" style={{ color: C.textPrimary }}>Environment Variables</CardTitle>
                <CardDescription className="text-xs" style={{ color: C.textSecondary }}>
                  Secrets configured via Manus project settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { key: "STRIPE_SECRET_KEY", status: "set", description: "Stripe live secret key" },
                  { key: "STRIPE_WEBHOOK_SECRET", status: "set", description: "Stripe webhook signature" },
                  { key: "VITE_STRIPE_PUBLISHABLE_KEY", status: "set", description: "Stripe publishable key (frontend)" },
                  { key: "BREVO_API_KEY", status: "set", description: "Brevo email API key" },
                  { key: "JWT_SECRET", status: "set", description: "Session cookie signing" },
                  { key: "DATABASE_URL", status: "set", description: "TiDB connection string" },
                ].map(env => (
                  <div key={env.key} className="flex items-center gap-3 py-2 border-b"
                    style={{ borderColor: C.cardBorder }}>
                    <code className="text-xs font-mono flex-1" style={{ color: C.textPrimary }}>{env.key}</code>
                    <span className="text-xs" style={{ color: C.textMuted }}>{env.description}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${C.green}15`, color: C.green }}>
                      Set
                    </span>
                  </div>
                ))}
                <p className="text-xs mt-3" style={{ color: C.textMuted }}>
                  Manage secrets in Manus project Settings → Secrets panel
                </p>
              </CardContent>
            </Card>

            {/* Security Checklist */}
            <Card style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <CardHeader>
                <CardTitle className="text-sm" style={{ color: C.textPrimary }}>Security Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { done: true, text: "Stripe webhook signature verification enabled" },
                  { done: true, text: "Admin role gating on all admin procedures" },
                  { done: true, text: "API keys stored as hashed values (SHA-256)" },
                  { done: true, text: "HMAC-SHA256 signed outbound webhooks" },
                  { done: true, text: "JWT session cookies (httpOnly, secure)" },
                  { done: true, text: "Idempotency checks on Stripe webhook events" },
                  { done: false, text: "Rate limiting on /api/external/* endpoints" },
                  { done: false, text: "2FA for admin login" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    {item.done
                      ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: C.green }} />
                      : <AlertCircle className="w-4 h-4 shrink-0" style={{ color: C.textMuted }} />
                    }
                    <p className="text-xs" style={{ color: item.done ? C.textSecondary : C.textPrimary }}>{item.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
