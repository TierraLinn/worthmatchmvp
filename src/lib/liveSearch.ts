import {
  curatedAshbyBoards,
  normalizeAshbyJob,
  searchAshbyBoards,
  type AshbySearchResult,
} from "./ashby";
import { rankOpportunities } from "./matcher";
import {
  fetchRemotiveJobs,
  normalizeRemotiveJob,
  type RemotiveJob,
} from "./remotive";
import type { MatchResult, SkillInsight, UserProfile } from "../types";

export interface LiveSearchRun {
  query: string;
  remotiveJobs: RemotiveJob[];
  ashbyResults: AshbySearchResult[];
  remotiveMatches: MatchResult[];
  ashbyMatches: MatchResult[];
  combinedMatches: MatchResult[];
  notes: string[];
}

function sortCombinedMatches(matches: MatchResult[]) {
  return [...matches].sort((left, right) => {
    if (right.matchScore !== left.matchScore) {
      return right.matchScore - left.matchScore;
    }

    if (right.preferenceFit !== left.preferenceFit) {
      return right.preferenceFit - left.preferenceFit;
    }

    if (right.payPotential !== left.payPotential) {
      return right.payPotential - left.payPotential;
    }

    return right.urgency - left.urgency;
  });
}

export async function runLiveSourceSearch(
  profile: UserProfile,
  insight: SkillInsight,
  query: string,
  options?: {
    remotiveLimit?: number;
    ashbyLimit?: number;
    combinedLimit?: number;
  },
) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return {
      query: "",
      remotiveJobs: [],
      ashbyResults: [],
      remotiveMatches: [],
      ashbyMatches: [],
      combinedMatches: [],
      notes: ["No search query was provided."],
    } satisfies LiveSearchRun;
  }

  const remotiveLimit = options?.remotiveLimit ?? 10;
  const ashbyLimit = options?.ashbyLimit ?? 12;
  const combinedLimit = options?.combinedLimit ?? 8;
  const [remotiveResult, ashbyResult] = await Promise.allSettled([
    fetchRemotiveJobs(normalizedQuery, remotiveLimit),
    searchAshbyBoards(
      normalizedQuery,
      profile,
      insight,
      curatedAshbyBoards,
      ashbyLimit,
    ),
  ]);

  const remotiveJobs =
    remotiveResult.status === "fulfilled" ? remotiveResult.value : [];
  const ashbyResults =
    ashbyResult.status === "fulfilled" ? ashbyResult.value : [];
  const remotiveMatches = rankOpportunities(
    profile,
    insight,
    remotiveJobs.map((job) => normalizeRemotiveJob(job, profile, insight)),
  );
  const ashbyMatches = rankOpportunities(
    profile,
    insight,
    ashbyResults.map((result) =>
      normalizeAshbyJob(result.board, result.job, profile, insight),
    ),
  );
  const notes: string[] = [];

  if (remotiveResult.status === "rejected") {
    notes.push("Remotive was unavailable.");
  }

  if (ashbyResult.status === "rejected") {
    notes.push("One or more Ashby boards did not load.");
  }

  return {
    query: normalizedQuery,
    remotiveJobs,
    ashbyResults,
    remotiveMatches,
    ashbyMatches,
    combinedMatches: sortCombinedMatches([
      ...remotiveMatches,
      ...ashbyMatches,
    ]).slice(0, combinedLimit),
    notes,
  } satisfies LiveSearchRun;
}
