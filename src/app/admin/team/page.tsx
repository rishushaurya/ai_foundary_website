"use client";

import React, { useState, useEffect } from "react";
import { TeamMember } from "@/lib/data";
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
  GraduationCap,
} from "lucide-react";

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit/Add modal state
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/team");
      const data = await res.json();
      setMembers(data);
    } catch {
      setNotice({ type: "error", text: "Failed to load team members" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMember) return;

    setSaving(true);
    setNotice(null);

    try {
      const isNew = !members.some((m) => m.id === activeMember.id);
      const method = isNew ? "POST" : "PUT";

      const res = await fetch("/api/admin/team", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeMember),
      });

      if (!res.ok) throw new Error("Failed to save member");

      setNotice({ type: "success", text: "Team member updated and synchronized!" });
      setIsModalOpen(false);
      setActiveMember(null);
      await fetchMembers();
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      const res = await fetch(`/api/admin/team?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setNotice({ type: "success", text: "Team member removed" });
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Delete failed" });
    }
  };

  const openNewMemberModal = () => {
    setActiveMember({
      id: `team-${Date.now()}`,
      name: "",
      role: "",
      category: "team",
      affiliation: "",
      email: "",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlHYmRv5UvJfByZ3NBzHJStQbFL_4zr6bODS_nr-byLotWW4OI2WHdE2tFJWjTUH8vWjC5NQ0-ZYlcXiDeTvpicrhELnBWw36Ot-VMIBkTgzQk_qwVKvXd4kE4qL47PSdZlwlvzljM1b3CMYg3ZWD7iVpXHJjXgnswsSgXUM_n3v-MuEknupsNwErFJmHm2JknF4FR9FElyeY6Pg4X0VFD0NqsI27Z83-1WRayFgqoptOEP0zK62EL",
      order: members.length + 1,
      showOnHome: true,
      socialLinks: { linkedin: "", github: "", instagram: "" },
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setActiveMember({
      ...member,
      socialLinks: {
        linkedin: member.socialLinks?.linkedin || "",
        github: member.socialLinks?.github || "",
        instagram: member.socialLinks?.instagram || "",
      },
    });
    setIsModalOpen(true);
  };

  const facultyList = members.filter((m) => m.category === "faculty");
  const executiveList = members.filter((m) => m.category === "executive");
  const wingList = members.filter((m) => m.category === "team");

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-cyan-200">
            <Users className="size-3 text-cyan-600" />
            <span>Team &amp; Mentors</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Faculty Advisors &amp; Student Leadership
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage faculty mentors, student executives, and departmental wing contributors.
          </p>
        </div>

        <button
          onClick={openNewMemberModal}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Add Member</span>
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

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="size-8 animate-spin text-cyan-600" />
          <span className="text-xs font-bold">Loading team roster...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Faculty Members */}
          <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <GraduationCap className="size-5 text-cyan-600" />
              <span>Faculty Mentors ({facultyList.length})</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facultyList.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img
                        src={normalizeImageUrl(m.image, "/images/rectangle-899.png")}
                        alt={m.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">{m.name}</span>
                      <span className="text-xs font-semibold text-cyan-700">{m.role}</span>
                      <span className="text-[11px] text-slate-400 block">{m.affiliation}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(m)}
                      className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-cyan-600"
                    >
                      <Edit2 className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(m.id)}
                      className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Executives & Wings */}
          <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Users className="size-5 text-cyan-600" />
              <span>Student Executives &amp; Wings ({executiveList.length + wingList.length})</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[...executiveList, ...wingList].map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img
                        src={normalizeImageUrl(m.image, "/images/rectangle-899.png")}
                        alt={m.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{m.name}</span>
                      <span className="text-[11px] font-semibold text-slate-500">{m.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(m)}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-cyan-600"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(m.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT / ADD MEMBER MODAL ===== */}
      {isModalOpen && activeMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {members.some((m) => m.id === activeMember.id) ? "Edit Member" : "Add Member"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-bold uppercase tracking-wider text-slate-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={activeMember.name}
                  onChange={(e) => setActiveMember({ ...activeMember, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold uppercase tracking-wider text-slate-700">
                    Category *
                  </label>
                  <select
                    value={activeMember.category}
                    onChange={(e) =>
                      setActiveMember({
                        ...activeMember,
                        category: e.target.value as "faculty" | "executive" | "team",
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:border-cyan-500"
                  >
                    <option value="faculty">Faculty Mentor</option>
                    <option value="executive">Student Executive</option>
                    <option value="team">Department Wing Member</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold uppercase tracking-wider text-slate-700">
                    Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={activeMember.role}
                    onChange={(e) => setActiveMember({ ...activeMember, role: e.target.value })}
                    placeholder="e.g. Lead Designer, AI Researcher"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold uppercase tracking-wider text-slate-700">
                  Affiliation / Department
                </label>
                <input
                  type="text"
                  value={activeMember.affiliation || ""}
                  onChange={(e) => setActiveMember({ ...activeMember, affiliation: e.target.value })}
                  placeholder="e.g. Department of CSE (AI & ML), DSU"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold uppercase tracking-wider text-slate-700">
                  Image URL (Online Link / Google Drive / Local)
                </label>
                <input
                  type="text"
                  value={activeMember.image}
                  onChange={(e) => setActiveMember({ ...activeMember, image: e.target.value })}
                  placeholder="Paste direct image link..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold uppercase tracking-wider text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={activeMember.email || ""}
                  onChange={(e) => setActiveMember({ ...activeMember, email: e.target.value })}
                  placeholder="name@dsu.edu.in"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold uppercase tracking-wider text-slate-700">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={activeMember.socialLinks?.linkedin || ""}
                  onChange={(e) =>
                    setActiveMember({
                      ...activeMember,
                      socialLinks: { ...activeMember.socialLinks, linkedin: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full text-white bg-gradient-to-r from-cyan-600 to-blue-600 font-bold shadow-md shadow-cyan-600/25"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
