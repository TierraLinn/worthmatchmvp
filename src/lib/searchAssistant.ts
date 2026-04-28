import type { SkillInsight, UserProfile } from "../types";
import type { PlatformSearchCard } from "./platformSearch";

export interface SearchAssistantPlan {
  primaryQuery: string;
  queryChips: string[];
  searchThesis: string;
  recommendedCards: PlatformSearchCard[];
  nextSteps: string[];
}

function unique(values: string[], limit = 8) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).slice(0, limit);
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").trim();
}

function looksLikeServiceFocus(focusTerm: string, insight: SkillInsight) {
  const normalizedFocus = normalize(focusTerm);

  if (!normalizedFocus) {
    return false;
  }

  const serviceCorpus = insight.serviceOffers.map((offer) => normalize(offer)).join(" ");
  const focusTokens = normalizedFocus.split(/\s+/).filter((token) => token.length > 3);

  return (
    serviceCorpus.includes(normalizedFocus) ||
    focusTokens.some((token) => serviceCorpus.includes(token))
  );
}

function cardPriorityScore(
  card: PlatformSearchCard,
  profile: UserProfile,
  insight: SkillInsight,
  focusTerm: string,
) {
  const prefersRemote = profile.workModes.includes("remote");
  const prefersLocal = profile.workModes.includes("local");
  const prefersHybrid = profile.workModes.includes("hybrid");
  const needsFastIncome = profile.incomeSpeed === "now";
  const serviceFocus = looksLikeServiceFocus(focusTerm, insight);
  const normalizedDesiredRoles = normalize(profile.desiredRoles);

  let score = 0;

  switch (card.id) {
    case "linkedin":
      score += 26;
      break;
    case "indeed":
      score += 24;
      break;
    case "handshake":
      score += 18;
      break;
    case "craigslist-jobs":
      score += 20;
      break;
    case "facebook-marketplace":
      score += 16;
      break;
    case "local-classifieds":
      score += 17;
      break;
    default:
      score += 12;
  }

  if (card.mode === "jobs") {
    score += prefersRemote ? 16 : 0;
    score += prefersHybrid ? 10 : 0;
    score += serviceFocus ? 2 : 10;
  }

  if (card.mode === "services" || card.mode === "community") {
    score += prefersLocal ? 16 : 0;
    score += needsFastIncome ? 18 : 8;
    score += serviceFocus ? 14 : 4;
  }

  if (normalizedDesiredRoles && normalize(card.searchText).includes(normalizedDesiredRoles.split(/\s+/)[0] ?? "")) {
    score += 6;
  }

  if (needsFastIncome && (card.id === "craigslist-jobs" || card.id === "local-classifieds")) {
    score += 10;
  }

  return score;
}

function modeSummary(profile: UserProfile) {
  if (profile.workModes.length === 0) {
    return "remote and local opportunities";
  }

  if (profile.workModes.length === 1) {
    return `${profile.workModes[0]} opportunities`;
  }

  if (
    profile.workModes.includes("remote") &&
    profile.workModes.includes("local")
  ) {
    return "remote roles with local income fallbacks";
  }

  return profile.workModes.join(", ");
}

function incomeSummary(profile: UserProfile) {
  switch (profile.incomeSpeed) {
    case "now":
      return "immediate income";
    case "this-month":
      return "income this month";
    default:
      return "longer-term fit";
  }
}

export function buildSearchAssistantPlan(
  profile: UserProfile,
  insight: SkillInsight,
  cards: PlatformSearchCard[],
  focusTerm?: string,
): SearchAssistantPlan {
  const primaryQuery =
    focusTerm?.trim() ||
    insight.jobTitles[0] ||
    insight.serviceOffers[0] ||
    "customer support";
  const recommendedCards = [...cards]
    .sort(
      (left, right) =>
        cardPriorityScore(right, profile, insight, primaryQuery) -
        cardPriorityScore(left, profile, insight, primaryQuery),
    )
    .slice(0, 3);

  const searchThesis = `Because this profile is aiming for ${modeSummary(profile)} and wants ${incomeSummary(profile)}, the assistant is prioritizing ${primaryQuery.toLowerCase()} paths first, then keeping fast-response fallback platforms ready.`;

  const queryChips = unique([
    primaryQuery,
    ...insight.jobTitles.slice(0, 4),
    ...insight.serviceOffers.slice(0, 2),
  ]);

  const nextSteps = [
    `Run one live search for "${primaryQuery}" across Remotive and curated Ashby company boards.`,
    `Open ${recommendedCards[0]?.name ?? "LinkedIn"} and ${recommendedCards[1]?.name ?? "Indeed"} with prebuilt matched queries.`,
    "Import the strongest listings into WorthMatch for ranking, resume targeting, and tracking.",
  ];

  return {
    primaryQuery,
    queryChips,
    searchThesis,
    recommendedCards,
    nextSteps,
  };
}
