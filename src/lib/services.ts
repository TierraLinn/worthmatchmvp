import type { MatchResult, SkillInsight, UserProfile, WorkMode } from "../types";

type ServiceType =
  | "admin"
  | "education"
  | "community"
  | "tech"
  | "concierge"
  | "support";

export interface ServiceTier {
  name: string;
  price: string;
  description: string;
  deliverables: string[];
}

export interface ServiceBlueprint {
  id: string;
  title: string;
  audience: string;
  serviceType: ServiceType;
  mode: WorkMode;
  modeLabel: string;
  positioning: string;
  promise: string;
  pricingNote: string;
  included: string[];
  proofPoints: string[];
  pricingTiers: ServiceTier[];
  outreachDm: string;
  outreachEmail: string;
  listingHeadline: string;
  listingDescription: string;
  searchQueries: string[];
  intakeChecklist: string[];
  launchPlan: string[];
  relatedMatches: MatchResult[];
}

export interface ServiceStudioModel {
  openingSummary: string;
  quickIncomeCount: number;
  localPathCount: number;
  blueprints: ServiceBlueprint[];
}

function unique(values: string[], limit = 8) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).slice(0, limit);
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function classifyService(offer: string): ServiceType {
  const normalized = offer.toLowerCase();

  if (
    normalized.includes("tutor") ||
    normalized.includes("homework") ||
    normalized.includes("study")
  ) {
    return "education";
  }

  if (
    normalized.includes("event") ||
    normalized.includes("outreach") ||
    normalized.includes("social") ||
    normalized.includes("flyer")
  ) {
    return "community";
  }

  if (
    normalized.includes("device") ||
    normalized.includes("portal") ||
    normalized.includes("tech")
  ) {
    return "tech";
  }

  if (
    normalized.includes("family") ||
    normalized.includes("organization") ||
    normalized.includes("errand")
  ) {
    return "concierge";
  }

  if (
    normalized.includes("inbox") ||
    normalized.includes("calendar") ||
    normalized.includes("virtual assistant") ||
    normalized.includes("admin")
  ) {
    return "admin";
  }

  return "support";
}

function chooseMode(serviceType: ServiceType, workModes: WorkMode[]) {
  if (
    (serviceType === "admin" || serviceType === "support") &&
    workModes.includes("remote")
  ) {
    return "remote";
  }

  if (serviceType === "education" && workModes.includes("hybrid")) {
    return "hybrid";
  }

  if (workModes.includes("local")) {
    return "local";
  }

  if (workModes.includes("hybrid")) {
    return "hybrid";
  }

  return workModes[0] ?? "remote";
}

function formatModeLabel(mode: WorkMode) {
  if (mode === "remote") {
    return "Remote-ready service";
  }

  if (mode === "hybrid") {
    return "Hybrid-friendly service";
  }

  return "Local-first service";
}

function audienceForType(
  serviceType: ServiceType,
  mode: WorkMode,
  profile: UserProfile,
) {
  switch (serviceType) {
    case "education":
      return "Students and families who need calm academic support";
    case "community":
      return "Local businesses, programs, and neighborhood organizers";
    case "tech":
      return "Households and older adults who need patient tech help";
    case "concierge":
      return mode === "local"
        ? "Busy households that need organized practical help"
        : "Families who need dependable coordination support";
    case "admin":
      return "Founders, teams, and solo operators who need organized follow-through";
    default:
      return `${profile.location} clients who need reliable support without a long hiring process`;
  }
}

