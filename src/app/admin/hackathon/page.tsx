"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
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
  ShieldCheck,
  Vote,
  TrendingUp,
  FileText,
  Upload,
  RefreshCw,
  Eye,
  Sliders,
  ChevronRight,
  UserCheck,
  Ban,
  ArrowRight,
  Copy,
  EyeOff,
  Radio,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import {
  HackathonEvent,
  HackathonRound,
  HackathonCriteria,
  HackathonTeam,
  HackathonJudge,
  HackathonScore,
  HackathonTiebreaker,
  HackathonActivityLog,
} from "@/lib/hackathon/constants";

export default function AdminHackathonPage() {
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "overview" | "rounds" | "teams" | "judges" | "leaderboard" | "votes" | "logs"
  >("overview");

  // Event Data Sub-states
  const [rounds, setRounds] = useState<HackathonRound[]>([]);
  const [criteria, setCriteria] = useState<HackathonCriteria[]>([]);
  const [teams, setTeams] = useState<HackathonTeam[]>([]);
  const [judges, setJudges] = useState<HackathonJudge[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [votesData, setVotesData] = useState<{ totalVotes: number; tally: any[]; votes: any[] }>({
    totalVotes: 0,
    tally: [],
    votes: [],
  });
  const [tiebreakers, setTiebreakers] = useState<HackathonTiebreaker[]>([]);
  const [logs, setLogs] = useState<HackathonActivityLog[]>([]);

  // Scores matrix round filter
  const [scoreFilterRoundId, setScoreFilterRoundId] = useState<string>("all");

  // Modals
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<HackathonEvent>>({
    title: "",
    description: "",
    theme: "AI Foundry 2026",
    status: "draft",
    currentRoundNumber: 1,
    isVotingOpen: false,
  });

  const [roundModalOpen, setRoundModalOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<Partial<HackathonRound>>({
    name: "",
    roundNumber: 1,
    type: "qualifier",
    status: "pending",
    isElimination: true,
    isPublished: false,
  });

  const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<Partial<HackathonCriteria>>({
    name: "",
    description: "",
    maxMarks: 10,
    weight: 1.0,
    roundId: "",
  });

  const [copyCritModalOpen, setCopyCritModalOpen] = useState(false);
  const [copySourceRoundId, setCopySourceRoundId] = useState<string>("");
  const [copyTargetRoundId, setCopyTargetRoundId] = useState<string>("");

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>({
    teamCode: "",
    teamName: "",
    leaderName: "",
    leaderEmail: "",
    leaderPhone: "",
    members: "",
    passkey: "",
  });

  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState("");

  const [judgeModalOpen, setJudgeModalOpen] = useState(false);
  const [editingJudge, setEditingJudge] = useState<any>({
    name: "",
    email: "",
    accessCode: "",
  });
  const [newlyCreatedJudgeCode, setNewlyCreatedJudgeCode] = useState<string | null>(null);

  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [advanceCutoff, setAdvanceCutoff] = useState<number>(5);

  const [tieModalOpen, setTieModalOpen] = useState(false);
  const [editingTie, setEditingTie] = useState<{
    roundId: string;
    teamId: string;
    rankAdjustment: number;
    reason: string;
  }>({ roundId: "", teamId: "", rankAdjustment: 0, reason: "" });

  // Score Override Modal
  const [scoreEditModalOpen, setScoreEditModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<any | null>(null);

  // Hidden Passkeys and Session States
  const [revealedTeamPasskeys, setRevealedTeamPasskeys] = useState<Record<string, boolean>>({});
  const [revealedJudgeCodes, setRevealedJudgeCodes] = useState<Record<string, boolean>>({});
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (id: string, code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleRequestScoreChange = async (score: any) => {
    const reason = prompt(
      "Enter note for the judge on what to revise:",
      "Administrator requested score revision."
    );
    if (!reason) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/hackathon/scores/request-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoreId: score.id,
          eventId: selectedEventId,
          roundId: score.roundId,
          judgeId: score.judgeId,
          teamId: score.teamId,
          reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request change.");
      setNotice({
        type: "success",
        text: "Score change requested! Judge can now edit and resubmit their score in the Judge Portal.",
      });
      await fetchEventData(selectedEventId);
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleResetTeamSession = async (teamId: string) => {
    const confirmReset = window.confirm(
      "Reset active session for this team? Any device currently logged in will be disconnected immediately."
    );
    if (!confirmReset) return;

    setSaving(true);
    try {
      const targetTeam = teams.find((t) => t.id === teamId);
      if (!targetTeam) return;
      const res = await fetch("/api/admin/hackathon/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...targetTeam,
          resetSession: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset session.");
      setNotice({ type: "success", text: "Team device session has been reset." });
      await fetchEventData(selectedEventId);
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMultiLogin = async (teamId: string, currentAllow: boolean) => {
    setSaving(true);
    try {
      const targetTeam = teams.find((t) => t.id === teamId);
      if (!targetTeam) return;
      const res = await fetch("/api/admin/hackathon/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...targetTeam,
          allowMultipleLogins: !currentAllow,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update team settings.");
      setNotice({
        type: "success",
        text: `Multi-device login ${!currentAllow ? "enabled" : "disabled"} for team.`,
      });
      await fetchEventData(selectedEventId);
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = (type: string, options?: { roundId?: string; mode?: string }) => {
    if (!selectedEventId) {
      setNotice({ type: "error", text: "Please select an event to export." });
      return;
    }
    const params = new URLSearchParams({ type, eventId: selectedEventId });
    if (options?.roundId) params.set("roundId", options.roundId);
    if (options?.mode) params.set("mode", options.mode);
    window.open(`/api/admin/hackathon/export?${params.toString()}`, "_blank");
  };

  const handleToggleUniversalRevisions = async (roundId: string, currentAllow: boolean) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/hackathon/scores/request-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          roundId,
          universal: true,
          allowRevisions: !currentAllow,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle universal revisions.");
      setNotice({
        type: "success",
        text: data.message || `Universal score revisions ${!currentAllow ? "enabled" : "disabled"}.`,
      });
      await fetchEventData(selectedEventId);
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const currentEvent = events.find((e) => e.id === selectedEventId);

  // Load Events on Mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Load Sub-data when selected event changes
  useEffect(() => {
    if (selectedEventId) {
      fetchEventData(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/hackathon/events");
      const data = await res.json();
      const list = data.events || [];
      setEvents(list);
      if (list.length > 0 && !selectedEventId) {
        setSelectedEventId(list[0].id);
      }
    } catch {
      setNotice({ type: "error", text: "Failed to load hackathon events." });
    } finally {
      setLoading(false);
    }
  };

  const fetchEventData = async (eventId: string) => {
    try {
      const [roundsRes, critRes, teamsRes, judgesRes, scoresRes, votesRes, tiesRes, logsRes] =
        await Promise.all([
          fetch(`/api/admin/hackathon/rounds?eventId=${eventId}`).then((r) => r.json()),
          fetch(`/api/admin/hackathon/criteria?eventId=${eventId}`).then((r) => r.json()),
          fetch(`/api/admin/hackathon/teams?eventId=${eventId}`).then((r) => r.json()),
          fetch(`/api/admin/hackathon/judges?eventId=${eventId}`).then((r) => r.json()),
          fetch(`/api/admin/hackathon/scores?eventId=${eventId}`).then((r) => r.json()),
          fetch(`/api/admin/hackathon/votes?eventId=${eventId}`).then((r) => r.json()),
          fetch(`/api/admin/hackathon/tiebreakers?eventId=${eventId}`).then((r) => r.json()),
          fetch(`/api/admin/hackathon/logs?eventId=${eventId}`).then((r) => r.json()),
        ]);

      setRounds(roundsRes.rounds || []);
      setCriteria(critRes.criteria || []);
      setTeams(teamsRes.teams || []);
      setJudges(judgesRes.judges || []);
      setScores(scoresRes.scores || []);
      setVotesData(votesRes || { totalVotes: 0, tally: [], votes: [] });
      setTiebreakers(tiesRes.tiebreakers || []);
      setLogs(logsRes.logs || []);
    } catch {
      setNotice({ type: "error", text: "Failed to refresh hackathon details." });
    }
  };

  // ---- Save Event ----
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/hackathon/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEvent),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save event.");
      setNotice({ type: "success", text: "Event saved successfully." });
      setEventModalOpen(false);
      await fetchEvents();
      if (data.event?.id) setSelectedEventId(data.event.id);
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ---- Delete Event (Root Admin with Cascading Purge) ----
  const handleDeleteEvent = async () => {
    if (!currentEvent) return;
    const confirmName = window.prompt(
      `CAUTION: This will permanently delete the event "${currentEvent.title}" and PURGE all associated rounds, teams, judges, scores, and votes.\n\nTo confirm, type the word DELETE below:`
    );
    if (confirmName !== "DELETE") {
      alert("Event deletion cancelled.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/hackathon/events?id=${currentEvent.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete event.");
      setNotice({ type: "success", text: "Event and all related records completely purged." });
      setSelectedEventId("");
      await fetchEvents();
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ---- Quick State Toggle ----
  const handleStateToggle = async (updates: any) => {
    if (!selectedEventId) return;
    try {
      const res = await fetch("/api/admin/hackathon/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: selectedEventId, ...updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "State update failed.");
      setNotice({ type: "success", text: "State updated successfully." });
      await fetchEvents();
      await fetchEventData(selectedEventId);
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    }
  };

  // ---- Save Round ----
  const handleSaveRound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/hackathon/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editingRound, eventId: selectedEventId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save round.");
      setNotice({ type: "success", text: "Round saved." });
      setRoundModalOpen(false);
      await fetchEventData(selectedEventId);
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRound = async (id: string) => {
    if (!confirm("Are you sure you want to delete this round?")) return;
    try {
      await fetch(`/api/admin/hackathon/rounds?id=${id}`, { method: "DELETE" });
      setNotice({ type: "success", text: "Round deleted." });
      await fetchEventData(selectedEventId);
    } catch {
      setNotice({ type: "error", text: "Failed to delete round." });
    }
  };

  // ---- Save Criteria ----
  const handleSaveCriteria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/hackathon/criteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editingCriteria, eventId: selectedEventId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save criteria.");
      setNotice({ type: "success", text: "Criteria saved." });
      setCriteriaModalOpen(false);
      await fetchEventData(selectedEventId);
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ---- Copy Criteria From Previous Round ----
  const handleCopyCriteria = async () => {
    if (!selectedEventId || !copySourceRoundId || !copyTargetRoundId) {
      alert("Please select both a source round and target round.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/hackathon/criteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          copyFromRoundId: copySourceRoundId,
          toRoundId: copyTargetRoundId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to copy criteria.");
      setNotice({ type: "success", text: `Successfully duplicated ${data.count} criteria into target round.` });
      setCopyCritModalOpen(false);
      await fetchEventData(selectedEventId);
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCriteria = async (id: string) => {
    if (!confirm("Delete criteria?")) return;
    try {
      await fetch(`/api/admin/hackathon/criteria?id=${id}`, { method: "DELETE" });
      await fetchEventData(selectedEventId);
    } catch {
      setNotice({ type: "error", text: "Failed to delete criteria." });
    }
  };

  // ---- Save Single Team ----
  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/hackathon/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editingTeam, eventId: selectedEventId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save team.");
      setNotice({ type: "success", text: "Team saved successfully." });
      setTeamModalOpen(false);
      await fetchEventData(selectedEventId);
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ---- Bulk CSV Upload ----
  const handleBulkCSV = async () => {
    if (!selectedEventId || !csvText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/hackathon/teams/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: selectedEventId, csvContent: csvText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "CSV upload failed.");
      setNotice({ type: "success", text: `Imported ${data.count} teams.` });
      setCsvModalOpen(false);
      setCsvText("");
      await fetchEventData(selectedEventId);
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ---- Team Quick Status Update ----
  const handleTeamStatusToggle = async (teamId: string, updates: any) => {
    try {
      const res = await fetch("/api/admin/hackathon/teams/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, ...updates }),
      });
      if (!res.ok) throw new Error("Status update failed");
      await fetchEventData(selectedEventId);
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Permanently delete this team?")) return;
    try {
      await fetch(`/api/admin/hackathon/teams?id=${id}`, { method: "DELETE" });
      setNotice({ type: "success", text: "Team deleted." });
      await fetchEventData(selectedEventId);
    } catch {
      setNotice({ type: "error", text: "Failed to delete team." });
    }
  };

  // ---- Save Judge ----
  const handleSaveJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/hackathon/judges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editingJudge, eventId: selectedEventId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register judge.");
      if (data.generatedAccessCode) {
        setNewlyCreatedJudgeCode(data.generatedAccessCode);
      }
      setNotice({ type: "success", text: "Judge account created." });
      await fetchEventData(selectedEventId);
      if (!data.generatedAccessCode) {
        setJudgeModalOpen(false);
      }
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJudge = async (id: string) => {
    if (!confirm("Delete this judge?")) return;
    try {
      await fetch(`/api/admin/hackathon/judges?id=${id}`, { method: "DELETE" });
      await fetchEventData(selectedEventId);
    } catch {
      setNotice({ type: "error", text: "Failed to delete judge." });
    }
  };

  // ---- Stage Advancement ----
  const handleAdvanceStage = async () => {
    if (!currentEvent || !currentEvent.activeRoundId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/hackathon/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          currentRoundId: currentEvent.activeRoundId,
          cutoffRank: advanceCutoff,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Advancement failed.");
      setNotice({ type: "success", text: data.message });
      setAdvanceModalOpen(false);
      await fetchEvents();
      await fetchEventData(selectedEventId);
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ---- Save Tiebreaker ----
  const handleSaveTiebreaker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/hackathon/tiebreakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editingTie, eventId: selectedEventId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to adjust tie.");
      setNotice({ type: "success", text: "Tiebreaker adjustment applied." });
      setTieModalOpen(false);
      await fetchEventData(selectedEventId);
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ---- Admin Score Override ----
  const handleSaveScoreOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScore || !selectedEventId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/hackathon/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          roundId: editingScore.roundId,
          judgeId: editingScore.judgeId,
          teamId: editingScore.teamId,
          criterionScores: editingScore.criterionScores,
          feedback: editingScore.feedback,
          reason: editingScore.overrideReason || "Administrator score modification",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to modify score.");
      setNotice({ type: "success", text: "Score successfully updated and re-normalized." });
      setScoreEditModalOpen(false);
      setEditingScore(null);
      await fetchEventData(selectedEventId);
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ---- Audit Trail Deletion ----
  const handleDeleteLog = async (logId: string) => {
    try {
      await fetch(`/api/admin/hackathon/logs?id=${logId}`, { method: "DELETE" });
      await fetchEventData(selectedEventId);
    } catch {
      setNotice({ type: "error", text: "Failed to delete log entry." });
    }
  };

  const handleClearAllLogs = async () => {
    if (!confirm("Clear all activity logs for this event?")) return;
    try {
      await fetch(`/api/admin/hackathon/logs?all=true&eventId=${selectedEventId}`, { method: "DELETE" });
      setNotice({ type: "success", text: "All event audit logs cleared." });
      await fetchEventData(selectedEventId);
    } catch {
      setNotice({ type: "error", text: "Failed to clear logs." });
    }
  };

  // Filtered scores for the scores matrix
  const filteredScores = scores.filter((s) => {
    if (scoreFilterRoundId === "all") return true;
    return s.roundId === scoreFilterRoundId;
  });

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      {/* Top Banner & Event Selector */}
      <div className="glass-card rounded-3xl p-5 sm:p-8 border border-white/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 mb-1">
            <Trophy className="size-4 sm:size-5" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
              Hackathon Headquarters
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            {currentEvent ? currentEvent.title : "Leaderboard Administration"}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure tournament stages, evaluation criteria, teams, judges &amp; live publishing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {events.length > 0 && (
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-cyan-500/20 max-w-[200px] truncate"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.status.toUpperCase()})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              setEditingEvent({
                title: "",
                description: "",
                theme: "AI Foundry 2026",
                status: "draft",
                currentRoundNumber: 1,
                isVotingOpen: false,
              });
              setEventModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-extrabold shadow-md shadow-cyan-600/20 hover:opacity-95 transition-all cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Notices */}
      {notice && (
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
            notice.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === "success" ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
            <span className="font-semibold leading-relaxed">{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs (Scrollable on Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-bold no-scrollbar">
        {[
          { key: "overview", label: "Overview & Controls", icon: Sliders },
          { key: "rounds", label: `Rounds (${rounds.length})`, icon: Calendar },
          { key: "teams", label: `Teams (${teams.length})`, icon: Users },
          { key: "judges", label: `Judges (${judges.length})`, icon: UserCheck },
          { key: "leaderboard", label: "Scores Matrix & Publish", icon: TrendingUp },
          { key: "votes", label: `Audience Votes (${votesData.totalVotes})`, icon: Vote },
          { key: "logs", label: `Audit Trail (${logs.length})`, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white/80 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Controls */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {currentEvent ? (
            <>
              {/* Telemetry Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Event Lifecycle Card */}
                <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-xs space-y-2">
                  <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">
                    Event Lifecycle
                  </span>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        currentEvent.status === "live"
                          ? "bg-emerald-100 text-emerald-800 animate-pulse"
                          : currentEvent.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {currentEvent.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 pt-2">
                    {["draft", "live", "completed", "archived"].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStateToggle({ status: st })}
                        className={`text-[10px] uppercase font-bold py-1 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                          currentEvent.status === st
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Active Round Card (Interactive Switcher) */}
                <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-xs space-y-2">
                  <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">
                    Active Tournament Round
                  </span>
                  <div className="space-y-2">
                    <select
                      value={currentEvent.activeRoundId || ""}
                      onChange={(e) => {
                        const targetRound = rounds.find((r) => r.id === e.target.value);
                        if (targetRound) {
                          handleStateToggle({
                            activeRoundId: targetRound.id,
                            currentRoundNumber: targetRound.roundNumber,
                          });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 shadow-xs"
                    >
                      <option value="">-- Choose Active Round --</option>
                      {rounds.map((r) => (
                        <option key={r.id} value={r.id}>
                          Round {r.roundNumber}: {r.name} ({r.type.toUpperCase()})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500">
                      Evaluators will immediately evaluate teams for this active round.
                    </p>
                  </div>
                </div>

                {/* Quick Link & Portal View */}
                <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-xs space-y-2 sm:col-span-2 lg:col-span-1">
                  <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">
                    Participant Leaderboard
                  </span>
                  <p className="text-xs text-slate-500">
                    Live authenticated portal where teams check evaluation marks and cast votes.
                  </p>
                  <div className="pt-1">
                    <a
                      href={`/leaderboard?eventId=${currentEvent.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold hover:bg-cyan-100 transition-all"
                    >
                      <span>Open Live Portal</span>
                      <ChevronRight className="size-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Tournament Stage Actions & Danger Zone */}
              <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Tournament Stage Progression</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Advance top qualifying teams to the next round and eliminate others.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => {
                      setAdvanceCutoff(5);
                      setAdvanceModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                  >
                    <TrendingUp className="size-3.5" />
                    <span>Advance Stage (Cutoff Rank)</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingEvent(currentEvent);
                      setEventModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Edit2 className="size-3.5" />
                    <span>Edit Info</span>
                  </button>

                  {/* Root Admin Event Deletion */}
                  <button
                    onClick={handleDeleteEvent}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete Event</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card rounded-3xl p-12 text-center border border-white/80">
              <Trophy className="size-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Hackathon Selected</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Create a new event using the button above to begin configuring rounds, criteria, and teams.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Rounds & Criteria */}
      {activeTab === "rounds" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900">Stages &amp; Evaluation Criteria</h2>
              <p className="text-xs text-slate-500">Configure round sequences, audience voting, and metrics.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setEditingRound({
                    name: `Round ${rounds.length + 1}`,
                    roundNumber: rounds.length + 1,
                    type: rounds.length === 0 ? "qualifier" : "semi-final",
                    status: "pending",
                    isElimination: true,
                    isPublished: false,
                  });
                  setRoundModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Add Round</span>
              </button>

              <button
                onClick={() => {
                  if (rounds.length < 2) {
                    alert("You need at least 2 rounds configured to copy criteria.");
                    return;
                  }
                  setCopySourceRoundId(rounds[0]?.id || "");
                  setCopyTargetRoundId(rounds[rounds.length - 1]?.id || "");
                  setCopyCritModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                <Copy className="size-3.5 text-slate-600" />
                <span>Copy Criteria from Previous Round</span>
              </button>

              <button
                onClick={() => {
                  setEditingCriteria({
                    name: "",
                    description: "",
                    maxMarks: 10,
                    weight: 1.0,
                    roundId: rounds[0]?.id || "",
                  });
                  setCriteriaModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 transition-all cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Add Criterion</span>
              </button>
            </div>
          </div>

          {/* Rounds List */}
          <div className="space-y-4">
            {rounds.map((round) => {
              const roundCrit = criteria.filter((c) => c.roundId === round.id || !c.roundId);
              const isFinal = round.type === "final";

              return (
                <div key={round.id} className="glass-card rounded-3xl p-5 sm:p-6 border border-white/80 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="size-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">
                        {round.roundNumber}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-black text-slate-900">{round.name}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
                            {round.type}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              round.status === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : round.status === "scoring"
                                ? "bg-amber-100 text-amber-800"
                                : round.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {round.status}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              round.isPublished
                                ? "bg-cyan-100 text-cyan-800 font-black"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {round.isPublished ? "Scores Publicly Live" : "Scores Draft (Hidden)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Voting Toggle strictly for Final Round */}
                      {isFinal && currentEvent && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold">
                          <Vote className="size-3.5 text-purple-600" />
                          <span>Audience Voting (30%):</span>
                          <button
                            onClick={() => handleStateToggle({ isVotingOpen: !currentEvent.isVotingOpen })}
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all ${
                              currentEvent.isVotingOpen
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            }`}
                          >
                            {currentEvent.isVotingOpen ? "OPEN" : "CLOSED"}
                          </button>
                        </div>
                      )}

                      <select
                        value={round.status}
                        onChange={(e) =>
                          handleStateToggle({ roundId: round.id, roundStatus: e.target.value })
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active (Pitching)</option>
                        <option value="scoring">Scoring Open</option>
                        <option value="completed">Completed</option>
                      </select>

                      <button
                        onClick={() => {
                          setEditingRound(round);
                          setRoundModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRound(round.id)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Criteria in this round */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                      Evaluation Metrics ({roundCrit.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {roundCrit.map((c) => (
                        <div
                          key={c.id}
                          className="p-3 rounded-2xl bg-white/90 border border-slate-200/80 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block">{c.name}</span>
                            <span className="text-[10px] text-slate-400">Max: {c.maxMarks} pts</span>
                          </div>
                          <button
                            onClick={() => handleDeleteCriteria(c.id)}
                            className="text-slate-400 hover:text-red-500 cursor-pointer p-1"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      ))}
                      {roundCrit.length === 0 && (
                        <span className="text-xs text-slate-400 italic">No criteria assigned yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {rounds.length === 0 && (
              <div className="glass-card rounded-3xl p-8 text-center border border-white/80 text-xs text-slate-400">
                No rounds configured. Click &quot;Add Round&quot; to begin.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Teams Management */}
      {activeTab === "teams" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900">Registered Teams ({teams.length})</h2>
              <p className="text-xs text-slate-500">Only Team Code and Team Name are required.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleExport("teams")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Export complete 2-sheet Excel file (Sheet 1: Public Roster, Sheet 2: Secret Passkeys)"
              >
                <FileSpreadsheet className="size-3.5" />
                <span>Export Excel (2 Sheets)</span>
              </button>
              <button
                onClick={() => setCsvModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                <Upload className="size-3.5 text-slate-600" />
                <span>Bulk CSV Import</span>
              </button>
              <button
                onClick={() => {
                  setEditingTeam({
                    teamCode: `TEAM-${Math.floor(100 + Math.random() * 900)}`,
                    teamName: "",
                    leaderName: "",
                    leaderEmail: "",
                    leaderPhone: "",
                    members: "",
                    passkey: Math.random().toString(36).substring(2, 8).toUpperCase(),
                  });
                  setTeamModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Add Team</span>
              </button>
            </div>
          </div>

          {/* Teams Table */}
          <div className="glass-card rounded-3xl border border-white/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 sm:px-5">Code</th>
                    <th className="py-3 px-4">Team Name</th>
                    <th className="py-3 px-4">Leader / Contact</th>
                    <th className="py-3 px-4">Secret Passkey</th>
                    <th className="py-3 px-4">Device Session</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {teams.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 sm:px-5 font-mono font-black text-slate-900">{t.teamCode}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{t.teamName}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{t.leaderName || "—"}</div>
                        {t.leaderEmail && <div className="text-[11px] text-slate-400">{t.leaderEmail}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md min-w-[75px] text-center inline-block">
                            {revealedTeamPasskeys[t.id] ? (t.passkey || "—") : "••••••••"}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setRevealedTeamPasskeys((prev) => ({ ...prev, [t.id]: !prev[t.id] }))
                            }
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                            title={revealedTeamPasskeys[t.id] ? "Hide Passkey" : "Reveal Passkey"}
                          >
                            {revealedTeamPasskeys[t.id] ? (
                              <EyeOff className="size-3.5" />
                            ) : (
                              <Eye className="size-3.5" />
                            )}
                          </button>
                          {t.passkey && (
                            <button
                              type="button"
                              onClick={() => handleCopyCode(t.id, t.passkey!)}
                              className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                              title="Copy Passkey"
                            >
                              {copiedCodeId === t.id ? (
                                <CheckCircle2 className="size-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {t.hasActiveSession ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                Logged In
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                Offline
                              </span>
                            )}
                            {t.hasActiveSession && (
                              <button
                                onClick={() => handleResetTeamSession(t.id)}
                                className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
                                title="Disconnect logged-in device"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                          <div>
                            <button
                              onClick={() => handleToggleMultiLogin(t.id, !!t.allowMultipleLogins)}
                              className={`text-[10px] font-semibold cursor-pointer ${
                                t.allowMultipleLogins
                                  ? "text-cyan-700 underline"
                                  : "text-slate-400 hover:text-slate-600"
                              }`}
                              title="Toggle multi-device permission"
                            >
                              {t.allowMultipleLogins ? "Multi-Device On" : "Single Device"}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {t.disqualified && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-100 text-red-700">
                              Disqualified
                            </span>
                          )}
                          {t.finalist && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-100 text-cyan-800">
                              Finalist
                            </span>
                          )}
                          {t.isEliminated && !t.disqualified && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-500">
                              Eliminated
                            </span>
                          )}
                          {!t.isEliminated && !t.disqualified && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                              Active
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleTeamStatusToggle(t.id, { disqualified: !t.disqualified })
                            }
                            title={t.disqualified ? "Reinstate" : "Disqualify"}
                            className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                              t.disqualified
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-red-50 text-red-600 hover:bg-red-100"
                            }`}
                          >
                            <Ban className="size-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              handleTeamStatusToggle(t.id, { finalist: !t.finalist })
                            }
                            title={t.finalist ? "Remove Finalist" : "Make Finalist"}
                            className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                              t.finalist
                                ? "bg-cyan-100 text-cyan-800"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            <Trophy className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(t.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {teams.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No teams added yet. Click &quot;Add Team&quot; to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Judges Management */}
      {activeTab === "judges" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900">Judges Roster ({judges.length})</h2>
              <p className="text-xs text-slate-500">Evaluators use access codes on mobile or desktop to score assigned rounds.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleExport("judges")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Export Judges Directory with Access Passkeys to Excel"
              >
                <FileSpreadsheet className="size-3.5" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={() => {
                  setNewlyCreatedJudgeCode(null);
                  setEditingJudge({
                    name: "",
                    email: "",
                    accessCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                  });
                  setJudgeModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Register Judge</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {judges.map((j: any) => (
              <div key={j.id} className="glass-card rounded-3xl p-5 border border-white/80 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{j.name}</h3>
                    <p className="text-xs text-slate-400">{j.email}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteJudge(j.id)}
                    className="text-slate-400 hover:text-red-500 cursor-pointer p-1"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-bold text-[11px] uppercase text-slate-400">Access Passkey:</span>
                    <div className="flex items-center gap-1 font-mono">
                      <span className="bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-800">
                        {revealedJudgeCodes[j.id] ? (j.accessCode || "••••••••") : "••••••••"}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedJudgeCodes((prev) => ({ ...prev, [j.id]: !prev[j.id] }))
                        }
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                        title={revealedJudgeCodes[j.id] ? "Hide Code" : "Reveal Code"}
                      >
                        {revealedJudgeCodes[j.id] ? (
                          <EyeOff className="size-3.5" />
                        ) : (
                          <Eye className="size-3.5" />
                        )}
                      </button>
                      {j.accessCode && (
                        <button
                          type="button"
                          onClick={() => handleCopyCode(j.id, j.accessCode!)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                          title="Copy Access Code"
                        >
                          {copiedCodeId === j.id ? (
                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-xs text-slate-500">
                    <span className="font-semibold text-emerald-600">Active Evaluator</span>
                    <a href="/judge/login" target="_blank" className="text-cyan-700 font-bold hover:underline">
                      Judge Portal &rarr;
                    </a>
                  </div>
                </div>
              </div>
            ))}
            {judges.length === 0 && (
              <div className="glass-card rounded-3xl p-8 text-center text-xs text-slate-400 col-span-full">
                No judges registered yet. Click &quot;Register Judge&quot; to assign evaluation credentials.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Scores Matrix & Publish */}
      {activeTab === "leaderboard" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Scores Matrix &amp; Live Publishing</h2>
              <p className="text-xs text-slate-500">
                Review and edit judge evaluations in draft mode. Click &quot;Publish&quot; to release scores live to participants.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  if (selectedEventId) fetchEventData(selectedEventId);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                <span>Refresh Matrix</span>
              </button>
            </div>
          </div>

          {/* Round Filter Tabs & Publishing Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Filter Round:</span>
              <button
                onClick={() => setScoreFilterRoundId("all")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  scoreFilterRoundId === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Rounds ({scores.length})
              </button>
              {rounds.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setScoreFilterRoundId(r.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    scoreFilterRoundId === r.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Round {r.roundNumber}: {r.name}
                </button>
              ))}
            </div>

            {/* Actions for Filtered Round or All Rounds */}
            <div className="flex flex-wrap items-center gap-2">
              {scoreFilterRoundId === "all" ? (
                <button
                  onClick={() => handleExport("marks")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  title="Export all marks from all rounds to Excel"
                >
                  <FileSpreadsheet className="size-3.5" />
                  <span>Export All Marks (Excel)</span>
                </button>
              ) : (
                (() => {
                  const targetRound = rounds.find((r) => r.id === scoreFilterRoundId);
                  if (!targetRound) return null;
                  const isPub = targetRound.isPublished === true;
                  const allowRev = targetRound.allowRevisions === true;
                  return (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleToggleUniversalRevisions(targetRound.id, allowRev)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          allowRev
                            ? "bg-amber-500 text-white shadow-xs hover:bg-amber-600"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                        title="Universal score change: allows all judges to revise/edit any team's scores in this round"
                      >
                        <Edit2 className="size-3.5" />
                        <span>{allowRev ? "Universal Revisions ON (Round-wide)" : "Enable Round-wide Revisions"}</span>
                      </button>

                      <button
                        onClick={() => handleExport("marks", { roundId: targetRound.id })}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                        title="Export this round's complete score details & rankings to Excel"
                      >
                        <FileSpreadsheet className="size-3.5" />
                        <span>Export Round Marks (Excel)</span>
                      </button>

                      <button
                        onClick={() =>
                          handleStateToggle({
                            roundId: targetRound.id,
                            isPublished: !isPub,
                          })
                        }
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          isPub
                            ? "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200"
                            : "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                        }`}
                      >
                        {isPub ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        <span>{isPub ? "Unpublish Scores (Make Draft)" : "Publish Round Scores to Public Live"}</span>
                      </button>
                    </div>
                  );
                })()
              )}
            </div>
          </div>

          {/* Scores table grouped by filtered round */}
          <div className="glass-card rounded-3xl border border-white/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-5">Round</th>
                    <th className="py-3.5 px-4">Team</th>
                    <th className="py-3.5 px-4">Judge</th>
                    <th className="py-3.5 px-4">Marks Awarded</th>
                    <th className="py-3.5 px-4">Normalized (100)</th>
                    <th className="py-3.5 px-4">Submitted At</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredScores.map((s) => {
                    const roundName = rounds.find((r) => r.id === s.roundId)?.name || "Round";
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-5 font-bold text-slate-800">{roundName}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {s.teamCode} - {s.teamName}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{s.judgeName}</td>
                        <td className="py-3 px-4">
                          {s.totalMarksAwarded} / {s.totalMaxPossible}
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-cyan-700">
                          {s.normalizedScore} pts
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-400">
                          {new Date(s.submittedAt).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleRequestScoreChange(s)}
                              disabled={s.changeRequested}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                                s.changeRequested
                                  ? "bg-amber-100 text-amber-800 border border-amber-300 cursor-not-allowed"
                                  : "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                              }`}
                              title="Unlock this score for judge re-evaluation on the judge portal"
                            >
                              {s.changeRequested ? "Change Pending" : "Change"}
                            </button>
                            <button
                              onClick={() => {
                                setEditingTie({
                                  roundId: s.roundId,
                                  teamId: s.teamId,
                                  rankAdjustment: 0,
                                  reason: "",
                                });
                                setTieModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 cursor-pointer"
                            >
                              Tie Adjust
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredScores.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No scores recorded for this round selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Audience Votes */}
      {activeTab === "votes" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Audience Voting Tallies (30% Final Component)
              </h2>
              <p className="text-xs text-slate-500">Votes cast by eliminated teams for final candidates.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs font-bold text-slate-600">
                Total Votes Cast: <span className="text-slate-900 font-black">{votesData.totalVotes}</span>
              </div>
              <button
                onClick={() => handleExport("votes")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                title="Export Audience Voting Audit to Excel"
              >
                <FileSpreadsheet className="size-3.5" />
                <span>Export Votes (Excel)</span>
              </button>
            </div>
          </div>

          {/* Tally Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {votesData.tally?.map((item: any, idx: number) => (
              <div key={idx} className="glass-card rounded-3xl p-5 border border-white/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-slate-400">{item.teamCode}</span>
                  <span className="text-xl font-black text-cyan-600">{item.count} votes</span>
                </div>
                <h3 className="font-black text-slate-900 text-sm">{item.teamName}</h3>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-cyan-600 h-1.5 rounded-full"
                    style={{
                      width: `${votesData.totalVotes > 0 ? (item.count / votesData.totalVotes) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Vote Log */}
          <div className="glass-card rounded-3xl border border-white/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-extrabold uppercase text-[11px] text-slate-400">
              Vote Audit Trail
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Voter (Eliminated Team)</th>
                    <th className="py-3 px-4">Candidate Voted For</th>
                    <th className="py-3 px-4">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {votesData.votes?.map((v: any) => (
                    <tr key={v.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                        {new Date(v.submittedAt).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {v.voterTeam?.teamCode} - {v.voterTeam?.teamName}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-cyan-700">
                        {v.candidateTeam?.teamCode} - {v.candidateTeam?.teamName}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">{v.ipAddress}</td>
                    </tr>
                  ))}
                  {votesData.votes?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        No votes cast yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Audit Trail */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-black text-slate-900">Security &amp; Action Log Trail</h2>
            {logs.length > 0 && (
              <button
                onClick={handleClearAllLogs}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all cursor-pointer"
              >
                Clear All Logs
              </button>
            )}
          </div>

          <div className="glass-card rounded-3xl border border-white/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {logs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50 gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-900">{log.action}</span>
                    {log.actorType === "admin" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200 shadow-2xs">
                        Admin: {log.actorId || "System Admin"}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600">
                        {log.actorType}: {log.actorId}
                      </span>
                    )}
                  </div>
                  {log.details && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      {JSON.stringify(log.details)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="text-slate-400 hover:text-red-500 cursor-pointer p-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">No activity logs recorded.</div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          MODALS
      ========================================== */}

      {/* Create / Edit Event Modal */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="glass-card rounded-3xl p-5 sm:p-8 border border-white/80 bg-white max-w-lg w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                {editingEvent.id ? "Edit Hackathon Event" : "Create Hackathon Event"}
              </h3>
              <button onClick={() => setEventModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  placeholder="e.g. AI Foundry Global Hackathon 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Theme / Track</label>
                <input
                  type="text"
                  value={editingEvent.theme || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, theme: e.target.value })}
                  placeholder="e.g. Autonomous AI Agents & Generative Workflows"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingEvent.description || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  placeholder="Brief synopsis of the hackathon..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status</label>
                <select
                  value={editingEvent.status || "draft"}
                  onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold"
                >
                  <option value="draft">Draft (Planning)</option>
                  <option value="live">Live (Active)</option>
                  <option value="completed">Completed (Finalized)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Round Modal */}
      {roundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="glass-card rounded-3xl p-5 sm:p-8 border border-white/80 bg-white max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                {editingRound.id ? "Edit Round" : "Add Tournament Round"}
              </h3>
              <button onClick={() => setRoundModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRound} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Round Sequence Number</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={editingRound.roundNumber || 1}
                  onChange={(e) => setEditingRound({ ...editingRound, roundNumber: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Round Name</label>
                <input
                  type="text"
                  required
                  value={editingRound.name || ""}
                  onChange={(e) => setEditingRound({ ...editingRound, name: e.target.value })}
                  placeholder="e.g. Round 1: Proof of Concept Pitch"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Round Type</label>
                <select
                  value={editingRound.type || "qualifier"}
                  onChange={(e) => setEditingRound({ ...editingRound, type: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold"
                >
                  <option value="qualifier">Qualifier</option>
                  <option value="semi-final">Semi-Final</option>
                  <option value="final">Final (Activates 70/30 Split & Voting)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRoundModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50"
                >
                  Save Round
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Copy Criteria Modal */}
      {copyCritModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="glass-card rounded-3xl p-5 sm:p-8 border border-white/80 bg-white max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Duplicate Criteria from Round</h3>
              <button onClick={() => setCopyCritModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Copy all evaluation metrics from an existing round into a new round without manual re-typing.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Source Round (Copy from):</label>
                <select
                  value={copySourceRoundId}
                  onChange={(e) => setCopySourceRoundId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-bold"
                >
                  {rounds.map((r) => (
                    <option key={r.id} value={r.id}>
                      Round {r.roundNumber}: {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Round (Copy into):</label>
                <select
                  value={copyTargetRoundId}
                  onChange={(e) => setCopyTargetRoundId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-bold"
                >
                  {rounds.map((r) => (
                    <option key={r.id} value={r.id}>
                      Round {r.roundNumber}: {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setCopyCritModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCopyCriteria}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold cursor-pointer disabled:opacity-50"
              >
                {saving ? "Copying..." : "Duplicate Criteria"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Criteria Modal */}
      {criteriaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="glass-card rounded-3xl p-5 sm:p-8 border border-white/80 bg-white max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Add Evaluation Criterion</h3>
              <button onClick={() => setCriteriaModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCriteria} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Round</label>
                <select
                  value={editingCriteria.roundId || ""}
                  onChange={(e) => setEditingCriteria({ ...editingCriteria, roundId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold"
                >
                  <option value="">All Rounds</option>
                  {rounds.map((r) => (
                    <option key={r.id} value={r.id}>
                      Round {r.roundNumber}: {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Criterion Name</label>
                <input
                  type="text"
                  required
                  value={editingCriteria.name || ""}
                  onChange={(e) => setEditingCriteria({ ...editingCriteria, name: e.target.value })}
                  placeholder="e.g. Innovation & Novelty"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Max Marks</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={editingCriteria.maxMarks || 10}
                  onChange={(e) => setEditingCriteria({ ...editingCriteria, maxMarks: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCriteriaModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  Save Criterion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Single Team Modal (Only Code and Name required) */}
      {teamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="glass-card rounded-3xl p-5 sm:p-8 border border-white/80 bg-white max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Register Competing Team</h3>
              <button onClick={() => setTeamModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Team Code *</label>
                  <input
                    type="text"
                    required
                    value={editingTeam.teamCode}
                    onChange={(e) => setEditingTeam({ ...editingTeam, teamCode: e.target.value })}
                    placeholder="T-101"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 uppercase font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Secret Passkey</label>
                  <input
                    type="text"
                    value={editingTeam.passkey}
                    onChange={(e) => setEditingTeam({ ...editingTeam, passkey: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  value={editingTeam.teamName}
                  onChange={(e) => setEditingTeam({ ...editingTeam, teamName: e.target.value })}
                  placeholder="e.g. Neural Nexus"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Leader Name (Optional)</label>
                  <input
                    type="text"
                    value={editingTeam.leaderName}
                    onChange={(e) => setEditingTeam({ ...editingTeam, leaderName: e.target.value })}
                    placeholder="Alex Chen"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Leader Email (Optional)</label>
                  <input
                    type="email"
                    value={editingTeam.leaderEmail}
                    onChange={(e) => setEditingTeam({ ...editingTeam, leaderEmail: e.target.value })}
                    placeholder="alex@uni.edu"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Member Names (Optional, comma separated)</label>
                <input
                  type="text"
                  value={editingTeam.members}
                  onChange={(e) => setEditingTeam({ ...editingTeam, members: e.target.value })}
                  placeholder="Sarah Lee, David Kim, Maya Patel"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTeamModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Save Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Modal */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="glass-card rounded-3xl p-5 sm:p-8 border border-white/80 bg-white max-w-lg w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Bulk Import Teams (CSV)</h3>
              <button onClick={() => setCsvModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>

            <div className="text-xs text-slate-500 space-y-2">
              <p>Paste CSV content below. Minimum required columns: team_code, team_name</p>
              <pre className="p-2.5 rounded-xl bg-slate-100 text-slate-800 font-mono text-[10px] overflow-x-auto">
                team_code,team_name,leader_name,leader_email,leader_phone,members,passkey
              </pre>
            </div>

            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="T-101,Neural Nexus,Alex Chen,alex@uni.edu,9876543210,David;Sarah,AI2026"
              className="w-full p-3 rounded-2xl border border-slate-200 text-slate-900 font-mono text-xs"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCsvModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkCSV}
                disabled={saving || !csvText.trim()}
                className="px-5 py-2 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-700 disabled:opacity-50 text-xs cursor-pointer"
              >
                {saving ? "Importing..." : "Process & Import"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Judge Modal */}
      {judgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="glass-card rounded-3xl p-5 sm:p-8 border border-white/80 bg-white max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Register Judge Account</h3>
              <button onClick={() => setJudgeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>

            {newlyCreatedJudgeCode ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 text-xs">
                <span className="font-bold block">Judge Access Code Generated:</span>
                <span className="font-mono text-lg font-black block text-slate-900 bg-white p-2 rounded-xl border border-emerald-300">
                  {newlyCreatedJudgeCode}
                </span>
                <p className="text-[11px] text-slate-600">
                  Share this code with the judge along with their email. They will enter it to log into the Judge Portal.
                </p>
                <button
                  onClick={() => setJudgeModalOpen(false)}
                  className="w-full mt-2 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveJudge} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Judge Name</label>
                  <input
                    type="text"
                    required
                    value={editingJudge.name}
                    onChange={(e) => setEditingJudge({ ...editingJudge, name: e.target.value })}
                    placeholder="Dr. Evelyn Wright"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Judge Email</label>
                  <input
                    type="email"
                    required
                    value={editingJudge.email}
                    onChange={(e) => setEditingJudge({ ...editingJudge, email: e.target.value })}
                    placeholder="evelyn@university.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Judge Access Code (Optional)</label>
                  <input
                    type="text"
                    value={editingJudge.accessCode}
                    onChange={(e) => setEditingJudge({ ...editingJudge, accessCode: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono font-bold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setJudgeModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                  >
                    Register
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Advance Stage Modal */}
      {advanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="glass-card rounded-3xl p-5 sm:p-8 border border-white/80 bg-white max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Execute Stage Advancement</h3>
              <button onClick={() => setAdvanceModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Advancing the stage locks the current round, eliminates non-advancing teams, and progresses top teams to the next stage.
            </p>

            <div className="text-xs space-y-2">
              <label className="font-bold text-slate-700 block">Cutoff Rank (Top N Teams Advance):</label>
              <input
                type="number"
                min={1}
                max={50}
                value={advanceCutoff}
                onChange={(e) => setAdvanceCutoff(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-black text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setAdvanceModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdvanceStage}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer disabled:opacity-50"
              >
                {saving ? "Processing..." : "Confirm & Advance"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Score Edit Override Modal */}
      {scoreEditModalOpen && editingScore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="glass-card rounded-3xl p-5 sm:p-8 border border-white/80 bg-white max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                Admin Score Review &amp; Override
              </h3>
              <button onClick={() => setScoreEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="font-bold text-slate-900">{editingScore.teamCode} - {editingScore.teamName}</div>
              <div className="text-[11px] text-slate-500">Evaluator: {editingScore.judgeName}</div>
            </div>

            <form onSubmit={handleSaveScoreOverride} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Criterion Marks</label>
                <div className="space-y-2">
                  {criteria
                    .filter((c) => c.roundId === editingScore.roundId || !c.roundId)
                    .map((crit) => {
                      const val = editingScore.criterionScores?.[crit.id] ?? 0;
                      return (
                        <div key={crit.id} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                          <span className="font-semibold text-slate-700">{crit.name} (Max: {crit.maxMarks})</span>
                          <input
                            type="number"
                            min={0}
                            max={crit.maxMarks}
                            step={0.5}
                            value={val}
                            onChange={(e) => {
                              const num = parseFloat(e.target.value) || 0;
                              setEditingScore({
                                ...editingScore,
                                criterionScores: {
                                  ...editingScore.criterionScores,
                                  [crit.id]: Math.min(crit.maxMarks, Math.max(0, num)),
                                },
                              });
                            }}
                            className="w-16 px-2 py-1 rounded-lg border border-slate-300 font-bold text-right"
                          />
                        </div>
                      );
                    })}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Override Reason</label>
                <input
                  type="text"
                  required
                  value={editingScore.overrideReason || ""}
                  onChange={(e) => setEditingScore({ ...editingScore, overrideReason: e.target.value })}
                  placeholder="e.g. Typo correction after judge consultation"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScoreEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  Apply Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tiebreaker Adjustment Modal */}
      {tieModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="glass-card rounded-3xl p-5 sm:p-8 border border-white/80 bg-white max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Manual Tiebreaker / Rank Shift</h3>
              <button onClick={() => setTieModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTiebreaker} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Rank Adjustment</label>
                <select
                  value={editingTie.rankAdjustment}
                  onChange={(e) => setEditingTie({ ...editingTie, rankAdjustment: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-slate-900"
                >
                  <option value={-1}>Advance +1 Position (Higher Rank)</option>
                  <option value={1}>Drop -1 Position (Lower Rank)</option>
                  <option value={0}>No Shift (Neutral)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Reason for Adjustment</label>
                <textarea
                  required
                  rows={3}
                  value={editingTie.reason}
                  onChange={(e) => setEditingTie({ ...editingTie, reason: e.target.value })}
                  placeholder="e.g. Higher score on Code Architecture metric broken after judge consensus."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTieModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
