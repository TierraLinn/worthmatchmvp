import type { Opportunity, SkillInsight, UserProfile, WorkMode } from "../types";

export interface AshbyBoard {
  id: string;
  name: string;
  focus: string;
}

interface AshbyApiResponse {
  jobs: AshbyJob[];
}

export interface AshbyJob {
  id: string;
  title: string;
  department?: string | null;
  team?: string | null;
  employmentType?: string | null;
  location?: string | null;
  secondaryLocations?: Array<{ location?: string | null }>;
  publishedAt: string;
  isRemote?: boolean;
  workplaceType?: string | null;
  jobUrl: string;
  applyUrl?: string | null;
  descriptionHtml?: string | null;
  descriptionPlain?: string | null;
  compensation?: {
    compensationTierSummary?: string | null;
    scrapeableCompensationSalarySummary?: string | null;
  } | null;
}

export interface AshbySearchResult {
  board: AshbyBoard;
  job: AshbyJob;
  relevance: number;
}

export const curatedAshbyBoards: AshbyBoard[] = [
  {
    id: "notion",
    name: "Notion",
    focus: "Product, operations, sales, and support-adjacent startup roles",
  },
  {
    id: "ramp",
    name: "Ramp",
    focus: "Operations, customer, sales, and growth-heavy company roles",
  },
  {
    id: "mercor",
    name: "Mercor",
    focus: "Operations, recruiting, people, and scale-up support roles",
  },
  {
    id: "openai",
    name: "OpenAI",
    focus: "Policy, operations, research, GTM, and specialist company roles",
  },
  {
    id: "cursor",
    name: "Cursor",
    focus: "Lean startup roles with engineering, growth, and product mix",
  },
  {
    id: "linear",
    name: "Linear",
    focus: "Modern product-company roles with engineering and GTM hiring",
  },
];

const CACHE_TTL_MS = 15 * 60 * 1000;

function unique(values: string[], limit = 6) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).slice(0, limit);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function cacheKey(boardId: string) {
  return `worthmatch.ashby.${boardId}`;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").trim();
}

function inferRemotePolicy(job: AshbyJob): WorkMode {
  if (job.isRemote) {
    return "remote";
  }

  const workplace = job.workplaceType?.toLowerCase() ?? "";

  if (workplace.includes("remote")) {
    return "remote";
  }

  if (workplace.includes("hybrid")) {
    return "hybrid";
  }

  return "local";
}

function inferKind(value?: string | null): Opportunity["kind"] {
  const normalizedValue = value?.toLowerCase() ?? "";

  if (normalizedValue.includes("contract")) {
    return "contract";
  }

  if (normalizedValue.includes("part")) {
    return "part-time";
  }

  if (normalizedValue.includes("intern")) {
    return "gig";
  }

  return "full-time";
}

function inferExperienceLevel(job: AshbyJob): Opportunity["experienceLevel"] {
  const corpus = normalize(
    `${job.title} ${job.department ?? ""} ${job.team ?? ""} ${job.descriptionPlain ?? ""}`,
  );

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
    corpus.includes("principal") ||
    corpus.includes("lead")
  ) {
    return "mid";
  }

  return "growing";
}

function compensationLabel(job: AshbyJob) {
  return (
    job.compensation?.scrapeableCompensationSalarySummary ||
    job.compensation?.compensationTierSummary ||
    "See source"
  );
}

function compensationValue(job: AshbyJob) {
  const label = compensationLabel(job);
  const numbers = Array.from(
    label.matchAll(/\$?(\d{2,3})(?:,\d{3})?/g),
    (match) => Number(match[1]),
  );

  if (numbers.length === 0) {
    return 72;
  }

  const average = numbers.reduce((total, value) => total + value, 0) / numbers.length;
  return Math.max(60, Math.min(98, Math.round(average / 2)));
}

function urgencyFromDate(publishedAt: string) {
  const publishedTime = new Date(publishedAt).getTime();

  if (Number.isNaN(publishedTime)) {
    return 72;
  }

  const ageDays = (Date.now() - publishedTime) / (1000 * 60 * 60 * 24);

  if (ageDays <= 3) {
    return 92;
  }

  if (ageDays <= 7) {
    return 84;
  }

  if (ageDays <= 14) {
    return 76;
  }

  return 68;
}

function categoryForJob(job: AshbyJob) {
  return job.department || job.team || "Company roles";
}