function pricingTiersForType(serviceType: ServiceType): ServiceTier[] {
  switch (serviceType) {
    case "education":
      return [
        {
          name: "Starter session",
          price: "$45 per session",
          description: "Fast proof-of-value option for one student or family.",
          deliverables: [
            "One focused support session",
            "Clear recap with next steps",
            "Simple progress notes",
          ],
        },
        {
          name: "Weekly support pack",
          price: "$170 per week",
          description: "Best fit for families who want recurring support.",
          deliverables: [
            "Multiple tutoring or planning touchpoints",
            "Parent or student updates",
            "Homework and schedule accountability",
          ],
        },
        {
          name: "Exam sprint",
          price: "$320 project",
          description: "Short, intensive support before a deadline or test.",
          deliverables: [
            "Study plan",
            "Priority review sessions",
            "Final check-in and action plan",
          ],
        },
      ];
    case "community":
      return [
        {
          name: "Quick launch",
          price: "$180 project",
          description: "A low-risk way for local clients to test the service.",
          deliverables: [
            "One flyer or event support sprint",
            "Messaging cleanup",
            "Checklist and follow-up notes",
          ],
        },
        {
          name: "Campaign support",
          price: "$475 pack",
          description: "Built for a small event, outreach push, or promo cycle.",
          deliverables: [
            "Calendar or checklist setup",
            "Client communication support",
            "Content or outreach coordination",
          ],
        },
        {
          name: "Monthly retainer",
          price: "$950 per month",
          description: "Ongoing help for organizations with repeating community work.",
          deliverables: [
            "Weekly planning touchpoints",
            "Status updates",
            "Priority support during active weeks",
          ],
        },
      ];
    case "tech":
      return [
        {
          name: "Setup visit",
          price: "$65 per visit",
          description: "Simple device or account support for one household.",
          deliverables: [
            "Device setup",
            "Account walkthrough",
            "Written next steps",
          ],
        },
        {
          name: "Family support pack",
          price: "$145 package",
          description: "Two-session bundle for recurring household tech needs.",
          deliverables: [
            "Two support sessions",
            "Password or portal organization help",
            "Troubleshooting recap",
          ],
        },
        {
          name: "Confidence plan",
          price: "$280 project",
          description: "Best for ongoing patient coaching and follow-up.",
          deliverables: [
            "Multiple visits or check-ins",
            "Customized how-to guide",
            "Follow-up practice support",
          ],
        },
      ];
    case "concierge":
      return [
        {
          name: "Starter block",
          price: "$45 per hour",
          description: "Quick help with errands, scheduling, or family admin.",
          deliverables: [
            "Focused support block",
            "Priority list cleanup",
            "Simple status summary",
          ],
        },
        {
          name: "Half-day reset",
          price: "$170 package",
          description: "Designed for clients who need a visible before-and-after result.",
          deliverables: [
            "Calendar or paperwork reset",
            "Reminder system setup",
            "Action list for the next week",
          ],
        },
        {
          name: "Weekly lane",
          price: "$360 per week",
          description: "Recurring support for high-trust household or family needs.",
          deliverables: [
            "Scheduled support windows",
            "Ongoing coordination",
            "Weekly check-in summary",
          ],
        },
      ];
    case "admin":
      return [
        {
          name: "Inbox reset",
          price: "$225 project",
          description: "Best for proving value quickly with a contained admin sprint.",
          deliverables: [
            "Inbox or calendar cleanup",
            "Priority sorting",
            "Summary with recommended system",
          ],
        },
        {
          name: "Weekly support lane",
          price: "$425 per week",
          description: "A flexible support option for busy founders or teams.",
          deliverables: [
            "Recurring admin support",
            "Follow-up tracking",
            "Clear weekly update",
          ],
        },
        {
          name: "Monthly retainer",
          price: "$1,150 per month",
          description: "For clients who want dependable back-office support.",
          deliverables: [
            "Priority calendar support",
            "Inbox and documentation help",
            "Ongoing client communication support",
          ],
        },
      ];
    default:
      return [
        {
          name: "Starter project",
          price: "$190 package",
          description: "Fast proof of value with a clear before-and-after outcome.",
          deliverables: [
            "Defined support sprint",
            "Client update",
            "Next-step plan",
          ],
        },
        {
          name: "Weekly support",
          price: "$395 per week",
          description: "A repeatable way to turn dependable help into recurring income.",
          deliverables: [
            "Priority support window",
            "Progress notes",
            "Communication follow-through",
          ],
        },
        {
          name: "Trusted retainer",
          price: "$980 per month",
          description: "For clients who need someone reliable in their corner.",
          deliverables: [
            "Recurring support",
            "Weekly planning",
            "Clear reporting and follow-up",
          ],
        },
      ];
  }
}

