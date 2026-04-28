import type { Opportunity, SkillInsight, UserProfile } from "../types";

interface RemotiveApiResponse {
  jobs: RemotiveJob[];
}

export interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  job_type?: string | null;
  publication_date: string;
  candidate_required_location?: string | null;
  salary?: string | null;
  description: string;
}

const CACHE_TTL_MS = 15 * 60 * 1000;

function unique(values: string[], limit = 6) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).slice(0, limit);
}

function cacheKey(search: string) {
  return `worthmatch.remotive.${search.toLowerCase()}`;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function inferKind(value?: string | null): Opportunity["kind"] {
  const normalized = value?.toLowerCase() ?? "";

  if (normalized.includes("contract")) {
    return "contract";
  }

  if (normalized.includes("part")) {
    return "part-time";
  }

  if (normalized.includes("freelance")) {
    return "gig";
  }

  return "full-time";
}

function inferExperienceLevel(job: RemotiveJob): Opportunity["experienceLevel"] {
  const corpus = `${job.title} ${stripHtml(job.description)}`.toLowerCase();

  if (
    corpus.includes("intern") ||
    corpus.includes("junior") ||
    corpus.includes("entry")
  ) {
    return "entry";
  }

  if (
    corpus.includes("senior") ||
    corpus.includes("staff") ||
    corpus.includes("lead") ||
    corpus.includes("principal")
  ) {
    return "mid";
  }

  return "growing";
}

function inferCompensationValue(salary?: string | null) {
  if (!salary) {
    return 70;
  }

  const numbers = Array.from(
    salary.matchAll(/\$?(\d{2,3})(?:,\d{3})?/g),
    (match) => Number(match[1]),
  );

  if (numbers.length === 0) {
    return 72;
  }

  const average = numbers.reduce((total, value) => total + value, 0) / numbers.length;
  return Math.max(58, Math.min(96, Math.round(average / 2)));
}

function inferUrgency(publicationDate: string) {
  const publishedTime = new Date(publicationDate).getTime();

  if (Number.isNaN(publishedTime)) {
    return 74;
  }

  const ageDays = (Date.now() - publishedTime) / (1000 * 60 * 60 * 24);

  if (ageDays <= 3) {
    return 90;
  }

  if (ageDays <= 7) {
    return 82;
  }

  if (ageDays <= 14) {
    return 75;
  }

  return 68;
}

export async function fetchRemotiveJobs(search: string, limit = 8) {
  const normalizedSearch = search.trim();

  if (!normalizedSearch) {
    return [] as RemotiveJob[];
  }

  if (typeof window !== "undefined") {
    const cached = window.sessionStorage.getItem(cacheKey(normalizedSearch));

    if (cached) {
      try {
        const parsed = JSON.parse(cached) as {
          savedAt: number;
          jobs: RemotiveJob[];
        };

        if (Date.now() - parsed.savedAt < CACHE_TTL_MS) {
          return parsed.jobs;
        }
      } catch {
        window.sessionStorage.removeItem(cacheKey(normalizedSearch));
      }
    }
  }

  const response = await fetch(
    `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(
      normalizedSearch,
    )}&limit=${limit}`,
  );

  if (!response.ok) {
    throw new Error("Failed to load live Remotive jobs.");
  }

  const payload = (await response.json()) as RemotiveApiResponse;
  const jobs = payload.jobs.slice(0, limit);

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(
      cacheKey(normalizedSearch),
      JSON.stringify({
        savedAt: Date.now(),
        jobs,
      }),
    );
  }

  return jobs;
}

export function normalizeRemotiveJob(
  job: RemotiveJob,
  profile: UserProfile,
  insight: SkillInsight,
): Opportunity {
  const plainDescription = stripHtml(job.description);
  const titleTokens = job.title
    .split(/[^a-zA-Z0-9]+/)
    .filter((token) => token.length > 3);

  const skills = unique([
    ...titleTokens,
    ...job.category.split(/[^a-zA-Z0-9]+/),
    ...insight.marketableSkills,
  ], 6);

  return {
    id: `remotive-${job.id}`,
    title: job.title,
    organization: job.company_name,
    sourceId: "remotive-api",
    sourceLabel: "Remotive live API",
    sourceType: "official",
    location: job.candidate_required_location || "Remote",
    remotePolicy: "remote",
    kind: inferKind(job.job_type),
    experienceLevel: inferExperienceLevel(job),
    compensation: job.salary || "See listing",
    compensationValue: inferCompensationValue(job.salary),
    urgencyScore: inferUrgency(job.publication_date),
    category: job.category || "Remote opportunities",
    summary: plainDescription.slice(0, 220),
    responsibilities: [
      `Review the live source listing on Remotive for the full ${job.title.toLowerCase()} scope.`,
      `Mirror role language from ${job.company_name} into the targeted resume and outreach.`,
      "Use the source link to apply after tailoring materials inside WorthMatch.",
    ],
    qualifications: [
      skills[0] ?? insight.atsKeywords[0] ?? "communication",
      skills[1] ?? insight.atsKeywords[1] ?? "organization",
      "Comfort applying through a live external source after targeting materials",
    ],
    skills,
    tags: unique([
      "live-search",
      "remote",
      "remotive",
      job.job_type ?? "",
      profile.incomeSpeed === "now" ? "urgent" : "remote roles",
    ], 5),
    link: job.url,
  };
}