function relevanceScore(
  board: AshbyBoard,
  job: AshbyJob,
  query: string,
  profile: UserProfile,
  insight: SkillInsight,
) {
  const corpus = normalize(
    [
      job.title,
      job.department,
      job.team,
      job.location,
      job.descriptionPlain,
      board.name,
      board.focus,
    ]
      .filter(Boolean)
      .join(" "),
  );

  const searchTerms = unique([
    query,
    ...insight.jobTitles,
    ...insight.marketableSkills,
    ...profile.desiredRoles.split(","),
  ])
    .flatMap((value) => normalize(value).split(/\s+/))
    .filter((token) => token.length > 2);

  return searchTerms.reduce(
    (score, token) => score + (corpus.includes(token) ? 12 : 0),
    0,
  );
}

export async function fetchAshbyBoardJobs(board: AshbyBoard) {
  if (typeof window !== "undefined") {
    const cached = window.sessionStorage.getItem(cacheKey(board.id));

    if (cached) {
      try {
        const parsed = JSON.parse(cached) as {
          savedAt: number;
          jobs: AshbyJob[];
        };

        if (Date.now() - parsed.savedAt < CACHE_TTL_MS) {
          return parsed.jobs;
        }
      } catch {
        window.sessionStorage.removeItem(cacheKey(board.id));
      }
    }
  }

  const response = await fetch(
    `https://api.ashbyhq.com/posting-api/job-board/${board.id}?includeCompensation=true`,
  );

  if (!response.ok) {
    throw new Error(`Failed to load ${board.name} board.`);
  }

  const payload = (await response.json()) as AshbyApiResponse;
  const jobs = payload.jobs.filter((job) => job.title && job.jobUrl);

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(
      cacheKey(board.id),
      JSON.stringify({
        savedAt: Date.now(),
        jobs,
      }),
    );
  }

  return jobs;
}

export async function searchAshbyBoards(
  query: string,
  profile: UserProfile,
  insight: SkillInsight,
  boards: AshbyBoard[] = curatedAshbyBoards,
  limit = 10,
) {
  const results = await Promise.all(
    boards.map(async (board) => {
      const jobs = await fetchAshbyBoardJobs(board);

      return jobs.map((job) => ({
        board,
        job,
        relevance: relevanceScore(board, job, query, profile, insight),
      }));
    }),
  );

  return results
    .flat()
    .filter((item) => {
      const queryText = query.trim().toLowerCase();

      if (!queryText) {
        return true;
      }

      const haystack = normalize(
        `${item.job.title} ${item.job.department ?? ""} ${item.job.team ?? ""} ${
          item.job.descriptionPlain ?? ""
        }`,
      );

      return haystack.includes(normalize(queryText));
    })
    .sort((left, right) => {
      if (right.relevance !== left.relevance) {
        return right.relevance - left.relevance;
      }

      return urgencyFromDate(right.job.publishedAt) - urgencyFromDate(left.job.publishedAt);
    })
    .slice(0, limit);
}

export function normalizeAshbyJob(
  board: AshbyBoard,
  job: AshbyJob,
  profile: UserProfile,
  insight: SkillInsight,
): Opportunity {
  const description = job.descriptionPlain || stripHtml(job.descriptionHtml || "");
  const remotePolicy = inferRemotePolicy(job);
  const skills = unique([
    job.department ?? "",
    job.team ?? "",
    ...job.title.split(/[^a-zA-Z0-9]+/),
    ...insight.marketableSkills,
  ], 6);

  return {
    id: `ashby-${board.id}-${job.id}`,
    title: job.title,
    organization: board.name,
    sourceId: `ashby-api-${board.id}`,
    sourceLabel: `${board.name} via Ashby API`,
    sourceType: "official",
    location: job.location || (remotePolicy === "remote" ? "Remote" : profile.location),
    remotePolicy,
    kind: inferKind(job.employmentType),
    experienceLevel: inferExperienceLevel(job),
    compensation: compensationLabel(job),
    compensationValue: compensationValue(job),
    urgencyScore: urgencyFromDate(job.publishedAt),
    category: categoryForJob(job),
    summary: description.slice(0, 220),
    responsibilities: [
      `Review the live ${board.name} posting for the full role details and expectations.`,
      `Mirror language from ${job.title.toLowerCase()} into the targeted resume and outreach.`,
      "Use the original company board link to apply after tailoring materials inside WorthMatch.",
    ],
    qualifications: [
      skills[0] ?? insight.atsKeywords[0] ?? "communication",
      skills[1] ?? insight.atsKeywords[1] ?? "organization",
      "Comfort applying through a live company board after ranking the opportunity",
    ],
    skills,
    tags: unique([
      "live-search",
      "ashby",
      board.name,
      remotePolicy,
      job.employmentType ?? "",
    ], 5),
    link: job.jobUrl,
  };
}
