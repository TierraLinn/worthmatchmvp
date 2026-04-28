import type { MatchResult, Opportunity, SkillInsight, UserProfile } from "../types";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").trim();
}

function keywordSet(values: string[]) {
  return new Set(
    values
      .flatMap((value) => normalize(value).split(/\s+/))
      .filter((token) => token.length > 2),
  );
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function inferExperienceScore(profile: UserProfile, opportunity: Opportunity) {
  const notes = normalize(
    `${profile.experienceNotes} ${profile.helpRequests} ${profile.strengths}`,
  );

  if (opportunity.experienceLevel === "entry") {
    return notes.includes("lead") || notes.includes("retail") ? 92 : 85;
  }

  if (opportunity.experienceLevel === "growing") {
    return notes.includes("club") || notes.includes("business") ? 81 : 70;
  }

  return 62;
}

function buildWhyItMatches(
  opportunity: Opportunity,
  insight: SkillInsight,
  overlap: string[],
  preferenceFit: number,
) {
  const reasons = [
    overlap.length > 0
      ? `Direct skill overlap with ${overlap.slice(0, 3).join(", ")}.`
      : "Strong adjacent fit based on communication, reliability, and organization.",
    preferenceFit >= 85
      ? `Matches the requested ${opportunity.remotePolicy} work preference.`
      : "Still workable with the current location and flexibility settings.",
    `Belongs to ${opportunity.category}, which aligns with likely roles such as ${insight.jobTitles.slice(0, 2).join(" and ")}.`,
  ];

  return reasons;
}

function buildActions(opportunity: Opportunity, overlap: string[], gaps: string[]) {
  const actions = [
    `Lead with ${overlap[0] ?? "reliability"} in the opening summary.`,
    `Mirror keywords from the listing such as ${opportunity.skills.slice(0, 3).join(", ")} in the resume.`,
    opportunity.kind === "gig" || opportunity.kind === "contract"
      ? "Offer one concrete service package or starter scope in outreach."
      : "Prepare one short example that shows follow-through under real constraints.",
  ];

  if (gaps.length > 0) {
    actions.push(`Address the gap around ${gaps[0]} with a transferable example.`);
  }

  return actions.slice(0, 4);
}

export function rankOpportunities(
  profile: UserProfile,
  insight: SkillInsight,
  opportunities: Opportunity[],
): MatchResult[] {
  const keywords = keywordSet([
    ...insight.marketableSkills,
    ...insight.atsKeywords,
    ...insight.jobTitles,
    ...insight.serviceOffers,
    profile.strengths,
    profile.helpRequests,
    profile.desiredRoles,
  ]);

  return opportunities
    .map((opportunity) => {
      const overlap = opportunity.skills.filter((skill) =>
        normalize(skill)
          .split(/\s+/)
          .some((token) => keywords.has(token)),
      );

      const skillFit = clamp(44 + overlap.length * 14);
      const preferenceFit = profile.workModes.includes(opportunity.remotePolicy)
        ? 95
        : opportunity.remotePolicy === "hybrid" &&
            (profile.workModes.includes("remote") || profile.workModes.includes("local"))
          ? 78
          : 58;
      const payPotential = opportunity.compensationValue;
      const urgencyBoost = profile.incomeSpeed === "now" ? 8 : profile.incomeSpeed === "this-month" ? 4 : 0;
      const urgency = clamp(opportunity.urgencyScore + urgencyBoost);
      const experienceFit = inferExperienceScore(profile, opportunity);
      const matchScore = Math.round(
        skillFit * 0.34 +
          preferenceFit * 0.18 +
          payPotential * 0.18 +
          urgency * 0.14 +
          experienceFit * 0.16,
      );

      const missingQualifications = opportunity.qualifications.filter((qualification) => {
        const parts = normalize(qualification).split(/\s+/);
        return !parts.some((part) => keywords.has(part));
      });

      return {
        ...opportunity,
        matchScore,
        skillFit,
        preferenceFit,
        payPotential,
        urgency,
        experienceFit,
        missingQualifications,
        whyItMatches: buildWhyItMatches(opportunity, insight, overlap, preferenceFit),
        recommendedActions: buildActions(opportunity, overlap, missingQualifications),
      };
    })
    .sort((left, right) => right.matchScore - left.matchScore);
}
