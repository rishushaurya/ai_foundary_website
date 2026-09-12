"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Trophy,
  Search,
  CheckCircle2,
  AlertCircle,
  Vote,
  ShieldCheck,
  RefreshCw,
  Lock,
  X,
  ArrowLeft,
  Users,
  Award,
  Sparkles,
  BarChart3,
  ChevronRight,
  LogOut,
  Layers,
  Calendar,
} from "lucide-react";
import { HACKATHON_CONSTANTS } from "@/lib/hackathon/constants";

export default function PublicLeaderboardPage() {
  // Available Events & Current Selection
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [eventData, setEventData] = useState<any>(null);

  // Tournament Data
  const [rounds, setRounds] = useState<any[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Verified Team State (Participant Session)
  const [myTeamData, setMyTeamData] = useState<any>(null);
  const [teamScorecardOpen, setTeamScorecardOpen] = useState(false);

  // Gate & Verification Form
  const [teamCodeInput, setTeamCodeInput] = useState("");
  const [passkeyInput, setPasskeyInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  // Audience Voting State
  const [castingVote, setCastingVote] = useState(false);
  const [voteNotice, setVoteNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Fetch Leaderboard Status
  const fetchStatus = useCallback(async (eventId?: string, roundId?: string) => {
    try {
      const params = new URLSearchParams();
      if (eventId) params.set("eventId", eventId);
      if (roundId) params.set("roundId", roundId);

      const url = `/api/leaderboard/status${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load status");
      const data = await res.json();

      setAvailableEvents(data.availableEvents || []);
      setEventData(data.event);
      setRounds(data.rounds || []);
      setLeaderboard(data.leaderboard || []);
      setIsVotingOpen(data.isVotingOpen || false);
      setIsPublished(data.isPublished || false);
      setLastUpdated(new Date().toLocaleTimeString());

      if (data.event && !selectedEventId) {
        setSelectedEventId(data.event.id);
      }
      if (data.activeRound && (!selectedRoundId || selectedRoundId === "")) {
        setSelectedRoundId(data.activeRound.id);
      }
    } catch (err) {
      console.error("[leaderboard] Poll error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, selectedRoundId]);

  // 2. Fetch Logged-in Team Details
  const fetchMyTeamStatus = async () => {
    try {
      const res = await fetch("/api/leaderboard/team-status");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setMyTeamData(data);
        } else {
          setMyTeamData(null);
        }
      } else {
        setMyTeamData(null);
      }
    } catch {
      setMyTeamData(null);
    }
  };

  // Initial Load & Polling Interval
  useEffect(() => {
    fetchStatus(selectedEventId, selectedRoundId);
    fetchMyTeamStatus();

    const interval = setInterval(() => {
      fetchStatus(selectedEventId, selectedRoundId);
    }, HACKATHON_CONSTANTS.POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchStatus, selectedEventId, selectedRoundId]);

  // Handle Event Switching
  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setSelectedRoundId("");
    setLoading(true);
    fetchStatus(eventId);
  };

  // Handle Round Tab Switching
  const handleSelectRound = (roundId: string) => {
    setSelectedRoundId(roundId);
    fetchStatus(selectedEventId, roundId);
  };

  // Team Verification Submission
  const handleVerifyTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerifyError("");

    try {
      const res = await fetch("/api/leaderboard/verify-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamCode: teamCodeInput.trim(),
          passkey: passkeyInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed.");

      setTeamCodeInput("");
      setPasskeyInput("");
      await fetchMyTeamStatus();
      await fetchStatus(selectedEventId, selectedRoundId);
    } catch (err: any) {
      setVerifyError(err.message || "Invalid Team Code or Passkey.");
    } finally {
      setVerifying(false);
    }
  };

  // Cast Audience Vote
  const handleCastVote = async (candidateTeamId: string, candidateName: string) => {
    const confirmVote = window.confirm(
      `Cast your team's official vote for "${candidateName}"?\n\nThis action is final and cannot be modified.`
    );
    if (!confirmVote) return;

    setCastingVote(true);
    setVoteNotice(null);

    try {
      const res = await fetch("/api/leaderboard/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateTeamId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit vote.");

      setVoteNotice({ type: "success", text: data.message });
      await fetchMyTeamStatus();
      await fetchStatus(selectedEventId, selectedRoundId);
    } catch (err: any) {
      setVoteNotice({ type: "error", text: err.message });
    } finally {
      setCastingVote(false);
    }
  };

  // Logout Team Session
  const handleTeamLogout = async () => {
    await fetch("/api/leaderboard/team-status", { method: "DELETE" });
    setMyTeamData(null);
    setTeamScorecardOpen(false);
  };

  // Filtered Leaderboard
  const filteredLeaderboard = leaderboard.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.teamCode?.toLowerCase().includes(q) ||
      item.teamName?.toLowerCase().includes(q)
    );
  });

  const selectedRound = rounds.find((r) => r.id === selectedRoundId);
  const isFinalRound = selectedRound?.type === "final";
  const top3 = isPublished ? filteredLeaderboard.slice(0, 3) : [];

  return (
    <div className="min-h-screen bg-[#FFFFE9] text-[#2D2E2A] selection:bg-[#2D2E2A] selection:text-[#FFFFE9] font-sans antialiased">
      {/* ---------------------------------------------------- */}
      {/* TOP NAVBAR (MATCHING SITE EDITORIAL STYLE)           */}
      {/* ---------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-[#FFFFE9]/90 backdrop-blur-md border-b border-[#2D2E2A]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/team"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C6CCBD]/40 hover:bg-[#C6CCBD] text-xs font-semibold uppercase tracking-wider text-[#2D2E2A] transition-all"
            >
              <ArrowLeft className="size-3.5" />
              <span>Team</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#ECFF17] border border-[#2D2E2A]/40 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#2D2E2A]">
                AI FOUNDRY ARENA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {myTeamData?.authenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTeamScorecardOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2D2E2A] text-[#FFFFE9] hover:text-[#ECFF17] text-xs font-semibold tracking-wider transition-all cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="size-3.5 text-[#ECFF17]" />
                  <span>{myTeamData.team.teamCode} (My Team)</span>
                </button>
                <button
                  onClick={handleTeamLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-full hover:bg-[#C6CCBD]/40 text-[#2D2E2A]/70 hover:text-[#2D2E2A] transition-all cursor-pointer"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFF17]/40 border border-[#2D2E2A]/20 text-[11px] font-mono font-bold uppercase tracking-wider text-[#2D2E2A]">
                <Lock className="size-3" />
                <span>Gated Access</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* MAIN CONTAINER                                      */}
      {/* ---------------------------------------------------- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {!loading && !eventData && availableEvents.length === 0 ? (
          <div className="rounded-3xl border border-[#2D2E2A]/15 bg-white p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
            <div className="size-14 rounded-2xl bg-[#C6CCBD]/30 border border-[#2D2E2A]/15 flex items-center justify-center mx-auto text-[#2D2E2A]">
              <Trophy className="size-7 text-[#2D2E2A]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif italic text-[#2D2E2A]">
              Tournament Arena
            </h1>
            <p className="text-xs sm:text-sm text-[#5E6059] leading-relaxed max-w-md mx-auto">
              There are currently no active hackathons running. Tournament schedules, leaderboards, and scoring rubrics will be published here by event directors once launched.
            </p>
            <div className="pt-2">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2D2E2A] text-[#FFFFE9] hover:text-[#ECFF17] text-xs font-semibold uppercase tracking-wider transition-all"
              >
                <ArrowLeft className="size-3.5" />
                <span>Browse Scheduled Events</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* MASTHEAD & EVENT SWITCHER */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-[#2D2E2A]/10">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D2E2A] text-[#FFFFE9] text-[10px] font-mono uppercase tracking-widest">
                    <Trophy className="size-3 text-[#ECFF17]" />
                    <span>OFFICIAL TOURNAMENT STANDINGS</span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-serif italic text-[#2D2E2A] tracking-tight leading-tight">
                    {eventData ? eventData.title : "Tournament Arena"}
                  </h1>
                  {eventData?.theme && (
                    <p className="text-xs sm:text-sm font-medium text-[#5E6059]">
                      Track / Theme: <span className="text-[#2D2E2A] font-semibold">{eventData.theme}</span>
                    </p>
                  )}
                </div>

                {/* Event Selector & Sync Status */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {availableEvents.length > 1 && (
                    <div className="relative">
                      <select
                        value={selectedEventId}
                        onChange={(e) => handleSelectEvent(e.target.value)}
                        aria-label="Select Active Tournament"
                        className="appearance-none px-4 py-2 pr-9 rounded-full bg-white border border-[#2D2E2A]/20 text-xs font-semibold text-[#2D2E2A] focus:outline-hidden focus:border-[#2D2E2A] cursor-pointer shadow-xs"
                      >
                        {availableEvents.map((evt) => (
                          <option key={evt.id} value={evt.id}>
                            {evt.title}
                          </option>
                        ))}
                      </select>
                      <ChevronRight className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-[#2D2E2A]/60 rotate-90" />
                    </div>
                  )}

                  <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#5E6059] px-3 py-1.5 rounded-full bg-[#C6CCBD]/20 border border-[#2D2E2A]/10">
                    <RefreshCw className="size-3 text-[#2D2E2A] animate-spin" />
                    <span>Sync • {lastUpdated || "live"}</span>
                  </div>
                </div>
              </div>

              {/* Round Navigation Tabs (Pill Style matching Wix-Bold) */}
              {rounds.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {rounds.map((r) => {
                    const isSelected = r.id === selectedRoundId;
                    return (
                      <button
                        key={r.id}
                        onClick={() => handleSelectRound(r.id)}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#2D2E2A] text-[#FFFFE9] shadow-sm"
                            : "bg-[#C6CCBD]/40 text-[#2D2E2A] hover:bg-[#C6CCBD]"
                        }`}
                      >
                        <span>Round {r.roundNumber}: {r.name}</span>
                        {r.isPublished && (
                          <span className="size-1.5 rounded-full bg-[#ECFF17]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

        {/* ---------------------------------------------------- */}
        {/* GATE CARD: IF PARTICIPANT IS NOT LOGGED IN          */}
        {/* ---------------------------------------------------- */}
        {!myTeamData?.authenticated ? (
          <div className="rounded-3xl border border-[#2D2E2A]/15 bg-white p-6 sm:p-10 shadow-xl space-y-6 max-w-xl mx-auto text-center">
            <div className="size-12 rounded-2xl bg-[#ECFF17]/30 border border-[#2D2E2A]/15 flex items-center justify-center mx-auto text-[#2D2E2A]">
              <Lock className="size-6" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[#7A836F]">
                STRICT VERIFIED ACCESS
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif italic text-[#2D2E2A]">
                Participant Gate &amp; Verification
              </h2>
              <p className="text-xs sm:text-sm text-[#5E6059] leading-relaxed">
                Tournament leaderboards, performance marks, and audience voting are restricted to accredited teams. Enter your assigned credentials below.
              </p>
            </div>

            {verifyError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="size-4 text-red-500 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyTeam} className="space-y-4 text-left">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#2D2E2A] font-bold mb-1.5">
                  Team Code
                </label>
                <input
                  type="text"
                  required
                  value={teamCodeInput}
                  onChange={(e) => setTeamCodeInput(e.target.value)}
                  placeholder="e.g. T-101"
                  className="w-full px-4 py-3 rounded-2xl bg-[#FFFFE9]/60 border border-[#2D2E2A]/20 text-[#2D2E2A] font-mono font-bold uppercase placeholder:text-[#2D2E2A]/30 focus:outline-hidden focus:border-[#2D2E2A] focus:bg-white text-xs sm:text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#2D2E2A] font-bold mb-1.5">
                  Secret Passkey
                </label>
                <input
                  type="password"
                  required
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Enter private passkey"
                  className="w-full px-4 py-3 rounded-2xl bg-[#FFFFE9]/60 border border-[#2D2E2A]/20 text-[#2D2E2A] font-mono font-bold placeholder:text-[#2D2E2A]/30 focus:outline-hidden focus:border-[#2D2E2A] focus:bg-white text-xs sm:text-sm transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-3.5 px-6 rounded-full bg-[#2D2E2A] text-[#FFFFE9] hover:text-[#ECFF17] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    <span>Verify &amp; Unlock Tournament Arena</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* ---------------------------------------------------- */
          /* AUTHENTICATED LEADERBOARD DISPLAY                   */
          /* ---------------------------------------------------- */
          <div className="space-y-10">
            {/* MY TEAM SUMMARY BANNER */}
            <div className="rounded-3xl border border-[#2D2E2A]/15 bg-[#232521] text-[#FFFFE9] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-xl">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#ECFF17]">
                    ACCREDITED PARTICIPANT
                  </span>
                  <span className="size-1 rounded-full bg-[#ECFF17]" />
                  <span className="text-xs font-mono font-bold text-[#FFFFE9]">
                    {myTeamData.team.teamCode}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif italic text-[#FFFFE9]">
                  {myTeamData.team.teamName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#FFFFE9]/70 pt-1">
                  {myTeamData.team.leaderName && (
                    <span>Leader: {myTeamData.team.leaderName}</span>
                  )}
                  {myTeamData.team.members?.length > 0 && (
                    <span>• Members: {myTeamData.team.members.join(", ")}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => setTeamScorecardOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-[#ECFF17] text-[#2D2E2A] font-bold text-xs uppercase tracking-wider hover:bg-[#d8ea13] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <BarChart3 className="size-4" />
                  <span>My Performance Scorecard</span>
                </button>
                <button
                  onClick={handleTeamLogout}
                  className="px-4 py-2.5 rounded-full border border-[#FFFFE9]/20 text-[#FFFFE9]/80 hover:text-[#FFFFE9] hover:bg-white/5 font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* UNPUBLISHED ROUND NOTICE */}
            {!isPublished && (
              <div className="rounded-3xl border border-amber-300 bg-amber-50/80 p-6 sm:p-8 space-y-3 text-amber-900">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-amber-800">
                  <AlertCircle className="size-4 text-amber-600" />
                  <span>Stage Evaluations In Progress</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif italic text-amber-950">
                  Scores Under Administrator Review
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 leading-relaxed max-w-2xl">
                  Judges are currently evaluating project demos and entering rubric criteria. The official standings and marks for {selectedRound?.name || "this round"} will be published to the live arena by tournament directors once verified.
                </p>
              </div>
            )}

            {/* TOP 3 PODIUM (EDITORIAL STYLE) */}
            {isPublished && top3.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#7A836F]">
                  <Award className="size-4 text-[#2D2E2A]" />
                  <span>Stage Leaders Podium</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {top3.map((team, idx) => {
                    const podiumLabels = ["1ST PLACE", "2ND PLACE", "3RD PLACE"];
                    const isMyTeam = myTeamData?.team && team.teamId === myTeamData.team.id;
                    return (
                      <div
                        key={team.teamId}
                        className={`rounded-3xl p-6 sm:p-8 border transition-all flex flex-col justify-between space-y-4 ${
                          idx === 0
                            ? "bg-[#232521] text-[#FFFFE9] border-[#ECFF17] shadow-xl"
                            : "bg-white text-[#2D2E2A] border-[#2D2E2A]/15 shadow-sm"
                        } ${isMyTeam ? "ring-2 ring-[#ECFF17]" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest ${
                              idx === 0
                                ? "bg-[#ECFF17] text-[#2D2E2A]"
                                : "bg-[#2D2E2A] text-[#FFFFE9]"
                            }`}
                          >
                            {podiumLabels[idx]}
                          </span>
                          <span className="font-mono text-xs font-bold opacity-75">
                            {team.teamCode}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h3
                            className={`text-xl sm:text-2xl font-serif italic font-bold truncate ${
                              idx === 0 ? "text-[#FFFFE9]" : "text-[#2D2E2A]"
                            }`}
                          >
                            {team.teamName}
                          </h3>
                          {isMyTeam && (
                            <span className="text-[10px] font-mono font-bold uppercase text-[#ECFF17] bg-[#2D2E2A] px-2 py-0.5 rounded-full inline-block">
                              YOUR TEAM
                            </span>
                          )}
                          {isFinalRound && (
                            <p
                              className={`text-[11px] font-mono ${
                                idx === 0 ? "text-[#FFFFE9]/70" : "text-[#5E6059]"
                              }`}
                            >
                              Votes Received: {team.votesCount || 0}
                            </p>
                          )}
                        </div>

                        <div
                          className={`pt-4 border-t flex items-baseline justify-between ${
                            idx === 0 ? "border-[#FFFFE9]/15" : "border-[#2D2E2A]/10"
                          }`}
                        >
                          <span
                            className={`text-xs font-medium uppercase tracking-wider ${
                              idx === 0 ? "text-[#FFFFE9]/60" : "text-[#5E6059]"
                            }`}
                          >
                            Official Rating
                          </span>
                          <span
                            className={`font-mono text-3xl font-black ${
                              idx === 0 ? "text-[#ECFF17]" : "text-[#2D2E2A]"
                            }`}
                          >
                            {team.finalScore}
                            <span className="text-xs font-sans font-normal opacity-60 ml-1">/ 100</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* FULL STANDINGS SECTION */}
            <div className="rounded-3xl border border-[#2D2E2A]/15 bg-white shadow-xl overflow-hidden space-y-6 p-6 sm:p-8">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#2D2E2A]/10">
                <div>
                  <h2 className="text-2xl font-serif italic text-[#2D2E2A]">
                    {isPublished ? "Official Stage Rankings" : "Accredited Teams Roster"}
                  </h2>
                  <p className="text-xs text-[#5E6059] mt-0.5">
                    {selectedRound ? `Round ${selectedRound.roundNumber}: ${selectedRound.name}` : "Tournament Standings"} • {filteredLeaderboard.length} teams participating
                  </p>
                </div>

                {/* Search Box */}
                <div className="relative min-w-[240px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#5E6059]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search team code or name..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-full bg-[#FFFFE9]/60 border border-[#2D2E2A]/20 text-xs text-[#2D2E2A] placeholder:text-[#2D2E2A]/40 focus:outline-hidden focus:border-[#2D2E2A] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* DESKTOP TABLE VIEW (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#2D2E2A]/15 text-[#5E6059] font-mono font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Team</th>
                      <th className="py-3 px-4">{isFinalRound ? "Total Score" : "Score (100 Scale)"}</th>
                      {isFinalRound && isPublished && <th className="py-3 px-4">Votes Received</th>}
                      {isFinalRound && isVotingOpen && <th className="py-3 px-4 text-center">Audience Ballot</th>}
                      <th className="py-3 px-4 text-right">Tournament Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D2E2A]/10 text-[#2D2E2A]">
                    {filteredLeaderboard.map((item) => {
                      const isMyTeam = myTeamData?.team && item.teamId === myTeamData.team.id;
                      return (
                        <tr
                          key={item.teamId}
                          className={`hover:bg-[#FFFFE9]/70 transition-colors ${
                            isMyTeam ? "bg-[#ECFF17]/20 font-semibold" : ""
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`size-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                                  item.rank === 1
                                    ? "bg-[#2D2E2A] text-[#ECFF17]"
                                    : item.rank === 2
                                    ? "bg-[#C6CCBD] text-[#2D2E2A]"
                                    : item.rank === 3
                                    ? "bg-[#2D2E2A]/20 text-[#2D2E2A]"
                                    : "bg-black/5 text-[#5E6059]"
                                }`}
                              >
                                {isPublished ? item.rank || "-" : "-"}
                              </span>
                              {item.isTie && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                  TIE
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono font-bold">{item.teamCode}</td>
                          <td className="py-4 px-4">
                            <div className="font-bold text-[#2D2E2A]">{item.teamName}</div>
                            {isMyTeam && (
                              <span className="text-[10px] font-mono text-[#2D2E2A] font-extrabold uppercase tracking-wider">
                                (Your Team)
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {isPublished ? (
                              <span className="font-mono font-extrabold text-sm text-[#2D2E2A]">
                                {item.finalScore !== null ? `${item.finalScore} pts` : "—"}
                              </span>
                            ) : (
                              <span className="font-mono text-xs text-[#5E6059] italic">
                                Pending Release
                              </span>
                            )}
                          </td>
                          {isFinalRound && isPublished && (
                            <td className="py-4 px-4 font-mono font-bold text-[#2D2E2A]">
                              {item.votesCount || 0} votes
                            </td>
                          )}
                          {isFinalRound && isVotingOpen && (
                            <td className="py-4 px-4 text-center">
                              {myTeamData?.voting?.hasVoted ? (
                                myTeamData.voting.votedCandidateId === item.teamId ? (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                                    <CheckCircle2 className="size-3" /> Voted
                                  </span>
                                ) : (
                                  <span className="text-slate-300 text-xs">—</span>
                                )
                              ) : myTeamData?.team?.isEliminated && myTeamData?.voting?.canVote ? (
                                <button
                                  onClick={() => handleCastVote(item.teamId, item.teamName)}
                                  disabled={castingVote}
                                  className="px-3.5 py-1.5 rounded-full bg-[#ECFF17] hover:bg-[#2D2E2A] hover:text-[#FFFFE9] text-[#2D2E2A] text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                  Vote
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400">Eliminated teams only</span>
                              )}
                            </td>
                          )}
                          <td className="py-4 px-4 text-right">
                            {item.disqualified ? (
                              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-red-100 text-red-700 border border-red-200">
                                Disqualified
                              </span>
                            ) : item.finalist ? (
                              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-[#2D2E2A] text-[#ECFF17]">
                                Finalist
                              </span>
                            ) : item.advanced ? (
                              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Advancing
                              </span>
                            ) : item.isEliminated ? (
                              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-gray-200 text-gray-700">
                                Eliminated
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-[#C6CCBD]/40 text-[#2D2E2A]">
                                Contending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW (< 768px) */}
              <div className="block md:hidden space-y-3">
                {filteredLeaderboard.map((item) => {
                  const isMyTeam = myTeamData?.team && item.teamId === myTeamData.team.id;
                  return (
                    <div
                      key={item.teamId}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        isMyTeam
                          ? "bg-[#ECFF17]/20 border-[#2D2E2A]/30 shadow-xs"
                          : "bg-[#FFFFE9]/50 border-[#2D2E2A]/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                              item.rank === 1
                                ? "bg-[#2D2E2A] text-[#ECFF17]"
                                : item.rank === 2
                                ? "bg-[#C6CCBD] text-[#2D2E2A]"
                                : item.rank === 3
                                ? "bg-[#2D2E2A]/20 text-[#2D2E2A]"
                                : "bg-black/5 text-[#5E6059]"
                            }`}
                          >
                            {isPublished ? item.rank || "-" : "-"}
                          </span>
                          <span className="font-mono text-xs font-bold text-[#2D2E2A]">
                            {item.teamCode}
                          </span>
                        </div>

                        {item.disqualified ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-red-100 text-red-700 border border-red-200">
                            Disqualified
                          </span>
                        ) : item.finalist ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-[#2D2E2A] text-[#ECFF17]">
                            Finalist
                          </span>
                        ) : item.advanced ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Advancing
                          </span>
                        ) : item.isEliminated ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-gray-200 text-gray-700">
                            Eliminated
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-[#C6CCBD]/40 text-[#2D2E2A]">
                            Contending
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-[#2D2E2A]">{item.teamName}</h4>
                        {isMyTeam && (
                          <span className="text-[10px] font-mono text-[#2D2E2A] font-extrabold uppercase">
                            (Your Team)
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#2D2E2A]/10 flex items-center justify-between">
                        <span className="text-xs text-[#5E6059]">Total Score</span>
                        {isPublished ? (
                          <span className="font-mono font-black text-lg text-[#2D2E2A]">
                            {item.finalScore} <span className="text-xs font-sans text-[#5E6059]">/ 100</span>
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-[#5E6059] italic">Pending Release</span>
                        )}
                      </div>

                      {isFinalRound && isPublished && (
                        <div className="text-[11px] font-mono text-[#5E6059] flex items-center justify-between pt-1">
                          <span>Total Score: {item.finalScore} pts</span>
                          <span className="font-bold text-[#2D2E2A]">Votes: {item.votesCount || 0}</span>
                        </div>
                      )}

                      {/* Eliminated Team Voting Action in Final Round */}
                      {isFinalRound && isVotingOpen && (
                        <div className="pt-2">
                          {myTeamData?.voting?.hasVoted ? (
                            myTeamData.voting.votedCandidateId === item.teamId ? (
                              <div className="text-center py-1.5 px-3 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
                                <CheckCircle2 className="size-3.5" /> Your Official Ballot
                              </div>
                            ) : null
                          ) : myTeamData?.team?.isEliminated && myTeamData?.voting?.canVote ? (
                            <button
                              onClick={() => handleCastVote(item.teamId, item.teamName)}
                              disabled={castingVote}
                              className="w-full py-2.5 rounded-full bg-[#ECFF17] hover:bg-[#2D2E2A] hover:text-[#FFFFE9] text-[#2D2E2A] text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              Vote for Team
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filteredLeaderboard.length === 0 && (
                <div className="py-12 text-center text-[#5E6059] text-xs">
                  {loading ? "Refreshing arena standings..." : "No teams matching search criteria."}
                </div>
              )}
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {/* ---------------------------------------------------- */}
      {/* MODAL: MY TEAM PERFORMANCE SCORECARD & VOTING        */}
      {/* ---------------------------------------------------- */}
      {teamScorecardOpen && myTeamData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2E2A]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="rounded-3xl border border-[#2D2E2A]/15 bg-[#FFFFE9] max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 text-[#2D2E2A] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2D2E2A]/10">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#7A836F]">
                  TEAM TELEMETRY • {myTeamData.team.teamCode}
                </span>
                <h2 className="text-2xl font-serif italic text-[#2D2E2A] mt-0.5">
                  {myTeamData.team.teamName}
                </h2>
                <p className="text-xs text-[#5E6059]">
                  Leader: {myTeamData.team.leaderName || "Not assigned"}
                  {myTeamData.team.members?.length > 0 && ` • Members: ${myTeamData.team.members.join(", ")}`}
                </p>
              </div>

              <button
                onClick={() => setTeamScorecardOpen(false)}
                className="p-2 rounded-full hover:bg-[#C6CCBD]/40 text-[#2D2E2A]/60 hover:text-[#2D2E2A] transition-all cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Voting Notice Banner */}
            {voteNotice && (
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
                  voteNotice.type === "success"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-red-50 border-red-300 text-red-800"
                }`}
              >
                {voteNotice.type === "success" ? (
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="size-4 text-red-600 shrink-0" />
                )}
                <span>{voteNotice.text}</span>
              </div>
            )}

            {/* Tournament Status Pill */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#2D2E2A]/10 text-xs">
              <span className="text-[#5E6059] font-mono font-bold uppercase tracking-wider text-[11px]">
                Stage Qualification
              </span>
              <span
                className={`px-3 py-1 rounded-full font-mono font-bold uppercase text-xs ${
                  myTeamData.team.disqualified
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : myTeamData.team.finalist
                    ? "bg-[#2D2E2A] text-[#ECFF17]"
                    : myTeamData.team.isEliminated
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}
              >
                {myTeamData.team.disqualified
                  ? "Disqualified"
                  : myTeamData.team.finalist
                  ? "Contending Finalist"
                  : myTeamData.team.isEliminated
                  ? "Eliminated (Eligible to Vote)"
                  : "Active in Tournament"}
              </span>
            </div>

            {/* Audience Votes Received (for non-eliminated teams) */}
            {!myTeamData.team.isEliminated && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#2D2E2A]/10 text-xs shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-[#ECFF17] flex items-center justify-center text-[#2D2E2A]">
                    <Vote className="size-4 text-[#2D2E2A]" />
                  </div>
                  <div>
                    <span className="text-[#5E6059] font-mono font-bold uppercase tracking-wider text-[10px] block">
                      Audience Endorsement
                    </span>
                    <span className="font-bold text-sm text-[#2D2E2A]">Total Votes Received</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-lg text-[#2D2E2A]">
                    {myTeamData.team.votesReceived ?? 0}
                  </span>
                  <span className="text-[10px] text-[#5E6059] font-mono block">
                    {myTeamData.team.votesReceived === 1 ? "ballot cast" : "ballots cast"}
                  </span>
                </div>
              </div>
            )}

            {/* Round Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A836F] flex items-center gap-2">
                <BarChart3 className="size-4 text-[#2D2E2A]" />
                <span>Round Marks, Rank &amp; Criteria Breakdown</span>
              </h3>

              <div className="space-y-3">
                {myTeamData.roundBreakdown?.map((rb: any) => (
                  <div
                    key={rb.roundId}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-[#2D2E2A]/10 space-y-3 text-xs shadow-xs"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2D2E2A] text-sm">{rb.roundName}</span>
                        {/* Rank Badge for Everyone (or Disqualified / Eliminated indicator) */}
                        {rb.displayRank ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#2D2E2A] text-[#ECFF17] font-mono font-bold text-xs">
                            Rank #{rb.displayRank}
                          </span>
                        ) : rb.statusBadge ? (
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                              rb.statusBadge === "Disqualified"
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : rb.statusBadge.startsWith("Eliminated")
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                            }`}
                          >
                            {rb.statusBadge}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3">
                        {!myTeamData.team.isEliminated && rb.roundType === "final" && (
                          <span className="font-mono font-bold text-xs text-[#5E6059]">
                            Votes: {rb.votesCount ?? myTeamData.team.votesReceived ?? 0}
                          </span>
                        )}
                        <span className="font-mono font-black text-[#2D2E2A]">
                          {rb.isPublished && rb.finalScore !== null
                            ? `${rb.finalScore} / 100`
                            : "Evaluation In Progress"}
                        </span>
                      </div>
                    </div>

                    {/* Criteria items or Evaluation In Progress notice */}
                    {rb.isPublished && Object.keys(rb.criteriaBreakdown || {}).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#2D2E2A]/10">
                        {Object.entries(rb.criteriaBreakdown).map(([critId, crit]: any) => (
                          <div
                            key={critId}
                            className="p-2.5 rounded-xl bg-[#FFFFE9] border border-[#2D2E2A]/10 flex items-center justify-between text-[11px]"
                          >
                            <span className="text-[#2D2E2A] font-medium">{crit.name}</span>
                            <span className="font-mono font-bold text-[#2D2E2A]">
                              {crit.marksAwarded} / {crit.maxMarks}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-[#FFFFE9]/60 border border-[#2D2E2A]/10 text-[11px] text-[#5E6059] flex items-center gap-2">
                        <Lock className="size-3.5 text-[#7A836F] shrink-0" />
                        <span>
                          {rb.pendingMessage ||
                            "Evaluation in progress. Scores will be officially revealed once this round's leaderboard is published by administrators."}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Audience Voting Section */}
            <div className="space-y-3 pt-2 border-t border-[#2D2E2A]/10">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A836F] flex items-center gap-2">
                <Vote className="size-4 text-[#2D2E2A]" />
                <span>Audience Voting for Finalists</span>
              </h3>

              {myTeamData.voting?.hasVoted ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Your team has cast its official vote. Thank you for shaping the tournament outcome!</span>
                </div>
              ) : myTeamData.voting?.canVote ? (
                <div className="space-y-3">
                  <p className="text-xs text-[#5E6059] leading-relaxed">
                    As an eliminated team, your vote carries 30% of the stage evaluation weight. Cast your ballot for your top finalist:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {myTeamData.voting?.candidates?.map((candidate: any) => (
                      <div
                        key={candidate.id}
                        className="p-4 rounded-2xl bg-white border border-[#2D2E2A]/15 hover:border-[#2D2E2A] transition-all flex flex-col justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-[10px] text-[#7A836F]">
                            {candidate.teamCode}
                          </span>
                          <h4 className="font-bold text-sm text-[#2D2E2A] mt-0.5">{candidate.teamName}</h4>
                          {candidate.leaderName && (
                            <span className="text-[#5E6059] text-[11px]">Led by {candidate.leaderName}</span>
                          )}
                        </div>

                        <button
                          onClick={() => handleCastVote(candidate.id, candidate.teamName)}
                          disabled={castingVote}
                          className="w-full py-2 rounded-full bg-[#2D2E2A] hover:text-[#ECFF17] text-[#FFFFE9] font-bold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-all"
                        >
                          {castingVote ? "Recording..." : "Cast Team Vote"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white border border-[#2D2E2A]/10 text-xs text-[#5E6059]">
                  Audience voting is currently inactive (voting is open exclusively to eliminated teams during the championship final).
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
