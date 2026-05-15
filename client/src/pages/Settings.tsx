import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("general");
  const [liveKeys, setLiveKeys] = useState({
    publishable: "",
    secret: "",
  });
  const [kycStatus, setKycStatus] = useState<"pending" | "verified" | "rejected">("pending");

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">Only admins can access settings</p>
          <Button onClick={() => navigate("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleSaveLiveKeys = () => {
    if (!liveKeys.publishable || !liveKeys.secret) {
      toast.error("Please fill in both keys");
      return;
    }
    toast.success("Live keys saved. Awaiting KYC verification...");
    setKycStatus("pending");
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: "oklch(0.07 0.025 255)" }}>
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8" style={{ color: "oklch(0.95 0.01 265)" }}>
          Settings
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="payment" className="space-y-4">
            <Card style={{ background: "oklch(0.12 0.03 255)", border: "1px solid oklch(0.30 0.08 255)" }}>
              <CardHeader>
                <CardTitle>Stripe Live Mode</CardTitle>
                <CardDescription>Configure live payment processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg" style={{ background: "oklch(0.15 0.06 25 / 0.4)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    {kycStatus === "verified" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                    )}
                    <span className="font-bold">KYC Status: {kycStatus === "verified" ? "Verified ✓" : "Pending"}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Publishable Key (Live)</label>
                    <Input
                      placeholder="pk_live_..."
                      value={liveKeys.publishable}
                      onChange={(e) => setLiveKeys({ ...liveKeys, publishable: e.target.value })}
                      className="mt-1 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Secret Key (Live)</label>
                    <Input
                      placeholder="sk_live_..."
                      type="password"
                      value={liveKeys.secret}
                      onChange={(e) => setLiveKeys({ ...liveKeys, secret: e.target.value })}
                      className="mt-1 font-mono text-xs"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveLiveKeys} className="w-full" style={{ background: "oklch(0.82 0.16 65)" }}>
                  Save Live Keys
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
