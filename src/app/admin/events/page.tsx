"use client";

import React, { useState, useEffect } from "react";
import { EventData, EventCustomQuestion } from "@/lib/data";
import { normalizeImageUrl } from "@/lib/image-helper";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  Download,
  Clock,
  Lock,
  Unlock,
} from "lucide-react";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit/Add modal
  const [activeEvent, setActiveEvent] = useState<EventData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Registrations Viewer modal
  const [viewingRegsEvent, setViewingRegsEvent] = useState<EventData | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      setEvents(data);
    } catch {
      setNotice({ type: "error", text: "Failed to load events" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent) return;

    setSaving(true);
    setNotice(null);

    try {
      const isNew = !events.some((ev) => ev.id === activeEvent.id);
      const method = isNew ? "POST" : "PUT";

      const res = await fetch("/api/admin/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeEvent),
      });

      if (!res.ok) throw new Error("Failed to save event");

      setNotice({ type: "success", text: "Event updated and synchronized live!" });
      setIsModalOpen(false);
      setActiveEvent(null);
      await fetchEvents();
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Failed to save event" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setNotice({ type: "success", text: "Event removed successfully" });
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Delete failed" });
    }
  };

  const openNewEventModal = () => {
    setActiveEvent({
      id: `evt-${Date.now()}`,
      title: "",
      description: "",
      date: "Oct 25, 2026",
      venue: "DSU Innovation Hall",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqGXvsvKNg8FLCw2KFq974LERIA0x-ed5scbtG-vr7_Erz1LXF0Kxo6IqAt4jUJjdeQwylLItjc3ZIlWy4POUMjToItuEgSL3auk47bkOyypTKJlgIVp-zH_xOVI1B5rjO0mLjpM2L8SLv_2EXACmgePorX1RlrdDiyzJr2_mfCFS0OtkGutcJDkKw7PWNzbGl59kAK4Vn_VSR3N7VpPY09StkEzS5Wmj2LWXxcNiNMtKDurLLha5S",
      status: "upcoming",
      registrationMode: "builtin",
      externalRegistrationUrl: "",
      isRegistrationOpen: true,
      registrationStartDate: "",
      registrationDeadline: "",
      closedMessage: "Applications Closed",
      showOnHome: true,
      showOnEventPage: true,
      customQuestions: [],
      registrations: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (evt: EventData) => {
    setActiveEvent({
      ...evt,
      registrationMode: evt.registrationMode || "builtin",
      externalRegistrationUrl: evt.externalRegistrationUrl || evt.googleFormUrl || "",
      isRegistrationOpen: evt.isRegistrationOpen !== false,
      registrationStartDate: evt.registrationStartDate || "",
      registrationDeadline: evt.registrationDeadline || "",
      closedMessage: evt.closedMessage || "Applications Closed",
      customQuestions: evt.customQuestions || [],
    });
    setIsModalOpen(true);
  };

  const addCustomQuestion = () => {
    if (!activeEvent) return;
    const newQ: EventCustomQuestion = {
      id: `q-${Date.now()}`,
      label: "",
      type: "text",
      required: false,
    };
    setActiveEvent({
      ...activeEvent,
      customQuestions: [...(activeEvent.customQuestions || []), newQ],
    });
  };

  const removeCustomQuestion = (qId: string) => {
    if (!activeEvent) return;
    setActiveEvent({
      ...activeEvent,
      customQuestions: (activeEvent.customQuestions || []).filter((q) => q.id !== qId),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-cyan-200">
            <Calendar className="size-3 text-cyan-600" />
            <span>Event Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Events, Hackathons &amp; Masterclasses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Publish upcoming initiatives, manage registration open/closed status, deadlines, and questions.
          </p>
        </div>

        <button
          onClick={openNewEventModal}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="size-4" />
          <span>New Event</span>
        </button>
      </div>

      {notice && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            notice.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="size-4 text-emerald-600" />
          ) : (
            <AlertCircle className="size-4 text-red-600" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Events Table / Card List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="size-8 animate-spin text-cyan-600" />
          <span className="text-xs font-bold">Loading events...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white/50 border border-slate-200/60 text-slate-500 text-sm">
          No events created yet. Click "+ New Event" above to create one.
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider">
                  <th className="pb-3 px-3">Event Title</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Applications</th>
                  <th className="pb-3 px-3">Home Spotlight</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Venue</th>
                  <th className="pb-3 px-3 text-center">Registrations</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((evt) => {
                  const isClosed = evt.isRegistrationOpen === false || evt.status === "ended";
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-3 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            <img
                              src={normalizeImageUrl(evt.image, "/images/rectangle-899.png")}
                              alt={evt.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-slate-900">{evt.title}</span>
                            <span className="text-[11px] text-slate-500 line-clamp-1">{evt.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            evt.status === "upcoming"
                              ? "bg-cyan-50 text-cyan-800 border border-cyan-200"
                              : evt.status === "ongoing"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isClosed
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {isClosed ? <Lock className="size-2.5" /> : <Unlock className="size-2.5" />}
                          <span>{isClosed ? "Closed" : "Open"}</span>
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            evt.showOnHome !== false
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {evt.showOnHome !== false ? "Visible on Home" : "Hidden on Home"}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-slate-600 font-medium whitespace-nowrap">{evt.date}</td>
                      <td className="py-4 px-3 text-slate-600 font-medium">{evt.venue}</td>
                      <td className="py-4 px-3 text-center">
                        <button
                          onClick={() => setViewingRegsEvent(evt)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 text-[11px] transition-colors cursor-pointer"
                        >
                          <Users className="size-3 text-cyan-600" />
                          <span>{(evt.registrations || []).length} Attendees</span>
                        </button>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(evt)}
                            className="p-1.5 rounded-lg hover:bg-cyan-50 text-slate-500 hover:text-cyan-700 transition-colors cursor-pointer"
                            title="Edit Event"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(evt.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Event"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== EDIT / ADD EVENT MODAL ===== */}
      {isModalOpen && activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {events.some((e) => e.id === activeEvent.id) ? "Edit Event Details" : "Create New Event"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={activeEvent.title}
                    onChange={(e) => setActiveEvent({ ...activeEvent, title: e.target.value })}
                    placeholder="e.g. AI Foundry Hackathon Sprint"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Status *</label>
                  <select
                    value={activeEvent.status}
                    onChange={(e) =>
                      setActiveEvent({
                        ...activeEvent,
                        status: e.target.value as "upcoming" | "ongoing" | "ended",
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing Challenge</option>
                    <option value="ended">Ended / Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date String *</label>
                  <input
                    type="text"
                    required
                    value={activeEvent.date}
                    onChange={(e) => setActiveEvent({ ...activeEvent, date: e.target.value })}
                    placeholder="e.g. Oct 25, 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Venue / Location *</label>
                  <input
                    type="text"
                    required
                    value={activeEvent.venue}
                    onChange={(e) => setActiveEvent({ ...activeEvent, venue: e.target.value })}
                    placeholder="e.g. DSU Innovation Hall / Online"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Event Image (Google Drive link / Direct image URL)
                </label>
                <input
                  type="text"
                  value={activeEvent.image}
                  onChange={(e) => setActiveEvent({ ...activeEvent, image: e.target.value })}
                  placeholder="https://drive.google.com/file/d/... or /images/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-[11px] text-slate-700 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={activeEvent.description}
                  onChange={(e) => setActiveEvent({ ...activeEvent, description: e.target.value })}
                  placeholder="Comprehensive event briefing, tracks, and requirements..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              {/* ===== REGISTRATION AVAILABILITY & TIMELINE ===== */}
              <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-cyan-700" />
                    <span className="font-extrabold uppercase tracking-wider text-cyan-950">
                      Application Window &amp; Availability Control
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Allow Registrations / Applications
                    </label>
                    <select
                      value={activeEvent.isRegistrationOpen !== false ? "open" : "closed"}
                      onChange={(e) =>
                        setActiveEvent({
                          ...activeEvent,
                          isRegistrationOpen: e.target.value === "open",
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="open">🟢 Open (Students can apply)</option>
                      <option value="closed">🔴 Closed / Paused (Block applications)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Closed Message / Button Text
                    </label>
                    <input
                      type="text"
                      value={activeEvent.closedMessage || "Applications Closed"}
                      onChange={(e) =>
                        setActiveEvent({
                          ...activeEvent,
                          closedMessage: e.target.value,
                        })
                      }
                      placeholder="e.g. Applications Closed"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Applications Open Date / Time (Optional)
                    </label>
                    <input
                      type="text"
                      value={activeEvent.registrationStartDate || ""}
                      onChange={(e) =>
                        setActiveEvent({
                          ...activeEvent,
                          registrationStartDate: e.target.value,
                        })
                      }
                      placeholder="e.g. Oct 15, 2026 10:00 AM"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-[11px] text-slate-800 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Application Deadline / Closing Date (Optional)
                    </label>
                    <input
                      type="text"
                      value={activeEvent.registrationDeadline || ""}
                      onChange={(e) =>
                        setActiveEvent({
                          ...activeEvent,
                          registrationDeadline: e.target.value,
                        })
                      }
                      placeholder="e.g. Oct 24, 2026 11:59 PM"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-[11px] text-slate-800 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* ===== REGISTRATION SETTINGS ===== */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <LinkIcon className="size-4 text-cyan-600" />
                  <span className="font-extrabold uppercase tracking-wider text-slate-800">
                    Registration Mode &amp; Custom Fields
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mode</label>
                    <select
                      value={activeEvent.registrationMode || "builtin"}
                      onChange={(e) =>
                        setActiveEvent({
                          ...activeEvent,
                          registrationMode: e.target.value as "builtin" | "external",
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="builtin">Built-in Form Portal</option>
                      <option value="external">External Registration Link (Unstop / Devfolio / Google Forms)</option>
                    </select>
                  </div>

                  {activeEvent.registrationMode === "external" && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">External Registration URL</label>
                      <input
                        type="url"
                        value={activeEvent.externalRegistrationUrl || activeEvent.googleFormUrl || ""}
                        onChange={(e) =>
                          setActiveEvent({
                            ...activeEvent,
                            externalRegistrationUrl: e.target.value,
                            googleFormUrl: e.target.value,
                          })
                        }
                        placeholder="https://unstop.com/... or https://forms.gle/..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-[11px] text-slate-900 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  )}
                </div>

                {/* Built-in Custom Question Builder */}
                {activeEvent.registrationMode === "builtin" && (
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        <HelpCircle className="size-3.5 text-cyan-600" />
                        <span>Custom Registration Questions ({activeEvent.customQuestions?.length || 0})</span>
                      </span>
                      <button
                        type="button"
                        onClick={addCustomQuestion}
                        className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-bold hover:bg-cyan-200 transition-colors cursor-pointer"
                      >
                        + Add Question
                      </button>
                    </div>

                    {(activeEvent.customQuestions || []).map((q, qIdx) => (
                      <div key={q.id} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-3">
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={q.label}
                            onChange={(e) => {
                              const updated = [...(activeEvent.customQuestions || [])];
                              updated[qIdx].label = e.target.value;
                              setActiveEvent({ ...activeEvent, customQuestions: updated });
                            }}
                            placeholder="Question label (e.g. GitHub profile or Team name)"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
                          />
                        </div>
                        <select
                          value={q.type}
                          onChange={(e) => {
                            const updated = [...(activeEvent.customQuestions || [])];
                            updated[qIdx].type = e.target.value as "text" | "select" | "textarea";
                            setActiveEvent({ ...activeEvent, customQuestions: updated });
                          }}
                          className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700"
                        >
                          <option value="text">Text Input</option>
                          <option value="textarea">Textarea</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeCustomQuestion(q.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={activeEvent.showOnHome !== false}
                    onChange={(e) => setActiveEvent({ ...activeEvent, showOnHome: e.target.checked })}
                    className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Show in Homepage Spotlight</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={activeEvent.showOnEventPage !== false}
                    onChange={(e) => setActiveEvent({ ...activeEvent, showOnEventPage: e.target.checked })}
                    className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Show on Events Page</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-full font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/20 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  <span>Save Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== REGISTRATIONS VIEWER MODAL ===== */}
      {viewingRegsEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-slate-200 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700">
                  Attendee Roster
                </span>
                <h2 className="text-xl font-bold text-slate-900">{viewingRegsEvent.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                {(viewingRegsEvent.registrations || []).length > 0 && (
                  <a
                    href={`/api/admin/export?type=events&eventId=${viewingRegsEvent.id}`}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors no-underline"
                  >
                    <Download className="size-3 text-cyan-600" />
                    <span>Export CSV</span>
                  </a>
                )}
                <button
                  onClick={() => setViewingRegsEvent(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {(viewingRegsEvent.registrations || []).length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-medium text-xs">
                No students registered for this event yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider">
                      <th className="pb-2 px-2">Name</th>
                      <th className="pb-2 px-2">Email</th>
                      <th className="pb-2 px-2">Phone</th>
                      <th className="pb-2 px-2">Branch / College</th>
                      <th className="pb-2 px-2">Registered At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingRegsEvent.registrations?.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50">
                        <td className="py-3 px-2 font-bold text-slate-900">{reg.name}</td>
                        <td className="py-3 px-2 text-cyan-700 font-mono text-[11px]">{reg.email}</td>
                        <td className="py-3 px-2 font-mono text-[11px] text-slate-600">{reg.phone}</td>
                        <td className="py-3 px-2 text-slate-600">{reg.branch}</td>
                        <td className="py-3 px-2 text-slate-400 font-mono text-[10px]">
                          {new Date(reg.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
