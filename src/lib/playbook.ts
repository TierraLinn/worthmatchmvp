import type {
  MatchResult,
  SkillInsight,
  TrackedOpportunityView,
  UserProfile,
} from "../types";

function unique(values: string[], limit = 8) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).slice(0, limit);
}

export interface SearchPlaybook {
  keywordLine: string;
  searchQueries: string[];
  localServiceQueries: string[];
  servicePitch: string;
  actionPlan: string[];
  openingSummary: string;
}

export function buildSearchPlaybook(
  profile: UserProfile,
  insight: SkillInsight,
  matches: MatchResult[],
  trackedOpportunities: TrackedOpportunityView[],
): SearchPlaybook {
  const topMatches = matches.slice(0, 3);
  const topRoleTitles = unique([
    ...insight.jobTitles.slice(0, 4),
    ...topMatches.map((match) => match.title),
  ], 5);
  const location = profile.location;

  const searchQueries = unique(
    topRoleTitles.flatMap((title) => [
      `${title} remote`,
      `${title} "${location}"`,
      `${title} entry level remote`,
    ]),
    6,
  );

  const localServiceQueries = unique(
    insight.serviceOffers.slice(0, 4).flatMap((offer) => [
      `${offer} ${location}`,
      `${offer} near me`,
    ]),
    5,
  );

  const keywordLine = unique([
    ...insight.atsKeywords,
    ...insight.marketableSkills,
  ], 12).join(", ");

  const servicePitch = `${profile.name} offers ${insight.serviceOffers
    .slice(0, 2)
    .join(" and ")} with strengths in ${insight.marketableSkills
    .slice(0, 3)
    .join(", ")}. Ideal for clients who need calm follow-through, clear updates, and dependable execution.`;

  const nextTracked = trackedOpportunities[0];
  const actionPlan = unique([
    `Lead applications with ${topMatches[0]?.title ?? insight.jobTitles[0]} and mirror keywords from ${topMatches[0]?.organization ?? "top matches"}.`,
    `Search using phrases like ${searchQueries[0] ?? insight.jobTitles[0]} and ${searchQueries[1] ?? "remote support roles"}.`,
    `Pitch local services using ${localServiceQueries[0] ?? insight.serviceOffers[0]}.`,
    nextTracked
      ? `Advance ${nextTracked.opportunity.title} by completing: ${nextTracked.nextStep}`
      : "Track one high-fit opportunity and prepare a same-day tailored resume.",
  ], 4);

  const openingSummary =
    `${profile.name} is a strong match for ${topRoleTitles
      .slice(0, 3)
      .join(", ")} because of proven strengths in ${insight.marketableSkills
      .slice(0, 3)
      .join(", ")}.`;

  return {
    keywordLine,
    searchQueries,
    localServiceQueries,
    servicePitch,
    actionPlan,
    openingSummary,
  };
}
