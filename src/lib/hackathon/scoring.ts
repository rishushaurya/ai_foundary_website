import {
  HackathonScore,
  HackathonVote,
  HackathonTeam,
  HackathonCriteria,
  HackathonRound,
  HackathonTiebreaker,
  HACKATHON_CONSTANTS,
} from "./constants";

export interface TeamScoreSummary {
  teamId: string;
  teamCode: string;
  teamName: string;
  isEliminated: boolean;
  finalist: boolean;
  disqualified?: boolean;
  judgeScoresCount: number;
  avgJudgeScore: number; // 0 - 100
  criteriaBreakdown: Record<string, { name: string; marksAwarded: number; maxMarks: number }>;
  votesCount?: number;
  voteScore?: number; // 0 - 100 (share of all counted votes)
  finalScore: number; // 0 - 100
  rank: number;
  isTie: boolean;
  tiebreakerReason?: string;
  advanced?: boolean;
}

/**
 * Normalizes numbers to specified decimal precision
 */
export function roundToPrecision(val: number, decimals = HACKATHON_CONSTANTS.DECIMAL_PRECISION): number {
  const factor = Math.pow(10, decimals);
  return Math.round((val + Number.EPSILON) * factor) / factor;
}

/** A valid admin-set split: whole percent 0-100. */
export function isValidJudgeWeight(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 100;
}

/** Judges' share (percent) of a final round's score; audience votes get the rest. */
export function judgeSharePct(round: { judgeWeight?: number }): number {
  return isValidJudgeWeight(round.judgeWeight) ? round.judgeWeight : HACKATHON_CONSTANTS.DEFAULT_JUDGE_WEIGHT_PCT;
}

/**
 * Filters teams eligible to compete in a specific tournament round.
 * Excludes disqualified teams and teams eliminated in previous rounds.
 * For the final this is also the list of teams that can receive audience votes.
 */
export function getCompetingTeamsForRound(
  teams: HackathonTeam[],
  targetRound: { id: string; roundNumber: number; type: string },
  allRounds: { id: string; roundNumber: number }[]
): HackathonTeam[] {
  const roundNumberMap = new Map(allRounds.map((r) => [r.id, r.roundNumber]));

  return teams.filter((team) => {
    // Disqualified teams never appear in any round
    if (team.disqualified) return false;

    // Final round: only non-eliminated finalists
    if (targetRound.type === "final") {
      return team.finalist && !team.isEliminated;
    }

    // Round 1: all non-disqualified teams
    if (targetRound.roundNumber <= 1) {
      return true;
    }

    // Subsequent rounds (Round 2+):
    // If team was eliminated in an earlier round, exclude them
    if (team.isEliminated) {
      if (!team.eliminatedInRoundId) {
        return false;
      }
      const elimRoundNum = roundNumberMap.get(team.eliminatedInRoundId);
      if (elimRoundNum !== undefined && elimRoundNum < targetRound.roundNumber) {
        return false;
      }
    }

    return true;
  });
}

/** Who may cast the single audience vote: eliminated teams that weren't disqualified. */
export function canTeamVote(team: HackathonTeam): boolean {
  return team.isEliminated && !team.disqualified;
}

/**
 * A round may go live (active/scoring) only when no other round of the event is live and every
 * earlier round is completed. Returns the reason it can't, or null.
 */
export function roundStartBlocker(round: HackathonRound, eventRounds: HackathonRound[]): string | null {
  const live = eventRounds.find((r) => r.id !== round.id && (r.status === "active" || r.status === "scoring"));
  if (live) return `Round '${live.name}' is still running. Complete it (or advance the stage) first.`;
  const unfinished = eventRounds.find((r) => r.id !== round.id && r.roundNumber < round.roundNumber && r.status !== "completed");
  if (unfinished) return `Round '${unfinished.name}' must be completed before '${round.name}' can start.`;
  return null;
}

/**
 * Standings for one round, ranking only the teams competing in it. Every view (public board,
 * team scorecard, admin preview, advancement, exports) goes through here so they always agree.
 */
