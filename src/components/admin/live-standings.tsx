"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import type { TeamScoreSummary } from "@/lib/hackathon/scoring";

interface StandingsResponse {
  round: { id: string; name: string; type: string; status: string; isPublished: boolean };
  cutoff: number | null;
  standings: TeamScoreSummary[];
  competingCount: number;
  unscoredCount: number;
  advancingCount: number;
  tieAtCutoff: boolean;
}

/**
 * The real ranking for a round (published or not) with the cutoff line drawn in. It uses the same
 * server computation as the Advance action, so what you see here is exactly what will happen.
 * `refreshKey` is the live change counter: the table re-fetches whenever scores or votes change.
 */
export function LiveStandings({
  eventId,
  roundId,
  cutoff,
  refreshKey,
}: {
  eventId: string;
  roundId: string;
  cutoff?: number;
  refreshKey: number;
}) {
  const [data, setData] = useState<StandingsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ eventId, roundId });
    if (cutoff && cutoff > 0) params.set("cutoff", String(cutoff));
    fetch(`/api/admin/hackathon/standings?${params}`, { cache: "no-store", signal: controller.signal })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Failed to load standings.");
        setData(body);
        setError("");
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      });
    return () => controller.abort();
  }, [eventId, roundId, cutoff, refreshKey]);

  if (error) {
    return (
      <p className="flex items-center gap-2 text-xs text-red-700">
        <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
        {error}
      </p>
    );
  }
  if (!data) {
    return (
      <p className="flex items-center gap-2 text-xs text-slate-500">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Computing standings…
      </p>
    );
  }

  const isFinal = data.round.type === "final";
  const lastAdvancingIdx = data.cutoff ? data.standings.map((s) => !!s.advanced).lastIndexOf(true) : -1;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-[11px] font-bold">
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">{data.competingCount} competing</span>
        {data.cutoff && (
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            {data.advancingCount} advance (cutoff top {data.cutoff})
          </span>
        )}
        {data.unscoredCount > 0 && (
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
            {data.unscoredCount} not yet scored
          </span>
        )}
        {data.tieAtCutoff && (
          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
            Tie on the cutoff: more teams advance than the cutoff. Use Tie Adjust to break it.
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left border-collapse text-xs">
          <caption className="sr-only">Live standings for {data.round.name}</caption>
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
              <th scope="col" className="py-2.5 px-3">Rank</th>
              <th scope="col" className="py-2.5 px-3">Team</th>
              <th scope="col" className="py-2.5 px-3 text-right">Judges</th>
              {isFinal && <th scope="col" className="py-2.5 px-3 text-right">Votes</th>}
              <th scope="col" className="py-2.5 px-3 text-right">Final</th>
              <th scope="col" className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {data.standings.map((s, idx) => (
              <tr
                key={s.teamId}
                className={`${s.disqualified ? "opacity-50" : ""} ${
                  idx === lastAdvancingIdx ? "border-b-2 border-b-emerald-500" : ""
                }`}
              >
                <td className="py-2 px-3 font-mono font-black text-slate-900">
                  {s.disqualified ? "—" : `#${s.rank}`}
                  {s.isTie && <span className="ml-1 text-[10px] font-bold text-purple-700">TIE</span>}
                </td>
                <td className="py-2 px-3 font-bold text-slate-900">
                  <span className="font-mono text-slate-400 mr-1.5">{s.teamCode}</span>
                  {s.teamName}
                </td>
                <td className="py-2 px-3 text-right font-mono">
                  {s.judgeScoresCount > 0 ? s.avgJudgeScore.toFixed(2) : "—"}
                </td>
                {isFinal && <td className="py-2 px-3 text-right font-mono">{s.votesCount ?? 0}</td>}
                <td className="py-2 px-3 text-right font-mono font-black text-cyan-700">{s.finalScore.toFixed(2)}</td>
                <td className="py-2 px-3">
                  {s.disqualified ? (
                    <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-bold">Disqualified</span>
                  ) : s.judgeScoresCount === 0 ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold">Unscored</span>
                  ) : data.cutoff ? (
                    s.advanced ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold">Advances</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">Eliminated</span>
                    )
                  ) : (
                    <span className="text-slate-400">Scored</span>
                  )}
                </td>
              </tr>
            ))}
            {data.standings.length === 0 && (
              <tr>
                <td colSpan={isFinal ? 6 : 5} className="py-6 text-center text-slate-400">
                  No teams are competing in this round.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
