import type {
  ApplicationStage,
  TrackedOpportunity,
  TrackedOpportunityView,
} from "../types";

export const applicationStages: ApplicationStage[] = [
  "discovered",
  "ready",
  "applied",
  "interview",
  "offer",
];

export const applicationStageLabels: Record<ApplicationStage, string> = {
  discovered: "Discovered",
  ready: "Ready to apply",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
};

export const seededTrackedOpportunities: TrackedOpportunity[] = [
  {
    opportunityId: "northline-student-success",
    stage: "ready",
    nextStep: "Tailor the resume summary and answer the motivation prompt.",
    dueLabel: "Today",
    notes: "High-fit remote role with fast traction and clear student-facing language.",
    lastUpdated: "2026-04-20",
  },
  {
    opportunityId: "oakland-small-business",
    stage: "applied",
    nextStep: "Send a one-package freelance pitch with flyer and caption examples.",
    dueLabel: "Tomorrow",
    notes: "Great quick-income bridge opportunity with visible local proof points.",
    lastUpdated: "2026-04-19",
  },
  {
    opportunityId: "ladderloop-founder-assistant",
    stage: "interview",
    nextStep: "Practice one story about reprioritizing under pressure.",
    dueLabel: "This week",
    notes: "Strong upside if the candidate can show ownership and writing polish.",
    lastUpdated: "2026-04-18",
  },
];

export function formatDateStamp() {
  return new Date().toISOString().slice(0, 10);
}

export function createTrackedOpportunity(opportunityId: string): TrackedOpportunity {
  return {
    opportunityId,
    stage: "discovered",
    nextStep: "Review match reasons and decide whether to target materials.",
    dueLabel: "Soon",
    notes: "Newly tracked from the opportunity board.",
    lastUpdated: formatDateStamp(),
  };
}

export function sortTrackedOpportunities(
  trackedOpportunities: TrackedOpportunityView[],
) {
  const stageRank = new Map(applicationStages.map((stage, index) => [stage, index]));

  return [...trackedOpportunities].sort((left, right) => {
    const leftRank = stageRank.get(left.stage) ?? 0;
    const rightRank = stageRank.get(right.stage) ?? 0;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return right.opportunity.matchScore - left.opportunity.matchScore;
  });
}
