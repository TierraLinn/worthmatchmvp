import type { ImportInput, Opportunity, SkillInsight, UserProfile } from "../types";

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function buildId(seed: string) {
  return seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function titleFromLink(link: string) {
  try {
    const url = new URL(link);
    const parts = url.pathname.split("/").filter(Boolean);
    const raw = parts[parts.length - 1] ?? url.hostname.replace("www.", "");
    return titleCase(raw.replace(/[-_]/g, " "));
  } catch {
    return "Imported Listing";
  }
}

function extractTitle(mode: ImportInput["mode"], content: string) {
  if (mode === "link") {
    return titleFromLink(content);
  }

  if (mode === "upload") {
    return titleCase(content.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]/g, " "));
  }

  if (mode === "manual") {
    try {
      const parsed = JSON.parse(content) as {
        title?: string;
      };
      return parsed.title?.trim() || "Saved Opportunity";
    } catch {
      return "Saved Opportunity";
    }
  }

  const firstLine = content.split("\n").find((line) => line.trim().length > 0);
  return titleCase((firstLine ?? "Imported Opportunity").slice(0, 56));
}

function extractOrganization(mode: ImportInput["mode"], content: string) {
  if (mode === "manual") {
    try {
      const parsed = JSON.parse(content) as {
        organization?: string;
      };
      return parsed.organization?.trim() || "Manual save";
    } catch {
      return "Manual save";
    }
  }

  if (mode === "link") {
    try {
      const url = new URL(content);
      return titleCase(url.hostname.replace("www.", "").split(".")[0]);
    } catch {
      return "Imported source";
    }
  }

  return mode === "upload" ? "Uploaded listing" : "Pasted description";
}

function inferRemotePolicy(content: string, profile: UserProfile): Opportunity["remotePolicy"] {
  const normalized = content.toLowerCase();

  if (normalized.includes("remote")) {
    return "remote";
  }

  if (normalized.includes("hybrid")) {
    return "hybrid";
  }

  return profile.workModes[0] ?? "remote";
}

export function createImportedOpportunity(
  input: ImportInput,
  profile: UserProfile,
  insight: SkillInsight,
): Opportunity {
  const manualFields =
    input.mode === "manual"
      ? (JSON.parse(input.content) as {
          title?: string;
          organization?: string;
          location?: string;
          pay?: string;
          summary?: string;
        })
      : null;
  const title = extractTitle(input.mode, input.content);
  const organization = extractOrganization(input.mode, input.content);
  const remotePolicy = inferRemotePolicy(input.content, profile);
  const summarySeed =
    input.mode === "paste"
      ? input.content.slice(0, 220)
      : manualFields?.summary?.trim() ||
        input.extra ||
        `Imported via ${input.mode}. Review and refine before applying.`;

  const sourceType =
    input.mode === "manual" ? "manual" : input.mode === "paste" ? "manual" : "imported";

  return {
    id: buildId(`${title}-${organization}-${Date.now()}`),
    title,
    organization,
    sourceId: `${input.mode}-intake`,
    sourceLabel:
      input.mode === "paste"
        ? "Pasted description"
        : input.mode === "upload"
          ? "Uploaded asset"
          : input.mode === "manual"
            ? "Saved opportunity"
            : "Imported link",
    sourceType,
    location:
      manualFields?.location?.trim() ||
      (remotePolicy === "remote" ? "Remote" : profile.location),
    remotePolicy,
    kind: input.mode === "manual" ? "gig" : "contract",
    experienceLevel: "entry",
    compensation:
      manualFields?.pay?.trim() ||
      (input.mode === "manual"
        ? "Set by user"
        : profile.incomeSpeed === "now"
          ? "Estimate high urgency"
          : "Estimate from listing"),
    compensationValue: profile.incomeSpeed === "now" ? 80 : 70,
    urgencyScore: input.mode === "manual" ? 90 : 76,
    category:
      input.mode === "manual" ? "Freelance Services" : "Imported Opportunities",
    summary: summarySeed,
    responsibilities: [
      `Lead with ${insight.marketableSkills[0]} and ${insight.marketableSkills[1]} in the application.`,
      "Review the listing details and normalize them into a quick-apply summary.",
      "Tailor resume bullets to reflect the opportunity's top outcomes.",
    ],
    qualifications: [
      insight.atsKeywords[0] ?? "communication",
      insight.atsKeywords[1] ?? "organization",
      "Ability to learn fast and translate informal experience",
    ],
    skills: insight.marketableSkills.slice(0, 5),
    tags: [
      input.mode,
      remotePolicy,
      profile.incomeSpeed === "now" ? "urgent" : "review ready",
    ],
    link: input.mode === "link" ? input.content : undefined,
  };
}
