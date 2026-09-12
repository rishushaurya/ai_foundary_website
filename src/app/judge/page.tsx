"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function JudgeDashboardPage() {
  const router = useRouter();
  const [judgeInfo, setJudgeInfo] = useState<{ id: string; name: string; email: string; eventId: string } | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [rounds, setRounds] = useState<any[]>([]);
  const [activeRound, setActiveRound] = useState<any>(null);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [rosterSummary, setRosterSummary] = useState<any[]>([]);

  // Search & Active Team Evaluation State
  const [searchCode, setSearchCode] = useState<string>("");
  const [activeTeam, setActiveTeam] = useState<any | null>(null);
  const [criterionScores, setCriterionScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadSessionAndMetadata();
  }, []);

  const loadSessionAndMetadata = async () => {
    try {
      setLoading(true);
      const sessionRes = await fetch("/api/judge/session");
      if (!sessionRes.ok) {
        window.location.href = "/judge/login";
        return;
      }
      const sessionData = await sessionRes.json();
      setJudgeInfo(sessionData.judge);

      const teamsRes = await fetch("/api/judge/teams");
      if (!teamsRes.ok) throw new Error("Failed to load evaluation roster.");
      const data = await teamsRes.json();

      setEventData(data.event);
      setRounds(data.rounds || []);
      setActiveRound(data.activeRound || null);
      setCriteria(data.criteria || []);
      setRosterSummary(data.teams || []);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to load data." });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTeam = async (codeToSearch?: string) => {
    const code = (codeToSearch || searchCode).trim().toUpperCase();
    if (!code) {
      setStatusMessage({ type: "error", text: "Please enter a Team Code to search." });
      return;
    }

    setStatusMessage(null);
    try {
      const res = await fetch(`/api/judge/teams?search=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.teams && data.teams.length > 0) {
        const team = data.teams[0];
        setActiveTeam(team);
        setSearchCode(team.teamCode);
        setIsEditing(team.changeRequested === true && team.isScoredByMe === true);

        if (team.isScored && team.myScore) {
          setCriterionScores(team.myScore.criterionScores || {});
          setFeedback(team.myScore.feedback || "");
        } else {
          const initial: Record<string, number> = {};
          for (const c of criteria) {
            initial[c.id] = 0;
          }
          setCriterionScores(initial);
          setFeedback("");
        }
      } else {
        setActiveTeam(null);
        setStatusMessage({
          type: "error",
          text: `No competing team found with code '${code}' in this active round.`,
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  const handleScoreChange = (critId: string, valStr: string, maxMarks: number) => {
    const val = parseFloat(valStr);
    const clamped = isNaN(val) ? 0 : Math.min(maxMarks, Math.max(0, val));
    setCriterionScores((prev) => ({ ...prev, [critId]: clamped }));
  };

  // Compute live totals
  let totalAwarded = 0;
  let totalMax = 0;
  for (const c of criteria) {
    const marks = criterionScores[c.id] ?? 0;
    totalAwarded += marks;
    totalMax += c.maxMarks;
  }
  const normalizedScore =
    totalMax > 0 ? Math.round(((totalAwarded / totalMax) * 100 + Number.EPSILON) * 100) / 100 : 0;

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam || !activeRound) return;

    if (activeTeam.isScored && !isEditing) {
      alert("This team has already been scored. Submitted scores are locked unless an administrator requests a revision.");
      return;
    }

    const confirmSubmit = window.confirm(
      `Confirm score submission for ${activeTeam.teamCode} (${activeTeam.teamName}):\n` +
      `Total Marks: ${totalAwarded} / ${totalMax} (Normalized: ${normalizedScore} / 100)\n\n` +
      (isEditing
        ? "Submit updated score revision?"
        : "Once submitted, this score is locked until re-opened by an administrator.")
    );
    if (!confirmSubmit) return;

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/judge/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundId: activeRound.id,
          teamId: activeTeam.id,
          criterionScores,
          feedback,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit score.");

      setIsEditing(false);
      setStatusMessage({
        type: "success",
        text: `Score successfully recorded for ${activeTeam.teamName} (${normalizedScore} pts).`,
      });

      // Refresh data
      await loadSessionAndMetadata();
      // Re-fetch this team to show locked status
      await handleSearchTeam(activeTeam.teamCode);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/judge/session", { method: "DELETE" });
    window.location.href = "/judge/login";
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#ffffff",
          color: "#4b5563",
          fontSize: "14px",
        }}
      >
        Loading evaluator portal...
      </div>
    );
  }

  const scoredCount = rosterSummary.filter((t) => t.isScored).length;

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        color: "#111827",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          borderBottom: "1px solid #e5e7eb",
          padding: "14px 16px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          backgroundColor: "#ffffff",
        }}
      >
        <div>
          <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" }}>
            {eventData?.title || "Hackathon"}
          </div>
          <h1 style={{ fontSize: "16px", fontWeight: "700", margin: "2px 0 0 0" }}>
            {activeRound ? `${activeRound.name}` : "Evaluator Interface"}
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ textAlign: "right", fontSize: "12px" }}>
            <span style={{ fontWeight: "700" }}>{judgeInfo?.name}</span>
            <span style={{ color: "#6b7280", display: "block" }}>
              Progress: {scoredCount} / {rosterSummary.length} Scored
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              backgroundColor: "#ffffff",
              color: "#374151",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Single-Column Focused View */}
      <main style={{ maxWidth: "680px", width: "100%", margin: "0 auto", padding: "20px 16px", boxSizing: "border-box" }}>
        {statusMessage && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "6px",
              fontSize: "13px",
              marginBottom: "16px",
              backgroundColor: statusMessage.type === "success" ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${statusMessage.type === "success" ? "#bbf7d0" : "#fecaca"}`,
              color: statusMessage.type === "success" ? "#166534" : "#991b1b",
            }}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Search Team Code Card */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: "#f9fafb",
            marginBottom: "20px",
          }}
        >
          <label
            htmlFor="teamSearch"
            style={{ display: "block", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", color: "#374151", marginBottom: "8px" }}
          >
            Evaluate Team by Code
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              id="teamSearch"
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchTeam();
              }}
              placeholder="Enter Team Code (e.g. TEAM-101)"
              style={{
                flex: 1,
                padding: "10px 12px",
                fontSize: "14px",
                fontFamily: "monospace",
                fontWeight: "700",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                outline: "none",
                backgroundColor: "#ffffff",
              }}
            />
            <button
              onClick={() => handleSearchTeam()}
              style={{
                padding: "10px 18px",
                backgroundColor: "#111827",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Evaluate
            </button>
          </div>
        </div>

        {/* Selected Team Profile & Evaluation Form */}
        {activeTeam ? (
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px", backgroundColor: "#ffffff" }}>
            {/* Admin Revision Notice (Only for the evaluating judge when revision is enabled) */}
            {activeTeam.isScored && activeTeam.canEdit && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  backgroundColor: "#fef3c7",
                  border: "1px solid #f59e0b",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#92400e" }}>
                    ⚠️ Score Revision Unlocked
                  </div>
                  <div style={{ fontSize: "12px", color: "#b45309", marginTop: "2px" }}>
                    {activeTeam.changeReason || "Administrator has authorized a score edit for this team."}
                  </div>
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#b45309",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    ✏️ Edit Score
                  </button>
                )}
              </div>
            )}

            {/* Already Evaluated by Current Judge Banner */}
            {activeTeam.isScored && activeTeam.isScoredByMe && !activeTeam.canEdit && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "16px" }}>🔒</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#166534" }}>
                    Evaluation Submitted &amp; Locked
                  </div>
                  <div style={{ fontSize: "12px", color: "#15803d", marginTop: "2px" }}>
                    You evaluated this team on {activeTeam.myScore?.submittedAt ? `${new Date(activeTeam.myScore.submittedAt).toLocaleDateString()} at ${new Date(activeTeam.myScore.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "record"}. Scores are final and read-only.
                  </div>
                </div>
              </div>
            )}

            {/* Already Evaluated by Another Judge Banner (Strict Read-Only Mode) */}
            {activeTeam.isScored && !activeTeam.isScoredByMe && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "14px 16px",
                  borderRadius: "6px",
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "18px" }}>🔒</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e40af" }}>
                    Team Already Evaluated by {activeTeam.scoredByJudgeName || "Another Evaluator"} — Read-Only Mode
                  </div>
                  <div style={{ fontSize: "12px", color: "#1e3a8a", marginTop: "4px", lineHeight: "1.5" }}>
                    This team was already evaluated for this round on {activeTeam.myScore?.submittedAt ? `${new Date(activeTeam.myScore.submittedAt).toLocaleDateString()} at ${new Date(activeTeam.myScore.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "record"}. Under tournament rules, each team can only be evaluated once across all judges. You can inspect the recorded scores and feedback below in read-only mode.
                  </div>
                </div>
              </div>
            )}

            {/* Team Banner */}
            <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <span style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: "700", color: "#6b7280" }}>
                    TEAM CODE: {activeTeam.teamCode}
                  </span>
                  <h2 style={{ fontSize: "20px", fontWeight: "700", margin: "4px 0" }}>
                    {activeTeam.teamName}
                  </h2>
                  {activeTeam.leaderName && (
                    <div style={{ fontSize: "13px", color: "#4b5563" }}>
                      Leader: {activeTeam.leaderName}
                      {activeTeam.members?.length > 0 && ` • Members: ${activeTeam.members.join(", ")}`}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "700",
                    backgroundColor: isEditing
                      ? "#fef3c7"
                      : activeTeam.isScored
                      ? activeTeam.isScoredByMe
                        ? "#dcfce7"
                        : "#e0f2fe"
                      : "#fef3c7",
                    color: isEditing
                      ? "#92400e"
                      : activeTeam.isScored
                      ? activeTeam.isScoredByMe
                        ? "#166534"
                        : "#0369a1"
                      : "#92400e",
                  }}
                >
                  {isEditing
                    ? "REVISION IN PROGRESS"
                    : activeTeam.isScored
                    ? activeTeam.isScoredByMe
                      ? "YOUR EVALUATION (LOCKED)"
                      : `EVALUATED BY ${activeTeam.scoredByJudgeName ? activeTeam.scoredByJudgeName.toUpperCase() : "ANOTHER JUDGE"}`
                    : "EVALUATION PENDING"}
                </div>
              </div>
            </div>

            {/* Criteria Scoring Form */}
            <form onSubmit={handleSubmitScore}>
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", textTransform: "uppercase", color: "#374151" }}>
                  Evaluation Criteria ({criteria.length})
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {criteria.map((crit) => {
                    const currentVal = criterionScores[crit.id] ?? 0;
                    return (
                      <div
                        key={crit.id}
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          padding: "14px",
                          backgroundColor: "#fcfcfc",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: "700" }}>{crit.name}</div>
                            {crit.description && (
                              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                                {crit.description}
                              </div>
                            )}
                          </div>
                          <span style={{ fontSize: "12px", color: "#4b5563", fontWeight: "700" }}>
                            Max: {crit.maxMarks}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <input
                            type="number"
                            min={0}
                            max={crit.maxMarks}
                            step={0.5}
                            disabled={activeTeam.isScored && !isEditing}
                            value={currentVal}
                            onChange={(e) => handleScoreChange(crit.id, e.target.value, crit.maxMarks)}
                            style={{
                              width: "80px",
                              padding: "8px 10px",
                              fontSize: "16px",
                              fontWeight: "700",
                              border: "1px solid #d1d5db",
                              borderRadius: "4px",
                              outline: "none",
                              backgroundColor: activeTeam.isScored && !isEditing ? "#f3f4f6" : "#ffffff",
                            }}
                          />
                          <span style={{ fontSize: "13px", color: "#6b7280" }}>
                            / {crit.maxMarks} marks
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Evaluator Remarks */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="feedback"
                  style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}
                >
                  Evaluator Remarks (Optional)
                </label>
                <textarea
                  id="feedback"
                  rows={3}
                  disabled={activeTeam.isScored && !isEditing}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Notes on architecture, originality, presentation..."
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "13px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    boxSizing: "border-box",
                    outline: "none",
                    fontFamily: "inherit",
                    backgroundColor: activeTeam.isScored && !isEditing ? "#f3f4f6" : "#ffffff",
                  }}
                />
              </div>

              {/* Total Calculation Bar */}
              <div
                style={{
                  border: "1px solid #d1d5db",
                  backgroundColor: "#f9fafb",
                  borderRadius: "6px",
                  padding: "14px 16px",
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase" }}>
                    Raw Score
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "700" }}>
                    {totalAwarded} / {totalMax}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase" }}>
                    Normalized (100 Scale)
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "#111827" }}>
                    {normalizedScore} pts
                  </div>
                </div>
              </div>

              {!activeTeam.isScored || isEditing ? (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    disabled={submitting || criteria.length === 0}
                    style={{
                      flex: 1,
                      backgroundColor: isEditing ? "#b45309" : "#111827",
                      color: "#ffffff",
                      padding: "12px",
                      fontSize: "14px",
                      fontWeight: "700",
                      border: "none",
                      borderRadius: "6px",
                      cursor: submitting || criteria.length === 0 ? "not-allowed" : "pointer",
                      opacity: submitting || criteria.length === 0 ? 0.6 : 1,
                    }}
                  >
                    {submitting
                      ? "Submitting..."
                      : isEditing
                      ? "Resubmit Revised Score"
                      : "Submit & Lock Evaluation"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      style={{
                        padding: "12px 18px",
                        backgroundColor: "#f3f4f6",
                        color: "#374151",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "14px",
                    fontSize: "13px",
                    color: activeTeam.isScoredByMe ? "#166534" : "#1e40af",
                    backgroundColor: activeTeam.isScoredByMe ? "#f0fdf4" : "#eff6ff",
                    border: `1px solid ${activeTeam.isScoredByMe ? "#bbf7d0" : "#bfdbfe"}`,
                    borderRadius: "6px",
                    fontWeight: "600",
                  }}
                >
                  {activeTeam.isScoredByMe ? (
                    <span>
                      ✓ You completed this evaluation ({normalizedScore} pts) on{" "}
                      {activeTeam.myScore?.submittedAt
                        ? new Date(activeTeam.myScore.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "record"}. Scores are locked.
                    </span>
                  ) : (
                    <span>
                      🔒 Evaluated by {activeTeam.scoredByJudgeName || "Another Judge"} ({normalizedScore} pts).
                      Teams can only be evaluated once. Re-evaluation is disabled.
                    </span>
                  )}
                </div>
              )}
            </form>
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "48px 16px",
              color: "#6b7280",
              fontSize: "13px",
              border: "1px dashed #d1d5db",
              borderRadius: "8px",
            }}
          >
            Enter a Team Code or Team ID above and click Evaluate to begin scoring.
          </div>
        )}
      </main>
    </div>
  );
}
