import type { MatchResult } from "../types";

export type ComparisonLens =
  | "best-fit"
  | "quick-income"
  | "remote-flex"
  | "local-service"
  | "career-growth";

export interface ComparisonHighlight {
  label: string;
  reason: string;
  opportunity: MatchResult | null;
}

export interface LensRecommendationItem {
  match: MatchResult;
  score: number;
  rationale: string;
}

export interface LensRecommendation {
  lens: ComparisonLens;
  label: string;
  description: string;
  winner: LensRecommendationItem | null;
  runnerUp: LensRecommendationItem | null;
  ranked: LensRecommendationItem[];
  decisionBrief: string;
}

const lensLabels: Record<ComparisonLens, string> = {
  "best-fit": "Best overall fit",
  "quick-income": "Quick income",
  "remote-flex": "Remote flexibility",
  "local-service": "Local service path",
  "career-growth": "Career growth",
};

const lensDescriptions: Record<ComparisonLens, string> = {
  "best-fit":
    "Prioritizes total alignment across skill fit, preference fit, and overall confidence.",
  "quick-income":
    "Prioritizes urgency and pay so users can choose the fastest practical money path.",
  "remote-flex":
    "Prioritizes remote or hybrid flexibility while preserving strong fit.",
  "local-service":
    "Prioritizes local contracts and direct paid-service conversion potential.",
  "career-growth":
    "Prioritizes long-term skill growth, responsibility, and stepping-stone value.",
};

function localServiceBonus(match: MatchResult) {
  return match.category === "Freelance Services" || match.remotePolicy === "local"
    ? 96
    : match.remotePolicy === "hybrid"
      ? 72
      : 42;
}

function remoteBonus(match: MatchResult) {
  return match.remotePolicy === "remote"
    ? 98
    : match.remotePolicy === "hybrid"
      ? 82
      : 44;
}

function growthSignal(match: MatchResult) {
  const experienceBoost =
    match.experienceLevel === "growing"
      ? 94
      : match.experienceLevel === "entry"
        ? 78
        : 66;
  const contractBoost =
    match.kind === "contract" || match.kind === "gig" ? 88 : 74;

  return Math.round(experienceBoost * 0.55 + contractBoost * 0.45);
}

function roundScore(value: number) {
  return Math.round(value);
}

function scoreByLens(match: MatchResult, lens: ComparisonLens) {
  switch (lens) {
    case "quick-income":
      return roundScore(
        match.payPotential * 0.36 +
          match.urgency * 0.34 +
          match.preferenceFit * 0.12 +
          match.skillFit * 0.18,
      );
    case "remote-flex":
      return roundScore(
        remoteBonus(match) * 0.38 +
          match.preferenceFit * 0.28 +
          match.matchScore * 0.2 +
          match.payPotential * 0.14,
      );
    case "local-service":
      return roundScore(
        localServiceBonus(match) * 0.4 +
          match.payPotential * 0.24 +
          match.urgency * 0.18 +
          match.skillFit * 0.18,
      );
    case "career-growth":
      return roundScore(
        growthSignal(match) * 0.3 +
          match.skillFit * 0.28 +
          match.experienceFit * 0.16 +
          match.matchScore * 0.16 +
          match.payPotential * 0.1,
      );
    case "best-fit":
    default:
      return roundScore(
        match.matchScore * 0.44 +
          match.skillFit * 0.22 +
          match.preferenceFit * 0.18 +
          match.experienceFit * 0.16,
      );
  }
}

function rationaleForLens(match: MatchResult, lens: ComparisonLens) {
  switch (lens) {
    case "quick-income":
      return `High urgency (${match.urgency}) and pay signal (${match.payPotential}) make this the fastest likely converter.`;
    case "remote-flex":
      return `${match.remotePolicy} setup plus preference fit (${match.preferenceFit}) make it the strongest flexibility path.`;
    case "local-service":
      return `Strong local or freelance signal with immediate paid-service potential in ${match.category.toLowerCase()}.`;
    case "career-growth":
      return `Offers strong stepping-stone value through ${match.experienceLevel} level scope and transferable skill growth.`;
    case "best-fit":
    default:
      return `Highest total fit score with strong alignment across skills, experience, and preference.`;
  }
}