export function computeStandings(
  round: HackathonRound,
  allRounds: HackathonRound[],
  teams: HackathonTeam[],
  scores: HackathonScore[],
  votes: HackathonVote[],
  criteria: HackathonCriteria[],
  tiebreakers: HackathonTiebreaker[],
  cutoffRank: number | undefined = round.cutoffRank
): TeamScoreSummary[] {
  const competing = getCompetingTeamsForRound(teams, round, allRounds);
  // Only votes from eligible voters for eligible finalists count, so a later disqualification
  // can't skew everyone else's vote share.
  const eligibleCandidates = new Set(competing.map((t) => t.id));
  const eligibleVoters = new Set(teams.filter(canTeamVote).map((t) => t.id));
  const countedVotes = votes.filter(
    (v) => eligibleCandidates.has(v.candidateTeamId) && eligibleVoters.has(v.voterTeamId)
  );
  return computeRoundLeaderboard(
    round.id,
    round.type === "final",
    competing,
    scores,
    countedVotes,
    criteria.filter((c) => c.roundId === round.id || !c.roundId),
    tiebreakers,
    cutoffRank,
    judgeSharePct(round)
  );
}

/**
 * Calculates a single judge's score for a team normalized to a 100 scale.
 * Each criterion counts in proportion to maxMarks x weight (weight 1 everywhere = plain marks total).
 */
export function calculateJudgeNormalizedScore(
  criterionScores: Record<string, number>,
  criteriaList: HackathonCriteria[]
): { totalAwarded: number; totalMax: number; normalized: number } {
  let totalAwarded = 0;
  let totalMax = 0;
  let weightedAwarded = 0;
  let weightedMax = 0;

  for (const crit of criteriaList) {
    const awarded = Math.max(0, Math.min(crit.maxMarks, criterionScores[crit.id] ?? 0));
    const weight = crit.weight > 0 ? crit.weight : 1;
    totalAwarded += awarded;
    totalMax += crit.maxMarks;
    weightedAwarded += awarded * weight;
    weightedMax += crit.maxMarks * weight;
  }

  if (weightedMax === 0) return { totalAwarded: 0, totalMax: 0, normalized: 0 };

  const normalized = roundToPrecision((weightedAwarded / weightedMax) * HACKATHON_CONSTANTS.MAX_SCORE_SCALE);
  return { totalAwarded: roundToPrecision(totalAwarded), totalMax, normalized };
}

/**
 * Calculates full leaderboard rankings for a specific round.
 * Handles:
 * - Qualifier/Semi-final judge averaging
 * - Final round judge/audience split (judgeWeightPct% judges, the rest votes)
 * - Tie detection and manual tiebreaker adjustments
 * - Disqualifications
 */
