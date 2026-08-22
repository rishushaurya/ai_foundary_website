"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, CheckCircle, ShieldCheck, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both your administrator email and passkey.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      setSuccessMessage("Authentication successful. Redirecting to Admin Portal...");
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 600);
    } catch (err: any) {
      setError(err.message || "Failed to authenticate.");
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center p-4 font-mono overflow-hidden"
      style={{
        backgroundImage: "url(/images/architectural-bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark tint backdrop layer */}
      <div className="absolute inset-0 bg-[#050a14]/75 backdrop-blur-[4px]" />

      <GlassCard className="relative z-10 w-full max-w-sm border-white/20 bg-black/60 backdrop-blur-2xl shadow-2xl rounded-3xl p-2">
        <GlassCardHeader className="text-center pb-2">
          <div className="size-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-2 shadow-lg">
            <ShieldCheck className="size-6" />
          </div>
          <GlassCardTitle className="text-lg font-black text-center tracking-wider text-white uppercase font-['Hanken_Grotesk']">
            ADMIN PORTAL AUTH
          </GlassCardTitle>
          <p className="text-[11px] text-slate-400 font-sans mt-1">
            Authorized Executive &amp; Faculty Access Only
          </p>
        </GlassCardHeader>

        <GlassCardContent className="space-y-4 pt-2">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="size-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="size-4 flex-shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300 uppercase font-bold text-[10px] tracking-wider">
                Administrator Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@aifoundry.club"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-slate-500 h-11 focus:border-cyan-400 focus:bg-white/10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pass" className="text-slate-300 uppercase font-bold text-[10px] tracking-wider">
                Security Passkey
              </Label>
              <div className="relative">
                <Input
                  id="pass"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-500 h-11 focus:border-cyan-400 focus:bg-white/10 pr-10"
                />
                <Lock className="size-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-cyan-400 text-black hover:bg-cyan-300 font-black uppercase tracking-wider shadow-[0_0_20px_rgba(0,210,255,0.4)] transition-all hover:scale-102 cursor-pointer mt-2"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Verify & Enter Admin"}
            </Button>
          </form>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
