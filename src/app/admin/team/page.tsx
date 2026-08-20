"use client";

import React, { useState, useEffect } from "react";
import { TeamMember } from "@/lib/data";
import { Plus, Trash2, Edit2, Save, X, Loader2, CheckCircle, AlertCircle, Users } from "lucide-react";

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

      setNotice({ type: "success", text: "Team member updated successfully" });
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
      image: "/uploads/team/default.png",
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

  return (
    <div className="space-y-6 font-mono text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider text-white">
            TEAM &amp; FACULTY ROSTER
          </h1>
          <p className="text-xs text-slate-400 normal-case font-sans">
            Manage executive leads, functional wings, and faculty advisors.
          </p>
        </div>

        <button
          onClick={openNewMemberModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider bg-cyan-400 hover:bg-cyan-300 text-black transition-all hover:scale-105 cursor-pointer shadow-[0_0_15px_rgba(0,210,255,0.4)]"
        >
          <Plus className="size-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Notifications */}
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

      {/* Member List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl border border-white/10 bg-black/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 sm:p-5 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-lg hover:border-cyan-400/50 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                      member.category === "faculty"
                        ? "bg-amber-950/60 text-amber-300 border-amber-500/40"
                        : member.category === "executive"
                        ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/40"
                        : "bg-purple-950/60 text-purple-300 border-purple-500/40"
                    }`}
                  >
                    {member.category}
                  </span>
                  <h3 className="font-bold text-sm text-white uppercase">{member.name}</h3>
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  {member.role} {member.affiliation && `• ${member.affiliation}`} • {member.email || "No email"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(member)}
                  className="p-2.5 rounded-xl border border-white/15 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 hover:bg-cyan-950/30 transition-colors cursor-pointer"
                  title="Edit Member"
                >
                  <Edit2 className="size-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="p-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                  title="Delete Member"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {isModalOpen && activeMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-black/85 backdrop-blur-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-bold uppercase text-white">
                {members.some((m) => m.id === activeMember.id) ? "Edit Team Member" : "Add Team Member"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={activeMember.name}
                  onChange={(e) => setActiveMember({ ...activeMember, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-white/5 focus:outline-none focus:border-cyan-400 focus:bg-white/10 text-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Role Title *</label>
                  <input
                    type="text"
                    required
                    value={activeMember.role}
                    onChange={(e) => setActiveMember({ ...activeMember, role: e.target.value })}
                    placeholder="e.g. Lead / President"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-white/5 focus:outline-none focus:border-cyan-400 focus:bg-white/10 text-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Category *</label>
                  <select
                    value={activeMember.category}
                    onChange={(e) => setActiveMember({ ...activeMember, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-slate-900 focus:outline-none focus:border-cyan-400 text-white transition-colors"
                  >
                    <option value="faculty">Faculty Advisor</option>
                    <option value="executive">Executive Board</option>
                    <option value="team">Functional Wing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Affiliation / Subtitle</label>
                <input
                  type="text"
                  value={activeMember.affiliation || ""}
                  onChange={(e) => setActiveMember({ ...activeMember, affiliation: e.target.value })}
                  placeholder="e.g. Professor & Chairperson, CSE (AI & ML)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-white/5 focus:outline-none focus:border-cyan-400 focus:bg-white/10 text-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Official Email</label>
                <input
                  type="email"
                  value={activeMember.email || ""}
                  onChange={(e) => setActiveMember({ ...activeMember, email: e.target.value })}
                  placeholder="name@dsu.edu.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-white/5 focus:outline-none focus:border-cyan-400 focus:bg-white/10 text-white transition-colors"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="block text-[10px] uppercase font-bold text-slate-300">Social Channels</label>
                <input
                  type="url"
                  placeholder="LinkedIn URL"
                  value={activeMember.socialLinks?.linkedin || ""}
                  onChange={(e) =>
                    setActiveMember({
                      ...activeMember,
                      socialLinks: { ...activeMember.socialLinks, linkedin: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-white/20 bg-white/5 text-white"
                />
                <input
                  type="url"
                  placeholder="GitHub URL"
                  value={activeMember.socialLinks?.github || ""}
                  onChange={(e) =>
                    setActiveMember({
                      ...activeMember,
                      socialLinks: { ...activeMember.socialLinks, github: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-white/20 bg-white/5 text-white"
                />
                <input
                  type="url"
                  placeholder="Instagram URL"
                  value={activeMember.socialLinks?.instagram || ""}
                  onChange={(e) =>
                    setActiveMember({
                      ...activeMember,
                      socialLinks: { ...activeMember.socialLinks, instagram: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-white/20 bg-white/5 text-white"
                />
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
                  <span>Save Member</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