export function computeRoundLeaderboard(
  roundId: string,
  isFinalRound: boolean,
  teams: HackathonTeam[],
  scores: HackathonScore[],
  votes: HackathonVote[],
  criteria: HackathonCriteria[],
  tiebreakers: HackathonTiebreaker[],
  cutoffRank?: number,
  judgeWeightPct: number = HACKATHON_CONSTANTS.DEFAULT_JUDGE_WEIGHT_PCT
): TeamScoreSummary[] {
  // Group once: O(teams + scores + votes) instead of re-filtering every list for every team.
  const scoresByTeam = new Map<string, HackathonScore[]>();
  for (const s of scores) {
    if (s.roundId !== roundId) continue;
    const list = scoresByTeam.get(s.teamId);
    if (list) list.push(s);
    else scoresByTeam.set(s.teamId, [s]);
  }
  const votesByTeam = new Map<string, number>();
  let totalVotesCast = 0;
  if (isFinalRound) {
    for (const v of votes) {
      if (v.roundId !== roundId) continue;
      totalVotesCast++;
      votesByTeam.set(v.candidateTeamId, (votesByTeam.get(v.candidateTeamId) || 0) + 1);
    }
  }
  const tieByTeam = new Map(tiebreakers.filter((t) => t.roundId === roundId).map((t) => [t.teamId, t]));
  const critMap = new Map(criteria.map((c) => [c.id, c]));
  const judgeShare = judgeWeightPct / 100;
  const voteShare = (100 - judgeWeightPct) / 100;

  const summaries: TeamScoreSummary[] = teams.map((team) => {
    // If disqualified, zero out score and pin to bottom
    if (team.disqualified) {
      return {
        teamId: team.id,
        teamCode: team.teamCode,
        teamName: team.teamName,
        isEliminated: true,
        finalist: team.finalist,
        disqualified: true,
        judgeScoresCount: 0,
        avgJudgeScore: 0,
        criteriaBreakdown: {},
        votesCount: 0,
        voteScore: 0,
        finalScore: 0,
        rank: 9999,
        isTie: false,
        advanced: false,
      };
    }

    const teamScores = scoresByTeam.get(team.id) || [];
    const judgeCount = teamScores.length;

    let avgJudgeScore = 0;
    const criteriaSums: Record<string, { name: string; marksAwarded: number; maxMarks: number; count: number }> = {};

    if (judgeCount > 0) {
      const sumNormalized = teamScores.reduce((acc, s) => acc + s.normalizedScore, 0);
      avgJudgeScore = roundToPrecision(sumNormalized / judgeCount);

      for (const score of teamScores) {
        for (const [critId, marks] of Object.entries(score.criterionScores)) {
          const crit = critMap.get(critId);
          if (!criteriaSums[critId]) {
            criteriaSums[critId] = { name: crit ? crit.name : "Unknown", marksAwarded: 0, maxMarks: crit ? crit.maxMarks : 10, count: 0 };
          }
          criteriaSums[critId].marksAwarded += marks;
          criteriaSums[critId].count += 1;
        }
      }
    }

    const criteriaBreakdown: Record<string, { name: string; marksAwarded: number; maxMarks: number }> = {};
    for (const [id, item] of Object.entries(criteriaSums)) {
      criteriaBreakdown[id] = {
        name: item.name,
        marksAwarded: roundToPrecision(item.marksAwarded / (item.count || 1)),
        maxMarks: item.maxMarks,
      };
    }

    let finalScore = avgJudgeScore;
    let votesCount = 0;
    let voteScore = 0;

    if (isFinalRound) {
      votesCount = votesByTeam.get(team.id) || 0;
      // Vote score out of 100: this team's share of all counted votes
      const votePercentage = totalVotesCast > 0 ? (votesCount / totalVotesCast) * 100 : 0;
      voteScore = roundToPrecision(votePercentage);
      finalScore = roundToPrecision(avgJudgeScore * judgeShare + votePercentage * voteShare);
    }

    return {
      teamId: team.id,
      teamCode: team.teamCode,
      teamName: team.teamName,
      isEliminated: team.isEliminated,
      finalist: team.finalist,
      disqualified: false,
      judgeScoresCount: judgeCount,
      avgJudgeScore,
      criteriaBreakdown,
      votesCount: isFinalRound ? votesCount : undefined,
      voteScore: isFinalRound ? voteScore : undefined,
      finalScore,
      rank: 1,
      isTie: false,
      tiebreakerReason: tieByTeam.get(team.id)?.reason,
    };
  });

  // Sort: Active first, descending finalScore
  summaries.sort((a, b) => {
    if (a.disqualified && !b.disqualified) return 1;
    if (!a.disqualified && b.disqualified) return -1;
    return b.finalScore - a.finalScore;
  });

  // Compute ranks and detect ties
  let currentRank = 1;
  for (let i = 0; i < summaries.length; i++) {
    if (summaries[i].disqualified) {
      summaries[i].rank = summaries.length;
      continue;
    }

    if (i > 0 && summaries[i].finalScore === summaries[i - 1].finalScore) {
      summaries[i].rank = summaries[i - 1].rank;
      summaries[i].isTie = true;
      summaries[i - 1].isTie = true;
    } else {
      summaries[i].rank = currentRank;
    }
    currentRank++;
  }

  // Apply manual tiebreaker adjustments
  for (const summary of summaries) {
    const tie = tieByTeam.get(summary.teamId);
    if (tie && !summary.disqualified) {
      summary.rank = Math.max(1, summary.rank + tie.rankAdjustment);
    }
  }

  // Re-sort after tiebreaker adjustments
  summaries.sort((a, b) => {
    if (a.disqualified && !b.disqualified) return 1;
    if (!a.disqualified && b.disqualified) return -1;
    if (a.rank !== b.rank) return a.rank - b.rank;
    return b.finalScore - a.finalScore;
  });

  // Apply cutoff rank advancement if applicable
  if (cutoffRank && cutoffRank > 0) {
    for (const item of summaries) {
      item.advanced = !item.disqualified && item.rank <= cutoffRank;
    }
  }

  return summaries;
}
