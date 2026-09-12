import {
  HackathonScore,
  HackathonVote,
  HackathonTeam,
  HackathonCriteria,
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
  voteScore?: number; // 0 - 100 (scaled to vote weight component)
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

/**
 * Filters teams eligible to compete in a specific tournament round.
 * Excludes disqualified teams and teams eliminated in previous rounds.
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

/**
 * Calculates a single judge's score for a team normalized to a 100 scale.
 */
export function calculateJudgeNormalizedScore(
  criterionScores: Record<string, number>,
  criteriaList: HackathonCriteria[]
): { totalAwarded: number; totalMax: number; normalized: number } {
  let totalAwarded = 0;
  let totalMax = 0;

  for (const crit of criteriaList) {
    const awarded = Math.max(0, Math.min(crit.maxMarks, criterionScores[crit.id] ?? 0));
    totalAwarded += awarded;
    totalMax += crit.maxMarks;
  }

  if (totalMax === 0) return { totalAwarded: 0, totalMax: 0, normalized: 0 };

  const normalized = roundToPrecision((totalAwarded / totalMax) * HACKATHON_CONSTANTS.MAX_SCORE_SCALE);
  return { totalAwarded, totalMax, normalized };
}

/**
 * Calculates full leaderboard rankings for a specific round.
 * Handles:
 * - Qualifier/Semi-final judge averaging
 * - Final round 70/30 judge/audience vote split
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
  cutoffRank?: number
): TeamScoreSummary[] {
  const roundScores = scores.filter((s) => s.roundId === roundId);
  const roundVotes = isFinalRound ? votes.filter((v) => v.roundId === roundId) : [];
  const totalVotesCast = roundVotes.length;

  // Criteria map
  const critMap = new Map(criteria.map((c) => [c.id, c]));

  // Aggregate by team
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

    const teamScores = roundScores.filter((s) => s.teamId === team.id);
    const judgeCount = teamScores.length;

    let avgJudgeScore = 0;
    const criteriaSums: Record<string, { name: string; marksAwarded: number; maxMarks: number; count: number }> = {};

    if (judgeCount > 0) {
      const sumNormalized = teamScores.reduce((acc, s) => acc + s.normalizedScore, 0);
      avgJudgeScore = roundToPrecision(sumNormalized / judgeCount);

      // Aggregate criteria breakdowns
      for (const score of teamScores) {
        for (const [critId, marks] of Object.entries(score.criterionScores)) {
          const crit = critMap.get(critId);
          const name = crit ? crit.name : "Unknown";
          const max = crit ? crit.maxMarks : 10;
          if (!criteriaSums[critId]) {
            criteriaSums[critId] = { name, marksAwarded: 0, maxMarks: max, count: 0 };
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

    // Apply 70/30 rule if final round (70% Judges, 30% Audience Votes)
    if (isFinalRound) {
      const teamVotes = roundVotes.filter((v) => v.candidateTeamId === team.id);
      votesCount = teamVotes.length;

      // Vote score out of 100: percentage of total votes cast
      const votePercentage = totalVotesCast > 0 ? (votesCount / totalVotesCast) * 100 : 0;
      voteScore = roundToPrecision(votePercentage);

      const judgeComponent = avgJudgeScore * HACKATHON_CONSTANTS.JUDGE_WEIGHT; // 70%
      const voteComponent = votePercentage * HACKATHON_CONSTANTS.VOTE_WEIGHT; // 30%
      finalScore = roundToPrecision(judgeComponent + voteComponent);
    }

    // Check tiebreaker adjustment
    const tiebreaker = tiebreakers.find((t) => t.roundId === roundId && t.teamId === team.id);

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
      tiebreakerReason: tiebreaker?.reason,
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
    const tie = tiebreakers.find((t) => t.roundId === roundId && t.teamId === summary.teamId);
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
      if (!item.disqualified && item.rank <= cutoffRank) {
        item.advanced = true;
      } else {
        item.advanced = false;
      }
    }
  }

  return summaries;
}
