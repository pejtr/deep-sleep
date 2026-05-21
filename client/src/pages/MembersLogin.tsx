import { useEffect } from "react";
import { useLocation } from "wouter";
import { Moon, Lock, Sparkles, Shield, Star } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function MembersLogin() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  // If already logged in, redirect to members area
  useEffect(() => {
    if (!loading && user) {
      navigate("/members");
    }
  }, [user, loading, navigate]);

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "oklch(0.06 0.03 255)" }}
    >
      {/* Background orbs */}
      <div
        className="absolute rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, oklch(0.55 0.22 280), transparent)",
          top: "-200px",
          right: "-200px",
        }}
      />
      <div
        className="absolute rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, oklch(0.65 0.18 65), transparent)",
          bottom: "-100px",
          left: "-100px",
        }}
      />

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-md w-full">
        <div className="flex items-center gap-2 mb-2">
          <Moon className="w-6 h-6" style={{ color: "oklch(0.82 0.16 65)" }} />
          <span className="text-lg font-semibold tracking-wide" style={{ color: "oklch(0.82 0.16 65)" }}>
            Deep Sleep Reset
          </span>
        </div>

        {/* Card */}
        <div
          className="w-full rounded-2xl p-8 flex flex-col items-center gap-6"
          style={{
            background: "oklch(0.10 0.025 255 / 0.9)",
            border: "1px solid oklch(0.25 0.05 280 / 0.5)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "oklch(0.18 0.06 280 / 0.8)" }}
          >
            <Lock className="w-8 h-8" style={{ color: "oklch(0.75 0.18 280)" }} />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Members Area</h1>
            <p className="text-sm" style={{ color: "oklch(0.65 0.05 255)" }}>
              Access your 7-Night Protocol, ASMR tracks, and personalized sleep coaching
            </p>
          </div>

          {/* Benefits */}
          <div className="w-full space-y-3">
            {[
              { icon: <Sparkles className="w-4 h-4" />, text: "7-Night CBT-I Protocol PDF" },
              { icon: <Star className="w-4 h-4" />, text: "4 ASMR Sleep Tracks" },
              { icon: <Moon className="w-4 h-4" />, text: "Chronotype Guide & 30-Day Tracker" },
              { icon: <Shield className="w-4 h-4" />, text: "Luna — Your Personal Sleep Coach" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div style={{ color: "oklch(0.75 0.18 280)" }}>{item.icon}</div>
                <span className="text-sm" style={{ color: "oklch(0.80 0.04 255)" }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Login button */}
          {loading ? (
            <div className="w-full h-12 rounded-xl animate-pulse" style={{ background: "oklch(0.18 0.06 280)" }} />
          ) : (
            <button
              onClick={handleLogin}
              className="w-full h-12 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.45 0.20 300))",
                boxShadow: "0 4px 20px oklch(0.55 0.22 280 / 0.4)",
              }}
            >
              Sign In to Access
            </button>
          )}

          <p className="text-xs text-center" style={{ color: "oklch(0.50 0.04 255)" }}>
            Don't have an account?{" "}
            <a href="/order" className="underline" style={{ color: "oklch(0.75 0.18 280)" }}>
              Get Deep Sleep Reset →
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-center" style={{ color: "oklch(0.40 0.03 255)" }}>
          Secure login · 30-day money-back guarantee
        </p>
      </div>
    </div>
  );
}
