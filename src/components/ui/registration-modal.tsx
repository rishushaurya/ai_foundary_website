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
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Restore draft from localStorage
  useEffect(() => {
    if (event && isOpen) {
      try {
        const saved = localStorage.getItem(`aifoundry:reg:${event.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setFormData({
            name: parsed.name || "",
            email: parsed.email || "",
            phone: parsed.phone || "",
            college: parsed.college || "Dayananda Sagar University",
            branch: parsed.branch || "B.Tech CSE (AI & ML)",
          });
          setCustomAnswers(parsed.customAnswers || {});
        }
      } catch {}
      setStatus("idle");
      setErrorMessage("");
    }
  }, [event, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (event) {
      try {
        localStorage.setItem(`aifoundry:reg:${event.id}`, JSON.stringify({ ...updated, customAnswers }));
      } catch {}
    }
  };

  const handleCustomAnswerChange = (questionId: string, value: string) => {
    const updatedAnswers = { ...customAnswers, [questionId]: value };
    setCustomAnswers(updatedAnswers);

    if (event) {
      try {
        localStorage.setItem(`aifoundry:reg:${event.id}`, JSON.stringify({ ...formData, customAnswers: updatedAnswers }));
      } catch {}
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    // Check if event registration is disabled, future, or past deadline
    if (event.status === "ended" || event.isRegistrationOpen === false) {
      setStatus("error");
      setErrorMessage(event.closedMessage || "Applications for this event are currently closed.");
      return;
    }

    if (event.registrationStartDate && new Date(event.registrationStartDate).getTime() > Date.now()) {
      setStatus("error");
      setErrorMessage("Applications for this event have not opened yet.");
      return;
    }

    if (event.registrationDeadline && new Date(event.registrationDeadline).getTime() < Date.now()) {
      setStatus("error");
      setErrorMessage("The application deadline for this event has passed.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          ...formData,
          customAnswers,
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
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl border border-white/80 p-6 sm:p-8 shadow-2xl z-10 bg-white/95 backdrop-blur-2xl text-slate-900 font-sans max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-cyan-600">
                EVENT REGISTRATION PORTAL
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 line-clamp-1">
                {event.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          {status === "success" ? (
            <div className="py-8 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="size-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Registration Confirmed!</h3>
              <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
                We have confirmed your registration for <strong className="text-slate-900">{event.title}</strong>. Orientation details have been sent to <span className="font-semibold text-cyan-700">{formData.email}</span>.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {status === "error" && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2 font-bold">
                  <AlertCircle className="size-4 flex-shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Aryan Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@dsu.edu.in"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    College / University
                  </label>
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="Dayananda Sagar University"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Department / Branch
                  </label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    placeholder="B.Tech CSE (AI & ML)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              {/* Dynamic Custom Questions */}
              {event.customQuestions && event.customQuestions.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Additional Event Questions
                  </span>
                  {event.customQuestions.map((q) => (
                    <div key={q.id}>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {q.label} {q.required && "*"}
                      </label>
                      {q.type === "textarea" ? (
                        <textarea
                          rows={2}
                          required={q.required}
                          value={customAnswers[q.id] || ""}
                          onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                          placeholder="Your answer..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      ) : q.type === "select" && q.options ? (
                        <select
                          required={q.required}
                          value={customAnswers[q.id] || ""}
                          onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold focus:outline-none focus:border-cyan-500 transition-colors"
                        >
                          <option value="">Select option</option>
                          {q.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required={q.required}
                          value={customAnswers[q.id] || ""}
                          onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                          placeholder="Your answer..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-6 py-2.5 rounded-full font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {status === "loading" && <Loader2 className="size-3.5 animate-spin" />}
                  <span>Confirm Registration</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