function includedForType(serviceType: ServiceType, insight: SkillInsight) {
  switch (serviceType) {
    case "education":
      return [
        "Session planning and recap notes",
        "Progress check-ins",
        `Support anchored in ${insight.marketableSkills.slice(0, 2).join(" and ")}`,
      ];
    case "community":
      return [
        "Flyer, event, or outreach support",
        "Deadline and checklist management",
        "Polished updates for clients and stakeholders",
      ];
    case "tech":
      return [
        "Patient walkthroughs",
        "Account and device setup help",
        "Written instructions clients can reuse later",
      ];
    case "concierge":
      return [
        "Family admin and scheduling help",
        "Reminder and follow-through systems",
        "Clear status updates after each support block",
      ];
    case "admin":
      return [
        "Inbox, calendar, and follow-up cleanup",
        "Documentation and task tracking",
        "A dependable communication rhythm clients can trust",
      ];
    default:
      return [
        "Professional follow-through",
        "Clear client communication",
        "Support shaped around fast, visible relief",
      ];
  }
}

function buildOfferKeywords(
  offer: string,
  audience: string,
  serviceType: ServiceType,
) {
  return unique([
    ...offer.toLowerCase().split(/[^a-z0-9]+/),
    ...audience.toLowerCase().split(/[^a-z0-9]+/),
    serviceType,
  ]).filter((term) => term.length > 2);
}

