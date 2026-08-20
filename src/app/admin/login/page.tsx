"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
  GlassCardFooter,
} from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;

    if (!loginEmail) {
      setError("Please enter your administrator email.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      setSuccessMessage("Redirecting...");
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
      <div className="absolute inset-0 bg-[#050a14]/65 backdrop-blur-[2px]" />

      <GlassCard className="relative z-10 w-full max-w-sm border-white/20 bg-black/40 backdrop-blur-2xl shadow-2xl">
        <GlassCardHeader className="text-center pb-2">
          <GlassCardTitle className="text-base sm:text-lg font-bold text-center tracking-wider text-white uppercase">
            Log in for Admin Panel
          </GlassCardTitle>
        </GlassCardHeader>

        <GlassCardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="size-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="size-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@aifoundry.club"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-white/20 text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-cyan-400 text-black hover:bg-cyan-300 font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(0,210,255,0.4)]"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Login"}
            </Button>
          </form>
        </GlassCardContent>

        <GlassCardFooter className="flex flex-col gap-2 pt-2 border-t border-white/10">
          <div className="grid grid-cols-2 gap-2 w-full text-[10px]">
            <button
              type="button"
              onClick={() => handleLogin(undefined, "admin@aifoundry.club")}
              className="px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:border-cyan-400/60 hover:bg-cyan-950/30 text-slate-300 text-center transition-all cursor-pointer truncate"
            >
              admin@aifoundry.club
            </button>
            <button
              type="button"
              onClick={() => handleLogin(undefined, "amaan@gmail.com")}
              className="px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:border-cyan-400/60 hover:bg-cyan-950/30 text-slate-300 text-center transition-all cursor-pointer truncate"
            >
              amaan@gmail.com
            </button>
          </div>
        </GlassCardFooter>
      </GlassCard>
    </div>
  );
}
