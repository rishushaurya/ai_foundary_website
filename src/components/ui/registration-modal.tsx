"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { EventData } from "@/lib/data";

interface ModalProps {
  event: EventData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RegistrationModal({ event, isOpen, onClose }: ModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "Dayananda Sagar University",
    branch: "B.Tech CSE (AI & ML)",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Restore draft from localStorage
  useEffect(() => {
    if (event && isOpen) {
      try {
        const saved = localStorage.getItem(`aifoundry:reg:${event.id}`);
        if (saved) {
          setFormData((prev) => ({ ...prev, ...JSON.parse(saved) }));
        }
      } catch {}
      setStatus("idle");
      setErrorMessage("");
    }
  }, [event, isOpen]);

  // Keystroke-level persistence
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (event) {
      try {
        localStorage.setItem(`aifoundry:reg:${event.id}`, JSON.stringify(updated));
      } catch {}
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          ...formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register for event");
      }

      setStatus("success");
      try {
        localStorage.removeItem(`aifoundry:reg:${event.id}`);
      } catch {}
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Network error. Please retry.");
    }
  };

  if (!isOpen || !event) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg rounded-2xl border p-6 sm:p-8 shadow-2xl z-10 font-mono"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-4 mb-6" style={{ borderColor: "var(--border)" }}>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">
                EVENT REGISTRATION
              </span>
              <h2 className="text-base sm:text-lg font-bold uppercase mt-1 line-clamp-1">
                {event.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          {status === "success" ? (
            <div className="py-8 flex flex-col items-center text-center space-y-4">
              <CheckCircle className="size-16 text-emerald-400 animate-bounce" />
              <h3 className="text-xl font-bold uppercase">Registration Confirmed</h3>
              <p className="text-xs text-slate-400 max-w-sm normal-case">
                We have registered <strong className="text-white">{formData.email}</strong> for {event.title}. Check your inbox for orientation guidelines.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer"
                style={{ background: "var(--accent)", color: "#000" }}
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {status === "error" && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 flex items-center gap-2">
                  <AlertCircle className="size-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Aryan Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-black/40 focus:outline-none focus:border-cyan-400 transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@dsu.edu.in"
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-black/40 focus:outline-none focus:border-cyan-400 transition-colors"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile"
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-black/40 focus:outline-none focus:border-cyan-400 transition-colors"
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                  College / University
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-black/40 focus:outline-none focus:border-cyan-400 transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                  Branch / Department
                </label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="e.g. B.Tech CSE (AI & ML)"
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-black/40 focus:outline-none focus:border-cyan-400 transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: "var(--accent)", color: "#000" }}
                >
                  {status === "loading" && <Loader2 className="size-4 animate-spin" />}
                  <span>Submit Registration</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