function scoreRelatedMatch(
  match: MatchResult,
  keywords: string[],
  serviceType: ServiceType,
  mode: WorkMode,
) {
  const corpus = [
    match.title,
    match.organization,
    match.category,
    match.summary,
    ...match.skills,
    ...match.tags,
    ...match.whyItMatches,
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;

  score += keywords.reduce(
    (total, keyword) => total + (corpus.includes(keyword) ? 10 : 0),
    0,
  );

  if (match.remotePolicy === mode) {
    score += 20;
  } else if (match.remotePolicy === "hybrid" || mode === "hybrid") {
    score += 10;
  }

  if (serviceType === "education" && match.category === "Education & Coaching") {
    score += 28;
  }

  if (
    serviceType === "community" &&
    ["Events & Programs", "Freelance Services", "Community Support"].includes(
      match.category,
    )
  ) {
    score += 26;
  }

  if (
    serviceType === "concierge" &&
    ["Freelance Services", "Community Support"].includes(match.category)
  ) {
    score += 26;
  }

  if (
    (serviceType === "admin" || serviceType === "support") &&
    ["Executive Support", "Operations & Support", "Customer Experience"].includes(
      match.category,
    )
  ) {
    score += 24;
  }

  if (serviceType === "tech" && match.category === "Community Support") {
    score += 24;
  }

  return score;
}

function proofPointsForBlueprint(
  profile: UserProfile,
  insight: SkillInsight,
  relatedMatches: MatchResult[],
) {
  return unique([
    `Already trusted for ${profile.helpRequests.split(",").slice(0, 2).join(" and ").toLowerCase()}.`,
    `Brings ${insight.marketableSkills.slice(0, 3).join(", ")} to every client interaction.`,
    relatedMatches[0]
      ? `Directly aligned with the needs behind ${relatedMatches[0].title.toLowerCase()}.`
      : "",
    `Can start ${profile.availability.toLowerCase()}.`,
  ], 4);
}

function launchPlanForBlueprint(
  profile: UserProfile,
  offer: string,
  relatedMatches: MatchResult[],
) {
  return unique([
    `Write a one-paragraph offer blurb for ${offer.toLowerCase()} using the listing copy below.`,
    `Message 3 to 5 warm contacts or community leads in ${profile.location}.`,
    `Post the offer in one neighborhood, alumni, parent, or community channel.`,
    relatedMatches[0]
      ? `Mirror the language from ${relatedMatches[0].title} to make the service sound professional and outcome-focused.`
      : "Use concrete before-and-after language instead of general helpfulness.",
    "Collect one testimonial or simple client result after the first project.",
  ], 5);
}

function intakeChecklistForBlueprint(serviceType: ServiceType) {
  switch (serviceType) {
    case "education":
      return [
        "What subject, grade level, or deadline are we solving for?",
        "What usually feels hardest right now?",
        "How often should progress updates be sent?",
      ];
    case "community":
      return [
        "What event, campaign, or community need is the priority?",
        "Who approves copy, deadlines, and materials?",
        "What does a successful week of support look like?",
      ];
    case "tech":
      return [
        "Which device, app, or account is creating the problem?",
        "What should the client be able to do independently afterward?",
        "Would a written walkthrough help after the session?",
      ];
    case "concierge":
      return [
        "Which tasks are urgent versus recurring?",
        "How should updates and reminders be delivered?",
        "What would make the week feel more manageable?",
      ];
    default:
      return [
        "What is the highest-friction task right now?",
        "How should progress and follow-up be communicated?",
        "What outcome would make this feel worth it after week one?",
      ];
  }
}

function positioningForBlueprint(
  offer: string,
  audience: string,
  insight: SkillInsight,
) {
  return `${offer} for ${audience.toLowerCase()}, anchored in ${insight.marketableSkills
    .slice(0, 3)
    .join(", ")} and positioned as a fast, dependable way to get relief.`;
}

function promiseForBlueprint(
  profile: UserProfile,
  offer: string,
  audience: string,
) {
  return `${profile.name} helps ${audience.toLowerCase()} get organized, supported, and updated without needing a complicated hiring process. ${offer} is framed around calm communication, visible progress, and dependable follow-through.`;
}

function listingHeadlineForBlueprint(offer: string, mode: WorkMode) {
  const suffix =
    mode === "remote" ? "Remote-ready help" : mode === "hybrid" ? "Flexible support" : "Local support";

  return `${offer} | ${suffix}`;
}

function listingDescriptionForBlueprint(
  profile: UserProfile,
  insight: SkillInsight,
  offer: string,
  audience: string,
) {
  return `${profile.name} offers ${offer.toLowerCase()} for ${audience.toLowerCase()}. Best for clients who need help with ${profile.helpRequests
    .split(",")
    .slice(0, 3)
    .join(", ")
    .toLowerCase()}. Strengths include ${insight.marketableSkills
    .slice(0, 3)
    .join(", ")}, plus clear updates and dependable follow-through.`;
}

function searchQueriesForBlueprint(
  profile: UserProfile,
  offer: string,
  relatedMatches: MatchResult[],
) {
  return unique([
    `${offer} ${profile.location}`,
    `${offer} near me`,
    `${offer} local services`,
    relatedMatches[0] ? `${relatedMatches[0].title} freelance` : "",
    relatedMatches[1] ? `${relatedMatches[1].category} contract ${profile.location}` : "",
  ], 5);
}

function outreachDmForBlueprint(
  profile: UserProfile,
  offer: string,
  audience: string,
) {
  return `Hi, I’m opening a small ${offer.toLowerCase()} offer for ${audience.toLowerCase()}. I’m the person people already trust with ${profile.helpRequests
    .split(",")
    .slice(0, 2)
    .join(" and ")
    .toLowerCase()}, and I’m packaging that into a clearer paid service. If you know someone who needs dependable help, I’d love an introduction.`;
}

function outreachEmailForBlueprint(
  profile: UserProfile,
  offer: string,
  audience: string,
  included: string[],
) {
  return [
    `Subject: ${offer} support for ${profile.location}`,
    "",
    `Hi, I’m reaching out because I’m offering ${offer.toLowerCase()} for ${audience.toLowerCase()}.`,
    "",
    `My background includes ${profile.experienceNotes.toLowerCase()}, and people already rely on me for ${profile.helpRequests.toLowerCase()}. I’m turning that into a more professional service with support like ${included
      .slice(0, 2)
      .join(" and ")
      .toLowerCase()}.`,
    "",
    "If this would help your team, household, or community program, I’d be happy to send a quick starter package or availability note.",
    "",
    `Best,`,
    profile.name,
  ].join("\n");
}

export function buildServiceStudio(
  profile: UserProfile,
  insight: SkillInsight,
  matches: MatchResult[],
): ServiceStudioModel {
  const quickIncomeCount = matches.filter(
    (match) =>
      match.compensationValue >= 72 &&
      (match.kind === "gig" || match.kind === "contract" || match.urgency >= 84),
  ).length;

  const localPathCount = matches.filter((match) => match.remotePolicy !== "remote").length;

  const blueprints = insight.serviceOffers.slice(0, 3).map((offer) => {
    const serviceType = classifyService(offer);
    const mode = chooseMode(serviceType, profile.workModes);
    const audience = audienceForType(serviceType, mode, profile);
    const keywords = buildOfferKeywords(offer, audience, serviceType);
    const relatedMatches = [...matches]
      .sort(
        (left, right) =>
          scoreRelatedMatch(right, keywords, serviceType, mode) -
          scoreRelatedMatch(left, keywords, serviceType, mode),
      )
      .slice(0, 3);
    const included = includedForType(serviceType, insight);

    return {
      id: slugify(offer),
      title: offer,
      audience,
      serviceType,
      mode,
      modeLabel: formatModeLabel(mode),
      positioning: positioningForBlueprint(offer, audience, insight),
      promise: promiseForBlueprint(profile, offer, audience),
      pricingNote:
        "Starter pricing is designed to be easy to demo, easy to test locally, and easy to raise after proof or testimonials.",
      included,
      proofPoints: proofPointsForBlueprint(profile, insight, relatedMatches),
      pricingTiers: pricingTiersForType(serviceType),
      outreachDm: outreachDmForBlueprint(profile, offer, audience),
      outreachEmail: outreachEmailForBlueprint(profile, offer, audience, included),
      listingHeadline: listingHeadlineForBlueprint(offer, mode),
      listingDescription: listingDescriptionForBlueprint(
        profile,
        insight,
        offer,
        audience,
      ),
      searchQueries: searchQueriesForBlueprint(profile, offer, relatedMatches),
      intakeChecklist: intakeChecklistForBlueprint(serviceType),
      launchPlan: launchPlanForBlueprint(profile, offer, relatedMatches),
      relatedMatches,
    };
  });

  return {
    openingSummary: `${profile.name} can pursue direct income through packaged services as well as jobs. WorthMatch translated that path into sellable offers, starter pricing, and ready-to-send outreach.`,
    quickIncomeCount,
    localPathCount,
    blueprints,
  };
}

export function buildServiceLaunchKit(
  profile: UserProfile,
  blueprint: ServiceBlueprint,
) {
  return [
    "WORTHMATCH SERVICE LAUNCH KIT",
    profile.name,
    blueprint.title,
    "",
    "POSITIONING",
    blueprint.positioning,
    "",
    "PROMISE",
    blueprint.promise,
    "",
    "WHO IT IS FOR",
    blueprint.audience,
    "",
    "PRICING",
    ...blueprint.pricingTiers.map(
      (tier) =>
        `${tier.name} - ${tier.price}\n${tier.description}\n${tier.deliverables
          .map((deliverable) => `- ${deliverable}`)
          .join("\n")}`,
    ),
    "",
    "INCLUDED",
    ...blueprint.included.map((item) => `- ${item}`),
    "",
    "PROOF POINTS",
    ...blueprint.proofPoints.map((item) => `- ${item}`),
    "",
    "LISTING HEADLINE",
    blueprint.listingHeadline,
    "",
    "LISTING DESCRIPTION",
    blueprint.listingDescription,
    "",
    "OUTREACH DM",
    blueprint.outreachDm,
    "",
    "OUTREACH EMAIL",
    blueprint.outreachEmail,
    "",
    "SEARCH QUERIES",
    ...blueprint.searchQueries.map((item) => `- ${item}`),
    "",
    "CLIENT INTAKE CHECKLIST",
    ...blueprint.intakeChecklist.map((item) => `- ${item}`),
    "",
    "7-DAY LAUNCH PLAN",
    ...blueprint.launchPlan.map((item) => `- ${item}`),
  ].join("\n");
}
