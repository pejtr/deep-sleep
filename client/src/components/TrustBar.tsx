import { Shield, Star, Users, Award, Lock } from "lucide-react";

interface TrustBarProps {
  variant?: "full" | "compact";
}

export default function TrustBar({ variant = "full" }: TrustBarProps) {
  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="flex">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: "oklch(0.82 0.16 65)" }} />
            ))}
          </div>
          <span className="text-xs font-semibold" style={{ color: "oklch(0.82 0.16 65)" }}>4.9★</span>
          <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>(2,847 reviews)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" style={{ color: "oklch(0.78 0.18 65)" }} />
          <span className="text-xs font-semibold" style={{ color: "oklch(0.82 0.16 65)" }}>12,847+</span>
          <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>users</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" style={{ color: "oklch(0.78 0.18 65)" }} />
          <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>Secure checkout</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 border-y" style={{ borderColor: "oklch(0.78 0.18 65 / 0.1)" }}>
      <div className="container">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-4 h-4 fill-current" style={{ color: "oklch(0.82 0.16 65)" }} />
              ))}
            </div>
            <div>
              <span className="text-sm font-bold" style={{ color: "oklch(0.82 0.16 65)" }}>4.9★</span>
              <span className="text-xs ml-1" style={{ color: "oklch(0.50 0.04 265)" }}>from 2,847 reviews</span>
            </div>
          </div>

          <div className="w-px h-6 hidden md:block" style={{ background: "oklch(0.78 0.18 65 / 0.15)" }} />

          {/* Users */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: "oklch(0.78 0.18 65)" }} />
            <div>
              <span className="text-sm font-bold" style={{ color: "oklch(0.82 0.16 65)" }}>12,847+</span>
              <span className="text-xs ml-1" style={{ color: "oklch(0.50 0.04 265)" }}>users worldwide</span>
            </div>
          </div>

          <div className="w-px h-6 hidden md:block" style={{ background: "oklch(0.78 0.18 65 / 0.15)" }} />

          {/* Money-back */}
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: "oklch(0.78 0.18 65)" }} />
            <div>
              <span className="text-sm font-bold" style={{ color: "oklch(0.82 0.16 65)" }}>30-Day</span>
              <span className="text-xs ml-1" style={{ color: "oklch(0.50 0.04 265)" }}>money-back guarantee</span>
            </div>
          </div>

          <div className="w-px h-6 hidden md:block" style={{ background: "oklch(0.78 0.18 65 / 0.15)" }} />

          {/* Award */}
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4" style={{ color: "oklch(0.78 0.18 65)" }} />
            <div>
              <span className="text-sm font-bold" style={{ color: "oklch(0.82 0.16 65)" }}>98.2%</span>
              <span className="text-xs ml-1" style={{ color: "oklch(0.50 0.04 265)" }}>success rate</span>
            </div>
          </div>

          <div className="w-px h-6 hidden md:block" style={{ background: "oklch(0.78 0.18 65 / 0.15)" }} />

          {/* Secure */}
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" style={{ color: "oklch(0.78 0.18 65)" }} />
            <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>256-bit SSL encrypted</span>
          </div>

        </div>
      </div>
    </div>
  );
}
