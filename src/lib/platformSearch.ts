import type { SkillInsight, UserProfile } from "../types";

export interface PlatformSearchCard {
  id: string;
  name: string;
  mode: "jobs" | "services" | "community";
  description: string;
  searchText: string;
  openUrl: string;
  supportText: string[];
}

function unique(values: string[], limit = 6) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).slice(0, limit);
}

function encodeGoogleQuery(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function buildRolePhrase(insight: SkillInsight) {
  return insight.jobTitles.slice(0, 3).map((title) => `"${title}"`).join(" OR ");
}

function buildServicePhrase(insight: SkillInsight) {
  return insight.serviceOffers.slice(0, 3).map((offer) => `"${offer}"`).join(" OR ");
}

export function buildPlatformSearchCards(
  profile: UserProfile,
  insight: SkillInsight,
  focusTerm?: string,
) {
  const rolePhrase = focusTerm?.trim()
    ? `"${focusTerm.trim()}"`
    : buildRolePhrase(insight);
  const servicePhrase = buildServicePhrase(insight);
  const location = profile.location || "United States";

  const cards: PlatformSearchCard[] = [
    {
      id: "linkedin",
      name: "LinkedIn Jobs",
      mode: "jobs",
      description:
        "Use profile-aware role and location phrases, then import any strong listing back into WorthMatch.",
      searchText: `${rolePhrase} "${location}" remote OR hybrid site:linkedin.com/jobs/view`,
      openUrl: encodeGoogleQuery(
        `${rolePhrase} "${location}" remote OR hybrid site:linkedin.com/jobs/view`,
      ),
      supportText: unique([
        `${insight.jobTitles[0] ?? "operations coordinator"} ${location}`,
        `${insight.jobTitles[1] ?? "customer support"} remote`,
        insight.atsKeywords.slice(0, 5).join(", "),
      ]),
    },
    {
      id: "indeed",
      name: "Indeed",
      mode: "jobs",
      description:
        "Good for high-volume role searches and keyword-driven filtering across local and remote listings.",
      searchText: `${rolePhrase} "${location}" site:indeed.com/jobs OR site:indeed.com/viewjob`,
      openUrl: encodeGoogleQuery(
        `${rolePhrase} "${location}" site:indeed.com/jobs OR site:indeed.com/viewjob`,
      ),
      supportText: unique([
        `${insight.jobTitles[0] ?? "operations coordinator"} remote`,
        `${insight.jobTitles[2] ?? "program assistant"} ${location}`,
        insight.marketableSkills.slice(0, 4).join(", "),
      ]),
    },
    {
      id: "handshake",
      name: "Handshake",
      mode: "jobs",
      description:
        "Best for student and early-career searches. Use the copied query in Handshake or the platform-scoped search link.",
      searchText: `${rolePhrase} "${location}" entry level site:joinhandshake.com/jobs`,
      openUrl: encodeGoogleQuery(
        `${rolePhrase} "${location}" entry level site:joinhandshake.com/jobs`,
      ),
      supportText: unique([
        `${insight.jobTitles[0] ?? "student success"} internship`,
        `${insight.jobTitles[1] ?? "program coordinator"} student`,
        "student support, entry level, coordinator",
      ]),
    },
    {
      id: "craigslist-jobs",
      name: "Craigslist Jobs + Gigs",
      mode: "community",
      description:
        "Useful for urgent local income, project work, event support, and neighborhood-facing opportunities.",
      searchText: `(${rolePhrase} OR ${servicePhrase}) "${location}" site:craigslist.org`,
      openUrl: encodeGoogleQuery(
        `(${rolePhrase} OR ${servicePhrase}) "${location}" site:craigslist.org`,
      ),
      supportText: unique([
        `${insight.serviceOffers[0] ?? "admin support"} ${location}`,
        `${insight.serviceOffers[1] ?? "tutoring"} near me`,
        "gig, contract, immediate start",
      ]),
    },
    {
      id: "facebook-marketplace",
      name: "Facebook Marketplace + Local Groups",
      mode: "services",
      description:
        "Best for direct paid help, household services, tutoring, errands, and neighborhood referrals.",
      searchText: `${servicePhrase} "${location}" site:facebook.com/marketplace OR site:facebook.com/groups`,
      openUrl: encodeGoogleQuery(
        `${servicePhrase} "${location}" site:facebook.com/marketplace OR site:facebook.com/groups`,
      ),
      supportText: unique([
        `${insight.serviceOffers[0] ?? "organization support"} ${location}`,
        `${insight.serviceOffers[1] ?? "tutoring"} ${location}`,
        "local service, quick help, referrals",
      ]),
    },
    {
      id: "local-classifieds",
      name: "Local Classifieds + Community Boards",
      mode: "community",
      description:
        "Broader local search pack for community websites, nonprofits, and neighborhood boards where direct opportunities appear.",
      searchText: `(${rolePhrase} OR ${servicePhrase}) "${location}" ("community board" OR classifieds OR gig OR local help)`,
      openUrl: encodeGoogleQuery(
        `(${rolePhrase} OR ${servicePhrase}) "${location}" ("community board" OR classifieds OR gig OR local help)`,
      ),
      supportText: unique([
        `${insight.serviceOffers[0] ?? "admin help"} community board`,
        `${insight.jobTitles[0] ?? "operations assistant"} local posting`,
        "part-time, contract, flexible",
      ]),
    },
  ];

  return cards;
}
