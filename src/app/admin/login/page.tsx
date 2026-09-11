"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { Loader2, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [googleClientReady, setGoogleClientReady] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) {
      setError("Failed to receive Google credential token.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Google authentication rejected.");
      }

      setSuccessMessage(`Google Verified (${data.user.email}). Redirecting to Admin Portal...`);
      setTimeout(() => {
        window.location.href = "/admin";
      }, 500);
    } catch (err: any) {
      setError(err.message || "Failed to authenticate with Google.");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load Google Identity Services SDK
    const rawClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientId = rawClientId && !rawClientId.includes("exampleclientid")
      ? rawClientId.trim()
      : null;

    if (!clientId) {
      // No live Google Client ID configured
      setGoogleClientReady(false);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if ((window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (googleBtnRef.current) {
            (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
              theme: "filled_blue",
              size: "large",
              text: "signin_with",
              shape: "pill",
              width: 320,
              logo_alignment: "left",
            });
            setGoogleClientReady(true);
          }
        } catch (e) {
          console.warn("[Google GSI init failed]", e);
          setGoogleClientReady(false);
        }
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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
      <div className="absolute inset-0 bg-[#050a14]/80 backdrop-blur-[5px]" />

      <GlassCard className="relative z-10 w-full max-w-md border-white/20 bg-black/65 backdrop-blur-2xl shadow-2xl rounded-3xl p-4 sm:p-6 text-white">
        <GlassCardHeader className="text-center pb-2">
          <div className="size-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(0,210,255,0.25)]">
            <ShieldCheck className="size-7" />
          </div>
          <GlassCardTitle className="text-xl font-black text-center tracking-wider text-white uppercase font-['Hanken_Grotesk']">
            ADMIN PORTAL SECURITY
          </GlassCardTitle>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Google Identity &amp; Whitelist Verification
          </p>
        </GlassCardHeader>

        <GlassCardContent className="space-y-6 pt-2">
          {error && (
            <div className="p-4 rounded-2xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs flex items-start gap-3">
              <AlertCircle className="size-4 flex-shrink-0 text-red-400 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle className="size-4 flex-shrink-0 text-emerald-400" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* Exclusive High-Security Google Sign-In */}
          <div className="flex flex-col items-center justify-center space-y-4 py-2">
            <div
              ref={googleBtnRef}
              className="flex justify-center min-h-[44px] w-full"
            />

            {!googleClientReady && (
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setError(
                    "To enable live Google 1-Click login, configure your NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment (.env.local or Vercel)."
                  );
                }}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google Account</span>
              </button>
            )}

            <p className="text-[11px] text-slate-400 text-center font-sans max-w-xs leading-relaxed pt-2">
              Google cryptographically verifies your identity. Only email accounts authorized in the administrator whitelist are granted access.
            </p>

            {/* Judge Portal Link */}
            <div className="pt-3 border-t border-white/10 w-full text-center">
              <a
                href="/judge/login"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-sans transition-colors font-semibold"
              >
                Hackathon Judge Portal &rarr;
              </a>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
