"use client";

import React, { useState, useEffect } from "react";
import { EventData, EventRegistration } from "@/lib/data";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  Users,
  Calendar,
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

      setNotice({ type: "success", text: "Event updated successfully" });
      setIsModalOpen(false);
      setActiveEvent(null);
      await fetchEvents();
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Failed to save" });
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
      setNotice({ type: "success", text: "Event removed" });
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Delete failed" });
    }
  };

  const openNewEventModal = () => {
    setActiveEvent({
      id: `evt-${Date.now()}`,
      title: "",
      description: "",
      date: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
      venue: "DSU Main Campus, Bangalore",
      image: "/uploads/events/default.png",
      status: "upcoming",
      registrationMode: "builtin",
      googleFormUrl: "",
      isCountdownEvent: false,
      showOnHome: true,
      showOnEventPage: true,
      registrations: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event: EventData) => {
    setActiveEvent({
      ...event,
      date: new Date(event.date).toISOString().slice(0, 16),
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 font-mono text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider text-white">
            EVENT MANAGEMENT
          </h1>
          <p className="text-xs text-slate-400 normal-case font-sans">
            Create workshops, toggle registration modes, and export attendee lists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/export?type=events"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/15 hover:border-cyan-400/50 shadow-sm transition-all cursor-pointer no-underline"
          >
            <Download className="size-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={openNewEventModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider bg-cyan-400 hover:bg-cyan-300 text-black transition-all hover:scale-105 cursor-pointer shadow-[0_0_15px_rgba(0,210,255,0.4)]"
          >
            <Plus className="size-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Notices */}
      {notice && (
        <div
          className={`p-3 rounded-2xl border text-xs flex items-center gap-2 font-bold uppercase ${
            notice.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/60 border-red-500/40 text-red-300"
          }`}
        >
          {notice.type === "success" ? <CheckCircle className="size-4" /> : <AlertCircle className="size-4" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Events List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl border border-white/10 bg-black/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-lg hover:border-cyan-400/50 transition-all gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                      evt.status === "ended"
                        ? "bg-slate-900 text-slate-400 border-slate-700"
                        : "bg-cyan-950/60 text-cyan-300 border-cyan-500/40"
                    }`}
                  >
                    {evt.status}
                  </span>
                  {evt.isCountdownEvent && (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-950/60 border border-amber-500/40 text-amber-300">
                      Countdown Ticker
                    </span>
                  )}
                  <h3 className="font-bold text-sm text-white uppercase">{evt.title}</h3>
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  {new Date(evt.date).toLocaleString()} • Mode:{" "}
                  <strong className="text-white">{evt.registrationMode}</strong> •{" "}
                  <span className="text-cyan-400 font-bold">{(evt.registrations || []).length} Registered</span>
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => setViewingRegsEvent(evt)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 text-xs font-bold text-slate-300 hover:border-cyan-400 hover:bg-cyan-950/30 transition-colors cursor-pointer"
                  title="View Registered Attendees"
                >
                  <Users className="size-3.5 text-cyan-400" />
                  <span>({(evt.registrations || []).length})</span>
                </button>
                <button
                  onClick={() => openEditModal(evt)}
                  className="p-2.5 rounded-xl border border-white/15 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 hover:bg-cyan-950/30 transition-colors cursor-pointer"
                  title="Edit Event"
                >
                  <Edit2 className="size-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteEvent(evt.id)}
                  className="p-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                  title="Delete Event"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {isModalOpen && activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-black/85 backdrop-blur-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-bold uppercase text-white">
                {events.some((e) => e.id === activeEvent.id) ? "Edit Event" : "Create New Event"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={activeEvent.title}
                  onChange={(e) => setActiveEvent({ ...activeEvent, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-white/5 focus:outline-none focus:border-cyan-400 focus:bg-white/10 text-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={activeEvent.description}
                  onChange={(e) => setActiveEvent({ ...activeEvent, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-white/5 focus:outline-none focus:border-cyan-400 focus:bg-white/10 text-white leading-relaxed transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Date &amp; Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={activeEvent.date}
                    onChange={(e) => setActiveEvent({ ...activeEvent, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-white/5 focus:outline-none focus:border-cyan-400 focus:bg-white/10 text-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Status</label>
                  <select
                    value={activeEvent.status}
                    onChange={(e) => setActiveEvent({ ...activeEvent, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-slate-900 focus:outline-none focus:border-cyan-400 text-white transition-colors"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="ended">Ended (Closed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Venue Location</label>
                <input
                  type="text"
                  value={activeEvent.venue}
                  onChange={(e) => setActiveEvent({ ...activeEvent, venue: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-white/5 focus:outline-none focus:border-cyan-400 focus:bg-white/10 text-white transition-colors"
                />
              </div>

              <div className="p-4 rounded-2xl border border-white/15 bg-white/5 space-y-3">
                <label className="block text-[10px] uppercase font-bold text-cyan-400">Registration Mode</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="regMode"
                      checked={activeEvent.registrationMode === "builtin"}
                      onChange={() => setActiveEvent({ ...activeEvent, registrationMode: "builtin" })}
                    />
                    <span>Built-in Form (Stored in CMS)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="regMode"
                      checked={activeEvent.registrationMode === "google-form"}
                      onChange={() => setActiveEvent({ ...activeEvent, registrationMode: "google-form" })}
                    />
                    <span>External Google Form</span>
                  </label>
                </div>

                {activeEvent.registrationMode === "google-form" && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Google Form URL</label>
                    <input
                      type="url"
                      placeholder="https://forms.gle/..."
                      value={activeEvent.googleFormUrl || ""}
                      onChange={(e) => setActiveEvent({ ...activeEvent, googleFormUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-white/20 bg-black/50 text-white"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="countdownCheck"
                  checked={activeEvent.isCountdownEvent || false}
                  onChange={(e) => setActiveEvent({ ...activeEvent, isCountdownEvent: e.target.checked })}
                />
                <label htmlFor="countdownCheck" className="text-slate-300 cursor-pointer">
                  Feature as primary Countdown Ticker on Home &amp; Events pages
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold uppercase tracking-wider bg-cyan-400 hover:bg-cyan-300 text-black cursor-pointer shadow-[0_0_15px_rgba(0,210,255,0.4)] disabled:opacity-50"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  <span>Save Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registrations Attendee Modal */}
      {viewingRegsEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl border border-white/20 bg-black/85 backdrop-blur-2xl p-6 sm:p-8 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400">ATTENDEE ROSTER</span>
                <h2 className="text-base font-bold uppercase text-white">{viewingRegsEvent.title}</h2>
              </div>
              <button onClick={() => setViewingRegsEvent(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            <div className="flex justify-end">
              <a
                href={`/api/admin/export?type=events&eventId=${viewingRegsEvent.id}`}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-white/20 text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/15 transition-colors no-underline"
              >
                <Download className="size-3.5 text-cyan-400" />
                <span>Export Event CSV</span>
              </a>
            </div>

            {(!viewingRegsEvent.registrations || viewingRegsEvent.registrations.length === 0) ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No registrations received yet for this event.
              </div>
            ) : (
              <div className="space-y-2">
                {viewingRegsEvent.registrations.map((reg, idx) => (
                  <div
                    key={reg.id || idx}
                    className="p-3.5 rounded-2xl border border-white/15 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1"
                  >
                    <div>
                      <strong className="text-white uppercase block">{reg.name}</strong>
                      <span className="text-slate-400 font-sans">{reg.email} • {reg.phone}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {reg.college} • {reg.branch}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
