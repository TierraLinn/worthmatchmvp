import type { MatchResult, SkillInsight, UserProfile } from "../types";

export interface AssistantBriefCandidate {
  title: string;
  organization: string;
  sourceLabel: string;
  matchScore: number;
  whyItMatches: string[];
  missingQualifications: string[];
}

export interface AssistantBriefRequest {
  focus: string;
  profile: UserProfile;
  insight: SkillInsight;
  recommendedPlatforms: string[];
  topMatches: AssistantBriefCandidate[];
}

export interface AssistantBriefResult {
  source: "model" | "local";
  label: string;
  summary: string;
  model?: string;
  generatedAt: string;
}

function unique(values: string[], limit = 5) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).slice(0, limit);
}

function joinList(values: string[]) {
  if (values.length === 0) {
    return "your current fit signals";
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function topCandidateLine(candidate?: AssistantBriefCandidate) {
  if (!candidate) {
    return "No live listing is ranked yet, so start with a broad assistant search and import the first credible role that matches the target title.";
  }

  const strengths = candidate.whyItMatches.slice(0, 2).join("; ");
  const gaps =
    candidate.missingQualifications.slice(0, 2).join(", ") ||
    "no major gap signals yet";

  return `${candidate.title} at ${candidate.organization} is the strongest current lead at ${candidate.matchScore} match because ${strengths}. Watch for ${gaps}.`;
}

function nextMoves(request: AssistantBriefRequest) {
  const platforms = joinList(request.recommendedPlatforms.slice(0, 3));
  const candidate = request.topMatches[0];

  return [
    `Run or rerun the search around "${request.focus}" and keep ${platforms} as the first expansion path.`,
    candidate
      ? `Import ${candidate.title} into WorthMatch, then tailor the resume and outreach materials before opening the source listing.`
      : "Import the first strong live result so the resume, interview prep, and tracker can stay tied to one real opportunity.",
    "Move the chosen role into the tracker with a due date so the search turns into an application sequence, not just a list of leads.",
  ];
}

export function buildAssistantBriefFallback(
  request: AssistantBriefRequest,
): AssistantBriefResult {
  const focus = request.focus.trim() || request.insight.jobTitles[0] || "customer support";
  const candidate = request.topMatches[0];
  const skills = unique([
    ...request.insight.marketableSkills,
    ...request.insight.atsKeywords,
  ]);
  const resumeAngle = unique([
    request.profile.headline,
    request.insight.valueProps[0] ?? "",
    request.insight.valueProps[1] ?? "",
  ]).join(" ");

  const summary = [
    "## Best Fit Right Now",
    topCandidateLine(candidate),
    "",
    "## Search Angles",
    `Lead with ${joinList(skills.slice(0, 4))} and keep the search centered on ${focus.toLowerCase()} roles that respect ${joinList(request.profile.workModes)} preferences.`,
    `Expand next on ${joinList(request.recommendedPlatforms.slice(0, 3))}.`,
    "",
    "## Resume Angle",
    resumeAngle || "Lead with the clearest proof of reliability, communication, and follow-through.",
    "",
    "## Next 3 Moves",
    ...nextMoves(request).map((step) => `- ${step}`),
  ].join("\n");

  return {
    source: "local",
    label: "Built-in search strategy engine",
    summary,
    generatedAt: new Date().toISOString(),
  };
}

function normalizeCandidate(match: MatchResult): AssistantBriefCandidate {
  return {
    title: match.title,
    organization: match.organization,
    sourceLabel: match.sourceLabel,
    matchScore: match.matchScore,
    whyItMatches: match.whyItMatches.slice(0, 3),
    missingQualifications: match.missingQualifications.slice(0, 3),
  };
}

export async function generateAssistantBrief(
  request: Omit<AssistantBriefRequest, "topMatches"> & {
    topMatches: MatchResult[];
  },
): Promise<AssistantBriefResult> {
  const normalizedRequest: AssistantBriefRequest = {
    ...request,
    topMatches: request.topMatches.map(normalizeCandidate),
  };

  try {
    const response = await fetch("/api/assistant-brief", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalizedRequest),
    });

    if (!response.ok) {
      throw new Error("Assistant API unavailable.");
    }

    const payload = (await response.json()) as Partial<AssistantBriefResult>;

    if (!payload.summary || !payload.label || !payload.generatedAt) {
      throw new Error("Assistant API returned an incomplete payload.");
    }

    return {
      source: payload.source === "model" ? "model" : "local",
      label: payload.label,
      summary: payload.summary,
      model: payload.model,
      generatedAt: payload.generatedAt,
    };
  } catch {
    return buildAssistantBriefFallback(normalizedRequest);
  }
}