function buildDecisionBrief(
  ranked: LensRecommendationItem[],
  lens: ComparisonLens,
) {
  if (ranked.length === 0) {
    return "No saved opportunities yet.";
  }

  const winner = ranked[0];
  const runnerUp = ranked[1];

  return [
    `DECISION LENS: ${lensLabels[lens]}`,
    "",
    `RECOMMENDED PATH`,
    `${winner.match.title} at ${winner.match.organization}`,
    `Lens score: ${winner.score}`,
    winner.rationale,
    `Recommended next move: ${winner.match.recommendedActions[0]}`,
    "",
    runnerUp
      ? `RUNNER-UP\n${runnerUp.match.title} at ${runnerUp.match.organization}\nLens score: ${runnerUp.score}\n${runnerUp.rationale}\n`
      : "",
    "TOP SAVED OPTIONS",
    ranked
      .map(
        (item, index) =>
          `${index + 1}. ${item.match.title} - ${item.match.organization} (${item.score})`,
      )
      .join("\n"),
  ]
    .filter(Boolean)
    .join("\n");
}

export function getSavedComparisons(
  matches: MatchResult[],
  savedOpportunityIds: string[],
) {
  return matches.filter((match) => savedOpportunityIds.includes(match.id));
}

export function buildComparisonHighlights(
  savedMatches: MatchResult[],
): ComparisonHighlight[] {
  if (savedMatches.length === 0) {
    return [
      {
        label: "No saved opportunities yet",
        reason: "Save at least two matches to unlock a recommendation set.",
        opportunity: null,
      },
    ];
  }

  const bestOverall = [...savedMatches].sort(
    (left, right) => right.matchScore - left.matchScore,
  )[0];

  const bestQuickIncome = [...savedMatches].sort((left, right) => {
    const leftScore = left.payPotential * 0.5 + left.urgency * 0.5;
    const rightScore = right.payPotential * 0.5 + right.urgency * 0.5;
    return rightScore - leftScore;
  })[0];

  const bestRemote = [...savedMatches].sort((left, right) => {
    const leftScore = remoteBonus(left) + left.preferenceFit;
    const rightScore = remoteBonus(right) + right.preferenceFit;
    return rightScore - leftScore;
  })[0];

  const bestLocalService =
    savedMatches.find(
      (match) =>
        match.category === "Freelance Services" || match.remotePolicy === "local",
    ) ?? bestQuickIncome;

  return [
    {
      label: "Best overall fit",
      reason:
        "Highest total alignment across fit, experience, preference, and momentum.",
      opportunity: bestOverall,
    },
    {
      label: "Best for quick income",
      reason:
        "Strong urgency and pay signal make it the fastest practical path.",
      opportunity: bestQuickIncome,
    },
    {
      label: "Best remote-friendly path",
      reason: "Strong preference fit plus remote or hybrid flexibility.",
      opportunity: bestRemote,
    },
    {
      label: "Best local service path",
      reason:
        "Most likely to convert into direct paid service work or nearby contracts.",
      opportunity: bestLocalService,
    },
  ];
}

export function buildLensRecommendation(
  savedMatches: MatchResult[],
  lens: ComparisonLens,
): LensRecommendation {
  const ranked = [...savedMatches]
    .map((match) => ({
      match,
      score: scoreByLens(match, lens),
      rationale: rationaleForLens(match, lens),
    }))
    .sort((left, right) => right.score - left.score);

  return {
    lens,
    label: lensLabels[lens],
    description: lensDescriptions[lens],
    winner: ranked[0] ?? null,
    runnerUp: ranked[1] ?? null,
    ranked,
    decisionBrief: buildDecisionBrief(ranked, lens),
  };
}

export const comparisonLenses: ComparisonLens[] = [
  "best-fit",
  "quick-income",
  "remote-flex",
  "local-service",
  "career-growth",
];

export function getComparisonLensLabel(lens: ComparisonLens) {
  return lensLabels[lens];
}
