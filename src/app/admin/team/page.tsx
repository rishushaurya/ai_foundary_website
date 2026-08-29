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
  Eye,
} from "lucide-react";
import { ImagePreviewModal, ImagePreviewSettings } from "@/components/admin/image-preview-modal";

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit/Add modal state
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

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
      imageFit: "cover",
      imagePosition: "center",
      homeImage: "",
      order: members.length + 1,
      showOnHome: true,
      socialLinks: { linkedin: "", github: "", instagram: "" },
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setActiveMember({
      ...member,
      imageFit: member.imageFit || "cover",
      imagePosition: member.imagePosition || "center",
      homeImage: member.homeImage || "",
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
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-medium ${
            notice.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === "success" ? (
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-rose-600 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Faculty Advisory Board Section */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <GraduationCap className="size-5 text-cyan-600" />
          <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
            1. Faculty Advisory Board &amp; Mentors ({facultyList.length})
          </h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 className="size-6 animate-spin text-cyan-600 mr-2" />
            <span>Loading members...</span>
          </div>
        ) : facultyList.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">No faculty advisors added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facultyList.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={normalizeImageUrl(m.image)}
                      alt={m.name}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{m.name}</h4>
                    <p className="text-xs text-cyan-700 font-semibold truncate">{m.role}</p>
                    <p className="text-[11px] text-slate-500 truncate">{m.affiliation || "DSU AI & ML"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(m)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-cyan-600 transition-colors"
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(m.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Executive Leadership Section */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Users className="size-5 text-cyan-600" />
          <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
            2. Executive Leadership Board ({executiveList.length})
          </h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 className="size-6 animate-spin text-cyan-600 mr-2" />
            <span>Loading members...</span>
          </div>
        ) : executiveList.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">No executive leaders added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {executiveList.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={normalizeImageUrl(m.image)}
                      alt={m.name}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{m.name}</h4>
                    <p className="text-xs text-cyan-700 font-semibold truncate">{m.role}</p>
                    <p className="text-[11px] text-slate-500 truncate">{m.affiliation || "DSU AI Foundry"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(m)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-cyan-600 transition-colors"
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(m.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Departmental Wing Members Section */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Users className="size-5 text-cyan-600" />
          <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
            3. Departmental Wings &amp; Contributors ({wingList.length})
          </h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 className="size-6 animate-spin text-cyan-600 mr-2" />
            <span>Loading members...</span>
          </div>
        ) : wingList.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">No wing members added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wingList.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={normalizeImageUrl(m.image)}
                      alt={m.name}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{m.name}</h4>
                    <p className="text-xs text-cyan-700 font-semibold truncate">{m.role}</p>
                    <p className="text-[11px] text-slate-500 truncate">{m.affiliation || "Foundry Wing"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(m)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-cyan-600 transition-colors"
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(m.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Member Modal Dialog */}
      {isModalOpen && activeMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">
                {activeMember.id.startsWith("team-") && !members.some((m) => m.id === activeMember.id)
                  ? "Add New Team Member"
                  : "Edit Team Member"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
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
                  placeholder="e.g. Dr. Jane Doe / Alex Rivera"
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
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold uppercase tracking-wider text-slate-700">
                    Image URL (Online Link / Google Drive / Local)
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <Eye className="size-3.5" />
                    <span>Preview &amp; Framing</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={activeMember.image}
                  onChange={(e) => setActiveMember({ ...activeMember, image: e.target.value })}
                  placeholder="Paste direct image link..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Social Channels & Contact Details Grid */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="block font-extrabold uppercase tracking-wider text-slate-700 text-[11px]">
                  Social Media Links &amp; Contact (Icons appear on page only if provided)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={activeMember.email || ""}
                      onChange={(e) => setActiveMember({ ...activeMember, email: e.target.value })}
                      placeholder="user@dsu.edu.in"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={activeMember.socialLinks?.linkedin || ""}
                      onChange={(e) =>
                        setActiveMember({
                          ...activeMember,
                          socialLinks: { ...activeMember.socialLinks, linkedin: e.target.value },
                        })
                      }
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">GitHub URL</label>
                    <input
                      type="url"
                      value={activeMember.socialLinks?.github || ""}
                      onChange={(e) =>
                        setActiveMember({
                          ...activeMember,
                          socialLinks: { ...activeMember.socialLinks, github: e.target.value },
                        })
                      }
                      placeholder="https://github.com/..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Instagram URL</label>
                    <input
                      type="url"
                      value={activeMember.socialLinks?.instagram || ""}
                      onChange={(e) =>
                        setActiveMember({
                          ...activeMember,
                          socialLinks: { ...activeMember.socialLinks, instagram: e.target.value },
                        })
                      }
                      placeholder="https://instagram.com/..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full text-white bg-gradient-to-r from-cyan-600 to-blue-600 font-bold shadow-md shadow-cyan-600/25 cursor-pointer"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visual Image Preview & Framing Inspector Modal */}
      {activeMember && (
        <ImagePreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          title={`Team Member Portrait - ${activeMember.name || "New Member"}`}
          imageUrl={activeMember.image}
          homeImageUrl={activeMember.homeImage}
          imageFit={activeMember.imageFit || "cover"}
          imagePosition={activeMember.imagePosition || "center"}
          aspectRatioType="team"
          cardTitle={activeMember.name || "Member Name"}
          cardSubtitle={activeMember.role || "Role / Title"}
          onApply={(res: ImagePreviewSettings) => {
            setActiveMember({
              ...activeMember,
              image: res.imageUrl,
              homeImage: res.homeImageUrl,
              imageFit: res.imageFit,
              imagePosition: res.imagePosition,
            });
          }}
        />
      )}
    </div>
  );
}
